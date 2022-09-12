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
	name = serializers.CharField(allow_blank=True)
	is_file = serializers.BooleanField(read_only=True)
	filesize = serializers.IntegerField(read_only=True)

	class Meta:
		model = FilesystemItem
		fields = [
			'id',
			'parent',
			'name',
			'is_file',
			'filesize',
			'uploaded_file',
		]

	def validate_name(self, value):
		if not value and self.initial_data['uploaded_file'] is None:
			raise serializers.ValidationError('This field is required.')
		return value

	def validate_parent(self, value):
		if value is not None and value.is_file:
			raise serializers.ValidationError(f'{value.name} is not a folder.')
		return value