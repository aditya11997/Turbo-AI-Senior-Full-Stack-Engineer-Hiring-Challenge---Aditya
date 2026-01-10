from django.db.models import Count
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notes.models import Note, Category
from apps.notes.serializers import (
    NoteSerializer,
    NoteCreateSerializer,
    NoteUpdateSerializer,
    CategorySerializer,
)


class CategoriesListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Category.objects.filter(user=request.user).order_by("id")
        return Response(CategorySerializer(qs, many=True).data)


class NotesListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Note.objects.filter(user=request.user).select_related("category")
        category_name = request.query_params.get("category")
        if category_name:
            qs = qs.filter(category__name=category_name)
        return Response(NoteSerializer(qs, many=True).data)

    def post(self, request):
        serializer = NoteCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        note = serializer.save()
        return Response(NoteSerializer(note).data, status=status.HTTP_201_CREATED)


class NoteDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get(self, request, note_id):
        return Note.objects.select_related("category").get(id=note_id, user=request.user)

    def get(self, request, note_id):
        try:
            note = self._get(request, note_id)
        except Note.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(NoteSerializer(note).data)

    def patch(self, request, note_id):
        try:
            note = self._get(request, note_id)
        except Note.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = NoteUpdateSerializer(
            note, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        note = serializer.save()
        return Response(NoteSerializer(note).data)

    def delete(self, request, note_id):
        try:
            note = self._get(request, note_id)
        except Note.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotesSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Note.objects.filter(user=request.user)
        visible_qs = qs.exclude(
            title="Note Title",
            content="Pour your heart out...",
        )

        counts = visible_qs.values("category__name").annotate(count=Count("id"))
        counts_map = {c["category__name"]: c["count"] for c in counts}

        categories = Category.objects.filter(user=request.user).order_by("id")
        categories_out = [
            {"name": c.name, "color_hex": c.color_hex, "count": counts_map.get(c.name, 0)}
            for c in categories
        ]

        return Response(
            {
                "has_notes": visible_qs.exists(),
                "total_notes": visible_qs.count(),
                "default_category": "Random Thoughts",
                "categories": categories_out,
            }
        )
