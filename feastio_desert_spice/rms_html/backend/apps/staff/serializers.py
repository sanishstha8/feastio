from rest_framework import serializers
from apps.accounts.models import User
from .models import Employee, Shift


class EmployeeUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']


class EmployeeSerializer(serializers.ModelSerializer):
    user = EmployeeUserSerializer(read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'full_name', 'role', 'email',
            'phone', 'hourly_rate', 'shift', 'status', 'hire_date',
        ]
        read_only_fields = ['id']


class CreateEmployeeSerializer(serializers.Serializer):
    """Creates a User + Employee profile in one step."""
    # User fields
    first_name  = serializers.CharField()
    last_name   = serializers.CharField(required=False, default='')
    email       = serializers.EmailField()
    password    = serializers.CharField(write_only=True, min_length=6)
    role        = serializers.ChoiceField(choices=['manager', 'waiter', 'kitchen'])
    # Employee fields
    phone       = serializers.CharField(required=False, default='')
    hourly_rate = serializers.DecimalField(max_digits=6, decimal_places=2, default=0)
    shift       = serializers.ChoiceField(choices=['morning', 'afternoon', 'evening'])
    status      = serializers.ChoiceField(choices=['active', 'inactive'], default='active')
    hire_date   = serializers.DateField()

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        # Create User
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data.get('last_name', ''),
            role=validated_data['role'],
        )
        # Create Employee profile
        employee = Employee.objects.create(
            user=user,
            phone=validated_data.get('phone', ''),
            hourly_rate=validated_data['hourly_rate'],
            shift=validated_data['shift'],
            status=validated_data['status'],
            hire_date=validated_data['hire_date'],
        )
        return employee


class ShiftSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    employee_role = serializers.CharField(source='employee.user.role', read_only=True)
    hours_worked  = serializers.FloatField(read_only=True)

    class Meta:
        model = Shift
        fields = [
            'id', 'employee', 'employee_name', 'employee_role',
            'date', 'start_time', 'end_time', 'status',
            'clock_in', 'clock_out', 'hours_worked', 'notes',
        ]
        read_only_fields = ['id', 'clock_in', 'clock_out', 'hours_worked']


class ClockInSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['clock_in', 'clock_out'])