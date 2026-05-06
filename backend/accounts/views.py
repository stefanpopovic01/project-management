from django.shortcuts import render
from django.db.models import Q

from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import User
from .serializers import RegisterSerializer, UserSearchSerializer
from .permissions import IsAccountOwnerOrReadOnly

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class UserSearchView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSearchSerializer

    def get_queryset(self):
        query = self.request.query_params.get('q', '') # ( /api/users/?q=alex)
        
        if query:
            return User.objects.filter(
                Q(first_name__icontains=query) | 
                Q(last_name__icontains=query)
            )[:15]
            
        return User.objects.none()

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAuthenticated, IsAccountOwnerOrReadOnly]