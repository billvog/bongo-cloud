from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = [
			'id',
			'first_name',
			'last_name',
			'username',
			'email',
			'date_joined'
		]

class RegisterUserSerializer(serializers.ModelSerializer):
	first_name = serializers.CharField(min_length=2, max_length=50)
	last_name = serializers.CharField(min_length=2, max_length=50)
	username = serializers.CharField(min_length=3, max_length=50)
	email = serializers.EmailField(min_length=4, max_length=50)
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

	def validate(self, args):
		username = args.get('username', None)
		email = args.get('email', None)

		if User.objects.all().filter(username=username).exists():
			raise serializers.ValidationError('Username already in use.')

		if User.objects.all().filter(email=email).exists():
			raise serializers.ValidationError('Email already used.')

		return super().validate(args)
	
	def create(self, validated_data):
		return User.objects.create_user(**validated_data)