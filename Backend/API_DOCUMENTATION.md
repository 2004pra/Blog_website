# Koma Backend API Documentation

Base URL
- Production: https://blog-website-backend-tkt1.onrender.com
- Local: http://localhost:5000

Authentication
- Protected endpoints require header:
  Authorization: Bearer <jwt_token>

## 1) Authentication

### POST /signup
Create a new user account.

Request Body
```json
{
  "username": "john",
  "password": "secret123"
}
```

Success Response
- 201 Created
```json
{
  "message": "User created successfully"
}
```

### POST /login
Authenticate and receive JWT token.

Request Body
```json
{
  "username": "john",
  "password": "secret123"
}
```

Success Response
- 200 OK
```json
{
  "status": "success",
  "token": "<jwt>",
  "user": {
    "id": "<user_id>",
    "username": "john"
  }
}
```

## 2) Posts CRUD (Primary Entity)

### GET /posts/
Get all posts (public).

Success Response
- 200 OK
```json
[
  {
    "id": "<post_id>",
    "title": "My Post",
    "content": "Post content",
    "user_id": "<user_id>",
    "created_at": "2026-04-14 12:34:56.000000",
    "username": "john"
  }
]
```

### POST /posts/create_post
Create a post (protected).

Request Body
```json
{
  "title": "My Post",
  "content": "Post content"
}
```

Success Response
- 200 OK
```json
{
  "message": "Post created ✌️"
}
```

### PUT /posts/update/:post_id
Update own post (protected).

Request Body
```json
{
  "title": "Updated title",
  "content": "Updated content"
}
```

Success Response
- 200 OK
```json
{
  "message": "Post updated successfully"
}
```

### DELETE /posts/delete/:post_id
Delete own post (protected).

Success Response
- 200 OK
```json
{
  "message": "Post deleted successfully"
}
```

Common Error Responses
- 401 Unauthorized: token missing/invalid
- 403 Forbidden: ownership violation
- 404 Not Found: post not found

## 3) Profile APIs

### POST /profilepic
Update profile picture URL (protected).

### GET /profile
Get current logged-in user profile data (protected).

### GET /users/:user_id/profile
Get public profile view for target user (protected).

## 4) Follow APIs

### POST /follow/:target_user_id
Toggle follow/unfollow target user (protected).

### GET /follow/view/:target_user_id
Get followers and following of target user (protected).

## 5) Video APIs

### POST /api/videos/Upload_video
Upload video metadata entry (protected).

### GET /api/videos/
Get all videos (public).

### DELETE /api/videos/delete/:video_id
Delete own video (protected).

### POST /api/videos/videos/views/:video_id
Increment video view count (protected).

## 6) Comments APIs

### POST /api/videos/comment/:video_id
Create comment on a video (protected).

### GET /api/videos/comment/:video_id
Get comments of a video (protected).

## 7) Likes APIs

### POST /likes/likes/:video_id
Toggle like/unlike for video (protected).

### GET /likes/like_count/:video_id
Get total likes for video (public).

### GET /likes/status/:video_id
Get current user like status for video (protected).

## 8) Upload Signature API

### GET /get-signature
Get signed Cloudinary upload signature (protected).

## Validation and Error Handling Summary
- JSON body fields are validated per endpoint and return 400 for missing fields.
- Invalid IDs return 400 for routes that validate ObjectId.
- Auth middleware returns 401 for missing or invalid JWT.
- Ownership checks in posts/videos return 403 for unauthorized access.

## Versioning Note
- Current routes are partly namespaced (example: /api/videos/*).
- Recommended production normalization: expose all routes under /api/v1/* while preserving backward compatibility with redirects or aliases.
