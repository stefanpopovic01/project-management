from django.db import models
from django.conf import settings
from django.utils import timezone
from projects.models import Project, Task, ProjectInvite

class Notification(models.Model):
    class NotificationType(models.TextChoices):
        TASK_MOVED = 'task_moved', 'Task moved'
        COMMENT_ADDED = 'comment_added', 'Comment added'
        MEMBER_INVITED = 'member_invited', 'Member invited'
        TASK_ASSIGNED = 'task_assigned', 'Task assigned'
        USER_FOLLOWED = 'user_followed', 'User followed'

    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='made_notifications')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)

    invite = models.ForeignKey(ProjectInvite, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    type = models.CharField(max_length=20, choices=NotificationType.choices)

    message = models.TextField(blank=True, default='')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.actor} -> {self.recipient} ({self.type})"