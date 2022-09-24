from django.shortcuts import get_object_or_404
from django.http import Http404
from rest_framework import permissions
from rest_framework.request import Request

from .models import FilesystemItem, FilesystemSharedItem
from authentication.authentication import JWTAuthentication

"""
Only allow user to access if he's the owner of the FilesystemItem.
"""
class IsOwnerOfItem(permissions.BasePermission):
	def has_permission(self, request, view):
		try:
			if 'pk' in view.kwargs:
				filesystem_item = get_object_or_404(FilesystemItem, pk=view.kwargs['pk'])
				return self.does_user_has_permission(request, filesystem_item)
		except Http404:
			pass # in this case, the view is responsible for returning a 404
		except Exception as error:
			print(error)
			return False

		return True

	def has_object_permission(self, request, view, obj):
		return self.does_user_has_permission(request, obj)
	
	def does_user_has_permission(self, request: Request, fsitem: FilesystemItem) -> bool:
		user = None
		try:
			(user, _) = JWTAuthentication().authenticate(request)
		except Exception as error:
			print(error)

		if user is not None:
			return user == fsitem.owner
		else:
			return request.user == fsitem.owner

class FilesystemItemOwnerPermissionsMixin():
	permission_classes = [permissions.IsAuthenticated, IsOwnerOfItem]


"""
Only allow user who is the owner of the item (to perform Update or Delete ops.)
"""
class IsOwnerOfSharedItem(permissions.BasePermission):
	def has_object_permission(self, request, view, obj):
		return self.does_user_has_permission(request, obj)

	def does_user_has_permission(self, request: Request, shared_item: FilesystemSharedItem) -> bool:
		user = None
		try:
			(user, _) = JWTAuthentication().authenticate(request)
		except Exception as error:
			print(error)

		if user is None:
			return False

		# If user is the owner of the item, has permission
		if shared_item.item.owner == user:
			return True

		# In every other case, the users doesn't have permissions
		return False

"""
Only allow user who either is the owner of the item, or
is in the allowed_users list of the FilesystemSharedItem (to perform only Read ops.)
"""
class IsOwnerOrInAllowedUsersOfSharedItem(permissions.BasePermission):
	def has_object_permission(self, request, view, obj):
		return self.does_user_has_permission(request, obj)

	def does_user_has_permission(self, request: Request, shared_item: FilesystemSharedItem) -> bool:
		user = None
		try:
			(user, _) = JWTAuthentication().authenticate(request)
		except Exception as error:
			print(error)

		if user is None:
			return False

		# If the allowed_users list is empty, the file is shared across everyone.
		if shared_item.allowed_users.count() == 0:
			return True

		# If user is the owner of the item, has permission
		if shared_item.item.owner == user:
			return True

		# If user is in allowed_users, has permissions
		for allowed_user in shared_item.allowed_users.all():
			if user == allowed_user:
				return True

		# In every other case, the users doesn't have permissions
		return False

class FilesystemSharedItemOwnerPermissionsMixin():
	permission_classes = [permissions.IsAuthenticated, IsOwnerOfSharedItem]

class FilesystemSharedItemOwnerOrInAllowedUsersPermissionsMixin():
	permission_classes = [permissions.IsAuthenticated, IsOwnerOrInAllowedUsersOfSharedItem]