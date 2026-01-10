from django.db import transaction
from rest_framework import serializers

from apps.notes.models import Category
from apps.users.models import User

DEFAULT_CATEGORIES = [
    ("Random Thoughts", "#EF9C66"),
    ("School", "#FCDC94"),
    ("Personal", "#78ABA8"),
]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email")


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def create(self, validated_data):
        with transaction.atomic():
            user = User.objects.create_user(
                email=validated_data["email"],
                password=validated_data["password"],
            )
            for name, color_hex in DEFAULT_CATEGORIES:
                Category.objects.get_or_create(
                    user=user,
                    name=name,
                    defaults={"color_hex": color_hex},
                )
        return user
