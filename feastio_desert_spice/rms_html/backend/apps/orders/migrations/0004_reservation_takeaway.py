from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_payment'),
    ]

    operations = [
        migrations.CreateModel(
            name='Reservation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('customer_name', models.CharField(max_length=100)),
                ('customer_phone', models.CharField(max_length=20)),
                ('customer_email', models.EmailField(blank=True, default='')),
                ('party_size', models.PositiveIntegerField()),
                ('reserved_date', models.DateField()),
                ('reserved_time', models.TimeField()),
                ('status', models.CharField(choices=[('pending','Pending'),('confirmed','Confirmed'),('seated','Seated'),('cancelled','Cancelled'),('no_show','No Show')], default='pending', max_length=20)),
                ('notes', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('table', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reservations', to='orders.table')),
            ],
            options={'ordering': ['reserved_date', 'reserved_time']},
        ),
        migrations.CreateModel(
            name='Takeaway',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('customer_name', models.CharField(max_length=100)),
                ('customer_phone', models.CharField(max_length=20)),
                ('status', models.CharField(choices=[('pending','Pending'),('preparing','Preparing'),('ready','Ready'),('picked_up','Picked Up'),('cancelled','Cancelled')], default='pending', max_length=20)),
                ('total', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('payment_method', models.CharField(choices=[('cash','Cash'),('card','Card'),('qr','QR / Digital Wallet')], default='cash', max_length=20)),
                ('is_paid', models.BooleanField(default=False)),
                ('notes', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('ready_at', models.DateTimeField(blank=True, null=True)),
                ('picked_up_at', models.DateTimeField(blank=True, null=True)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='TakeawayItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.PositiveIntegerField(default=1)),
                ('price', models.DecimalField(decimal_places=2, max_digits=8)),
                ('menu_item', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='menu.menuitem')),
                ('takeaway', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='takeaway_items', to='orders.takeaway')),
            ],
        ),
    ]
