from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView
from .views import UserSearchView, UserDetailView, FollowToggleView, FollowersListView, FollowingListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('search/', UserSearchView.as_view(), name='user_search'), # Get User by Search
    path('user/<int:pk>/', UserDetailView.as_view(), name='user_detail'), # Edit, Delete, Get
    path('user/<int:pk>/follow/', FollowToggleView.as_view(), name='follow_toggle'),
    path('user/<int:pk>/followers/', FollowersListView.as_view(), name='user_followers'),
    path('user/<int:pk>/following/', FollowingListView.as_view(), name='user_following'),
]

