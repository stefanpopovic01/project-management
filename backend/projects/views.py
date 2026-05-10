from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from .models import Project, ProjectMember, ProjectInvite
from .serializers import ProjectSerializer, ProjectInviteSerializer
from .permissions import IsCreatorOrReadOnly, IsInviteParticipant
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from django.db.models import Q

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
