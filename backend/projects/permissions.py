from rest_framework import permissions
from django.shortcuts import get_object_or_404
from .models import Project

class IsCreatorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user

class IsInviteParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user

        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        if view.action in ["accept", "decline"]:
            return obj.receiver == user

        if view.action in ["destroy", "cancel"]:
            return obj.invited_by == user

        return False
    
class IsTaskCreatorOrAssignee(permissions.BasePermission):

    def has_permission(self, request, view):
        if view.action == 'create':
            project_id = request.data.get('project')
            project = get_object_or_404(Project, id=project_id)
            return project.owner == request.user
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        is_creator = obj.created_by == user
        is_assignee = obj.assignee == user

        if view.action == 'retrieve':
            return is_creator or is_assignee

        if view.action in ['update', 'partial_update', 'destroy', 'create_checklist_item']:
            return is_creator

        if view.action in ['add_comment', 'update_checklist_item', 'update_task_status']:
            return is_creator or is_assignee

        return False