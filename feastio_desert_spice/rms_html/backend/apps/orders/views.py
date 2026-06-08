from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Table, Order, OrderItem
from .serializers import (
    TableSerializer, OrderSerializer,
    CreateOrderSerializer, OrderItemSerializer
)

class IsManagerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method in ['DELETE', 'POST']:
            return request.user.role == 'manager'
        return True

class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    permission_classes = [IsManagerOrReadOnly]

    @action(detail=True, methods=['patch'], url_path='set-status')
    def set_status(self, request, pk=None):
        """PATCH /api/orders/tables/{id}/set-status/  body: { status: 'available' }"""
        table = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ['available', 'occupied', 'reserved']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        table.status = new_status
        if request.data.get('notes') is not None:
            table.notes = request.data.get('notes')
        table.save()
        return Response(TableSerializer(table).data)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('table').prefetch_related('items__menu_item').all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='complete')
    def complete(self, request, pk=None):
        """PATCH /api/orders/orders/{id}/complete/"""
        order = self.get_object()
    
        # Check all items are ready or served
        not_ready = order.items.exclude(status__in=['ready', 'served'])
        if not_ready.exists():
            item_names = ', '.join(i.menu_item.name for i in not_ready)
            return Response(
                {'error': f'Cannot complete order. These items are not ready yet: {item_names}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
        order.status = 'completed'
        order.completed_at = timezone.now()
        order.save()
        order.table.status = 'available'
        order.table.save()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['patch'], url_path='cancel')
    def cancel(self, request, pk=None):
        """PATCH /api/orders/orders/{id}/cancel/"""
        order = self.get_object()
        order.status = 'cancelled'
        order.save()
        order.table.status = 'available'
        order.table.save()
        return Response(OrderSerializer(order).data)
    
    @action(detail=True, methods=['post'], url_path='add-items')
    def add_items(self, request, pk=None):
        order = self.get_object()
        if order.status != 'active':
           return Response(
                {'error': 'Can only add items to active orders'},
                status=status.HTTP_400_BAD_REQUEST
            )
        items_data = request.data.get('items', [])
        if not items_data:
           return Response({'error': 'No items provided'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.menu.models import MenuItem
        for item_data in items_data:
            try:
                menu_item = MenuItem.objects.get(pk=item_data['menu_item'])
                existing = order.items.filter(menu_item=menu_item).first()
                if existing:
                   existing.quantity += item_data.get('quantity', 1)
                   existing.save()
                else:
                    OrderItem.objects.create(
                        order=order,
                        menu_item=menu_item,
                        quantity=item_data.get('quantity', 1),
                        price=menu_item.price,
                    )
            except MenuItem.DoesNotExist:
               return Response(
                {'error': f"Menu item {item_data['menu_item']} not found"},
                status=status.HTTP_404_NOT_FOUND
             )
        order.calculate_total()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['patch'], url_path='items/(?P<item_id>[^/.]+)/status')
    def update_item_status(self, request, pk=None, item_id=None):
        """PATCH /api/orders/orders/{id}/items/{item_id}/status/  body: { status: 'preparing' }"""
        order = self.get_object()
        try:
            item = order.items.get(pk=item_id)
        except OrderItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in ['pending', 'preparing', 'ready', 'served']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        item.status = new_status
        item.save()
        return Response(OrderItemSerializer(item).data)


from .models import Payment
from .serializers import PaymentSerializer, CreatePaymentSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('order__table').all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='refund')
    def refund(self, request, pk=None):
        payment = self.get_object()
        if request.user.role != 'manager':
            return Response({'error': 'Only managers can refund payments'}, status=status.HTTP_403_FORBIDDEN)
        payment.status = 'refunded'
        payment.save()
        return Response(PaymentSerializer(payment).data)


# ── Reservation ViewSet ───────────────────────────────────────────────────────
from .models import Reservation, Takeaway, TakeawayItem
from .serializers import (
    ReservationSerializer,
    TakeawaySerializer, CreateTakeawaySerializer,
)

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.select_related('table').all()
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        date_filter = self.request.query_params.get('date')
        status_filter = self.request.query_params.get('status')
        if date_filter:
            qs = qs.filter(reserved_date=date_filter)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    @action(detail=True, methods=['patch'], url_path='set-status')
    def set_status(self, request, pk=None):
        reservation = self.get_object()
        new_status = request.data.get('status')
        valid = ['pending', 'confirmed', 'seated', 'cancelled', 'no_show']
        if new_status not in valid:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        reservation.status = new_status
        reservation.save()
        # If seated, mark table as occupied
        if new_status == 'seated' and reservation.table:
            reservation.table.status = 'occupied'
            reservation.table.save()
        # If cancelled/no_show, free the table
        if new_status in ['cancelled', 'no_show'] and reservation.table:
            reservation.table.status = 'available'
            reservation.table.save()
        return Response(ReservationSerializer(reservation).data)


# ── Takeaway ViewSet ──────────────────────────────────────────────────────────
class TakeawayViewSet(viewsets.ModelViewSet):
    queryset = Takeaway.objects.prefetch_related('takeaway_items__menu_item').all()
    serializer_class = TakeawaySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = CreateTakeawaySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        takeaway = serializer.save()
        return Response(TakeawaySerializer(takeaway).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='set-status')
    def set_status(self, request, pk=None):
        takeaway = self.get_object()
        new_status = request.data.get('status')
        valid = ['pending', 'preparing', 'ready', 'picked_up', 'cancelled']
        if new_status not in valid:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        from django.utils import timezone as tz
        takeaway.status = new_status
        if new_status == 'ready':
            takeaway.ready_at = tz.now()
        if new_status == 'picked_up':
            takeaway.picked_up_at = tz.now()
            takeaway.is_paid = True
        takeaway.save()
        return Response(TakeawaySerializer(takeaway).data)

    @action(detail=True, methods=['patch'], url_path='mark-paid')
    def mark_paid(self, request, pk=None):
        takeaway = self.get_object()
        takeaway.is_paid = True
        method = request.data.get('payment_method', takeaway.payment_method)
        takeaway.payment_method = method
        takeaway.save()
        return Response(TakeawaySerializer(takeaway).data)
