from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ProjectViewSet, ProjectInviteViewSet

router = DefaultRouter()

router.register("invites", ProjectInviteViewSet, basename='project-invite')
router.register(r'', ProjectViewSet, basename='project')


urlpatterns = [
    path('', include(router.urls)),
]

'''
PROJECTS API DOCUMENTATION

Base URL: /api/projects/
Authentication: Bearer <JWT_TOKEN> required for all endpoints.

1. GET /api/projects/
   Description: Lists projects based on filters. Returns a custom object with metadata.
   
   Query Parameters (Optional):
   - user_id: [ID] -> Returns projects belonging to a specific user (Profile View).
   - filter: "created" -> Returns only projects where you are the creator.
   - filter: "assigned" -> Returns projects where you are a member but not the creator.
   - search: [string] -> Returns projects where the title starts with these letters.
   - limit: [number] -> Limits the result to X projects (e.g., for "Recent Projects" widgets).
   
   Response Structure:
   {
     "count": 5,           // Number of projects in the current response
     "projects": [...],    // Array of project objects with task stats & member details
     "totalCount": 42      // Total projects matching filters (before limiting)
   }

2. POST /api/projects/
   Description: Creates a new project.
   Logic: Automatically sets the logged-in user as the 'creator'.
   Body: { "title": "String", "description": "String" }

3. GET /api/projects/<id>/
   Description: Retrieves full details of a specific project.
   Includes: Member list, creator info, totalTasks, and completedTasks counts.

4. PUT /api/projects/<id>/
   Description: Full update of a project.
   Permission: Only the Creator can perform this action.

5. PATCH /api/projects/<id>/
   Description: Partial update (e.g., change only the title or status).
   Permission: Only the Creator can perform this action.

6. DELETE /api/projects/<id>/
   Description: Deletes the project.
   Permission: Only the Creator can perform this action.
'''


"""
ProjectInviteViewSet
---------------------

Handles project invitation lifecycle.

This endpoint allows authenticated users to:

1. Invite a user to a project
2. View their received invites
3. Accept an invite
4. Decline an invite
5. Cancel an invite (if they are the inviter)

----------------------------------------
📌 CREATE INVITE
POST /api/project/invites/

Body:
{
    "project": 1,
    "receiver": 5,
    "expires_at": "2026-06-01T00:00:00Z"
}

Rules:
- User must be authenticated
- Cannot invite yourself
- Cannot invite users already in project
- Cannot duplicate pending invites

----------------------------------------
📌 LIST INVITES
GET /api/invites/

Returns:
- All invites where request.user is receiver

----------------------------------------
📌 ACCEPT INVITE
POST /api/invites/{id}/accept/

Rules:
- Only receiver can accept
- Only pending invites can be accepted

Effect:
- Invite status → ACCEPTED
- User added to ProjectMember

----------------------------------------
📌 DECLINE INVITE
POST /api/invites/{id}/decline/

Rules:
- Only receiver can decline
- Only pending invites can be declined

Effect:
- Invite status → DECLINED

----------------------------------------
📌 DELETE INVITE (CANCEL)
DELETE /api/invites/{id}/

Rules:
- Only invited_by can delete invite
"""