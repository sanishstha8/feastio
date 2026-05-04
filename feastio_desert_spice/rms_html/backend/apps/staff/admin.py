from django.contrib import admin
from .models import Employee, Shift


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'shift', 'status', 'hourly_rate', 'hire_date']
    list_filter = ['shift', 'status', 'user__role']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'start_time', 'end_time', 'status', 'hours_worked']
    list_filter = ['status', 'date']
    search_fields = ['employee__user__first_name', 'employee__user__last_name']
