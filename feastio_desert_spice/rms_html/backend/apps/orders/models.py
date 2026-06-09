from django.db import models
from apps.menu.models import MenuItem


class Table(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = 'available', 'Available'
        OCCUPIED = 'occupied', 'Occupied'
        RESERVED = 'reserved', 'Reserved'

    number = models.PositiveIntegerField(unique=True)
    capacity = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['number']

    def __str__(self):
        return f"Table {self.number} ({self.status})"


class Order(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
    
    class OrderType(models.TextChoices):
        DINE_IN  = 'dine_in',  'Dine In'
        TAKEAWAY = 'takeaway', 'Takeaway'

    table = models.ForeignKey(Table, on_delete=models.PROTECT, related_name='orders')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    order_type = models.CharField(max_length=20, choices=OrderType.choices, default=OrderType.DINE_IN)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - Table {self.table.number}"

    def calculate_total(self):
        total = sum(item.price * item.quantity for item in self.items.all())
        self.total = total
        self.save(update_fields=['total'])
        return total


class OrderItem(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PREPARING = 'preparing', 'Preparing'
        READY = 'ready', 'Ready'
        SERVED = 'served', 'Served'

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=8, decimal_places=2)  # price at time of order
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name} (Order #{self.order.id})"


class Payment(models.Model):
    class Method(models.TextChoices):
        CASH = 'cash', 'Cash'
        CARD = 'card', 'Card'
        QR = 'qr', 'QR / Digital Wallet'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'
        REFUNDED = 'refunded', 'Refunded'

    order = models.OneToOneField(Order, on_delete=models.PROTECT, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.CASH)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    tip = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    note = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    @property
    def grand_total(self):
        return self.amount + self.tip - self.discount

    def __str__(self):
        return f"Payment for Order #{self.order.id} — NRs {self.grand_total}"


class Reservation(models.Model):
    class Status(models.TextChoices):
        PENDING   = 'pending',   'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        SEATED    = 'seated',    'Seated'
        CANCELLED = 'cancelled', 'Cancelled'
        NO_SHOW   = 'no_show',   'No Show'

    customer_name  = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=20)
    customer_email = models.EmailField(blank=True, default='')
    table          = models.ForeignKey(Table, on_delete=models.SET_NULL, null=True, blank=True, related_name='reservations')
    party_size     = models.PositiveIntegerField()
    reserved_date  = models.DateField()
    reserved_time  = models.TimeField()
    status         = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes          = models.TextField(blank=True, default='')
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['reserved_date', 'reserved_time']

    def __str__(self):
        return f"Reservation: {self.customer_name} — {self.reserved_date} {self.reserved_time}"


class Takeaway(models.Model):
    class Status(models.TextChoices):
        PENDING   = 'pending',   'Pending'
        PREPARING = 'preparing', 'Preparing'
        READY     = 'ready',     'Ready'
        PICKED_UP = 'picked_up', 'Picked Up'
        CANCELLED = 'cancelled', 'Cancelled'

    class PaymentMethod(models.TextChoices):
        CASH = 'cash', 'Cash'
        CARD = 'card', 'Card'
        QR   = 'qr',   'QR / Digital Wallet'

    customer_name   = models.CharField(max_length=100)
    customer_phone  = models.CharField(max_length=20)
    status          = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    total           = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method  = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CASH)
    is_paid         = models.BooleanField(default=False)
    notes           = models.TextField(blank=True, default='')
    created_at      = models.DateTimeField(auto_now_add=True)
    ready_at        = models.DateTimeField(null=True, blank=True)
    picked_up_at    = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Takeaway #{self.id} — {self.customer_name}"

    def calculate_total(self):
        total = sum(item.price * item.quantity for item in self.takeaway_items.all())
        self.total = total
        self.save(update_fields=['total'])
        return total


class TakeawayItem(models.Model):
    takeaway  = models.ForeignKey(Takeaway, on_delete=models.CASCADE, related_name='takeaway_items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT)
    quantity  = models.PositiveIntegerField(default=1)
    price     = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name} (Takeaway #{self.takeaway.id})"
