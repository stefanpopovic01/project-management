from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet

router = DefaultRouter()
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