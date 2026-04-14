# Backend Developer Internship Assignment Submission

Project
- Koma: Scalable REST API with Authentication, Protected CRUD, and React Integration

Repository
- This repository contains both backend and frontend implementation required for assignment demonstration.

Deployment Links
- Frontend (Vercel): https://koma-7.vercel.app
- Backend (Render): https://blog-website-backend-tkt1.onrender.com

## Requirement Coverage Matrix

1. User registration and login with password hashing and JWT
- Status: Completed
- Implemented in:
  - Backend/hello.py (/signup, /login)
  - Backend/auth.py (JWT verification middleware)
- Notes:
  - Password hashing uses Flask-Bcrypt
  - JWT includes user_id with expiration

2. Role-based access (user vs admin)
- Status: Partially completed (user-level authorization)
- Implemented in:
  - Backend/auth.py (authenticated user access)
  - Backend/posts.py and Backend/videos.py (ownership-based authorization for update/delete)
- Notes:
  - Current implementation enforces user-level protection and owner-only write control.
  - Admin role layer can be added next with role claims and admin middleware.

3. CRUD APIs for secondary entity
- Status: Completed
- Primary entity:
  - Posts CRUD in Backend/posts.py
- Additional entities:
  - Videos, comments, likes, follows in Backend/videos.py, Backend/likes.py, Backend/follow.py

4. API versioning, error handling, validation
- Status: Completed for error handling/validation, partial for versioning standardization
- Implemented in:
  - Validation and structured errors in all backend modules
  - Namespaced route example in /api/videos/*
- Notes:
  - Full normalization to /api/v1/* is documented in SCALABILITY_NOTE.md as next step.

5. API documentation (Swagger/Postman)
- Status: Completed
- Files:
  - Backend/openapi.yaml
  - Backend/Koma_API.postman_collection.json
  - Backend/API_DOCUMENTATION.md

6. Database schema
- Status: Completed
- Database:
  - MongoDB via PyMongo
- Collections:
  - users, posts, profiles, videos, likes, comments, followers

7. Basic frontend integration
- Status: Completed
- Frontend:
  - React + Vite
  - Auth, protected actions, CRUD interaction with backend APIs
  - Connection layer in Frontend/src/api.js

8. Security and scalability
- Status: Completed for assignment scope
- Security:
  - JWT-protected routes
  - Password hashing
  - Ownership checks for write actions
- Scalability:
  - Modular Flask blueprint architecture
  - Clear upgrade roadmap in SCALABILITY_NOTE.md

## How Reviewer Can Test Quickly

1. Start backend server and frontend server.
2. Register a new user and login.
3. Use token to create/update/delete posts.
4. Open Postman collection and run auth + posts requests.
5. Review OpenAPI file for endpoint definitions.

## Deliverables Included
- Working backend APIs for authentication and CRUD
- Frontend connected to backend APIs
- Swagger/OpenAPI documentation
- Postman collection
- Scalability note

## Scope Clarification
- Redis caching and Docker are intentionally kept as optional future enhancements for this submission timeline.
