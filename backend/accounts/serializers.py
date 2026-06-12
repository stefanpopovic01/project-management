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

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'initials', 'image', 'email']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['image'] = self.get_image(instance)
        
        return data

class UserSerializer(AbsoluteImageMixin, serializers.ModelSerializer):
    followers_count = serializers.IntegerField(source='followers.count', read_only=True)
    following_count = serializers.IntegerField(source='following.count', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'position', 'company', 'location', 'bio', 'image', 
            'skills', 'initials', 'followers_count', 'following_count', 'created_at'
        ]

    def to_representation(self, instance):

        data = super().to_representation(instance)
        data['image'] = self.get_image(instance)
        
        return data

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user, context={'request': self.context.get('request')}).data
        
        return data
    