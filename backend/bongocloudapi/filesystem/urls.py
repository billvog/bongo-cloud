from django.urls import path
from . import views

urlpatterns = [
  path('', views.filesystem_item_list_create_api_view),
  path('<uuid:pk>/', views.filesystem_item_list_create_api_view),
  path('<uuid:pk>/info', views.filesystem_item_retrieve_destroy_api_view),
  path('<uuid:pk>/delete', views.filesystem_item_retrieve_destroy_api_view)
]
