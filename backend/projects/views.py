from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from .models import Project, ProjectMember, ProjectInvite, Task, Comment, ChecklistItem
from .serializers import ProjectSerializer, ProjectInviteSerializer, TaskSerializer, CommentSerializer, ChecklistSerializer
from .permissions import IsCreatorOrReadOnly, IsInviteParticipant, IsTaskCreatorOrAssignee
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.exceptions import PermissionDenied
from notifications.models import Notification
from django.utils import timezone
from django.db.models import Q
from django.shortcuts import get_object_or_404

User = get_user_model()

class ProjectViewSet(ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsCreatorOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        
        # New parameters for search, status, and profile viewing
        target_user_id = self.request.query_params.get('user_id')
        filter_type = self.request.query_params.get('filter')
        search = self.request.query_params.get('search')

        # Logic for req.params.id || req.user.id
        if target_user_id:
            target_user = User.objects.filter(id=target_user_id).first() or user
        else:
            target_user = user

        # 1. Base Filter (Targeted at the user being viewed)
        if filter_type == 'created':
            queryset = Project.objects.filter(owner=target_user) # GET /api/projects/?filter=created 
        
        elif filter_type == 'assigned':
            queryset = Project.objects.filter(members=target_user).exclude(owner=target_user) # GET /api/projects/?filter=assigned

        else:
            queryset = Project.objects.filter(members=target_user) # GET /api/projects/ → Returns all projects (Created + Joined).

        # 3. Search Logic (istartswith matches "starting with certain letters")
        if search:
            queryset = queryset.filter(title__istartswith=search)

        # 5. Sorting (createdAt: -1)
        return queryset.order_by('-created_at').distinct()

    def list(self, request, *args, **kwargs): # overriding the default behavior.
        queryset = self.get_queryset()
        
        total_matching = queryset.count()

        # Limit logic
        limit = request.query_params.get('limit')
        if limit:
            try:
                queryset = queryset[:int(limit)]
            except (ValueError, TypeError):
                pass

        serializer = self.get_serializer(queryset, many=True)
        
        # Returns the exact format frontend expects
        return Response({
            "count": len(serializer.data),
            "projects": serializer.data,
            "totalCount": total_matching
        })

    # def perform_create(self, serializer):
    #     # This replaces the manual "create" logic and ensures 
    #     # the creator is saved as the person currently logged in.
    #     serializer.save(owner=self.request.user)

    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)

        ProjectMember.objects.create(
            project=project,
            user=self.request.user
        )

        return project

    @action(detail=True, methods=['post'], url_path='remove-member')
    def remove_member(self, request, pk=None):
        project = self.get_object()

        # get user_id from request body
        user_id = request.data.get('user_id')

        if not user_id:
            return Response(
                {"detail": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # find membership
        member = get_object_or_404(
            ProjectMember,
            project=project,
            user_id=user_id
        )

        # optional safety: prevent removing owner
        if member.user == project.owner:
            return Response(
                {"detail": "You cannot remove project owner"},
                status=status.HTTP_400_BAD_REQUEST
            )

        member.delete()

        return Response({
            "message": "Member removed successfully"
        }, status=status.HTTP_200_OK) 

# GET /api/projects/?filter=created&search=Web&limit=5

class ProjectInviteViewSet(ModelViewSet):
    serializer_class = ProjectInviteSerializer
    permission_classes = [IsAuthenticated, IsInviteParticipant]

    def get_queryset(self):
        user = self.request.user

        return ProjectInvite.objects.filter(
            Q(invited_by=user) | Q(receiver=user)
        )

    def perform_create(self, serializer):
        project = serializer.validated_data['project']
        receiver = serializer.validated_data['receiver']

        if project.owner != self.request.user:
            raise PermissionDenied("Only project owner can invite users.")

        if receiver == self.request.user:
            raise PermissionDenied("You cannot invite yourself.")

        if ProjectInvite.objects.filter(
            project=project,
            receiver=receiver,
            status=ProjectInvite.InviteStatus.PENDING
        ).exists():
            raise PermissionDenied("User already has a pending invite.")

        if ProjectMember.objects.filter(
            project=project,
            user=receiver
        ).exists():
            raise PermissionDenied("User is already a member.")

        serializer.save(
            invited_by=self.request.user,
            status=ProjectInvite.InviteStatus.PENDING
        )

        Notification.objects.create(
            actor=self.request.user,
            recipient=receiver,
            type=Notification.NotificationType.MEMBER_INVITED,
            message=f"{self.request.user.first_name} {self.request.user.last_name} invited you to {project.title}.",
            project=project
        )

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        invite = self.get_object()

        if invite.receiver != request.user:
            return Response(
                {"detail": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        if invite.status != ProjectInvite.InviteStatus.PENDING:
            return Response(
                {"detail": f"Already {invite.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        invite.status = ProjectInvite.InviteStatus.ACCEPTED
        invite.accepted_at = timezone.now()
        invite.save()

        ProjectMember.objects.get_or_create(
            project=invite.project,
            user=request.user
        )

        return Response({
            "message": "Invite accepted",
            "status": invite.status
        })

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        invite = self.get_object()

        if invite.receiver != request.user:
            return Response(
                {"detail": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        if invite.status != ProjectInvite.InviteStatus.PENDING:
            return Response(
                {"detail": f"Already {invite.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        invite.status = ProjectInvite.InviteStatus.DECLINED
        invite.save()

        return Response({
            "message": "Invite declined",
            "status": invite.status
        })

    def destroy(self, request, *args, **kwargs):
        invite = self.get_object()

        if invite.invited_by != request.user:
            return Response(
                {"detail": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)

class TaskViewSet(ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsTaskCreatorOrAssignee]

    def get_queryset(self):
        user = self.request.user
        project_id = self.request.query_params.get('project_id')
        user_id = self.request.query_params.get('user_id')

        if project_id:
            project = get_object_or_404(Project, id=project_id)
            if project.owner != user and not project.members.filter(id=user.id).exists():
                raise PermissionDenied("You are not a member of this project.")
            queryset = Task.objects.filter(project=project)

        elif user_id:
            if str(user.id) != str(user_id):
                raise PermissionDenied("You can only view your own tasks.")
            queryset = Task.objects.filter(assignee=user)

        else:
            queryset = Task.objects.filter(Q(created_by=user) | Q(assignee=user))

        return queryset.select_related('assignee', 'project', 'created_by').prefetch_related('comments__author', 'checklist_items')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        user_id = request.query_params.get('user_id')

        if user_id:
            now = timezone.now().date()
            total = queryset.count()
            completed = queryset.filter(status=Task.TaskStatus.DONE).count()
            overdue = queryset.filter(due_date__lt=now).exclude(status=Task.TaskStatus.DONE).count()

            serializer = self.get_serializer(queryset, many=True)
            return Response({
                "tasks": serializer.data,
                "stats": {
                    "total": total,
                    "completed": completed,
                    "overdue": overdue,
                    "pending": total - completed
                }
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "count": queryset.count(),
            "tasks": serializer.data
        })

    def perform_create(self, serializer):
        task = serializer.save(created_by=self.request.user)
        assignee = task.assignee

        if assignee and assignee != self.request.user:
            Notification.objects.create(
                actor=self.request.user,
                recipient=assignee,
                type=Notification.NotificationType.TASK_ASSIGNED,
                message=f"{self.request.user.first_name} {self.request.user.last_name} assigned you to task \"{task.title}\".",
                project=task.project,
                task=task
            )

    @action(detail=True, methods=['post'], url_path='comments') # detail=True already handles the task relation — it means the URL is /tasks/{pk}/add_comment/, so pk is the task ID
    def add_comment(self, request, pk=None):
        task = self.get_object()  # this fetches the task by pk AND runs has_object_permission
        body = request.data.get('body')

        if not body:
            return Response(
                {"message": "Body is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        comment = Comment.objects.create(
            task=task,
            author=self.request.user,
            body=body
        )

        if task.created_by != self.request.user:
            Notification.objects.create(
                actor=self.request.user,
                recipient=task.created_by,
                type=Notification.NotificationType.COMMENT_ADDED,
                message=f"{self.request.user.first_name} {self.request.user.last_name} commented on \"{task.title}\".",
                project=task.project,
                task=task
            )

        return Response({
            "message": "Comment added successfully.",
            "comment": CommentSerializer(comment).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='status')
    def update_task_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')

        if not new_status:
            return Response(
                {"message": "Status is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = task.status
        task.status = new_status
        task.save()

        if task.created_by != self.request.user:
            Notification.objects.create(
                actor=self.request.user,
                recipient=task.created_by,
                type=Notification.NotificationType.TASK_MOVED,
                message=f"{self.request.user.first_name} {self.request.user.last_name} moved \"{task.title}\" from {old_status} to {new_status}.",
                project=task.project,
                task=task
            )

        return Response({
            "message": "Status updated successfully.",
            "task": TaskSerializer(task).data
        })

    @action(detail=True, methods=['patch'], url_path='checklist/(?P<item_id>[^/.]+)')
    def update_checklist_item(self, request, pk=None, item_id=None):
        task = self.get_object()
        is_done = request.data.get('is_done')

        if is_done is None:
            return Response(
                {"message": "is_done field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        checklist_item = get_object_or_404(ChecklistItem, id=item_id, task=task)
        checklist_item.is_done = is_done
        checklist_item.save()

        return Response({
            "message": "Checklist item updated successfully.",
            "checklist_item": ChecklistSerializer(checklist_item).data
        })

    @action(detail=True, methods=['post'], url_path='checklist')
    def create_checklist_item(self, request, pk=None):
        task = self.get_object()
        text = request.data.get('text')

        if not text:
            return Response(
                {"message": "Text field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        checklist_item = ChecklistItem.objects.create(
            task=task,
            text=text,
            is_done=request.data.get('is_done', False)
        )

        return Response({
            "message": "Checklist item added successfully.",
            "checklist_item": ChecklistSerializer(checklist_item).data
        }, status=status.HTTP_201_CREATED)


'''
url_path='checklist/(?P<item_id>[^/.]+)' — this captures the item ID from the URL so your endpoint looks like PATCH 
/tasks/{pk}/checklist/{item_id}/ 
'''