from rest_framework import permissions
from rest_framework.request import Request
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import FilesystemItem

"""
Only allow user to access if he's the owner of the FilesystemItem.
In future, add allowed_users column or something, to allow users to share files, with each other.
"""
class IsOwner(permissions.BasePermission):
	def has_permission(self, request, view):
		if 'pk' in view.kwargs:
			filesystem_item = FilesystemItem.objects.get(pk=view.kwargs['pk'])
			return self.does_user_has_permission(request, filesystem_item)
		else:
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