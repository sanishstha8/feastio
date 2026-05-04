from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, MenuItem
from .serializers import CategorySerializer, MenuItemSerializer


class IsManagerOrReadOnly(permissions.BasePermission):
    """Managers can write; waiter/kitchen can only read."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'manager'


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsManagerOrReadOnly]


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.select_related('category').all()
    serializer_class = MenuItemSerializer
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter by availability if requested
        available = self.request.query_params.get('available')
        if available is not None:
            qs = qs.filter(available=available.lower() == 'true')
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category_id=category)
        return qs

    @action(detail=True, methods=['patch'], url_path='toggle-availability')
    def toggle_availability(self, request, pk=None):
        """PATCH /api/menu/items/{id}/toggle-availability/"""
        item = self.get_object()
        item.available = not item.available
        item.save()
        return Response(MenuItemSerializer(item).data)
