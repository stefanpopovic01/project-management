from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(source='followers.count', read_only=True)
    following_count = serializers.IntegerField(source='following.count', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'first_name', 
            'last_name', 'position', 'company', 'location', 'bio', 'image', 'skills', 'initials', 'followers_count', 'following_count'
        ]

        extra_kwargs = {
            'password': {'write_only': True},
            'initials': {'read_only': True} 
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return 
    
class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'initials', 'image']