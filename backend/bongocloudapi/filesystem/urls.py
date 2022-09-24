from django.urls import path
from . import views

urlpatterns = [
  path('', views.FilesystemItemListAPIView.as_view()),
  path('create/', views.FilesystemCreateAPIView.as_view()),
  path('<uuid:pk>/', views.FilesystemItemListAPIView.as_view()),
  path('<uuid:pk>/move/', views.MoveFilesystemItemAPIView.as_view()),
  path('<uuid:pk>/info/', views.FilesystemItemRetrieveAPIView.as_view()),
  path('<uuid:pk>/delete/', views.FilesystemItemDestroyAPIView.as_view()),
  path('<uuid:pk>/share/', views.CreateFilesystemSharedItemAPIView.as_view()),
  path('share/<uuid:pk>/', views.RetrieveFilesystemSharedItemAPIVIew.as_view()),
  path('<str:path>/', views.FilesystemItemRetrieveFromPathAPIView.as_view()),
]
