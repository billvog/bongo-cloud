from django.urls import path
from . import views

urlpatterns = [
  path('', views.FilesystemItemListAPIView.as_view()),
  path('create/', views.FilesystemCreateAPIView.as_view()),
  path('<uuid:pk>/', views.FilesystemItemListAPIView.as_view()),
  path('<uuid:pk>/update/', views.FilesystemItemUpdateAPIView.as_view()),
  path('<uuid:pk>/info/', views.FilesystemItemRetrieveDestroyAPIView.as_view()),
  path('<uuid:pk>/delete/', views.FilesystemItemRetrieveDestroyAPIView.as_view()),
]
