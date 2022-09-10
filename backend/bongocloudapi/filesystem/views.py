from rest_framework import status
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveDestroyAPIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import FilesystemItem
from .serializers import CreateFilesystemItemSerializer, FilesystemItemSerializer
from .permissions import FilesystemOwnerPermissionsMixin

class FilesystemItemListAPIView(ListAPIView, FilesystemOwnerPermissionsMixin):
	queryset = FilesystemItem.objects.all()
	serializer_class = FilesystemItemSerializer

	def list(self, request, *args, **kwargs):
		if 'pk' in kwargs:
			item = FilesystemItem.objects.get(pk=kwargs['pk'])
			item_serializer = self.get_serializer(item, many=False)
			item_data = item_serializer.data
		else:
			item_data = None

		subitems_queryset = self.filter_queryset(self.get_queryset())
		subitems_serializer = self.get_serializer(subitems_queryset, many=True)
		subitems_data = subitems_serializer.data

		return Response({ 'current': item_data, 'items': subitems_data })

	def get_queryset(self):
		request = self.request
		user = request.user
		qs = super().get_queryset().filter(owner=user)

		if 'pk' in self.kwargs:
			qs = qs.filter(parent__pk=self.kwargs['pk'])
		else:
			qs = qs.filter(parent=None)

		return qs

class FilesystemCreateAPIView(CreateAPIView, FilesystemOwnerPermissionsMixin):
	serializer_class = CreateFilesystemItemSerializer

	def post(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		data = serializer.initial_data

		# Check if the user has access to the parent
		if 'parent' in data and data.get('parent'):
			parent = get_object_or_404(FilesystemItem, pk=data.get('parent'))
			if not parent.owner == request.user:
				return Response(None, status=401)

		serializer.is_valid(raise_exception=True)
		
		data = serializer.validated_data
		user = self.request.user

		name = data['name']
		is_file = False
		filesize = 0

		uploaded_file = data['uploaded_file']
		if uploaded_file is not None:
			name = uploaded_file.name
			is_file = True
			filesize = uploaded_file.size

		created_item = serializer.save(owner=user, name=name, is_file=is_file, filesize=filesize)

		serialized_item = FilesystemItemSerializer(created_item, context=self.get_serializer_context()).data

		headers = self.get_success_headers(serialized_item)
		return Response(serialized_item, status=status.HTTP_201_CREATED, headers=headers)


class FilesystemItemRetrieveDestroyAPIView(RetrieveDestroyAPIView, FilesystemOwnerPermissionsMixin):
	queryset = FilesystemItem.objects.all()
	serializer_class = FilesystemItemSerializer