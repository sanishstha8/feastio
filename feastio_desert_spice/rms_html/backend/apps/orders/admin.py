from django.contrib import admin
from .models import Table, Order, OrderItem, Payment

admin.site.register(Table)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)
