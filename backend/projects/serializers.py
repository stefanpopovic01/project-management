from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, ProjectMember, ProjectInvite, Task
from accounts.serializers import UserSearchSerializer

User = get_user_model() # Getting customized Abstract User from settings.py specifically AUTH_USER_MODEL

class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSearchSerializer(read_only=True)

    class Meta:
        model = ProjectMember
        fields = ['user', 'joined_at']

class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSearchSerializer(read_only=True)
    members = ProjectMemberSerializer(source='projectmember_set', many=True, read_only=True)
    
    total_tasks = serializers.SerializerMethodField() # "There is no database column for this. To get the value, look for a function in this class that starts with get_ followed by the field name.
    completed_tasks = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'status', 'deadline', 
            'owner', 'members', 'total_tasks', 'completed_tasks', 
            'member_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['owner', 'created_at', 'updated_at']

    def get_total_tasks(self, obj):
        return obj.tasks.count()

    def get_completed_tasks(self, obj):
        return obj.tasks.filter(status=Task.TaskStatus.DONE).count()
    
    def get_member_count(self, obj):
        return obj.projectmember_set.count()

class ProjectInviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectInvite
        fields = ['id','project','receiver','invited_by','status','expires_at']
        read_only_fields = ['invited_by', 'status']

    def validate(self, data):
        project = data['project']
        receiver = data['receiver']

        if ProjectMember.objects.filter(project=project,user=receiver).exists():
            raise serializers.ValidationError("User is already a member of this project.")

        if ProjectInvite.objects.filter(project=project,receiver=receiver,status=ProjectInvite.InviteStatus.PENDING).exists():
            raise serializers.ValidationError(
                "A pending invite already exists for this user."
            )

        return data