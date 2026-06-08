from django.contrib import admin
from .models import Table, Order, OrderItem, Payment, Reservation, Takeaway, TakeawayItem

admin.site.register(Table)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)
admin.site.register(Reservation)
admin.site.register(Takeaway)
admin.site.register(TakeawayItem)
