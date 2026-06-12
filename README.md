# Flowly — Project Management Tool

A full-stack project management web application built with React, Django REST Framework, and PostgreSQL.

## Live Demo

https://project-management-django-iota.vercel.app/

## Features

### Users & Social
- **Secure Authentication:** Register and login with JWT authentication (SimpleJWT).
- **Password Reset Pipeline:** Fully automated, secure email password resets via Brevo HTTPS API.
- **Profile Customization:** Edit bio, manage core skill chips, and upload custom profile avatars directly to Cloudinary storage.
- **Social Ecosystem:** Search for other users, view their public profiles, and follow / unfollow users.
- **Activity Summary:** View projects a user created or contributed to directly from their profile dashboard.

### Projects
- Create projects and invite other users as members.
- Edit project details.
- View a summary of any public project.

### Task Board
- Kanban-style dashboard with three columns: **Planning**, **In Progress**, **Done**.
- Only the task owner can drag tasks between columns.
- Only the task owner and project owner can view full task details.
- Add comments to tasks.
- Project owner can add a checklist to tasks.

### Core Utilities & Communication
- **Contact & Support Engine:** Integrated contact form that shoots messages straight to administration inbox.
- **Production Logging System:** Internal server logger tracks middleware traffic, request execution times, and database operational exceptions.
- **Notification System:** Notifications for project invitations, follows, and tasks.

### Security
- JWT-based authentication and database-level request authorization.
- Comprehensive CORS configuration protecting backend entry points.
- Production-hardened environment separation using `python-dotenv`.
- Robust structural data integrity enforced via a Relational Database Management System (RDBMS).

> and more — including staggered frontend dashboard data fetching, cross-origin resource isolation, and dynamic error state protections.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), Axios |
| **Backend** | Python, Django REST Framework |
| **Database** | PostgreSQL (Relational DB) |
| **File Storage** | Cloudinary (Avatars & Images) |
| **Email Gateway** | Brevo API via Django Anymail |
| **Hosting** | Vercel (Frontend), Render (Backend) |
