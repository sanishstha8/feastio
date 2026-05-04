from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role']

    def create(self, validated_data):
        # Always set username = email so login works
        validated_data['username'] = validated_data.get('email', validated_data['username'])
        user = User.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Allow login with email address.
    Looks up user by email and authenticates with password.
    """
    def validate(self, attrs):
        # attrs['username'] contains whatever the user typed in the username field
        # We treat it as an email lookup
        login_input = attrs.get('username', '')

        # Try to find user by email first, fall back to username
        try:
            user_obj = User.objects.get(email=login_input)
            attrs['username'] = user_obj.username
        except User.DoesNotExist:
            pass  # let simplejwt handle it normally (username login)

        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
