# RestaurantOS — Windows Setup (HTML + Django, No React needed!)
# ─────────────────────────────────────────────────────────────────
# This version runs entirely from Django. No npm, no Node.js needed.
# Just Python + Django and you're done.

## STEP 1 — Open PowerShell and go to the project folder
cd path\to\restaurant_os

## STEP 2 — Create virtual environment
python -m venv venv
venv\Scripts\Activate.ps1

# If you get execution policy error, run this first:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

## STEP 3 — Install dependencies
pip install Django==5.0.6 djangorestframework==3.15.2 djangorestframework-simplejwt==5.3.1 django-cors-headers==4.4.0 python-decouple==3.8

## STEP 4 — Setup environment
copy .env.example .env
# Open .env in notepad — the defaults work as-is for SQLite (no PostgreSQL needed)

## STEP 5 — Run migrations
python manage.py makemigrations accounts
python manage.py makemigrations menu
python manage.py makemigrations orders
python manage.py makemigrations staff
python manage.py migrate

## STEP 6 — Load demo data
python seed.py

## STEP 7 — Run the server
python manage.py runserver

## STEP 8 — Open your browser
# Go to: http://localhost:8000
# That's it! The full app runs at this single URL.

## ─────────────────────────────────────────────
## Demo Login Accounts
## ─────────────────────────────────────────────
# Manager  → admin@restaurant.com   / admin123
# Waiter   → waiter@restaurant.com  / waiter123
# Kitchen  → kitchen@restaurant.com / kitchen123

## ─────────────────────────────────────────────
## TROUBLESHOOTING
## ─────────────────────────────────────────────

# Error: venv\Scripts\Activate.ps1 cannot be loaded
# Fix: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Error: No module named 'django'
# Fix: Make sure venv is activated (you should see (venv) in your prompt)
#      Then run: pip install -r requirements.txt

# Error: No module named 'decouple'
# Fix: pip install python-decouple

# The app looks broken / CSS not loading
# Fix: python manage.py collectstatic --noinput
