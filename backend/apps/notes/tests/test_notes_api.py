import pytest
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.notes.models import Category, Note
from apps.users.models import User
from apps.users.serializers import DEFAULT_CATEGORIES

pytestmark = pytest.mark.django_db


def create_user(email: str, password: str = "StrongPass123"):
    return User.objects.create_user(email=email, password=password)


def seed_categories(user: User):
    for name, color_hex in DEFAULT_CATEGORIES:
        Category.objects.get_or_create(user=user, name=name, defaults={"color_hex": color_hex})


def auth_client(user: User):
    refresh = RefreshToken.for_user(user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return client


def test_unauthorized_access():
    client = APIClient()
    summary_response = client.get("/api/notes/summary")
    assert summary_response.status_code == 401

    create_response = client.post("/api/notes", {}, format="json")
    assert create_response.status_code == 401


def test_summary_for_new_user():
    user = create_user("newuser@example.com")
    seed_categories(user)
    client = auth_client(user)

    response = client.get("/api/notes/summary")
    assert response.status_code == 200
    assert response.data["has_notes"] is False
    assert response.data["total_notes"] == 0

    categories = response.data["categories"]
    assert len(categories) == 3
    names = sorted([item["name"] for item in categories])
    assert names == ["Personal", "Random Thoughts", "School"]
    assert all(item["count"] == 0 for item in categories)


def test_new_note_creates_with_defaults():
    user = create_user("defaults@example.com")
    seed_categories(user)
    client = auth_client(user)

    response = client.post("/api/notes", {}, format="json")
    assert response.status_code == 201
    assert response.data["title"] == "Note Title"
    assert response.data["content"] == "Pour your heart out..."
    assert response.data["category"]["name"] == "Random Thoughts"
    assert Note.objects.filter(user=user).count() == 1

    summary = client.get("/api/notes/summary")
    assert summary.data["has_notes"] is False
    assert summary.data["total_notes"] == 0
    category_counts = {item["name"]: item["count"] for item in summary.data["categories"]}
    assert category_counts["Random Thoughts"] == 0


def test_create_note_with_explicit_category():
    user = create_user("school@example.com")
    seed_categories(user)
    client = auth_client(user)

    response = client.post(
        "/api/notes", {"category_name": "School"}, format="json"
    )
    assert response.status_code == 201
    assert response.data["category"]["name"] == "School"

    summary = client.get("/api/notes/summary")
    assert summary.data["has_notes"] is False
    assert summary.data["total_notes"] == 0
    category_counts = {item["name"]: item["count"] for item in summary.data["categories"]}
    assert category_counts["School"] == 0


def test_list_filtering_by_category():
    user = create_user("filter@example.com")
    seed_categories(user)
    random_category = Category.objects.get(user=user, name="Random Thoughts")
    school_category = Category.objects.get(user=user, name="School")

    Note.objects.create(user=user, category=random_category, title="A", content="A")
    Note.objects.create(user=user, category=school_category, title="B", content="B")

    client = auth_client(user)
    response = client.get("/api/notes?category=School")
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["category"]["name"] == "School"


def test_categories_list():
    user = create_user("categories@example.com")
    seed_categories(user)
    client = auth_client(user)

    response = client.get("/api/categories")
    assert response.status_code == 200
    assert len(response.data) == 3
    names = sorted([item["name"] for item in response.data])
    assert names == ["Personal", "Random Thoughts", "School"]


def test_patch_updates_note_and_timestamp():
    user = create_user("patch@example.com")
    seed_categories(user)
    random_category = Category.objects.get(user=user, name="Random Thoughts")
    school_category = Category.objects.get(user=user, name="School")

    note = Note.objects.create(
        user=user,
        category=random_category,
        title="Old",
        content="Old",
    )
    before = note.updated_at

    client = auth_client(user)
    response = client.patch(
        f"/api/notes/{note.id}",
        {"title": "New", "content": "New", "category_name": "School"},
        format="json",
    )
    assert response.status_code == 200
    assert response.data["title"] == "New"
    assert response.data["content"] == "New"
    assert response.data["category"]["name"] == "School"

    note.refresh_from_db()
    assert note.category_id == school_category.id
    assert note.updated_at > before


def test_hard_delete_note():
    user = create_user("delete@example.com")
    seed_categories(user)
    random_category = Category.objects.get(user=user, name="Random Thoughts")

    note = Note.objects.create(user=user, category=random_category, title="X", content="X")
    client = auth_client(user)

    delete_response = client.delete(f"/api/notes/{note.id}")
    assert delete_response.status_code == 204

    get_response = client.get(f"/api/notes/{note.id}")
    assert get_response.status_code == 404

    summary = client.get("/api/notes/summary")
    assert summary.data["total_notes"] == 0


def test_get_note_detail():
    user = create_user("detail@example.com")
    seed_categories(user)
    random_category = Category.objects.get(user=user, name="Random Thoughts")

    note = Note.objects.create(
        user=user,
        category=random_category,
        title="Hello",
        content="World",
    )

    client = auth_client(user)
    response = client.get(f"/api/notes/{note.id}")
    assert response.status_code == 200
    assert response.data["id"] == note.id
    assert response.data["title"] == "Hello"
    assert response.data["content"] == "World"
    assert response.data["category"]["name"] == "Random Thoughts"


def test_summary_counts_note_after_editing_defaults():
    user = create_user("editflip@example.com")
    seed_categories(user)
    client = auth_client(user)

    create_resp = client.post("/api/notes", {}, format="json")
    assert create_resp.status_code == 201
    note_id = create_resp.data["id"]

    patch_resp = client.patch(
        f"/api/notes/{note_id}",
        {"title": "My first note", "content": "Real content"},
        format="json",
    )
    assert patch_resp.status_code == 200

    summary = client.get("/api/notes/summary")
    assert summary.status_code == 200
    assert summary.data["has_notes"] is True
    assert summary.data["total_notes"] == 1
