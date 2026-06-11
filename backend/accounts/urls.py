from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, MyTokenObtainPairView, UserSearchView, UserDetailView, FollowToggleView, FollowersListView, FollowingListView, PasswordResetConfirmView, PasswordResetRequestView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'), # POST
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'), # POST
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # POST
    path('search/', UserSearchView.as_view(), name='user_search'), # GET users By Search
    path('user/<int:pk>/', UserDetailView.as_view(), name='user_detail'), # PATCH, PUT, DELETE, GET
    path('user/<int:pk>/follow/', FollowToggleView.as_view(), name='follow_toggle'), # POST
    path('user/<int:pk>/followers/', FollowersListView.as_view(), name='user_followers'), # GET
    path('user/<int:pk>/following/', FollowingListView.as_view(), name='user_following'), # GET
    path("password-reset/", PasswordResetRequestView.as_view()),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view()),
]

