from urllib import parse as parse_url

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView, ListAPIView, DestroyAPIView, UpdateAPIView, RetrieveAPIView
from rest_framework.response import Response

from django.conf import settings
from django.views.static import serve
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password, check_password

from .models import FilesystemItem, FilesystemSharedItem
from .serializers import (
	CreateFilesystemItemSerializer,
	CreateFilesystemSharedItemSerializer,
	DownloadFilesystemSharedItemSerializer,
	FilesystemItemSerializer,
	FilesystemSharedItemSerializer,
	MoveFilesystemItemSerializer,
	PublicFilesystemSharedItemSerializer,
	UpdateFilesystemSharedItemSerializer
)
from .permissions import (
	FilesystemItemOwnerPermissionsMixin,
	FilesystemSharedItemOwnerOrInAllowedUsersPermissionsMixin,
	FilesystemSharedItemOwnerPermissionsMixin
)

User = get_user_model()

MEDIA_ROOT = getattr(settings, 'MEDIA_ROOT', None)


class RetrieveFilesystemItemAPIView(FilesystemItemOwnerPermissionsMixin, RetrieveAPIView):
	queryset = FilesystemItem.objects.all()
	serializer_class = FilesystemItemSerializer

class RetrieveFilesystemItemFromPathAPIView(FilesystemItemOwnerPermissionsMixin, RetrieveAPIView):
	serializer_class = FilesystemItemSerializer

	def retrieve(self, request, *args, **kwargs):
		path = parse_url.unquote(kwargs['path'])
		item = get_object_or_404(FilesystemItem, path=path)
		item_serializer = self.get_serializer(item, many=False)
		item_data = item_serializer.data
		return Response({ 'item': item_data })

class ListFilesystemItemAPIView(FilesystemItemOwnerPermissionsMixin, ListAPIView):
	queryset = FilesystemItem.objects.all().order_by('is_file', 'name', '-created_at')
	serializer_class = FilesystemItemSerializer

	def list(self, request, *args, **kwargs):
		if 'pk' in kwargs:
			item = get_object_or_404(FilesystemItem, pk=kwargs['pk'])
		else:
			item = None

		user = request.user
		qs = self.get_queryset().filter(owner=user)
		qs = qs.filter(parent=item)
		
		if item is not None:
			if not item.owner == user:
				return Response(None, status=status.HTTP_404_NOT_FOUND)

			item_serializer = self.get_serializer(item, many=False)
			item_data = item_serializer.data
		else:
			item_data = None

		subitems_queryset = self.filter_queryset(qs)
		subitems_serializer = self.get_serializer(subitems_queryset, many=True)
		subitems_data = subitems_serializer.data

		return Response({ 'current': item_data, 'items': subitems_data })

