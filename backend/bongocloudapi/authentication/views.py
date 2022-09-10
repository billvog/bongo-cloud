from multiprocessing import context
from rest_framework import status, permissions
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from .serializers import UserSerializer, RegisterUserSerializer

class RegisterAPIView(GenericAPIView):
	serializer_class = RegisterUserSerializer

	def post(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.save()
		
		return Response({
			'user': UserSerializer(user, context=self.get_serializer_context()).data,
		}, status=status.HTTP_201_CREATED)

class MeAPIView(GenericAPIView):
	serializer_class = UserSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request, *args, **kwargs):
		user = request.user
		data = self.get_serializer(user).data
		return Response({ 'user': data })