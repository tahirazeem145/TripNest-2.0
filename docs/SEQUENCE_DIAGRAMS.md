# TripNest 2.0 - System Sequence Diagrams

This document contains Mermaid sequence diagrams illustrating the primary runtime interaction flows across the Client (Vite React), Backend API (Spring Boot), and Supabase PostgreSQL / Storage.

---

## 1. Authentication & Session Initialization Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Traveler
    participant Client as React Client (Vite)
    participant AuthContext as AuthContext State
    participant Backend as Spring Boot API
    participant Supabase as Supabase Auth / DB

    User->>Client: Enters credentials on /login
    Client->>Backend: POST /api/auth/login { email, password }
    Backend->>Supabase: Verify credentials via Supabase REST API
    Supabase-->>Backend: Return JWT Session & User Metadata
    Backend-->>Client: 200 OK { token, userProfile }
    Client->>AuthContext: Store token in localStorage & set state
    Client-->>User: Navigate to /home (Feed)
```

---

## 2. Post Creation & Media Upload Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Traveler
    participant Client as Create Page
    participant Backend as Media & Social Controller
    participant Storage as Supabase Storage Bucket
    participant DB as Supabase PostgreSQL

    User->>Client: Selects photos & enters caption/location
    User->>Client: Clicks "Share Adventure"
    Client->>Backend: POST /api/media/upload (multipart/form-data)
    Backend->>Storage: Store file in `tripnest-media` bucket
    Storage-->>Backend: Public CDN URL
    Backend-->>Client: 200 OK { mediaUrl }
    Client->>Backend: POST /api/social/posts { caption, location, mediaUrls }
    Backend->>DB: INSERT INTO posts & post_media
    DB-->>Backend: Post record created
    Backend-->>Client: 201 Created { post }
    Client-->>User: Redirect to /home with new post in feed
```

---

## 3. Social Interaction (Like & Comment) Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Traveler
    participant Client as PostCard Component
    participant Backend as Social Controller
    participant DB as PostgreSQL Database

    User->>Client: Clicks Like icon (❤️)
    Client->>Client: Optimistic UI state update (+1 like)
    Client->>Backend: POST /api/social/posts/{id}/like
    Backend->>DB: INSERT / DELETE FROM likes WHERE user_id & post_id
    DB-->>Backend: Updated likes count
    Backend-->>Client: 200 OK { liked: true, count: N }
    
    User->>Client: Submits comment text
    Client->>Backend: POST /api/social/posts/{id}/comments { content }
    Backend->>DB: INSERT INTO comments & trigger notification
    DB-->>Backend: Comment saved
    Backend-->>Client: 201 Created { comment }
    Client-->>User: Appends comment to discussion list
```
