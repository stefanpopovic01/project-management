from rest_framework import permissions

class IsCreatorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
                    return True
        return obj.owner == request.user

class IsInviteParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user

        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        if view.action in ["accept", "decline"]:
            return obj.receiver == user

        if view.action in ["destroy", "cancel"]:
            return obj.invited_by == user

        return False