from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from django.conf import settings  # Add this import at the top

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, Follow
from .serializers import RegisterSerializer, UserSearchSerializer, MyTokenObtainPairSerializer, UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import IsAccountOwnerOrReadOnly
from notifications.models import Notification

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

# It’s a pre-built class-based view provided by DRF that already implements a full “create” endpoint for you. - POST Only
# queryset - we need to refer it to Object we want to create, User in our case
# Serializer defines what fields are acceptable, how data is validated and object created

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# This is just short class to change default DNF login 

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

# ListAPIView is another prebuilt class-based view in Django REST Framework.
# It is used when you want to create an endpoint that: only returns a list of objects (GET request)

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAccountOwnerOrReadOnly]
    """ We need here to Delete Projects & Tasks & Notifications related to User when deleting. Implement later.. """

# it defines a ready-made API endpoint that works with a single object (one user)
# we have everything here, get, patch, post, delete 

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
            Notification.objects.create(
                actor=me,
                recipient=user_to_follow,
                type=Notification.NotificationType.USER_FOLLOWED,
                message=f"{me.first_name} {me.last_name} started following you."
            )
            return Response({"message": "Followed successfully", "following": True}, status=status.HTTP_201_CREATED)

# APIView is the most basic building block for views in Django REST Framework. Manually defining what happens for each http method

class FollowersListView(generics.ListAPIView):
    serializer_class = UserSearchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = get_object_or_404(User, pk=self.kwargs['pk'])
        return user.followers.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            "count": queryset.count(),
            "followers": serializer.data
        })

class FollowingListView(generics.ListAPIView):
    serializer_class = UserSearchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = get_object_or_404(User, pk=self.kwargs['pk'])
        return user.following.all()
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            "count": queryset.count(),
            "followers": serializer.data
        })
    
class PasswordResetRequestView(APIView):
    def post(self, request):
        email = request.data.get("email")

        try:
            user = User.objects.get(email=email)

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            reset_link = f"http://localhost:5174/reset-password/{uid}/{token}"

            send_mail(
                subject="Password Reset",
                message=f"Click to reset your password: {reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,  # Change None to this
                recipient_list=[email],
                fail_silently=False,
            )

        except User.DoesNotExist:
            # security: don't reveal if email exists
            pass

        return Response(
            {"message": "If the email exists, a reset link was sent."},
            status=status.HTTP_200_OK
        )
    
class PasswordResetConfirmView(APIView):
    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)

            if default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()

                return Response({"message": "Password reset successful"})

            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception:
            return Response(
                {"error": "Invalid request"},
                status=status.HTTP_400_BAD_REQUEST
            )