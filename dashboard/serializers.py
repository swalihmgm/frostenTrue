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
            'created_at'
        ]


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
