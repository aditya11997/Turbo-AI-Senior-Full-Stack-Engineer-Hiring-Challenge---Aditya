from rest_framework import serializers

from apps.notes.models import Note, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "color_hex"]


class NoteSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Note
        fields = ["id", "category", "title", "content", "created_at", "updated_at"]


class NoteCreateSerializer(serializers.Serializer):
    """
    For 'New Note' button.
    Create immediately.
    Defaults category to Random Thoughts.
    """

    category_name = serializers.CharField(required=False, allow_blank=True)
    title = serializers.CharField(required=False, allow_blank=True)
    content = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        request = self.context["request"]

        category_name = validated_data.get("category_name") or "Random Thoughts"
        category = Category.objects.filter(user=request.user, name=category_name).first()

        if category is None:
            category = Category.objects.filter(
                user=request.user, name="Random Thoughts"
            ).first()

        if category is None:
            category = Category.objects.create(
                user=request.user, name="Random Thoughts", color_hex="#EF9C66"
            )

        title = validated_data.get("title") or "Note Title"
        content = validated_data.get("content") or "Pour your heart out..."

        return Note.objects.create(
            user=request.user,
            category=category,
            title=title,
            content=content,
        )


class NoteUpdateSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(required=False)

    class Meta:
        model = Note
        fields = ["category_name", "title", "content"]

    def validate_category_name(self, value: str):
        if value not in ("Random Thoughts", "School", "Personal"):
            raise serializers.ValidationError("Invalid category.")
        return value

    def update(self, instance, validated_data):
        request = self.context["request"]

        category_name = validated_data.pop("category_name", None)
        if category_name:
            category = Category.objects.filter(user=request.user, name=category_name).first()
            if not category:
                raise serializers.ValidationError({"category_name": "Invalid category"})
            instance.category = category

        for key, value in validated_data.items():
            setattr(instance, key, value)

        instance.save()
        return instance
