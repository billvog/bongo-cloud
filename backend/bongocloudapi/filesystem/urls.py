from django.urls import path
from . import views

urlpatterns = [
  path('', views.FilesystemItemListAPIView.as_view()),
  path('<uuid:pk>/', views.FilesystemItemListAPIView.as_view()),
  
  path('create/', views.FilesystemCreateAPIView.as_view()),
  path('<uuid:pk>/move/', views.MoveFilesystemItemAPIView.as_view()),
  path('<uuid:pk>/info/', views.FilesystemItemRetrieveAPIView.as_view()),
  path('<uuid:pk>/delete/', views.FilesystemItemDestroyAPIView.as_view()),
  path('<uuid:pk>/download/', views.DownloadFilesystemItemAPIView.as_view(), name='filesystem_item-download'),
  path('<uuid:pk>/share/', views.CreateFilesystemSharedItemAPIView.as_view()),

  path('share/<uuid:pk>/', views.RetrieveFilesystemSharedItemAPIVIew.as_view()),
  path(
    'share/<uuid:pk>/download/',
    views.DownloadFilesystemSharedItemAPIVIew.as_view(),
    name='filesystem_shared_item-download'
  ),

  path('<str:path>/', views.FilesystemItemRetrieveFromPathAPIView.as_view()),
]
