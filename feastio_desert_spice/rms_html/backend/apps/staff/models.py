from django.db import models
from apps.accounts.models import User


class Employee(models.Model):
    class ShiftType(models.TextChoices):
        MORNING = 'morning', 'Morning'
        AFTERNOON = 'afternoon', 'Afternoon'
        EVENING = 'evening', 'Evening'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='employee_profile'
    )
    phone = models.CharField(max_length=20, blank=True)
    hourly_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    shift = models.CharField(max_length=20, choices=ShiftType.choices, default=ShiftType.MORNING)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    hire_date = models.DateField()

    class Meta:
        ordering = ['user__first_name']

    def __str__(self):
        return f"{self.user.get_full_name()} — {self.user.role}"


class Shift(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        ABSENT = 'absent', 'Absent'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='shifts')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    clock_in = models.DateTimeField(null=True, blank=True)
    clock_out = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-date', 'start_time']
        unique_together = ['employee', 'date']

    def __str__(self):
        return f"{self.employee} on {self.date}"

    @property
    def hours_worked(self):
        if self.clock_in and self.clock_out:
            delta = self.clock_out - self.clock_in
            return round(delta.total_seconds() / 3600, 2)
        return 0
