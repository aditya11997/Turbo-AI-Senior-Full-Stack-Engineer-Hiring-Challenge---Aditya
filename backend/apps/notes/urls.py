from django.urls import path

from apps.notes import views

urlpatterns = [
    path("categories", views.CategoriesListView.as_view(), name="categories"),
    path("notes", views.NotesListCreateView.as_view(), name="notes"),
    path("notes/summary", views.NotesSummaryView.as_view(), name="notes-summary"),
    path("notes/<int:note_id>", views.NoteDetailView.as_view(), name="note-detail"),
]
