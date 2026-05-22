from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=__import__('django.db.models', fromlist=['CharField']).CharField(
                choices=[
                    ('manager', 'Manager'),
                    ('waiter', 'Waiter'),
                    ('kitchen', 'Kitchen'),
                    ('cashier', 'Cashier'),
                ],
                default='waiter',
                max_length=20,
            ),
        ),
    ]