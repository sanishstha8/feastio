from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, ShiftViewSet

router = DefaultRouter()
router.register('employees', EmployeeViewSet, basename='employee')
router.register('shifts', ShiftViewSet, basename='shift')

urlpatterns = [
    path('', include(router.urls)),
]
