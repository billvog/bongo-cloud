import os

from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import FilesystemItem

@receiver(post_delete, sender=FilesystemItem)
def on_delete_filesystem_item(sender, instance, *args, **kwargs):
	if instance.uploaded_file:
		if os.path.isfile(instance.uploaded_file.path):
			os.remove(instance.uploaded_file.path)