from django.db import models
from django.conf import settings
from projects.models import Project, Task

class Notification(models.Model):
    class NotificationType(models.TextChoices):
        TASK_MOVED = 'task_moved', 'Task Moved'
        COMMENT_ADDED = 'comment_added', 'Comment Added'
        MEMBER_INVITED = 'member_invited', 'Member Invited'
        TASK_ASSIGNED = 'task_assigned', 'Task Assigned'
        USER_FOLLOWED = 'user_followed', 'User Followed'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications'
    )
    
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='actions_performed'
    )
    
    type = models.CharField(
        max_length=20, 
        choices=NotificationType.choices
    )
    
    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True, blank=True
    )

    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE, 
        related_name='notifications',
        null=True, blank=True
    )
    
    message = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at'] 

    def __str__(self):
        return f"{self.actor.username} -> {self.type} -> {self.recipient.username}"