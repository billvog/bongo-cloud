from rest_framework import serializers

from authentication.serializers import PublicUserSerializer
from .models import (
	FilesystemItem,
	FilesystemSharedItem,
	filesystemitem_gen_path,
)


class FilesystemItemSerializer(serializers.ModelSerializer):
	download_url = serializers.HyperlinkedIdentityField(view_name='filesystem_item-download', lookup_field='pk')

	class Meta:
		model = FilesystemItem
		fields = [
			'id',
			'parent',
			'name',
			'is_file',
			'size',
			'path',
			'is_shared',
			'download_url',
		]

class PublicFilesystemItemSerializer(serializers.ModelSerializer):
	class Meta:
		model = FilesystemItem
		fields = [
			'id',
			'name',
			'is_file',
			'size',
		]

class CreateFilesystemItemSerializer(serializers.ModelSerializer):
	is_file = serializers.BooleanField(read_only=True)
	filesize = serializers.IntegerField(read_only=True)

	class Meta:
		model = FilesystemItem
		fields = [
			'parent',
			'name',
			'is_file',
			'filesize',
			'uploaded_file',
		]

	def validate_name(self, value):
		request = self.context.get('request')
		user = request.user

		name = value
		parent = self.initial_data['parent']
		if parent == '':
			parent = None

		if FilesystemItem.objects.all().filter(owner=user, parent=parent, name__exact=name).exists():
			raise serializers.ValidationError(f'"{name}" already exists at this location.')
			
		return value

	def validate_parent(self, value):
		if value is not None and value.is_file:
			raise serializers.ValidationError(f'{value.name} is not a folder.')
		return value

class MoveFilesystemItemSerializer(serializers.ModelSerializer):
	path = serializers.CharField(read_only=True)

	class Meta:
		model = FilesystemItem
		fields = [
			'id',
			'parent',
			'name',
			'path',
		]

	"""
	This function iterates recursively in the item's children and 
	regenerates the path because a parent was renamed or moved.
	"""
	def iterate_children(self, item):
		children = item.filesystemitem_set.all()
		for child in children:
			child.path = filesystemitem_gen_path(child)
			child.save()
			if not child.is_file:
				self.iterate_children(child)

	def save(self, **kwargs):
		super().save(**kwargs)
		item = self.instance
		self.iterate_children(item)
		return item

	def validate_name(self, value):
		request = self.context.get('request')
		user = request.user

		name = value
		parent = self.initial_data['parent']
		if FilesystemItem.objects.all().filter(owner=user, parent=parent, name__exact=name).exists():
			raise serializers.ValidationError(f'"{name}" already exists at this location.')
		return value

	def validate_parent(self, value):
		if value is None:
			return value

		instance = self.instance
		if value == instance:
			raise serializers.ValidationError("You can't move a folder to its self.")

		request = self.context.get('request')
		user = request.user

		if not value.owner == user:
			raise serializers.ValidationError("Parent folder could not be found.")

		if value is not None and value.is_file:
			raise serializers.ValidationError(f'"{value.name}" is not a folder.')
		
		super_parent = value.parent
		while super_parent is not None:
			if super_parent == instance:
				raise serializers.ValidationError(f'"{value.name}" is a subfolder of "{instance.name}".')
			super_parent = super_parent.parent

		return value

class FilesystemSharedItemSerializer(serializers.ModelSerializer):
	item = FilesystemItemSerializer()
	allowed_users = serializers.SerializerMethodField()
	download_url = serializers.HyperlinkedIdentityField(view_name='filesystem_shared_item-download', lookup_field='pk')

	class Meta:
		model = FilesystemSharedItem
		fields = [
			'id',
			'item',
			'allowed_users',
			'has_password',
			'does_expire',
			'expiry',
			'is_expired',
			'download_url'
		]

	def get_allowed_users(self, obj):
		allowed_user_names = []
		allowed_users = obj.allowed_users.all()
		for allowed_user in allowed_users:
			allowed_user_names.append(allowed_user.username)
		return allowed_user_names

class PublicFilesystemSharedItemSerializer(serializers.ModelSerializer):
	item = PublicFilesystemItemSerializer()
	sharer = PublicUserSerializer(source='item.owner')
	download_url = serializers.HyperlinkedIdentityField(view_name='filesystem_shared_item-download', lookup_field='pk')

	class Meta:
		model = FilesystemSharedItem
		fields = [
			'id',
			'sharer',
			'item',
			'has_password',
			'does_expire',
			'expiry',
			'download_url'
		]

class CreateFilesystemSharedItemSerializer(serializers.ModelSerializer):
	item = FilesystemItemSerializer(read_only=True)
	has_password = serializers.BooleanField(default=False, read_only=True)
	does_expire = serializers.BooleanField(default=False, read_only=True)

	class Meta:
		model = FilesystemSharedItem
		fields = [
			'id',
			'item',
			'allowed_users',
			'has_password',
			'password',
			'does_expire',
			'expiry'
		]

	def validate_password(self, value):
		if value is not None and len(value) <= 0:
			raise serializers.ValidationError('Please provide a password.')
		return value

class UpdateFilesystemSharedItemSerializer(serializers.ModelSerializer):
	has_password = serializers.BooleanField(default=False, read_only=True)
	does_expire = serializers.BooleanField(default=False, read_only=True)

	class Meta:
		model = FilesystemSharedItem
		fields = [
			'id',
			'allowed_users',
			'has_password',
			'password',
			'does_expire',
			'expiry'
		]

class DownloadFilesystemSharedItemSerializer(serializers.Serializer):
	password = serializers.CharField(required=False)