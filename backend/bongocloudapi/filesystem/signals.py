from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import FilesystemItem

@receiver(post_delete, sender=FilesystemItem)
def on_delete_filesystem_item(sender, instance, *args, **kwargs):
	instance.uploaded_file.delete()