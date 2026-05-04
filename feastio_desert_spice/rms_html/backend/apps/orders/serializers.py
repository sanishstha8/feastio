from rest_framework import serializers
from .models import Table, Order, OrderItem, Payment


class TableSerializer(serializers.ModelSerializer):
    current_order_id = serializers.SerializerMethodField()

    class Meta:
        model = Table
        fields = ['id', 'number', 'capacity', 'status', 'notes','current_order_id']

    def get_current_order_id(self, obj):
        active = obj.orders.filter(status='active').first()
        return active.id if active else None


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'quantity', 'price', 'status']
        read_only_fields = ['id', 'price']  # price is set from menu item on create


class CreateOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['menu_item', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    table_number = serializers.IntegerField(source='table.number', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'table', 'table_number', 'status', 'total',
                  'items', 'created_at', 'completed_at']
        read_only_fields = ['id', 'total', 'created_at', 'completed_at']


class CreateOrderSerializer(serializers.Serializer):
    table_id = serializers.IntegerField()
    items = CreateOrderItemSerializer(many=True)

    def validate_table_id(self, value):
        try:
            table = Table.objects.get(pk=value)
        except Table.DoesNotExist:
            raise serializers.ValidationError("Table not found.")
        if table.status == 'occupied':
            raise serializers.ValidationError("Table is already occupied.")
        return value

    def create(self, validated_data):
        from django.utils import timezone
        table = Table.objects.get(pk=validated_data['table_id'])
        order = Order.objects.create(table=table, status='active')

        for item_data in validated_data['items']:
            menu_item = item_data['menu_item']
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=item_data['quantity'],
                price=menu_item.price,
            )

        order.calculate_total()
        table.status = 'occupied'
        table.save()
        return order


class PaymentSerializer(serializers.ModelSerializer):
    grand_total = serializers.ReadOnlyField()
    table_number = serializers.IntegerField(source='order.table.number', read_only=True)
    order_created_at = serializers.DateTimeField(source='order.created_at', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'table_number', 'order_created_at',
            'amount', 'tip', 'discount', 'grand_total',
            'method', 'status', 'note', 'created_at', 'paid_at',
        ]
        read_only_fields = ['id', 'created_at', 'grand_total', 'table_number', 'order_created_at']


class CreatePaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    method = serializers.ChoiceField(choices=['cash', 'card', 'qr'])
    tip = serializers.DecimalField(max_digits=8, decimal_places=2, default=0, required=False)
    discount = serializers.DecimalField(max_digits=8, decimal_places=2, default=0, required=False)
    note = serializers.CharField(allow_blank=True, required=False, default='')

    def validate_order_id(self, value):
        try:
            order = Order.objects.get(pk=value)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found.")
        if order.status != 'completed':
            raise serializers.ValidationError("Can only create payment for completed orders.")
        if hasattr(order, 'payment') and order.payment.status == 'paid':
            raise serializers.ValidationError("This order is already paid.")
        return value

    def create(self, validated_data):
        from django.utils import timezone
        order = Order.objects.get(pk=validated_data['order_id'])
        payment, _ = Payment.objects.get_or_create(
            order=order,
            defaults={
                'amount': order.total,
                'method': validated_data['method'],
                'tip': validated_data.get('tip', 0),
                'discount': validated_data.get('discount', 0),
                'note': validated_data.get('note', ''),
                'status': 'paid',
                'paid_at': timezone.now(),
            }
        )
        if not _:
            payment.method = validated_data['method']
            payment.tip = validated_data.get('tip', 0)
            payment.discount = validated_data.get('discount', 0)
            payment.note = validated_data.get('note', '')
            payment.status = 'paid'
            payment.paid_at = timezone.now()
            payment.save()
        return payment
