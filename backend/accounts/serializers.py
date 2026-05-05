from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'first_name', 
            'last_name', 'position', 'company', 'location', 'bio', 'image', 'skills'
        ]

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user