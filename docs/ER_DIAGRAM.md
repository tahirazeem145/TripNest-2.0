# TripNest 2.0 — Entity-Relationship (ER) Diagram

This document contains the complete database schema relationship model for **TripNest 2.0**.

---

## 📊 Database ER Diagram

```mermaid
erDiagram
    USERS ||--o{ POSTS : "creates"
    USERS ||--o{ LIKES : "gives"
    USERS ||--o{ COMMENTS : "writes"
    USERS ||--o{ SAVED_POSTS : "bookmarks"
    USERS ||--o{ FOLLOWS : "follows (follower)"
    USERS ||--o{ FOLLOWS : "followed_by (following)"
    USERS ||--o{ NOTIFICATIONS : "receives"
    
    POSTS ||--o{ POST_MEDIA : "contains"
    POSTS ||--o{ LIKES : "receives"
    POSTS ||--o{ COMMENTS : "has"
    POSTS ||--o{ SAVED_POSTS : "saved_in"

    USERS {
        uuid id PK "Primary Key (Supabase Auth User ID)"
        string email "User Email Address"
        string full_name "Full Display Name"
        string avatar_url "Profile Avatar Media URL"
        string bio "Short Travel Biography"
        timestamp created_at "Registration Timestamp"
    }

    POSTS {
        uuid id PK "Primary Key (Post ID)"
        uuid user_id FK "Foreign Key -> USERS.id"
        string destination "Location / City / Country"
        string caption "Travel Story & Descriptions"
        string image_url "Primary Media URL"
        timestamp created_at "Creation Timestamp"
    }

    POST_MEDIA {
        uuid id PK "Primary Key (Attachment ID)"
        uuid post_id FK "Foreign Key -> POSTS.id"
        string media_url "Media URL"
        int display_order "Carousel Order (0..N)"
        string media_type "Media Type (image/jpeg, etc.)"
    }

    LIKES {
        uuid id PK "Primary Key"
        uuid user_id FK "Foreign Key -> USERS.id"
        uuid post_id FK "Foreign Key -> POSTS.id"
        timestamp created_at "Like Timestamp"
    }

    COMMENTS {
        uuid id PK "Primary Key"
        uuid user_id FK "Foreign Key -> USERS.id"
        uuid post_id FK "Foreign Key -> POSTS.id"
        string content "Comment Text Content"
        timestamp created_at "Comment Timestamp"
    }

    SAVED_POSTS {
        uuid id PK "Primary Key"
        uuid user_id FK "Foreign Key -> USERS.id"
        uuid post_id FK "Foreign Key -> POSTS.id"
        timestamp created_at "Saved Timestamp"
    }

    FOLLOWS {
        uuid id PK "Primary Key"
        uuid follower_id FK "Foreign Key -> USERS.id"
        uuid following_id FK "Foreign Key -> USERS.id"
        timestamp created_at "Follow Timestamp"
    }

    NOTIFICATIONS {
        uuid id PK "Primary Key"
        uuid user_id FK "Foreign Key -> USERS.id"
        uuid sender_id FK "Foreign Key -> USERS.id"
        string type "Notification Type (like, comment, follow)"
        uuid post_id FK "Foreign Key -> POSTS.id (Nullable)"
        boolean is_read "Read Status"
        timestamp created_at "Notification Timestamp"
    }
```

---

## 🗄️ Entity Descriptions

1. **`USERS`**: Central user account entity linked with Supabase Authentication. Stores user profiles, display names, avatars, and bios.
2. **`POSTS`**: Core travel experience entity containing destination tags, captions, and primary image links.
3. **`POST_MEDIA`**: Supports multi-image carousels (up to 10 photos per post) with explicit display order.
4. **`LIKES`**: Junction table capturing likes given by users to travel posts.
5. **`COMMENTS`**: Contains user commentary on specific travel posts.
6. **`SAVED_POSTS`**: Junction table allowing users to bookmark posts into their personal travel collection.
7. **`FOLLOWS`**: Self-referencing social graph relationship table tracking followers and following relationships between users.
8. **`NOTIFICATIONS`**: Stores activity alerts triggered when users like, comment, or follow.
