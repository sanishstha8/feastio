from rest_framework import serializers
from .models import Table, Order, OrderItem


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
