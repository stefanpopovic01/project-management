from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'first_name', 
            'last_name', 'position', 'company', 'location', 'bio', 'image', 'skills', 'initials',
        ]

        extra_kwargs = {
            'password': {'write_only': True},
            'initials': {'read_only': True} 
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
    # Overriding create because if we do not password would be saved as a plain test and like this it will be hashed
    # valdiated_date are clean, validated data from my API request
    
class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'initials', 'image']

class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(source='followers.count', read_only=True)
    following_count = serializers.IntegerField(source='following.count', read_only=True)

    # We do not have these two fields in model so we need to create them here, and source='followers.count' is equal to: followers.count()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'position', 'company', 'location', 'bio', 'image', 
            'skills', 'initials', 'followers_count', 'following_count'
        ]

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Checks if username/password are correct

        data['user'] = UserSerializer(self.user).data
        # Uses the UserSerializer above to grab ALL data for the login response
        
        return data
    
# This is custom Login serializer, DNF has default one that just returns tokens and this one returns all data in response