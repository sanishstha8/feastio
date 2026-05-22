"""
Run this after migrations to load demo data:
    python seed.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from datetime import date, time, timedelta
from apps.accounts.models import User
from apps.menu.models import Category, MenuItem
from apps.orders.models import Table, Order, OrderItem
from apps.staff.models import Employee, Shift


def run():
    print("🌱 Seeding database...")

    # ── Users ────────────────────────────────────────────────
    manager, _ = User.objects.get_or_create(
        username='admin@restaurant.com',
        defaults=dict(email='admin@restaurant.com', first_name='Admin',
                      last_name='User', role='manager', is_staff=True)
    )
    manager.set_password('admin123')
    manager.save()

    waiter, _ = User.objects.get_or_create(
        username='waiter@restaurant.com',
        defaults=dict(email='waiter@restaurant.com', first_name='John',
                      last_name='Smith', role='waiter')
    )
    waiter.set_password('waiter123')
    waiter.save()

    kitchen, _ = User.objects.get_or_create(
        username='kitchen@restaurant.com',
        defaults=dict(email='kitchen@restaurant.com', first_name='Mike',
                  last_name='Chen', role='kitchen')
    )
    kitchen.set_password('kitchen123')
    kitchen.save()

    cashier, _ = User.objects.get_or_create(
        username='cashier@restaurant.com',
        defaults=dict(email='cashier@restaurant.com', first_name='Sarah',
                  last_name='Jones', role='cashier')
    )
    cashier.set_password('cashier123')
    cashier.save()

    print("  ✅ Users created")

    # ── Employee Profiles ─────────────────────────────────────
    Employee.objects.get_or_create(user=manager, defaults=dict(
        phone='555-0001', hourly_rate=25, shift='morning',
        status='active', hire_date=date(2022, 1, 1)
    ))
    Employee.objects.get_or_create(user=waiter, defaults=dict(
        phone='555-0002', hourly_rate=15, shift='morning',
        status='active', hire_date=date(2023, 3, 15)
    ))
    Employee.objects.get_or_create(user=kitchen, defaults=dict(
        phone='555-0003', hourly_rate=18, shift='morning',
        status='active', hire_date=date(2022, 8, 10)
    ))
    Employee.objects.get_or_create(user=cashier, defaults=dict(
        phone='555-0004', hourly_rate=14, shift='morning',
        status='active', hire_date=date(2023, 6, 1)
    ))


    print("  ✅ Employee profiles created")

    # ── Menu ─────────────────────────────────────────────────
    starters, _ = Category.objects.get_or_create(name='Starters')
    mains, _ = Category.objects.get_or_create(name='Main Course')
    drinks, _ = Category.objects.get_or_create(name='Drinks')
    desserts, _ = Category.objects.get_or_create(name='Desserts')

    menu_items = [
        (starters, 'Garlic Bread', 'Toasted bread with garlic butter', 4.99),
        (starters, 'Caesar Salad', 'Classic Caesar with croutons', 8.99),
        (starters, 'Soup of the Day', 'Ask your waiter for today\'s soup', 6.50),
        (mains, 'Grilled Chicken', 'With roasted vegetables and mashed potato', 16.99),
        (mains, 'Beef Burger', 'Double patty with fries', 14.99),
        (mains, 'Pasta Carbonara', 'Creamy bacon pasta', 13.99),
        (mains, 'Grilled Salmon', 'With lemon butter sauce', 19.99),
        (drinks, 'Soft Drink', 'Coke, Pepsi, Sprite', 2.99),
        (drinks, 'Fresh Juice', 'Orange, apple or mango', 4.50),
        (drinks, 'Coffee', 'Espresso, latte or cappuccino', 3.99),
        (desserts, 'Chocolate Cake', 'Warm with ice cream', 7.99),
        (desserts, 'Cheesecake', 'New York style', 6.99),
    ]

    for cat, name, desc, price in menu_items:
        MenuItem.objects.get_or_create(
            name=name,
            defaults=dict(category=cat, description=desc, price=price, available=True)
        )

    print("  ✅ Menu items created")

    # ── Tables ───────────────────────────────────────────────
    tables_data = [
        (1, 2), (2, 2), (3, 4), (4, 4), (5, 4),
        (6, 6), (7, 6), (8, 8), (9, 2), (10, 4),
    ]
    for number, capacity in tables_data:
        Table.objects.get_or_create(number=number, defaults=dict(capacity=capacity))

    print("  ✅ Tables created")

    # ── Sample active order ──────────────────────────────────
    table3 = Table.objects.get(number=3)
    if not Order.objects.filter(table=table3, status='active').exists():
        order = Order.objects.create(table=table3, status='active')
        table3.status = 'occupied'
        table3.save()
        burger = MenuItem.objects.get(name='Beef Burger')
        drink = MenuItem.objects.get(name='Soft Drink')
        OrderItem.objects.create(order=order, menu_item=burger, quantity=2, price=burger.price)
        OrderItem.objects.create(order=order, menu_item=drink, quantity=2, price=drink.price)
        order.calculate_total()

    print("  ✅ Sample order created (Table 3)")

    # ── Sample shifts ────────────────────────────────────────
    today = date.today()
    for emp_user, sh, et in [
        (waiter, time(8, 0), time(16, 0)),
        (kitchen, time(8, 0), time(16, 0)),
    ]:
        emp = Employee.objects.get(user=emp_user)
        Shift.objects.get_or_create(employee=emp, date=today, defaults=dict(
            start_time=sh, end_time=et, status='scheduled'
        ))

    print("  ✅ Shifts created")
    print("\n🎉 Done! You can now log in with:")
    print("   Manager : admin@restaurant.com / admin123")
    print("   Waiter  : waiter@restaurant.com / waiter123")
    print("   Kitchen : kitchen@restaurant.com / kitchen123")
    print("   Cashier : cashier@restaurant.com / cashier123")


if __name__ == '__main__':
    run()
