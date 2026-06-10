from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0004_reservation_takeaway'),
        ('orders', '0005_add_order_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reservation',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending',   'Pending'),
                    ('confirmed', 'Confirmed'),
                    ('seated',    'Seated'),
                    ('completed', 'Completed'),
                    ('cancelled', 'Cancelled'),
                    ('no_show',   'No Show'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
    ]