from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta, date
import random

from dashboard.models import CustomerType, Customer, Sale, Expense

class Command(BaseCommand):
    help = 'Seeds realistic sample data to populate the Frozen True dashboard visual UI.'

    def handle(self, *args, **kwargs):
        self.stdout.write('Clearing existing dashboard records...')
        Sale.objects.all().delete()
        Customer.objects.all().delete()
        CustomerType.objects.all().delete()
        Expense.objects.all().delete()

        self.stdout.write('Creating Customer Types...')
        shops_type = CustomerType.objects.create(name='Shops', description='Retail outlets and convenience shops')
        events_type = CustomerType.objects.create(name='Events', description='Exhibitions, festivals, and weddings')
        dist_type = CustomerType.objects.create(name='Distributors', description='Wholesalers and cold storage logistics providers')

        self.stdout.write('Creating Customer master list matching the UI design...')
        customers_data = [
            # (Name, Custom ID, Phone, Customer Type)
            ('Alingal Traders', 'FT-8821', '+91 98765 43210', shops_type),
            ('Tirur Cold Storage', 'FT-9012', '+91 99955 12345', dist_type),
            ('Frozen Express', 'FT-8110', '+91 94477 67890', dist_type),
            ('Malabar Ice Hub', 'FT-7729', '+91 98460 55566', dist_type),
            ('City Central Mart', 'FT-2201', '+91 85940 33322', shops_type),
            ('Blue Ocean Seafood', 'FT-3341', '+91 90201 11223', shops_type),
            ('Crystal Cold Storage', 'FT-4412', '+91 97444 88899', dist_type),
            ('Hotel Marina', 'FT-5501', '+91 95622 33445', shops_type),
            ('Deep Sea Logistics', 'FT-6623', '+91 91234 56789', dist_type),
        ]

        customers = {}
        for name, custom_id, phone, c_type in customers_data:
            cust = Customer.objects.create(
                name=name,
                custom_id=custom_id,
                phone=phone,
                customer_type=c_type
            )
            customers[name] = cust

        self.stdout.write('Creating transaction logs and sales over the last 30 days...')
        today = timezone.localdate()

        # Let's seed specific unpaid transactions to match the dashboard's exact expected balances
        # 1. Alingal Traders: ₹2,500 due (Pending)
        Sale.objects.create(
            date=today,
            customer=customers['Alingal Traders'],
            quantity=100,
            unit_type='Bags',
            unit_price=Decimal('25.00'),
            payment_status='Pending'
        )

        # 2. Tirur Cold Storage: ₹14,200 due (Pending)
        Sale.objects.create(
            date=today - timedelta(days=1),
            customer=customers['Tirur Cold Storage'],
            quantity=568,
            unit_type='Kg',
            unit_price=Decimal('25.00'),
            payment_status='Pending'
        )

        # 3. Malabar Ice Hub: ₹5,100 due (Overdue)
        Sale.objects.create(
            date=today - timedelta(days=4),
            customer=customers['Malabar Ice Hub'],
            quantity=170,
            unit_type='Kg',
            unit_price=Decimal('30.00'),
            payment_status='Overdue'
        )

        # 4. City Central Mart: ₹1,250 due (Pending)
        Sale.objects.create(
            date=today - timedelta(days=3),
            customer=customers['City Central Mart'],
            quantity=50,
            unit_type='Bags',
            unit_price=Decimal('25.00'),
            payment_status='Pending'
        )

        # 5. Blue Ocean Seafood: ₹4,250 (Paid)
        Sale.objects.create(
            date=today - timedelta(days=2),
            customer=customers['Blue Ocean Seafood'],
            quantity=170,
            unit_type='Bags',
            unit_price=Decimal('25.00'),
            payment_status='Paid'
        )

        # 6. Crystal Cold Storage: ₹12,800 (Pending)
        Sale.objects.create(
            date=today - timedelta(days=2),
            customer=customers['Crystal Cold Storage'],
            quantity=320,
            unit_type='Kg',
            unit_price=Decimal('40.00'),
            payment_status='Pending'
        )

        # 7. Hotel Marina: ₹2,100 (Paid)
        Sale.objects.create(
            date=today - timedelta(days=3),
            customer=customers['Hotel Marina'],
            quantity=70,
            unit_type='Bags',
            unit_price=Decimal('30.00'),
            payment_status='Paid'
        )

        # 8. Deep Sea Logistics: ₹5,600 (Overdue)
        Sale.objects.create(
            date=today - timedelta(days=5),
            customer=customers['Deep Sea Logistics'],
            quantity=140,
            unit_type='Kg',
            unit_price=Decimal('40.00'),
            payment_status='Overdue'
        )

        # 9. Frozen Express: ₹0 due, but log some historical paid sales
        Sale.objects.create(
            date=today - timedelta(days=10),
            customer=customers['Frozen Express'],
            quantity=500,
            unit_type='Bags',
            unit_price=Decimal('20.00'),
            payment_status='Paid'
        )

        # Seed additional sales scattered throughout the last 30 days to build a beautiful chart line
        customer_pool = list(customers.values())
        for i in range(29, -1, -1):
            sale_date = today - timedelta(days=i)
            # Skip if we already populated above to avoid duplicate heavy spikes, or add extra normal noise
            if random.random() > 0.4:
                cust = random.choice(customer_pool)
                qty = random.randint(10, 150)
                price = random.choice([20.00, 25.00, 30.00])
                Sale.objects.create(
                    date=sale_date,
                    customer=cust,
                    quantity=qty,
                    unit_type=random.choice(['Bags', 'Kg']),
                    unit_price=Decimal(str(price)),
                    payment_status=random.choice(['Paid', 'Paid', 'Paid', 'Pending'])
                )

        self.stdout.write('Creating Expense records matching UI breakdown Rs. 45,200...')
        Expense.objects.create(
            date=today - timedelta(days=2),
            amount=Decimal('15200.00'),
            category='Fuel',
            description='Diesel for generator and cold delivery trucks'
        )
        Expense.objects.create(
            date=today - timedelta(days=5),
            amount=Decimal('18000.00'),
            category='Electricity',
            description='KSEB monthly power charges for main ice plant'
        )
        Expense.objects.create(
            date=today - timedelta(days=8),
            amount=Decimal('7500.00'),
            category='Maintenance',
            description='Condenser repairs and compressor oil replacement'
        )
        Expense.objects.create(
            date=today - timedelta(days=12),
            amount=Decimal('4500.00'),
            category='Other',
            description='Office logistics supplies and packing materials'
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded all initial database dashboard rows!'))
