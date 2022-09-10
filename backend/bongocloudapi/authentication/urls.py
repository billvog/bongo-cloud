from django.urls import path
from rest_framework_simplejwt.views import (
	TokenObtainPairView,
	TokenRefreshView
)

from .views import RegisterAPIView, MeAPIView

urlpatterns = [
	path('register/', RegisterAPIView.as_view(), name='register'),
	path('login/', TokenObtainPairView.as_view(), name='login'),
	path('refresh-token/', TokenRefreshView.as_view(), name='refresh-token'),
	path('me/', MeAPIView.as_view(), name='me'),
]