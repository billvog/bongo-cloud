from rest_framework import serializers

from .models import FilesystemItem

class FilesystemItemSerializer(serializers.ModelSerializer):
	class Meta:
		model = FilesystemItem
		fields = [
			'id',
			'parent',
			'name',
			'is_file',
			'size',
			'path',
			'uploaded_file',
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

class UpdateFilesystemItemSerializer(serializers.ModelSerializer):
	path = serializers.CharField(read_only=True)

	class Meta:
		model = FilesystemItem
		fields = [
			'id',
			'parent',
			'name',
			'path',
		]

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

class ShareFilesystemItemSerializer(serializers.ModelSerializer):
	class Meta:
		model = FilesystemItem
		fields = [
			'id',
			'allow_any',
		]
	
	def validate_allow_any(self, value):
		instance = self.instance
		if not instance.is_file:
			raise serializers.ValidationError("Cannot share folders.")
		return value