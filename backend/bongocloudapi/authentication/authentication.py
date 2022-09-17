from django.http import HttpRequest
from django.contrib.auth import get_user_model
from rest_framework import authentication
import jwt

from .utils import decode_access_token

User = get_user_model()

class JWTAuthentication(authentication.BaseAuthentication):
	"""
	Authenticate user with the access token 
	provided from RefreshJWTMiddleware middleware.
	"""
	def authenticate(self, request: HttpRequest):
		if not 'HTTP_ACCESS_TOKEN' in request.META:
			return None

		access_token = request.META['HTTP_ACCESS_TOKEN']
		
		try:
			access_payload = decode_access_token(access_token)
			return (User.objects.get(pk=access_payload['user_id']), None)
		except jwt.ExpiredSignatureError:
			print('Access JWT error: Expired signature.')
		except Exception as error:
			print('Error occured while verifying access token:', error)
			return None