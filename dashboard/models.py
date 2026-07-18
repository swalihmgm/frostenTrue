from django.db import models
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum, F

class CustomerType(models.Model):
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


class Customer(models.Model):
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

    class Meta:
        verbose_name = "Customer"
        verbose_name_plural = "Customers"
        ordering = ['name']

    def __str__(self):
        return f"{self.custom_id} - {self.name}"

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


class Sale(models.Model):
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


class Expense(models.Model):
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
