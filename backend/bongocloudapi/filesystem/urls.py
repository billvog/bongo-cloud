from django.urls import path
from . import views

urlpatterns = [
  path('', views.ListFilesystemItemAPIView.as_view()),
  path('<uuid:pk>/', views.ListFilesystemItemAPIView.as_view()),
  path('path/<str:path>/', views.RetrieveFilesystemItemFromPathAPIView.as_view()),
  
  path('create/', views.CreateFilesystemItemAPIView.as_view()),
  path('<uuid:pk>/move/', views.MoveFilesystemItemAPIView.as_view()),
  path('<uuid:pk>/info/', views.RetrieveFilesystemItemAPIView.as_view()),
  path('<uuid:pk>/delete/', views.DestroyFilesystemItemAPIView.as_view()),
  path('<uuid:pk>/download/', views.DownloadFilesystemItemAPIView.as_view(), name='filesystem_item-download'),
  path('<uuid:pk>/share/', views.CreateFilesystemSharedItemAPIView.as_view()),

  path('share/item/<uuid:pk>/', views.RetrieveFilesystemSharedItemFromItemIdAPIView.as_view()),
  path('share/<uuid:pk>/', views.RetrieveFilesystemSharedItemAPIVIew.as_view()),
  path('share/<uuid:pk>/update/', views.UpdateFilesystemSharedItemAPIView.as_view()),
  path('share/<uuid:pk>/delete/', views.DestroyFilesystemSharedItemAPIView.as_view()),
  path('share/<uuid:pk>/download/', views.DownloadFilesystemSharedItemAPIVIew.as_view(), name='filesystem_shared_item-download'),
]
