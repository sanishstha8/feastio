from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TableViewSet, OrderViewSet, PaymentViewSet, ReservationViewSet, TakeawayViewSet

router = DefaultRouter()
router.register('tables',       TableViewSet,       basename='table')
router.register('orders',       OrderViewSet,       basename='order')
router.register('payments',     PaymentViewSet,     basename='payment')
router.register('reservations', ReservationViewSet, basename='reservation')
router.register('takeaways',    TakeawayViewSet,    basename='takeaway')

urlpatterns = [
    path('', include(router.urls)),
]
