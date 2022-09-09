from django.conf import settings
from django.views.static import serve
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404

from .models import FilesystemItem
from .permissions import IsOwner

"""
Middleware to serve media files with permission check
"""
class ServeUserUploadsMiddleware:
	MEDIA_URL = getattr(settings, 'MEDIA_URL', None)
	MEDIA_ROOT = getattr(settings, 'MEDIA_ROOT', None)

	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		response = self.get_response(request)
		return response

	def process_view(self, request, view_func, view_args, view_kwargs):
		try:
			if self.MEDIA_ROOT and self.MEDIA_URL and request.path_info.startswith(self.MEDIA_URL):
				path = request.path_info.replace(self.MEDIA_URL, '').lstrip('/')

				file_id = path.split('/')[-1]
				file = get_object_or_404(FilesystemItem, pk=file_id)

				if not IsOwner.does_user_has_permission(IsOwner, request, file):
					return JsonResponse({
						'error': "You are not allowed to access this file."
					}, status=401)

				response = serve(request, path=path, document_root=self.MEDIA_ROOT)
				response['Content-Disposition'] = f'attachment; filename="{file.name}"'
				response['Content-Length'] = str(file.filesize)
				return response
		except Exception:
			return JsonResponse({
					'error': "The requested file does not appear to be on our servers. We are terribly sorry 😢"
				}, status=404)

		return None