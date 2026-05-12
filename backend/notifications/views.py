from django.shortcuts import render, get_object_or_404

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from .models import Notification
from .serializers import NotificationSerializer
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
    
        return Notification.objects.filter(recipient=self.request.user)
            
class MarkAsReadView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk)

        if notification.recipient != self.request.user:
            return Response(
                {"detail": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )
        notification.is_read = True
        notification.save()

        return Response({"message": "Notification marked as read successfully"}, status=status.HTTP_200_OK)
    
class MarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        updated_count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)

        if updated_count == 0:
            return Response(
                {"message": "No unread notifications"},
                status=status.HTTP_200_OK
            )

        return Response(
            {"message": f"{updated_count} notifications marked as read"},
            status=status.HTTP_200_OK
        )