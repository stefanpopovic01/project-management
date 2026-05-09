from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Project, ProjectMember
from .serializers import ProjectSerializer
from .permissions import IsCreatorOrReadOnly

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


''' 
What Django does behind the scenes if you DON'T override:
def list(self, request, *args, **kwargs):
    queryset = self.get_queryset()
    serializer = self.get_serializer(queryset, many=True)
    return Response(serializer.data)
Because you wanted to change the response (to add totalCount and count), you had to rewrite this method.'''

# GET /api/projects/?filter=created&search=Web&limit=5