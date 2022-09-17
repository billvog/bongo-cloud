from django.conf import settings
from rest_framework.response import Response
from datetime import datetime, timezone, timedelta
import jwt

def generate_tokens_for_user(user):
	access_token = jwt.encode(
		{
			'user_id': str(user.id),
			'exp': datetime.now(tz=timezone.utc) + timedelta(minutes=7),
			'iat': datetime.now(tz=timezone.utc)
		},
		settings.JWT_ACCESS_TOKEN_SECRET, algorithm='HS256'
	)

	refresh_token = jwt.encode(
		{
			'user_id': str(user.id),
			'token_version': user.token_version,
			'exp': datetime.now(tz=timezone.utc) + timedelta(days=7),
			'iat': datetime.now(tz=timezone.utc)
		},
		settings.JWT_REFRESH_TOKEN_SECRET, algorithm='HS256'
	)

	return (access_token, refresh_token)

def set_refresh_token_cookie(response: Response, refresh_token: str):
	response.set_cookie('refresh_token', refresh_token, httponly=True)

def decode_access_token(access_token):
	return jwt.decode(access_token, settings.JWT_ACCESS_TOKEN_SECRET, algorithms=['HS256'])

def decode_refresh_token(refresh_token):
	return jwt.decode(refresh_token, settings.JWT_REFRESH_TOKEN_SECRET, algorithms=['HS256'])

def is_access_token_expired(access_token):
	try:
		decode_access_token(access_token)
	except jwt.ExpiredSignatureError:
		return True
	except:
		pass
	
	return False