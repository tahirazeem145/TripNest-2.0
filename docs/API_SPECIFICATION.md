# TripNest 2.0 - REST API Specification

This document provides a detailed specification for the TripNest 2.0 backend REST API built with Spring Boot and integrated with Supabase/PostgreSQL.

---

## Base URL & Environment

- **Development Base URL**: `http://localhost:8080/api`
- **Production Base URL**: `https://tripnest-backend.onrender.com/api`
- **Protocol**: HTTP/1.1 & HTTPS
- **Content-Type**: `application/json` (except file uploads which use `multipart/form-data`)

---

## Authentication & Authorization

All protected endpoints require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <supabase_access_token>
```

| Header Key | Type | Description |
|---|---|---|
| `Authorization` | String | Format: `Bearer <token>` |
| `Content-Type` | String | `application/json` |

---

## API Endpoints Summary

### 1. Authentication Endpoints (`/api/auth`)

#### 1.1 User Signup
- **Endpoint**: `POST /api/auth/signup`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "traveler@example.com",
    "password": "SecurePassword123!",
    "username": "wanderlust_alex",
    "fullName": "Alex Rivera",
    "homeLocation": "Barcelona, Spain",
    "bio": "Exploring mountain trails & coastal sunsets."
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-v4-user-id",
      "email": "traveler@example.com",
      "username": "wanderlust_alex",
      "fullName": "Alex Rivera",
      "avatarUrl": "https://images.unsplash.com/default-avatar.jpg",
      "bio": "Exploring mountain trails & coastal sunsets.",
      "homeLocation": "Barcelona, Spain",
      "createdAt": "2026-09-15T12:00:00Z"
    }
  }
  ```

#### 1.2 User Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "traveler@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-v4-user-id",
      "email": "traveler@example.com",
      "username": "wanderlust_alex",
      "fullName": "Alex Rivera",
      "avatarUrl": "https://images.unsplash.com/default-avatar.jpg"
    }
  }
  ```

#### 1.3 Get Current Authenticated User
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "id": "uuid-v4-user-id",
    "email": "traveler@example.com",
    "username": "wanderlust_alex",
    "fullName": "Alex Rivera",
    "avatarUrl": "https://...",
    "bio": "Exploring mountain trails & coastal sunsets.",
    "homeLocation": "Barcelona, Spain",
    "followersCount": 42,
    "followingCount": 18,
    "postsCount": 7
  }
  ```

---

### 2. Social & Feed Endpoints (`/api/social`)

#### 2.1 Get Global Feed
- **Endpoint**: `GET /api/social/feed?page=0&size=20&sort=latest`
- **Access**: Public / Authenticated

#### 2.2 Get Following Feed
- **Endpoint**: `GET /api/social/feed/following?page=0&size=20`
- **Access**: Authenticated

#### 2.3 Create Post
- **Endpoint**: `POST /api/social/posts`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "caption": "Watching the golden sunset over Oia, Santorini!",
    "locationName": "Oia, Santorini, Greece",
    "latitude": 36.4618,
    "longitude": 25.3753,
    "tags": ["santorini", "greece", "sunset", "travel"],
    "mediaUrls": [
      "https://images.unsplash.com/photo-santorini-1.jpg"
    ]
  }
  ```

#### 2.4 Like / Unlike Post
- **Endpoint**: `POST /api/social/posts/{postId}/like`
- **Access**: Authenticated

#### 2.5 Add Comment to Post
- **Endpoint**: `POST /api/social/posts/{postId}/comments`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "content": "Incredible shot! What time of year did you visit?"
  }
  ```

#### 2.6 Bookmark / Save Post
- **Endpoint**: `POST /api/social/posts/{postId}/save`
- **Access**: Authenticated

---

### 3. Media & Upload Endpoints (`/api/media`)

#### 3.1 Upload Media Asset
- **Endpoint**: `POST /api/media/upload`
- **Access**: Authenticated
- **Content-Type**: `multipart/form-data`
- **Form Param**: `file` (Binary Image/Video)
- **Response (200 OK)**:
  ```json
  {
    "url": "https://your-supabase-bucket.supabase.co/storage/v1/object/public/tripnest-media/post_xyz.jpg",
    "mediaType": "IMAGE",
    "size": 1048576
  }
  ```

---

## HTTP Status Codes & Error Formats

| Status Code | Meaning | Typical Scenario |
|---|---|---|
| `200 OK` | Success | Successful retrieval, update, or action |
| `201 Created` | Resource Created | Post, Comment, or User registered |
| `400 Bad Request` | Validation Error | Missing fields or malformed payload |
| `401 Unauthorized` | Authentication Missing | Missing or expired JWT token |
| `403 Forbidden` | Access Denied | Editing someone else's post |
| `404 Not Found` | Resource Missing | Post or user ID not found |
| `500 Internal Server Error` | Server Exception | Uncaught runtime error |

### Standard Error Payload
```json
{
  "timestamp": "2026-09-15T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Email is already registered in TripNest",
  "path": "/api/auth/signup"
}
```
