from rest_framework import serializers

from .models import FilesystemItem

class FilesystemItemSerializer(serializers.ModelSerializer):
	name = serializers.CharField(allow_blank=True)

	class Meta:
		model = FilesystemItem
		fields = [
			'id',
			'parent',
			'name',
			'is_file',
			'filesize',
			'size',
			'path',
			'uploaded_file',
		]

	def validate_name(self, value):
		if not value and self.initial_data['uploaded_file'] is None:
			raise serializers.ValidationError('Name is needed')
		return value

	def validate_parent(self, value):
		if value is not None and value.is_file:
			raise serializers.ValidationError(f'{value.name} is not a folder.')
		return value