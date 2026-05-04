from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Employee, Shift
from .serializers import EmployeeSerializer, ShiftSerializer, ClockInSerializer, CreateEmployeeSerializer


class IsManagerOnly(permissions.BasePermission):
    """Only managers can manage staff & shifts."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'manager'


class IsManagerOrSelf(permissions.BasePermission):
    """Managers can do anything; staff can only read their own records."""
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'manager':
            return True
        # Allow staff to read their own employee profile
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'employee'):
            return obj.employee.user == request.user
        return False


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related('user').all()

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateEmployeeSerializer
        return EmployeeSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsManagerOrSelf()]
        return [IsManagerOnly()]

    def create(self, request, *args, **kwargs):
        serializer = CreateEmployeeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        employee = serializer.save()
        return Response(EmployeeSerializer(employee).data, status=status.HTTP_201_CREATED)


class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.select_related('employee__user').all()
    serializer_class = ShiftSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'clock']:
            return [permissions.IsAuthenticated()]
        return [IsManagerOnly()]

    def get_queryset(self):
        qs = super().get_queryset()
        # Managers see all; staff see only their own shifts
        if self.request.user.role != 'manager':
            qs = qs.filter(employee__user=self.request.user)
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        # Filter by employee
        employee_id = self.request.query_params.get('employee')
        if employee_id:
            qs = qs.filter(employee_id=employee_id)
        return qs

    @action(detail=True, methods=['post'], url_path='clock')
    def clock(self, request, pk=None):
        """
        POST /api/staff/shifts/{id}/clock/
        body: { "action": "clock_in" | "clock_out" }
        """
        shift = self.get_object()
        serializer = ClockInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action_type = serializer.validated_data['action']
        now = timezone.now()

        if action_type == 'clock_in':
            if shift.clock_in:
                return Response(
                    {'error': 'Already clocked in'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            shift.clock_in = now
            shift.status = 'in_progress'
        else:
            if not shift.clock_in:
                return Response(
                    {'error': 'Must clock in first'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if shift.clock_out:
                return Response(
                    {'error': 'Already clocked out'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            shift.clock_out = now
            shift.status = 'completed'

        shift.save()
        return Response(ShiftSerializer(shift).data)
