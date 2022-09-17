from django.shortcuts import get_object_or_404
from django.http import Http404
from rest_framework import permissions
from rest_framework.request import Request

from .models import FilesystemItem
from authentication.authentication import JWTAuthentication

"""
Only allow user to access if he's the owner of the FilesystemItem.
In future, add allowed_users column or something, to allow users to share files, with each other.
"""
class IsOwner(permissions.BasePermission):
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

class FilesystemOwnerPermissionsMixin():
	permission_classes = [permissions.IsAuthenticated, IsOwner]