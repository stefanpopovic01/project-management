from rest_framework import serializers
from .models import Notification
from accounts.serializers import UserSearchSerializer
from projects.serializers import ProjectMinimalSerializer

class NotificationSerializer(serializers.ModelSerializer):
    actor = UserSearchSerializer(read_only=True)
    # recipient = UserSearchSerializer(read_only=True) not needed since logged user is recipient
    project = ProjectMinimalSerializer(read_only=True)
    class Meta:
        model = Notification
        fields = ['id', 'actor', 'recipient', 'project', 'task', 'type', 'message', 'is_read', 'created_at']