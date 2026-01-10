from django.urls import path

from apps.users import views

urlpatterns = [
    path("auth/register", views.RegisterView.as_view(), name="register"),
    path("auth/login", views.LoginView.as_view(), name="login"),
    path("auth/refresh", views.RefreshView.as_view(), name="refresh"),
    path("auth/me", views.MeView.as_view(), name="me"),
    path("auth/bootstrap", views.BootstrapView.as_view(), name="bootstrap"),
]
