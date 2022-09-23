from urllib import parse as parse_url
from rest_framework import status
from rest_framework.generics import CreateAPIView, ListAPIView, DestroyAPIView, UpdateAPIView, RetrieveAPIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import FilesystemItem
from .serializers import CreateFilesystemItemSerializer, FilesystemItemSerializer, ShareFilesystemItemSerializer, MoveFilesystemItemSerializer
from .permissions import FilesystemOwnerPermissionsMixin

class FilesystemItemRetrieveAPIView(FilesystemOwnerPermissionsMixin, RetrieveAPIView):
	serializer_class = FilesystemItemSerializer

class FilesystemItemRetrieveFromPathAPIView(FilesystemOwnerPermissionsMixin, RetrieveAPIView):
	serializer_class = FilesystemItemSerializer

	def retrieve(self, request, *args, **kwargs):
		path = parse_url.unquote(kwargs['path'])
		item = get_object_or_404(FilesystemItem, path=path)
		item_serializer = self.get_serializer(item, many=False)
		item_data = item_serializer.data
		return Response({ 'item': item_data })

class FilesystemItemListAPIView(FilesystemOwnerPermissionsMixin, ListAPIView):
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

class FilesystemCreateAPIView(FilesystemOwnerPermissionsMixin, CreateAPIView):
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


class FilesystemItemDestroyAPIView(FilesystemOwnerPermissionsMixin, DestroyAPIView):
	queryset = FilesystemItem.objects.all()
	serializer_class = FilesystemItemSerializer
	
class MoveFilesystemItemAPIView(FilesystemOwnerPermissionsMixin, UpdateAPIView):
	queryset = FilesystemItem.objects.all()
	serializer_class = MoveFilesystemItemSerializer

class ShareFilesystemItemAPIView(FilesystemOwnerPermissionsMixin, UpdateAPIView):
	queryset = FilesystemItem.objects.all()
	serializer_class = ShareFilesystemItemSerializer
