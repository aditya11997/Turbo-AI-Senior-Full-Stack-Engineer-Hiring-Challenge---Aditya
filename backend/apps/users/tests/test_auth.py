import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.notes.models import Category
from apps.users.models import User

pytestmark = pytest.mark.django_db


def _client():
    return APIClient()


def test_register_creates_user_and_returns_tokens():
    client = _client()
    response = client.post(
        "/api/auth/register",
        {"email": "test@example.com", "password": "StrongPass123"},
        format="json",
    )
    assert response.status_code == 201
    assert response.data["tokens"]["access"]
    assert response.data["tokens"]["refresh"]
    assert response.data["user"]["email"] == "test@example.com"
    assert response.data["ui"]["landing_route"] == "/notes"
    assert User.objects.filter(email="test@example.com").exists()


def test_register_creates_default_categories_once():
    client = _client()
    client.post(
        "/api/auth/register",
        {"email": "cats@example.com", "password": "StrongPass123"},
        format="json",
    )
    user = User.objects.get(email="cats@example.com")
    categories = list(Category.objects.filter(user=user).values_list("name", flat=True))
    assert sorted(categories) == ["Personal", "Random Thoughts", "School"]

    # Ensure get_or_create does not create duplicates.
    for name in categories:
        Category.objects.get_or_create(user=user, name=name, defaults={"color_hex": "#000000"})
    assert Category.objects.filter(user=user).count() == 3


def test_login_success():
    User.objects.create_user(email="login@example.com", password="StrongPass123")
    client = _client()
    response = client.post(
        "/api/auth/login",
        {"email": "login@example.com", "password": "StrongPass123"},
        format="json",
    )
    assert response.status_code == 200
    assert response.data["tokens"]["access"]
    assert response.data["tokens"]["refresh"]


def test_me_requires_auth():
    client = _client()
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_bootstrap_requires_auth():
    client = _client()
    response = client.get("/api/auth/bootstrap")
    assert response.status_code == 401


def test_bootstrap_returns_ui_state():
    user = User.objects.create_user(email="bootstrap@example.com", password="StrongPass123")
    refresh = RefreshToken.for_user(user)
    client = _client()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    response = client.get("/api/auth/bootstrap")
    assert response.status_code == 200
    assert response.data["user"]["email"] == "bootstrap@example.com"
    assert response.data["ui"]["has_notes"] is False
    assert response.data["ui"]["landing_route"] == "/notes"
