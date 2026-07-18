from django.contrib import admin
from .models import CustomerType, Customer, Sale, Expense

@admin.register(CustomerType)
class CustomerTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('custom_id', 'name', 'customer_type', 'phone', 'get_outstanding_balance')
    list_filter = ('customer_type', 'created_at')
    search_fields = ('custom_id', 'name', 'phone')
    ordering = ('custom_id',)
    
    # Define fields configuration in the detail view
    fieldsets = (
        ('Basic Information', {
            'fields': ('custom_id', 'name', 'phone', 'customer_type')
        }),
        ('System/Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ('created_at',)

    def get_outstanding_balance(self, obj):
        """
        Retrieves the property from the model and formats it for presentation in the list grid.
        """
        balance = obj.total_outstanding_balance
        return f"${balance:,.2f}"
    
    get_outstanding_balance.short_description = "Outstanding Balance"


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'date', 
        'customer', 
        'quantity', 
        'unit_type', 
        'unit_price', 
        'get_total_amount', 
        'payment_status'
    )
    list_filter = ('payment_status', 'unit_type', 'date', 'customer')
    search_fields = ('id', 'customer__name', 'customer__custom_id')
    date_hierarchy = 'date'
    ordering = ('-date', '-created_at')

    # Define fields configuration in the detail view
    fieldsets = (
        ('Transaction Details', {
            'fields': ('date', 'customer', 'quantity', 'unit_type', 'unit_price')
        }),
        ('Billing & Status', {
            'fields': ('payment_status',)
        }),
    )

    def get_total_amount(self, obj):
        """
        Retrieves the total_amount property from the Sale model and formats it.
        """
        return f"${obj.total_amount:,.2f}"
        
    get_total_amount.short_description = "Total Amount"


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('id', 'date', 'category', 'amount', 'description')
    list_filter = ('category', 'date')
    search_fields = ('category', 'description')
    date_hierarchy = 'date'
    ordering = ('-date', '-created_at')

    fieldsets = (
        ('Expense Information', {
            'fields': ('date', 'category', 'amount', 'description')
        }),
    )
