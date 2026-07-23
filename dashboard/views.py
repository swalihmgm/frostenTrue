from django.shortcuts import render
from rest_framework import viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, F, Q, Max
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta, date
from calendar import monthrange

from .models import CustomerType, Customer, Sale, Expense
from .serializers import (
    CustomerTypeSerializer, 
    CustomerSerializer, 
    SaleSerializer, 
    ExpenseSerializer
)

from rest_framework import permissions

class IsManagerUser(permissions.BasePermission):
    """
    Allows access only to manager (staff) users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser))


class IsManagerOrReadOnlyCustomer(permissions.BasePermission):
    """
    Allows full access to managers, and read-only access to customer users for their own data.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_staff or request.user.is_superuser:
            return True
        if request.method in permissions.SAFE_METHODS and hasattr(request.user, 'customer'):
            return True
        return False


class CustomerTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and editing customer types.
    """
    permission_classes = [IsManagerUser]
    queryset = CustomerType.objects.all()
    serializer_class = CustomerTypeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class CustomerViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing, creating, and modifying customers.
    Supports balance-based filtering and custom search options.
    """
    permission_classes = [IsManagerOrReadOnlyCustomer]
    serializer_class = CustomerSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'phone', 'custom_id']
    ordering_fields = ['name', 'custom_id', 'created_at']

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Customer.objects.none()
            
        if not (user.is_staff or user.is_superuser):
            if hasattr(user, 'customer'):
                return Customer.objects.filter(id=user.customer.id)
            return Customer.objects.none()

        queryset = Customer.objects.all()
        
        # Filter by customer type
        customer_type = self.request.query_params.get('customer_type')
        if customer_type:
            queryset = queryset.filter(customer_type_id=customer_type)

        # Filter by status (balance_status)
        balance_status = self.request.query_params.get('balance_status')
        if balance_status:
            if balance_status == 'active':
                queryset = queryset.filter(sales__payment_status__in=['Pending', 'Overdue']).distinct()
            elif balance_status == 'cleared':
                queryset = queryset.exclude(sales__payment_status__in=['Pending', 'Overdue'])
            elif balance_status == 'overdue':
                queryset = queryset.filter(sales__payment_status='Overdue').distinct()

        return queryset


