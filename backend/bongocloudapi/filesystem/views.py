from urllib import parse as parse_url
from rest_framework import status
from rest_framework.generics import CreateAPIView, ListAPIView, DestroyAPIView, UpdateAPIView, RetrieveAPIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password

from .models import FilesystemItem, FilesystemSharedItem
from .serializers import CreateFilesystemItemSerializer, CreateFilesystemSharedItemSerializer, FilesystemItemSerializer, FilesystemSharedItemSerializer, MoveFilesystemItemSerializer
from .permissions import FilesystemItemOwnerPermissionsMixin, FilesystemSharedItemOwnerOrInAllowedUsersPermissionsMixin

class FilesystemItemRetrieveAPIView(FilesystemItemOwnerPermissionsMixin, RetrieveAPIView):
	queryset = FilesystemItem.objects.all()
	serializer_class = FilesystemItemSerializer

class FilesystemItemRetrieveFromPathAPIView(FilesystemItemOwnerPermissionsMixin, RetrieveAPIView):
	serializer_class = FilesystemItemSerializer

	def retrieve(self, request, *args, **kwargs):
		path = parse_url.unquote(kwargs['path'])
		item = get_object_or_404(FilesystemItem, path=path)
		item_serializer = self.get_serializer(item, many=False)
		item_data = item_serializer.data
		return Response({ 'item': item_data })

class FilesystemItemListAPIView(FilesystemItemOwnerPermissionsMixin, ListAPIView):
	queryset = FilesystemItem.objects.all().order_by('is_file', 'name', '-created_at')
	serializer_class = FilesystemItemSerializer

	def list(self, request, *args, **kwargs):
		if 'pk' in kwargs:
			item = get_object_or_404(FilesystemItem, pk=kwargs['pk'])
		elif 'path' in kwargs:
			path = parse_url.unquote(kwargs['path'])
			item = get_object_or_404(FilesystemItem, path=path)
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

class FilesystemCreateAPIView(FilesystemItemOwnerPermissionsMixin, CreateAPIView):
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

class FilesystemItemDestroyAPIView(FilesystemItemOwnerPermissionsMixin, DestroyAPIView):
	queryset = FilesystemItem.objects.all()
	serializer_class = FilesystemItemSerializer
	
class MoveFilesystemItemAPIView(FilesystemItemOwnerPermissionsMixin, UpdateAPIView):
	queryset = FilesystemItem.objects.all()
	serializer_class = MoveFilesystemItemSerializer


class RetrieveFilesystemSharedItemAPIVIew(
	FilesystemSharedItemOwnerOrInAllowedUsersPermissionsMixin,
	RetrieveAPIView
):
	queryset = FilesystemSharedItem.objects.all()
	serializer_class = FilesystemSharedItemSerializer

class CreateFilesystemSharedItemAPIView(FilesystemItemOwnerPermissionsMixin, CreateAPIView):
	serializer_class = CreateFilesystemSharedItemSerializer

	def post(self, request, *args, **kwargs):
		item_id = kwargs['pk']
		item = get_object_or_404(FilesystemItem, pk=item_id)

		serializer = self.get_serializer(data=request.data)

		# logic to find users from their codes and store them in data

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