from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ProjectViewSet, ProjectInviteViewSet, TaskViewSet

router = DefaultRouter()

router.register("invites", ProjectInviteViewSet, basename='project-invite')
router.register("tasks", TaskViewSet, basename='tasks')
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

REMOVING MEMBER POST http://127.0.0.1:8000/api/projects/2/remove-member/ WITH 
{
  "user_id": 5
}

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

"""
    TaskViewSet - Full CRUD + custom actions for task management.

    Base URL: /api/projects/tasks/

    ─────────────────────────────────────────────────────────────
    STANDARD ENDPOINTS (provided by ModelViewSet)
    ─────────────────────────────────────────────────────────────

    GET /tasks/
        List tasks. Behavior depends on query params:
        - ?project_id=<id>  → returns all tasks for that project
                              (user must be project owner or member)
        - ?user_id=<id>     → returns all tasks assigned to that user
                              + stats { total, completed, overdue, pending }
                              (only the user themselves can access this)
        - no params         → returns all tasks where user is creator or assignee
        Permission: IsAuthenticated

    GET /tasks/<id>/
        Retrieve a single task with nested assignee, project,
        comments (with authors), checklist items, and checklist counts.
        Permission: creator or assignee only

    POST /tasks/
        Create a new task.
        Required body: { title, project, status, priority }
        Optional body: { description, assignee, due_date, tags }
        Permission: project owner only

    PUT /tasks/<id>/
        Full update of a task.
        Permission: task creator only

    PATCH /tasks/<id>/
        Partial update of a task.
        Permission: task creator only

    DELETE /tasks/<id>/
        Delete a task.
        Permission: task creator only

    ─────────────────────────────────────────────────────────────
    CUSTOM ACTIONS
    ─────────────────────────────────────────────────────────────

    POST /tasks/<id>/comments/
        Add a comment to a task.
        Required body: { body }
        Permission: task creator or assignee only

    PATCH /tasks/<id>/status/
        Update the status of a task.
        Required body: { status } → 'planned' | 'progress' | 'done'
        Permission: task creator or assignee only

    POST /tasks/<id>/checklist/
        Add a new checklist item to a task.
        Required body: { text }
        Optional body: { is_done } → defaults to False
        Permission: task creator only

    PATCH /tasks/<id>/checklist/<item_id>/
        Update a specific checklist item.
        Required body: { is_done }
        Permission: task creator or assignee only

    ─────────────────────────────────────────────────────────────
    PERMISSION SUMMARY
    ─────────────────────────────────────────────────────────────

    Action                    | Creator | Assignee | Project Owner
    --------------------------|---------|----------|---------------
    list                      |    ✓    |    ✓     |      ✓
    retrieve                  |    ✓    |    ✓     |      -
    create                    |    -    |    -     |      ✓
    update / partial_update   |    ✓    |    -     |      -
    destroy                   |    ✓    |    -     |      -
    add_comment               |    ✓    |    ✓     |      -
    update_task_status        |    ✓    |    ✓     |      -
    create_checklist_item     |    ✓    |    -     |      -
    update_checklist_item     |    ✓    |    ✓     |      -
"""