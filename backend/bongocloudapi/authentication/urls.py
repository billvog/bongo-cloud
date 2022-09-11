from django.urls import path
from rest_framework_simplejwt.views import (
	TokenRefreshView
)

from .views import LoginAPIView, RegisterAPIView, MeAPIView

urlpatterns = [
	path('me/', MeAPIView.as_view(), name='me'),
	path('login/', LoginAPIView.as_view(), name='login'),
	path('register/', RegisterAPIView.as_view(), name='register'),
	path('refresh-token/', TokenRefreshView.as_view(), name='refresh-token'),
]