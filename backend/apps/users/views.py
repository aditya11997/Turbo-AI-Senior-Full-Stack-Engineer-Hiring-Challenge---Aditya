from django.contrib.auth import authenticate, get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from apps.notes.models import Note
from apps.users.serializers import RegisterSerializer, UserSerializer

User = get_user_model()


def _issue_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def _post_login_payload(user):
    """
    Decide what the frontend should show after login.
    """
    has_notes = Note.objects.filter(user=user).exists()

    return {
        "user": UserSerializer(user).data,
        "tokens": _issue_tokens(user),
        "ui": {
            "has_notes": has_notes,
            "default_category": "Random Thoughts",
            "landing_route": "/notes",
        },
    }


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        payload = _post_login_payload(user)
        payload["ui"]["landing_route"] = "/notes"
        payload["ui"]["has_notes"] = False
        return Response(payload, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(request, username=email, password=password)
        if not user:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response(_post_login_payload(user), status=status.HTTP_200_OK)


class RefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class BootstrapView(APIView):
    def get(self, request):
        has_notes = Note.objects.filter(user=request.user).exists()
        return Response(
            {
                "user": UserSerializer(request.user).data,
                "ui": {
                    "has_notes": has_notes,
                    "default_category": "Random Thoughts",
                    "landing_route": "/notes",
                },
            },
            status=status.HTTP_200_OK,
        )
