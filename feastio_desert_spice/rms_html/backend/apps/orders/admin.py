from django.contrib import admin
from .models import Table, Order, OrderItem


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ['number', 'capacity', 'status']
    list_filter = ['status']
    list_editable = ['status']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['price']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'table', 'status', 'total', 'created_at']
    list_filter = ['status']
    inlines = [OrderItemInline]
    readonly_fields = ['total', 'created_at', 'completed_at']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'menu_item', 'quantity', 'price', 'status']
    list_filter = ['status']
