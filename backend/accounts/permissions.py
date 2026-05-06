from rest_framework import permissions

class IsAccountOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj == request.user

# GET, HEAD, OPTIONS are SAFE_METOHODS, we use this permission to allow people to just get other person profile
# Only allow changes if the object belongs to the logged-in user. (obj == request.user)
# obj is the database object retrieved from the queryset using the URL parameter (like /users/<id>/), 
# and DRF passes it into the permission check automatically before allowing access, in my case it's user, because in view we get certain user