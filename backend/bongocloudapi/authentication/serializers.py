from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = [
			'id',
			'short_code',
			'first_name',
			'last_name',
			'username',
			'email',
			'gravatar_hash',
			'date_joined'
		]

class PublicUserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = [
			'id',
			'short_code',
			'first_name',
			'last_name',
			'username',
			'gravatar_hash'
		]

class LoginUserSerializer(serializers.ModelSerializer):
	email = serializers.EmailField()
	password = serializers.CharField(write_only=True)
	
	class Meta:
		model = User
		fields = [
			'email',
			'password'
		]

class RegisterUserSerializer(serializers.ModelSerializer):
	first_name = serializers.CharField(min_length=2, max_length=50)
	last_name = serializers.CharField(min_length=2, max_length=50)
	username = serializers.CharField(min_length=3, max_length=50)
	password = serializers.CharField(write_only=True, min_length=6, max_length=150)

	class Meta:
		model = User
		fields = [
			'first_name',
			'last_name',
			'username',
			'email',
			'password'
		]

	def validate_username(self, value):
		if User.objects.all().filter(username=value).exists():
			raise serializers.ValidationError('Username already in use.')
		return value

	def validate_email(self, value):
		if User.objects.all().filter(email=value).exists():
			raise serializers.ValidationError('Email already used.')
		return value
	
	def create(self, validated_data):
		return User.objects.create_user(**validated_data)