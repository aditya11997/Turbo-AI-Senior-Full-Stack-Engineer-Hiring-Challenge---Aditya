from django.core.management.base import BaseCommand

from apps.notes.models import Note


class Command(BaseCommand):
    help = "Delete notes that only contain default title/content placeholders."

    def handle(self, *args, **options):
        deleted, _ = Note.objects.filter(
            title="Note Title",
            content="Pour your heart out...",
        ).delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} empty notes."))
