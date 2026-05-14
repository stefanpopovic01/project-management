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


class AbsoluteImageMixin:
    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(obj.image.url)
        from django.conf import settings
        base_url = getattr(settings, 'SITE_URL', 'http://127.0.0.1:8000')
        return f"{base_url.rstrip('/')}{obj.image.url}"

class UserSearchSerializer(AbsoluteImageMixin, serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'initials', 'image', 'email']

class UserSerializer(AbsoluteImageMixin, serializers.ModelSerializer):
    followers_count = serializers.IntegerField(source='followers.count', read_only=True)
    following_count = serializers.IntegerField(source='following.count', read_only=True)
    image = serializers.SerializerMethodField()  # added

    # We do not have these two fields in model so we need to create them here, and source='followers.count' is equal to: followers.count()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'position', 'company', 'location', 'bio', 'image', 
            'skills', 'initials', 'followers_count', 'following_count', 'created_at'
        ]

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Checks if username/password are correct

        data['user'] = UserSerializer(self.user, context={'request': self.context.get('request')}).data

        # Uses the UserSerializer above to grab ALL data for the login response
        
        return data
    
# This is custom Login serializer, DNF has default one that just returns tokens and this one returns all data in response