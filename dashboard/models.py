from django.db import models
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum, F

class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)


class SoftDeleteModel(models.Model):
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def delete(self, *args, **kwargs):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class CustomerType(SoftDeleteModel):
    """
    Represents classifications of customers such as Shops, Events, or Distributors.
    This helps in segmenting analytics and styling the dashboard visually.
    """
    name = models.CharField(
        max_length=50, 
        unique=True, 
        help_text="Type of customer, e.g., Shops, Events, Distributors"
    )
    description = models.TextField(
        blank=True, 
        null=True, 
        help_text="Optional description of this customer classification"
    )

    class Meta:
        verbose_name = "Customer Type"
        verbose_name_plural = "Customer Types"
        ordering = ['name']

    def __str__(self):
        return self.name


class Customer(SoftDeleteModel):
    """
    Represents a client who purchases ice blocks/bags.
    Tracks client-specific metadata and outstanding receivables.
    """
    name = models.CharField(
        max_length=150, 
        help_text="Full name or company name of the customer"
    )
    phone = models.CharField(
        max_length=20, 
        blank=True, 
        null=True, 
        help_text="Contact number for notifications or billing queries"
    )
    custom_id = models.CharField(
        max_length=20, 
        unique=True, 
        verbose_name="Custom ID",
        help_text="Custom unique ID string (e.g., 'FT-8821') to match visual UI layout"
    )
    customer_type = models.ForeignKey(
        CustomerType, 
        on_delete=models.PROTECT, 
        related_name="customers",
        help_text="Classification for this customer"
    )
    created_at = models.DateTimeField(
        default=timezone.now
    )
    email = models.EmailField(
        blank=True, 
        null=True, 
        unique=True,
        help_text="Email address for customer login"
    )
    user = models.OneToOneField(
        'auth.User', 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        related_name="customer",
        help_text="Associated User account for customer login"
    )

    class Meta:
        verbose_name = "Customer"
        verbose_name_plural = "Customers"
        ordering = ['name']

    def __str__(self):
        return f"{self.custom_id} - {self.name}"

    def save(self, *args, **kwargs):
        # Generate custom_id if not present
        if not self.custom_id:
            import random
            self.custom_id = f"FT-{random.randint(1000, 9999)}"
            
        if self.email:
            from django.contrib.auth.models import User
            # Check if we already have a linked user
            if not self.user:
                # Search if there is a User with username=email
                user = User.objects.filter(username=self.email).first()
                if not user:
                    user = User.objects.create_user(
                        username=self.email,
                        email=self.email,
                        password=self.name # password is the shop name (name)
                    )
                self.user = user
            else:
                # User exists, make sure email and username are updated if changed
                user = self.user
                if user.username != self.email or user.email != self.email:
                    user.username = self.email
                    user.email = self.email
                    user.save()
        else:
            # Email is blank. If there was a linked user, clean it up
            if self.user:
                user = self.user
                self.user = None
                super().save(*args, **kwargs) # Save Customer first to remove foreign key constraint
                user.delete()
                return

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        self.sales.all().delete()

    @property
    def total_outstanding_balance(self):
        """
        Calculates the total pending and overdue balance for the customer.
        Returns a Decimal representing the sum of (quantity * unit_price) for unpaid sales.
        """
        unpaid_sales = self.sales.filter(payment_status__in=['Pending', 'Overdue'])
        # Optimize by annotating and aggregating in the database
        result = unpaid_sales.annotate(
            item_total=F('quantity') * F('unit_price')
        ).aggregate(
            grand_total=Sum('item_total')
        )
        total = result['grand_total']
        return Decimal(total).quantize(Decimal('0.01')) if total is not None else Decimal('0.00')


class Sale(SoftDeleteModel):
    """
    Tracks transaction records of ice bags or blocks sold to a specific Customer.
    Used for revenue analysis and customer balance tracking.
    """
    UNIT_TYPE_CHOICES = [
        ('Bags', 'Bags'),
        ('Kg', 'Kg'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('Paid', 'Paid'),
        ('Pending', 'Pending'),
        ('Overdue', 'Overdue'),
    ]

    date = models.DateField(
        default=timezone.localdate, 
        help_text="Date the sale occurred"
    )
    customer = models.ForeignKey(
        Customer, 
        on_delete=models.CASCADE, 
        related_name="sales",
        help_text="Customer associated with this sale"
    )
    quantity = models.IntegerField(
        help_text="Quantity sold (bags or kg)"
    )
    unit_type = models.CharField(
        max_length=10, 
        choices=UNIT_TYPE_CHOICES, 
        default='Bags',
        help_text="Measurement unit: Bags or Kg"
    )
    unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Price per bag/block"
    )
    payment_status = models.CharField(
        max_length=15, 
        choices=PAYMENT_STATUS_CHOICES, 
        default='Pending',
        help_text="Payment state: Paid, Pending, or Overdue"
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        verbose_name = "Sale"
        verbose_name_plural = "Sales"
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"Sale #{self.id} | {self.customer.name} | {self.quantity} {self.unit_type} ({self.payment_status})"

    @property
    def total_amount(self):
        """
        Calculates the total price of the sale (quantity * unit_price).
        """
        total = self.quantity * self.unit_price
        return total.quantize(Decimal('0.01'))


class Expense(SoftDeleteModel):
    """
    Tracks company expenditures to calculate operational net margins.
    Categorized for quick breakdowns on the dashboard UI.
    """
    CATEGORY_CHOICES = [
        ('Fuel', 'Fuel'),
        ('Electricity', 'Electricity'),
        ('Maintenance', 'Maintenance'),
        ('Salary', 'Salary'),
        ('Other', 'Other'),
    ]

    date = models.DateField(
        default=timezone.localdate, 
        help_text="Date the expense was incurred"
    )
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Amount spent"
    )
    category = models.CharField(
        max_length=20, 
        choices=CATEGORY_CHOICES, 
        help_text="Category classification for breakdown analysis"
    )
    description = models.TextField(
        blank=True, 
        null=True, 
        help_text="Details of the expenditure"
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        verbose_name = "Expense"
        verbose_name_plural = "Expenses"
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"Expense #{self.id} | {self.category} | {self.amount} ({self.date})"
