from rest_framework.routers import DefaultRouter
from .views import NotificationListView, MarkAllReadView, MarkAsReadView
from django.urls import path

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/read/', MarkAsReadView.as_view(), name='notification-mark-read'),
    path('mark-all-read/', MarkAllReadView.as_view(), name='notification-mark-all-read'),
]