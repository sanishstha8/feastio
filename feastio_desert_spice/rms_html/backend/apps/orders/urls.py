from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TableViewSet, OrderViewSet, PaymentViewSet

router = DefaultRouter()
router.register('tables', TableViewSet, basename='table')
router.register('orders', OrderViewSet, basename='order')
router.register('payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]