class CreateFilesystemItemAPIView(FilesystemItemOwnerPermissionsMixin, CreateAPIView):
	serializer_class = CreateFilesystemItemSerializer

	def post(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		data = serializer.initial_data

		# Check if the user has access to the parent
		if 'parent' in data and data.get('parent'):
			parent = get_object_or_404(FilesystemItem, pk=data.get('parent'))
			if not parent.owner == request.user:
				return Response(None, status=status.HTTP_404_NOT_FOUND)

		serializer.is_valid(raise_exception=True)
		
		data = serializer.validated_data
		user = self.request.user

		is_file = False
		filesize = 0

		try:
			uploaded_file = data['uploaded_file']
		except Exception:
			return Response(None, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

		if uploaded_file is not None:
			is_file = True
			filesize = uploaded_file.size

		created_item = serializer.save(owner=user, is_file=is_file, filesize=filesize)

		serialized_item = FilesystemItemSerializer(created_item, context=self.get_serializer_context()).data

		headers = self.get_success_headers(serialized_item)
		return Response(serialized_item, status=status.HTTP_201_CREATED, headers=headers)

class DestroyFilesystemItemAPIView(FilesystemItemOwnerPermissionsMixin, DestroyAPIView):
	queryset = FilesystemItem.objects.all()
	serializer_class = FilesystemItemSerializer
	
class MoveFilesystemItemAPIView(FilesystemItemOwnerPermissionsMixin, UpdateAPIView):
	queryset = FilesystemItem.objects.all()
	serializer_class = MoveFilesystemItemSerializer

class DownloadFilesystemItemAPIView(FilesystemItemOwnerPermissionsMixin, APIView):
	def get(self, request, *args, **kwargs):
		item_id = kwargs['pk']
		item = get_object_or_404(FilesystemItem, pk=item_id)

		item_real_path = str(item.uploaded_file)

		response = serve(request, path=item_real_path, document_root=MEDIA_ROOT)
		response['Content-Disposition'] = f'inline; filename="{item.name}"'
		response['Content-Length'] = str(item.filesize)
		return response


class RetrieveFilesystemSharedItemAPIVIew(
	FilesystemSharedItemOwnerOrInAllowedUsersPermissionsMixin,
	RetrieveAPIView
):
	queryset = FilesystemSharedItem.objects.all()
	serializer_class = PublicFilesystemSharedItemSerializer

	def retrieve(self, request, *args, **kwargs):
		item_id = kwargs['pk']
		item = get_object_or_404(FilesystemSharedItem, pk=item_id)

		if item.is_expired():
			item.delete()
			return Response(None, status=status.HTTP_404_NOT_FOUND)

		serializer = self.get_serializer(item)
		return Response(serializer.data)

class DownloadFilesystemSharedItemAPIVIew(
	FilesystemSharedItemOwnerOrInAllowedUsersPermissionsMixin,
	APIView
):
	def post(self, request, *args, **kwargs):
		shared_item_id = kwargs['pk']
		shared_item = get_object_or_404(FilesystemSharedItem, pk=shared_item_id)

		serializer = DownloadFilesystemSharedItemSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		data = serializer.validated_data

		if shared_item.is_expired():
			shared_item.delete()
			return Response({ 'detail': 'Not found.' }, status=status.HTTP_404_NOT_FOUND)

		if shared_item.has_password:
			if 'password' not in data or len(data['password']) == 0:
				return Response({ 'detail': 'Please provide a password.' }, status=status.HTTP_400_BAD_REQUEST)

			if not check_password(data['password'], shared_item.password):
				return Response({ 'detail': 'Invalid password.' }, status=status.HTTP_400_BAD_REQUEST)

		item = shared_item.item
		item_real_path = str(item.uploaded_file)

		response = serve(request, path=item_real_path, document_root=MEDIA_ROOT)
		response['Content-Disposition'] = f'inline; filename="{item.name}"'
		response['Content-Length'] = str(item.filesize)
		return response

class CreateFilesystemSharedItemAPIView(FilesystemItemOwnerPermissionsMixin, CreateAPIView):
	serializer_class = CreateFilesystemSharedItemSerializer

	def post(self, request, *args, **kwargs):
		item_id = kwargs['pk']
		item = get_object_or_404(FilesystemItem, pk=item_id)

		if item.is_shared():
			return Response({ 'detail': 'This item is already shared.' }, status=status.HTTP_400_BAD_REQUEST)

		if not item.is_file:
			return Response({ 'detail': 'This item is not file.' }, status=status.HTTP_400_BAD_REQUEST)

		user = request.user

		serializer = self.get_serializer(data=request.data)
		data = serializer.initial_data

		allowed_users = []
		if 'allowed_users' in data and len(data['allowed_users']) > 0:
			for allowed_user in data['allowed_users']:
				try:
					if allowed_user == user.username:
						continue

					u = get_object_or_404(User, username=allowed_user)
					allowed_users.append(u.id)
				except:
					return Response({ 'detail': f'User "{allowed_user}" was not found.' }, status=status.HTTP_400_BAD_REQUEST)
		
		data['allowed_users'] = allowed_users

		serializer.is_valid(raise_exception=True)
		data = serializer.validated_data

		if 'password' in data and data['password'] is not None:
			data['has_password'] = True
			password_hash = make_password(data['password'])
		else:
			password_hash = None

		data['does_expire'] = 'expiry' in data and data['expiry'] is not None

		created_fileshare = serializer.save(item=item, password=password_hash)

		serialized_fileshare = FilesystemSharedItemSerializer(created_fileshare, context=self.get_serializer_context()).data

		headers = self.get_success_headers(serialized_fileshare)
		return Response(serialized_fileshare, status=status.HTTP_201_CREATED, headers=headers)

class RetrieveFilesystemSharedItemFromItemIdAPIView(
	FilesystemItemOwnerPermissionsMixin, RetrieveAPIView
):
	queryset = FilesystemSharedItem.objects.all()
	serializer_class = FilesystemSharedItemSerializer
	
	def retrieve(self, request, *args, **kwargs):
		item_id = kwargs['pk']
		item = get_object_or_404(FilesystemSharedItem, item__id=item_id)

		if item.is_expired():
			item.delete()
			return Response(None, status=status.HTTP_404_NOT_FOUND)

		serializer = self.get_serializer(item)
		return Response(serializer.data)

class UpdateFilesystemSharedItemAPIView(
	FilesystemSharedItemOwnerPermissionsMixin,
	UpdateAPIView
):
	queryset = FilesystemSharedItem.objects.all()
	serializer_class = UpdateFilesystemSharedItemSerializer

	def put(self, request, *args, **kwargs):
		return Response(None, status=status.HTTP_405_METHOD_NOT_ALLOWED)

	def patch(self, request, *args, **kwargs):
		# fetch shared item
		shared_item = self.get_object()

		# check if is expired
		if shared_item.is_expired():
			shared_item.delete()
			return Response({ 'detail': 'Not found' }, status=status.HTTP_404_NOT_FOUND)

		user = request.user

		# init serializer
		serializer = self.get_serializer(shared_item, data=request.data, partial=True)
		data = serializer.initial_data

		# find users from their usernames
		allowed_users = []
		if 'allowed_users' in data and len(data['allowed_users']) > 0:
			for allowed_user in data['allowed_users']:
				try:
					if allowed_user == user.username:
						continue

					u = get_object_or_404(User, username=allowed_user)
					allowed_users.append(u.id)
				except:
					return Response({ 'detail': f'User "{allowed_user}" was not found.' }, status=status.HTTP_400_BAD_REQUEST)
		
		data['allowed_users'] = allowed_users

		# check if data is valid
		serializer.is_valid(raise_exception=True)
		data = serializer.validated_data

		# check password
		if 'password' in data and data['password'] is not None:
			data['has_password'] = True
			
			if len(data['password']) <= 0:
				password_hash = shared_item.password
			else:
				password_hash = make_password(data['password'])
		else:
			data['has_password'] = False
			password_hash = None

		# check expiry datetime
		data['does_expire'] = 'expiry' in data and data['expiry'] is not None

		# save and return ok
		updated_fileshare = serializer.save(password=password_hash)
		serialized_fileshare = FilesystemSharedItemSerializer(updated_fileshare, context=self.get_serializer_context()).data
		return Response(serialized_fileshare)

class DestroyFilesystemSharedItemAPIView(
	FilesystemSharedItemOwnerPermissionsMixin,
	DestroyAPIView
):
	queryset = FilesystemSharedItem.objects.all()