from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TableViewSet, OrderViewSet

router = DefaultRouter()
router.register('tables', TableViewSet, basename='table')
router.register('orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
