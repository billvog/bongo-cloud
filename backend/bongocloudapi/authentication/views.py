from django.contrib.auth import authenticate
from rest_framework import status, permissions
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer, LoginUserSerializer, RegisterUserSerializer

class LoginAPIView(GenericAPIView):
	serializer_class = LoginUserSerializer

	def post(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		data = serializer.validated_data

		username = data['username']
		password = data['password']

		user = authenticate(username=username, password=password)
		if user is None:
			return Response({ 'detail': 'You entered an incorrect username or password.' }, status=status.HTTP_400_BAD_REQUEST)

		refresh_token = RefreshToken.for_user(user)
		access_token = refresh_token.access_token

		body = {
			'user': UserSerializer(user, context=self.get_serializer_context()).data
		}

		headers = {
			'x-access-token': access_token,
			'x-refresh-token': refresh_token
		}

		return Response(body, headers=headers, status=status.HTTP_200_OK)

class RegisterAPIView(GenericAPIView):
	serializer_class = RegisterUserSerializer

	def post(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.save()
		
		refresh_token = RefreshToken.for_user(user)
		access_token = refresh_token.access_token

		body = {
			'user': UserSerializer(user, context=self.get_serializer_context()).data,
		}

		headers = {
			'x-access-token': str(access_token),
			'x-refresh-token': str(refresh_token)
		}

		return Response(body, headers=headers, status=status.HTTP_201_CREATED)

class MeAPIView(GenericAPIView):
	serializer_class = UserSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request, *args, **kwargs):
		user = request.user
		data = self.get_serializer(user).data
		return Response({ 'user': data })