from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        MANAGER = 'manager', 'Manager'
        WAITER = 'waiter', 'Waiter'
        KITCHEN = 'kitchen', 'Kitchen'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.WAITER,
    )

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"

    @property
    def is_manager(self):
        return self.role == self.Role.MANAGER

    @property
    def is_staff_member(self):
        return self.role in [self.Role.WAITER, self.Role.KITCHEN]
