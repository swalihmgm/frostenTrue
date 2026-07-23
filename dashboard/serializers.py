from rest_framework import serializers
from .models import CustomerType, Customer, Sale, Expense

class CustomerTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerType
        fields = ['id', 'name', 'description']


class CustomerSerializer(serializers.ModelSerializer):
    customer_type_name = serializers.CharField(source='customer_type.name', read_only=True)
    total_outstanding_balance = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        read_only=True
    )
    last_activity = serializers.SerializerMethodField()
    last_activity_desc = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id', 
            'custom_id', 
            'name', 
            'phone', 
            'email',
            'customer_type', 
            'customer_type_name', 
            'total_outstanding_balance', 
            'last_activity',
            'last_activity_desc',
            'created_at'
        ]

    def get_last_activity(self, obj):
        latest_sale = obj.sales.order_by('-date', '-created_at').first()
        if latest_sale:
            return latest_sale.date.strftime('%b %d, %Y')
        return obj.created_at.strftime('%b %d, %Y')

    def get_last_activity_desc(self, obj):
        latest_sale = obj.sales.order_by('-date', '-created_at').first()
        if latest_sale:
            return f"Delivery: {int(latest_sale.quantity)} {latest_sale.unit_type} ({latest_sale.payment_status})"
        return "Account created"


class SaleSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_custom_id = serializers.CharField(source='customer.custom_id', read_only=True)
    customer_type_name = serializers.CharField(source='customer.customer_type.name', read_only=True)
    total_amount = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        read_only=True
    )

    class Meta:
        model = Sale
        fields = [
            'id', 
            'date', 
            'customer', 
            'customer_name', 
            'customer_custom_id', 
            'customer_type_name', 
            'quantity', 
            'unit_type', 
            'unit_price', 
            'payment_status', 
            'total_amount', 
            'created_at'
        ]


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'date', 'amount', 'category', 'description', 'created_at']
