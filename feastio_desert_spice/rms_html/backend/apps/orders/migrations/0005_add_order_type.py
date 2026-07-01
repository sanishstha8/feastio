from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0004_reservation_takeaway'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='order_type',
            field=models.CharField(
                choices=[('dine_in', 'Dine In'), ('takeaway', 'Takeaway')],
                default='dine_in',
                max_length=20,
            ),
        ),
    ]