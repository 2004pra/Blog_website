# Scalability Note

Current structure is monolith-first but modular, which is suitable for internship assignment scope and can scale incrementally.

## What is already scalable
- Flask blueprints split by domain (posts, profile, follow, likes, videos, upload).
- MongoDB collections separated by feature domain.
- Stateless JWT authentication suitable for horizontal scaling behind a load balancer.
- Frontend and backend already decoupled and deployable independently.

## Recommended next step roadmap
1. API version standardization
- Move all routes to /api/v1/* while keeping backward-compatible aliases.

2. Data and query scaling
- Add indexes on frequently queried fields:
  - users.username (unique)
  - posts.user_id, posts.created_at
  - videos.user_id, videos.created_at
  - likes.video_id, likes.user_id
  - followers.follower_id, followers.following_id

3. Service boundary evolution
- Split into focused services when traffic grows:
  - auth/profile service
  - content (posts/videos) service
  - social interactions (likes/comments/follow) service

4. Reliability and observability
- Centralized structured logging
- Request ID tracing and health endpoints
- Containerized deployment with separate app and database runtime

5. Optional performance layer
- Introduce Redis for hot-feed caching and rate-limiting when read traffic grows.

This roadmap provides a clear migration path from a single app to a production-grade architecture without rework.