class SaleViewSet(viewsets.ModelViewSet):
    """
    API endpoint for logging and viewing transactions of ice bags or blocks.
    Supports detailed search, customer filters, payment status, and date range filters.
    """
    permission_classes = [IsManagerOrReadOnlyCustomer]
    serializer_class = SaleSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['customer__name', 'customer__custom_id', 'id']
    ordering_fields = ['date', 'quantity', 'unit_price', 'created_at']

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Sale.objects.none()
            
        if not (user.is_staff or user.is_superuser):
            if hasattr(user, 'customer'):
                return Sale.objects.filter(customer=user.customer)
            return Sale.objects.none()

        queryset = Sale.objects.all()
        
        customer = self.request.query_params.get('customer')
        if customer:
            queryset = queryset.filter(customer_id=customer)

        payment_status = self.request.query_params.get('payment_status')
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)

        unit_type = self.request.query_params.get('unit_type')
        if unit_type:
            queryset = queryset.filter(unit_type=unit_type)

        customer_type = self.request.query_params.get('customer_type')
        if customer_type:
            queryset = queryset.filter(customer__customer_type_id=customer_type)

        # Date Range Filtering
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        return queryset


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for logging and managing operational expenditures.
    """
    permission_classes = [IsManagerUser]
    serializer_class = ExpenseSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['category', 'description']
    ordering_fields = ['date', 'amount', 'created_at']

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Expense.objects.none()

        queryset = Expense.objects.all()
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        return queryset


class DashboardOverviewView(APIView):
    """
    Custom endpoint to retrieve aggregated metrics, trends, and recent logs
    specifically formatted for the Frozen True Financial Dashboard UI.
    """
    def get(self, request, *args, **kwargs):
        # Check permissions
        user = request.user
        if not user or not user.is_authenticated:
            return Response({'detail': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        today = timezone.localdate()
        is_manager = user.is_staff or user.is_superuser
        
        if not is_manager:
            if not hasattr(user, 'customer'):
                return Response({'detail': 'Customer profile not found'}, status=status.HTTP_403_FORBIDDEN)
            
            customer = user.customer
            
            # Customer metrics:
            total_outstanding = customer.total_outstanding_balance
            
            # Trend (Last 30 Days) for this customer
            dates_list = [today - timedelta(days=i) for i in range(29, -1, -1)]
            sales_30_days = Sale.objects.filter(customer=customer, date__gte=dates_list[0], date__lte=today)
            daily_sales = sales_30_days.annotate(
                total=F('quantity') * F('unit_price')
            ).values('date').annotate(
                day_total=Sum('total')
            )
            daily_sales_map = {item['date']: item['day_total'] for item in daily_sales}
            trend_data = []
            for d in dates_list:
                trend_data.append({
                    'date': d.strftime('%Y-%m-%d'),
                    'label': d.strftime('%b %d'),
                    'amount': float(daily_sales_map.get(d) or Decimal('0.00'))
                })
                
            # Recent Activity: Latest 5 sales for this customer
            recent_sales = Sale.objects.filter(customer=customer).order_by('-date', '-created_at')[:5]
            recent_sales_serialized = SaleSerializer(recent_sales, many=True).data
            
            payload = {
                'metrics': {
                    'total_revenue_current_month': 0.00,
                    'total_revenue_previous_month': 0.00,
                    'revenue_growth_percentage': 0.0,
                    'total_expenses_current_month': 0.00,
                    'total_expenses_previous_month': 0.00,
                    'total_outstanding_receivables': float(total_outstanding),
                    'active_due_customers_count': 0
                },
                'trend_30_days': trend_data,
                'recent_activity': recent_sales_serialized
            }
            return Response(payload, status=status.HTTP_200_OK)

        # 1. Calculate Current Month Boundaries
        first_day_curr = date(today.year, today.month, 1)
        _, last_day_curr_num = monthrange(today.year, today.month)
        last_day_curr = date(today.year, today.month, last_day_curr_num)
        
        # 2. Calculate Previous Month Boundaries for Trend Comparisons
        if today.month == 1:
            first_day_prev = date(today.year - 1, 12, 1)
            last_day_prev = date(today.year - 1, 12, 31)
        else:
            first_day_prev = date(today.year, today.month - 1, 1)
            _, last_day_prev_num = monthrange(today.year, today.month - 1)
            last_day_prev = date(today.year, today.month - 1, last_day_prev_num)

        # 3. Revenue Metrics
        # Current Month Revenue
        curr_month_sales = Sale.objects.filter(date__gte=first_day_curr, date__lte=last_day_curr)
        curr_revenue = curr_month_sales.annotate(
            total=F('quantity') * F('unit_price')
        ).aggregate(grand_total=Sum('total'))['grand_total'] or Decimal('0.00')

        # Previous Month Revenue
        prev_month_sales = Sale.objects.filter(date__gte=first_day_prev, date__lte=last_day_prev)
        prev_revenue = prev_month_sales.annotate(
            total=F('quantity') * F('unit_price')
        ).aggregate(grand_total=Sum('total'))['grand_total'] or Decimal('0.00')

        # Growth Percentage Calculation
        growth_percentage = 0.00
        if prev_revenue > 0:
            growth_percentage = float(((curr_revenue - prev_revenue) / prev_revenue) * 100)

        # 4. Expense Metrics
        # Current Month Expenses
        curr_month_expenses = Expense.objects.filter(date__gte=first_day_curr, date__lte=last_day_curr)
        curr_expenses = curr_month_expenses.aggregate(grand_total=Sum('amount'))['grand_total'] or Decimal('0.00')

        # Previous Month Expenses (for potential breakdowns)
        prev_month_expenses = Expense.objects.filter(date__gte=first_day_prev, date__lte=last_day_prev)
        prev_expenses = prev_month_expenses.aggregate(grand_total=Sum('amount'))['grand_total'] or Decimal('0.00')

        # 5. Outstanding Receivables Metrics (All Time)
        total_outstanding = Sale.objects.filter(
            payment_status__in=['Pending', 'Overdue']
        ).annotate(
            total=F('quantity') * F('unit_price')
        ).aggregate(grand_total=Sum('total'))['grand_total'] or Decimal('0.00')

        # Active customer count with dues
        active_due_customers_count = Customer.objects.filter(
            sales__payment_status__in=['Pending', 'Overdue']
        ).distinct().count()

        # 6. Sales Trend (Last 30 Days)
        dates_list = [today - timedelta(days=i) for i in range(29, -1, -1)]
        sales_30_days = Sale.objects.filter(date__gte=dates_list[0], date__lte=today)
        
        # Query sum grouped by date
        daily_sales = sales_30_days.annotate(
            total=F('quantity') * F('unit_price')
        ).values('date').annotate(
            day_total=Sum('total')
        )
        
        daily_sales_map = {item['date']: item['day_total'] for item in daily_sales}
        
        trend_data = []
        for d in dates_list:
            trend_data.append({
                'date': d.strftime('%Y-%m-%d'),
                'label': d.strftime('%b %d'),
                'amount': float(daily_sales_map.get(d) or Decimal('0.00'))
            })

        # 7. Recent Transactions (Latest 5 Sales)
        recent_sales = Sale.objects.all().order_by('-date', '-created_at')[:5]
        recent_sales_serialized = SaleSerializer(recent_sales, many=True).data

        # Calculate Expense Growth Percentage
        expenses_growth_percentage = 0.00
        if prev_expenses > 0:
            expenses_growth_percentage = float(((curr_expenses - prev_expenses) / prev_expenses) * 100)

        # 8. Return Aggregated Payload
        payload = {
            'metrics': {
                'total_revenue_current_month': float(curr_revenue),
                'total_revenue_previous_month': float(prev_revenue),
                'revenue_growth_percentage': round(growth_percentage, 1),
                'total_expenses_current_month': float(curr_expenses),
                'total_expenses_previous_month': float(prev_expenses),
                'expenses_growth_percentage': round(expenses_growth_percentage, 1),
                'budgeted_expenses': 45000.00,
                'total_outstanding_receivables': float(total_outstanding),
                'active_due_customers_count': active_due_customers_count
            },
            'trend_30_days': trend_data,
            'recent_activity': recent_sales_serialized
        }
        return Response(payload, status=status.HTTP_200_OK)


class QuickAddContextView(APIView):
    """
    Returns quick lookup parameters such as recent customers, all customer brief 
    details, categories, and unit parameters to feed the Quick Add Modal UI.
    """
    def get(self, request, *args, **kwargs):
        # 1. Fetch 5 most recent customers ordered by their latest purchase
        recent_customer_ids = Sale.objects.values('customer').annotate(
            latest_sale=Max('created_at')
        ).order_by('-latest_sale')[:5]
        
        recent_ids = [item['customer'] for item in recent_customer_ids]
        
        # Ensure ordering is preserved matching recent activity
        recent_customers = sorted(
            Customer.objects.filter(id__in=recent_ids),
            key=lambda c: recent_ids.index(c.id)
        )
        
        # Fall back to latest created customers if no sales logged
        if not recent_customers:
            recent_customers = Customer.objects.all().order_by('-created_at')[:5]

        # 2. Brief summary of all customers (for dropdown lookup)
        all_customers = Customer.objects.all().order_by('name')
        
        recent_data = [
            {'id': c.id, 'name': c.name, 'custom_id': c.custom_id} 
            for c in recent_customers
        ]
        
        lookup_data = [
            {'id': c.id, 'name': c.name, 'custom_id': c.custom_id} 
            for c in all_customers
        ]

        # 3. Categorization constants matching choices
        expense_categories = [cat[0] for cat in Expense.CATEGORY_CHOICES]
        unit_types = [unit[0] for unit in Sale.UNIT_TYPE_CHOICES]

        return Response({
            'recent_customers': recent_data,
            'customer_lookup': lookup_data,
            'expense_categories': expense_categories,
            'unit_types': unit_types
        }, status=status.HTTP_200_OK)


class LoginView(APIView):
    """
    API endpoint for user login.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        from django.contrib.auth import authenticate, login
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            role = 'manager' if (user.is_staff or user.is_superuser) else 'customer'
            customer_id = user.customer.id if hasattr(user, 'customer') else None
            return Response({
                'username': user.username,
                'email': user.email,
                'role': role,
                'customer_id': customer_id
            }, status=status.HTTP_200_OK)
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    API endpoint for user logout.
    """
    def post(self, request):
        from django.contrib.auth import logout
        logout(request)
        return Response({'detail': 'Successfully logged out'}, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    """
    API endpoint to retrieve the current logged-in user.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        if request.user.is_authenticated:
            user = request.user
            role = 'manager' if (user.is_staff or user.is_superuser) else 'customer'
            customer_id = user.customer.id if hasattr(user, 'customer') else None
            return Response({
                'username': user.username,
                'email': user.email,
                'role': role,
                'customer_id': customer_id
            }, status=status.HTTP_200_OK)
        return Response({'detail': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

