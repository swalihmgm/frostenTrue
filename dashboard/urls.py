from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomerTypeViewSet,
    CustomerViewSet,
    SaleViewSet,
    ExpenseViewSet,
    DashboardOverviewView,
    QuickAddContextView
)

# Initialize Default DRF Router
router = DefaultRouter()
router.register(r'customer-types', CustomerTypeViewSet, basename='customer-type')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'sales', SaleViewSet, basename='sale')
router.register(r'expenses', ExpenseViewSet, basename='expense')

urlpatterns = [
    # Include router endpoints
    path('', include(router.urls)),
    
    # Custom dashboard aggregation and UI helper endpoints
    path('dashboard/overview/', DashboardOverviewView.as_view(), name='dashboard-overview'),
    path('dashboard/quick-add/', QuickAddContextView.as_view(), name='dashboard-quick-add'),
]
