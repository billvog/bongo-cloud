import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

def filesystemitem_gen_path(item):
	path = ''
	if item.parent is not None:
		parent = item.parent
		while (parent is not None):
			path = '/' + parent.name + path
			parent = parent.parent

	path += '/' + item.name
	return path

def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/u_<id>/<fsi_id>
    return 'u_{0}/{1}'.format(instance.owner.id, instance.id)

class FilesystemItem(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	owner = models.ForeignKey(User, on_delete=models.CASCADE)
	parent = models.ForeignKey('FilesystemItem', on_delete=models.CASCADE, null=True, blank=True)
	name = models.CharField(max_length=1024)
	filesize = models.PositiveBigIntegerField(default=0)
	path = models.CharField(max_length=4096)
	is_file = models.BooleanField()
	uploaded_file = models.FileField(upload_to=user_directory_path, null=True, blank=True)
	updated_at = models.DateTimeField(auto_now=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.name

	def save(self, *args, **kwargs):
		self.path = filesystemitem_gen_path(self)
		super(FilesystemItem, self).save(*args, **kwargs)

	def size(self):
		if not self.is_file:
			totalsize = 0
			for child in self.filesystemitem_set.all():
				totalsize += child.size()
			return totalsize
		else:
			return self.filesize

class FilesystemSharedItem(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	item = models.ForeignKey('FilesystemItem', on_delete=models.CASCADE, null=False)
	allowed_users = models.ManyToManyField(User, blank=True)
	has_password = models.BooleanField(default=False)
	password = models.CharField(max_length=100, null=True, blank=True)
	does_expire = models.BooleanField(default=False)
	expiry = models.DateTimeField(null=True, blank=True)

	def is_expired(self) -> bool:
		if not self.does_expire or self.expiry is None:
			return False
		return self.expiry < timezone.now()
		