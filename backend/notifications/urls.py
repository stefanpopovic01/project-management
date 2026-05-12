from rest_framework.routers import DefaultRouter
from .views import NotificationListView, MarkAllReadView, MarkAsReadView
from django.urls import path

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/read/', MarkAsReadView.as_view(), name='notification-mark-read'),
    path('mark-all-read/', MarkAllReadView.as_view(), name='notification-mark-all-read'),
]

'''

class NotificationListView(generics.ListAPIView):
    """
    GET /api/notifications/
    Returns all notifications for the authenticated user, ordered by most recent.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)


class MarkAsReadView(APIView):
    """
    PATCH /api/notifications/<pk>/read/
    Marks a single notification as read. Returns 404 if not found or does not belong to the user.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
        notification.is_read = True
        notification.save()
        return Response({"message": "Notification marked as read"}, status=status.HTTP_200_OK)


class MarkAllReadView(APIView):
    """
    PATCH /api/notifications/mark-all-read/
    Marks all unread notifications as read for the authenticated user.
    Returns the count of updated notifications.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        updated_count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)

        if updated_count == 0:
            return Response({"message": "No unread notifications"}, status=status.HTTP_200_OK)

        return Response({"message": f"{updated_count} notifications marked as read"}, status=status.HTTP_200_OK)

'''