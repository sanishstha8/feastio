from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0004_reservation_takeaway'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reservation',
            name='status',
            field=__import__('django.db.models', fromlist=['CharField']).CharField(
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