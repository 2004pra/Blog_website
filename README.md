# Scalable REST API With Authentication and CRUD - Koma

This repository is submitted as a backend-focused internship assignment demonstrating a modular Flask API with JWT authentication, protected CRUD operations, and a React UI for end-to-end testing of Koma, a social media platform.

## Assignment Mapping

### Backend (Primary)
- User registration and login with password hashing (Flask-Bcrypt) and JWT auth.
- Protected routes using token middleware.
- CRUD for primary content entity (posts), plus additional social/video entities.
- Structured modules using Flask blueprints for scalability.
- MongoDB schema via collections for users, posts, profiles, videos, likes, comments, and followers.
- API documentation provided via OpenAPI spec and Postman collection.

### Frontend (Supportive)
- React + Vite UI for signup, login, and JWT-based protected actions.
- Dashboard-style pages to read, create, edit, and delete content.
- API feedback surfaced through success and error handling in UI flows.

### Security and Scalability
- JWT token verification middleware on protected APIs.
- Password hashing using bcrypt before persistence.
- Modular project structure (auth, posts, profile, follow, likes, upload, videos) to support future feature expansion.
- Scalability note included in [SCALABILITY_NOTE.md](SCALABILITY_NOTE.md).

## Tech Stack
- Backend: Flask, PyMongo, Flask-Bcrypt, PyJWT, Flask-CORS
- Frontend: React, Vite, Context API, Fetch API
- Database: MongoDB
- Media: Cloudinary signed uploads

## Repository Structure

```text
Backend/
	hello.py            # app entry, auth routes, blueprint registration
	auth.py             # JWT guard middleware
	db.py               # MongoDB connection
	posts.py            # post CRUD
	profile.py          # self profile endpoints
	user_profile.py     # public profile endpoints
	follow.py           # follow/unfollow + followers/following
	likes.py            # likes toggle/status/count
	videos.py           # video + comments + views
	upload.py           # cloud upload signature endpoint

Frontend/
	src/api.js          # all backend communication from React
	src/components/     # auth, dashboard, post/video/profile UI
```

## API Documentation
- OpenAPI (Swagger): [Backend/openapi.yaml](Backend/openapi.yaml)
- Postman Collection: [Backend/Koma_API.postman_collection.json](Backend/Koma_API.postman_collection.json)
- Human-readable endpoint guide: [Backend/API_DOCUMENTATION.md](Backend/API_DOCUMENTATION.md)

## Local Setup

### 1) Backend

Create a .env file inside Backend with:

```env
SECRET_KEY=your_jwt_secret
MONGO_URI=mongodb://localhost:27017/blog_app
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Install and run:

```bash
cd Backend
pip install -r requirements.txt
python hello.py
```

Backend default URL: http://localhost:5000
Live backend URL: https://blog-website-backend-tkt1.onrender.com

### 2) Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend default URL: http://localhost:5173
Live frontend URL: https://koma-7.vercel.app

Optional frontend environment file:

```env
VITE_API_URL=http://localhost:5000
# For deployed frontend, set this to:
# VITE_API_URL=https://blog-website-backend-tkt1.onrender.com
```

## Core API Flows (Quick Test)

1. Register user via POST /signup
2. Login via POST /login and copy token
3. Call protected endpoints with Authorization header:
	 Bearer <jwt_token>
4. Create, list, update, and delete posts on the social feed

## Current Scope Notes
- This submission focuses on API security, modularity, and integration.
- Redis caching is intentionally not included in the current submission scope.
- API versioning is partially reflected through namespaced routes (example: /api/videos/*); full standardization can be done by migrating all routes to a unified /api/v1 prefix.

## Additional Documents
- Frontend-backend integration notes: [REACT_PYTHON_CONNECTION.md](REACT_PYTHON_CONNECTION.md)
- AI usage policy for this repository: [AI_GUIDANCE.md](AI_GUIDANCE.md)
- Assignment requirement mapping: [ASSIGNMENT_SUBMISSION.md](ASSIGNMENT_SUBMISSION.md)

## Author
Prashant Mishra
