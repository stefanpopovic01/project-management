from django.shortcuts import render, get_object_or_404
from django.db.models import Q

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, Follow
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
    # We need her to Delete Projects & Tasks & Notifications related to User when deleting. Implement later..

class FollowToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        user_to_follow = get_object_or_404(User, pk=pk)
        me = request.user

        if me == user_to_follow:
            return Response({"error": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        follow_exists = Follow.objects.filter(follower=me, following=user_to_follow).first()

        if follow_exists:
            follow_exists.delete()
            return Response({"message": "Unfollowed successfully", "following": False}, status=status.HTTP_200_OK)
        else:
            Follow.objects.create(follower=me, following=user_to_follow)
            return Response({"message": "Followed successfully", "following": True}, status=status.HTTP_201_CREATED)
        

class FollowersListView(generics.ListAPIView):
    serializer_class = UserSearchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = get_object_or_404(User, pk=self.kwargs['pk'])
        return user.followers.all()

class FollowingListView(generics.ListAPIView):
    serializer_class = UserSearchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = get_object_or_404(User, pk=self.kwargs['pk'])
        return user.following.all()