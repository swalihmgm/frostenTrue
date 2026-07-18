from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta

from .models import CustomerType, Customer, Sale, Expense

class DashboardAPITests(APITestCase):

    def setUp(self):
        # Create Customer Types
        self.shops_type = CustomerType.objects.create(name='Shops')
        self.dist_type = CustomerType.objects.create(name='Distributors')

        # Create Customers
        self.customer1 = Customer.objects.create(
            name='Alingal Traders',
            custom_id='FT-8821',
            phone='+919876543210',
            customer_type=self.shops_type
        )
        self.customer2 = Customer.objects.create(
            name='Frozen Express',
            custom_id='FT-8110',
            phone='+919447767890',
            customer_type=self.dist_type
        )

        # Create Sales (Paid, Pending, Overdue)
        # Outstanding dues for customer1: $2,500.00
        self.sale1 = Sale.objects.create(
            date=timezone.localdate(),
            customer=self.customer1,
            quantity=100,
            unit_type='Bags',
            unit_price=Decimal('25.00'),
            payment_status='Pending'
        )
        # Paid sale for customer2
        self.sale2 = Sale.objects.create(
            date=timezone.localdate() - timedelta(days=1),
            customer=self.customer2,
            quantity=200,
            unit_type='Kg',
            unit_price=Decimal('20.00'),
            payment_status='Paid'
        )

        # Create Expenses
        self.expense1 = Expense.objects.create(
            date=timezone.localdate(),
            amount=Decimal('15200.00'),
            category='Fuel',
            description='Generator fuel'
        )

    def test_customer_list_and_details(self):
        url = reverse('customer-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        # Verify custom outstanding balance property serialization
        customer1_data = next(c for c in response.data if c['id'] == self.customer1.id)
        self.assertEqual(float(customer1_data['total_outstanding_balance']), 2500.00)

    def test_customer_filtering_by_balance_status(self):
        url = reverse('customer-list')
        
        # Filter for active balance (should return customer1 only)
        response = self.client.get(url, {'balance_status': 'active'})
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.customer1.id)

        # Filter for cleared balance (should return customer2 only)
        response = self.client.get(url, {'balance_status': 'cleared'})
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.customer2.id)

    def test_quick_add_sale(self):
        url = reverse('sale-list')
        data = {
            'customer': self.customer1.id,
            'quantity': 50,
            'unit_type': 'Bags',
            'unit_price': '20.00',
            'payment_status': 'Pending'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(float(response.data['total_amount']), 1000.00)

    def test_quick_add_expense(self):
        url = reverse('expense-list')
        data = {
            'amount': '3500.00',
            'category': 'Electricity',
            'description': 'Main cold room electricity charges'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Expense.objects.count(), 2)

    def test_dashboard_overview(self):
        url = reverse('dashboard-overview')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify overview aggregates structure
        self.assertIn('metrics', response.data)
        self.assertIn('trend_30_days', response.data)
        self.assertIn('recent_activity', response.data)
        
        metrics = response.data['metrics']
        self.assertEqual(metrics['total_outstanding_receivables'], 2500.00)
        self.assertEqual(metrics['total_expenses_current_month'], 15200.00)
        self.assertEqual(metrics['total_revenue_current_month'], 6500.00) # $2500 + $4000

    def test_quick_add_context(self):
        url = reverse('dashboard-quick-add')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify structure
        self.assertIn('recent_customers', response.data)
        self.assertIn('customer_lookup', response.data)
        self.assertIn('expense_categories', response.data)
        self.assertIn('unit_types', response.data)
