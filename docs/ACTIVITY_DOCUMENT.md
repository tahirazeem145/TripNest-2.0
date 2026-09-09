# TRIPNEST 2.0: TRAVEL PHOTO SHARING COMMUNITY PLATFORM
## CAPSTONE PROJECT
### ACTIVITY DOCUMENT

**SUBMITTED BY:** TAHIR AZEEM  
**YEAR:** III  
**DEPARTMENT:** DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (CSE)  
**PROJECT:** TRIPNEST 2.0 — TRAVEL PHOTO SHARING & COMMUNITY PLATFORM  

---

## INDEX PAGE

| S.No | CONTENTS | PAGE NO. |
| :--- | :--- | :--- |
| **1** | Traditional ER Diagram | 2 |
| **2** | Traditional ER Diagram Explanation | 3 |
| **3** | Schema Mapping Rules | 5 |
| **4** | Data Dictionary | 6 onwards |

---

## 1. TRADITIONAL ER DIAGRAM

```mermaid
erDiagram
    USERS ||--o{ POSTS : "creates (1:N)"
    USERS ||--o{ COMMENTS : "writes (1:N)"
    USERS ||--o{ LIKES : "gives (1:N)"
    USERS ||--o{ SAVED_POSTS : "saves (1:N)"
    USERS ||--o{ FOLLOWS : "follower (1:N)"
    USERS ||--o{ FOLLOWS : "following (1:N)"
    USERS ||--o{ NOTIFICATIONS : "receives (1:N)"
    USERS ||--o{ TRAVEL_MEMORIES : "logs (1:N)"
    USERS ||--o{ TRIPS : "plans (1:N)"
    USERS ||--o{ RECOMMENDATIONS : "receives (1:N)"
    USERS ||--o{ USER_BADGES : "earns (1:N)"
    USERS ||--|| USER_PRIVACY_SETTINGS : "configures (1:1)"
    USERS ||--|| USER_NOTIFICATION_SETTINGS : "configures (1:1)"

    DESTINATIONS ||--o{ POSTS : "located at (0..1:N)"
    DESTINATIONS ||--o{ TRAVEL_MEMORIES : "referenced in (0..1:N)"
    DESTINATIONS ||--o{ TRIP_DESTINATIONS : "includes (1:N)"
    DESTINATIONS ||--o{ RECOMMENDATIONS : "suggested in (1:N)"

    POSTS ||--o{ PHOTOS : "contains (1:N)"
    POSTS ||--o{ COMMENTS : "receives (1:N)"
    POSTS ||--o{ LIKES : "gets (1:N)"
    POSTS ||--o{ SAVED_POSTS : "bookmarked in (1:N)"

    TRIPS ||--o{ TRIP_DESTINATIONS : "stops in (1:N)"
    BADGES ||--o{ USER_BADGES : "awarded as (1:N)"

    USERS {
        bigint user_id PK "Primary Key"
        varchar username UK "Unique username"
        varchar email UK "Unique email"
        varchar password "Hashed password"
        varchar profile_picture "Profile photo URL"
        text bio "Travel bio"
        date date_of_birth "Birth date"
        varchar gender "Gender"
        varchar location "City/Country"
        varchar account_status "active/suspended"
        timestamp created_at "Created timestamp"
    }

    POSTS {
        bigint post_id PK "Primary Key"
        bigint user_id FK "Foreign Key to USERS"
        bigint destination_id FK "Foreign Key to DESTINATIONS"
        varchar title "Post headline"
        text captions "Story caption"
        timestamp created_at "Created timestamp"
    }

    PHOTOS {
        bigint photo_id PK "Primary Key"
        bigint post_id FK "Foreign Key to POSTS"
        varchar image_url "Image file URL"
        varchar caption "Photo caption"
        int display_order "Carousel order"
    }

    DESTINATIONS {
        bigint destination_id PK "Primary Key"
        varchar name "Destination title"
        varchar country "Country"
        varchar state "State/Region"
        varchar city "City"
        decimal latitude "Latitude"
        decimal longitude "Longitude"
        text description "Overview summary"
    }

    LIKES {
        bigint user_id PK_FK "Foreign Key to USERS"
        bigint post_id PK_FK "Foreign Key to POSTS"
        timestamp created_at "Like timestamp"
    }

    SAVED_POSTS {
        bigint user_id PK_FK "Foreign Key to USERS"
        bigint post_id PK_FK "Foreign Key to POSTS"
        timestamp created_at "Saved timestamp"
    }

    FOLLOWS {
        bigint follower_id PK_FK "Foreign Key to USERS"
        bigint following_id PK_FK "Foreign Key to USERS"
        timestamp created_at "Follow timestamp"
    }

    COMMENTS {
        bigint comment_id PK "Primary Key"
        bigint post_id FK "Foreign Key to POSTS"
        bigint user_id FK "Foreign Key to USERS"
        text content "Comment text"
        timestamp created_at "Commented timestamp"
    }

    TRAVEL_MEMORIES {
        bigint memory_id PK "Primary Key"
        bigint user_id FK "Foreign Key to USERS"
        bigint destination_id FK "Foreign Key to DESTINATIONS"
        varchar title "Memory title"
        text description "Journal notes"
        date memory_date "Date of memory"
    }

    TRIPS {
        bigint trip_id PK "Primary Key"
        bigint user_id FK "Foreign Key to USERS"
        varchar title "Trip title"
        date start_date "Start date"
        date end_date "End date"
        varchar status "planned/ongoing/completed"
    }

    TRIP_DESTINATIONS {
        bigint trip_id PK_FK "Foreign Key to TRIPS"
        bigint destination_id PK_FK "Foreign Key to DESTINATIONS"
        int visit_order "Stop order"
    }

    RECOMMENDATIONS {
        bigint recommendation_id PK "Primary Key"
        bigint user_id FK "Foreign Key to USERS"
        bigint destination_id FK "Foreign Key to DESTINATIONS"
        text reason "Recommendation reason"
        decimal score "Relevance score"
    }

    BADGES {
        bigint badge_id PK "Primary Key"
        varchar name UK "Badge name"
        text description "Achievement criteria"
        varchar icon "Icon identifier"
    }

    USER_BADGES {
        bigint user_id PK_FK "Foreign Key to USERS"
        bigint badge_id PK_FK "Foreign Key to BADGES"
        timestamp earned_at "Earned timestamp"
    }

    USER_PRIVACY_SETTINGS {
        bigint privacy_id PK "Primary Key"
        bigint user_id UK_FK "Foreign Key to USERS"
        varchar profile_visibility "public/followers/private"
        boolean location_visibility "Show location"
        boolean show_travel_map "Show travel map"
    }

    USER_NOTIFICATION_SETTINGS {
        bigint notification_settings_id PK "Primary Key"
        bigint user_id UK_FK "Foreign Key to USERS"
        boolean likes_enabled "Alert on likes"
        boolean comments_enabled "Alert on comments"
        boolean followers_enabled "Alert on follows"
    }

    NOTIFICATIONS {
        bigint notification_id PK "Primary Key"
        bigint user_id FK "Foreign Key to USERS"
        varchar type "like/comment/follow"
        text message "Notification text"
        boolean is_read "Read status"
        timestamp created_at "Created timestamp"
    }
```

---

## 2. TRADITIONAL ER DIAGRAM EXPLANATION

The Traditional Entity Relationship (ER) Diagram represents the overall database structure of the **Travel Photo Sharing Community Platform (TripNest 2.0 / TripTales AI)**. It illustrates the major entities, their attributes, relationships, and cardinalities used in the system. The ER Diagram helps in understanding how different entities are connected before converting the design into relational database tables.

The **USERS** entity is the primary entity in the platform. It stores essential user profile and authentication information such as user ID, username, email, password, profile picture, bio, date of birth, gender, location, account status, and registration timestamp. Users can create travel posts, share multi-photo carousels, bookmark places, like and comment on experiences, follow fellow travelers, plan multi-stop itineraries, receive community recommendations, and earn gamification badges.

The **DESTINATIONS** entity stores comprehensive geographical data for travel locations across cities, states, and countries. Attributes include destination ID, name, country, state, city, latitude, longitude, description, and cover image. Destinations serve as a shared location catalog linked with travel posts, memories, itineraries, and recommendation algorithms.

The **POSTS** entity represents travel stories and experiences published by users. Each post contains a post ID, user ID (author), destination ID (location), title, captions, creation timestamp, and update timestamp. Every post belongs to a single user (1:N relationship from USERS to POSTS) and can optionally reference a specific destination.

The **PHOTOS** (or **POST_MEDIA**) entity enables rich multi-photo carousel support for travel posts. Each photo contains a photo ID, post ID, image URL, caption, display order, and upload timestamp. A single travel post can contain multiple carousel photos ordered sequentially.

The **LIKES** entity represents post engagements. It connects the USERS entity with the POSTS entity using a composite key `(user_id, post_id)`. This composite key structure guarantees that a user can like a specific post at most once.

The **COMMENTS** entity stores discussion comments left by travelers on posts. Attributes include comment ID, post ID, user ID, content, creation timestamp, and last updated timestamp. A single post can receive multiple comments from different users.

The **SAVED_POSTS** (or **SAVES**) entity enables travelers to bookmark inspirational travel posts and itineraries to their personal collections. It connects USERS and POSTS via a composite primary key `(user_id, post_id)`.

The **FOLLOWS** entity maintains the social graph between travelers. It records relationships using composite key `(follower_id, following_id)` along with follow timestamp. A check constraint prevents users from following themselves.

The **TRAVEL_MEMORIES** entity allows travelers to maintain personal travel journal logs and historical trip moments. Attributes include memory ID, user ID, destination ID, title, description, memory date, and cover image.

The **TRIPS** entity enables users to organize upcoming, ongoing, and completed travel itineraries. It stores trip ID, user ID, title, description, start date, end date, and status.

The **TRIP_DESTINATIONS** entity represents the ordered waypoints and stops within a planned trip. It connects TRIPS and DESTINATIONS using composite primary key `(trip_id, destination_id)` with a `visit_order` sequence.

The **RECOMMENDATIONS** entity stores smart destination suggestions calculated for travelers. Attributes include recommendation ID, user ID, destination ID, reason, and relevance score.

The **BADGES** entity represents gamification achievements that travelers can unlock (e.g., Trailblazer, Globetrotter, Master Photographer). Attributes include badge ID, name, description, icon, and creation timestamp.

The **USER_BADGES** entity records achievements unlocked by users. It forms a Many-to-Many bridge between USERS and BADGES using composite primary key `(user_id, badge_id)` and earned timestamp.

The **USER_PRIVACY_SETTINGS** and **USER_NOTIFICATION_SETTINGS** entities store user preferences. Each user has a 1:1 relationship with their privacy configuration (profile visibility, map visibility) and notification preferences (likes, comments, follower alerts).

The **NOTIFICATIONS** entity manages real-time alerts sent to users when social interactions occur. It stores notification ID, recipient user ID, activity type (`like`, `comment`, `follow`), notification message, reference entity ID, read status, and trigger timestamp.

Overall, the Traditional ER Diagram provides a clear representation of the entities and relationships used in the Travel Photo Sharing Community Platform. Primary Keys uniquely identify records, while Foreign Keys establish relationships between related entities with cascading integrity.

---

## 3. SCHEMA MAPPING RULES

### 1. Entity to Table Mapping
Each entity in the ER Diagram was converted into a separate relational table. For example, USERS, DESTINATIONS, POSTS, PHOTOS, COMMENTS, LIKES, SAVED_POSTS, and NOTIFICATIONS were converted into database tables.

### 2. Attribute to Column Mapping
Each attribute of an entity was converted into a column in the corresponding table with appropriate SQL data types.

### 3. Primary Key Mapping
Each table was assigned a Primary Key (either single-column `BIGINT/SERIAL/UUID` or composite keys) to uniquely identify every record.

### 4. Relationship Mapping
Relationships between entities were implemented using Foreign Keys. For example, `user_id` in the POSTS table references the USERS table.

### 5. One-to-Many Relationship Mapping
For a one-to-many relationship, the Primary Key of the parent table was added as a Foreign Key in the child table (e.g., `user_id` in POSTS, `post_id` in PHOTOS).

### 6. One-to-One Relationship Mapping
For a one-to-one relationship, a Foreign Key with a `UNIQUE` constraint was used (e.g., `user_id` in USER_PRIVACY_SETTINGS and USER_NOTIFICATION_SETTINGS).

### 7. Many-to-Many Relationship Mapping
Many-to-many relationships were represented using intermediate junction tables with composite primary keys (e.g., `LIKES`, `SAVED_POSTS`, `FOLLOWS`, `TRIP_DESTINATIONS`, `USER_BADGES`) to avoid data redundancy.

### 8. Foreign Key Mapping
Foreign Keys establish relational links across related tables. For example, `user_id` connects USERS with POSTS, LIKES, COMMENTS, SAVED_POSTS, and NOTIFICATIONS.

### 9. Referential Integrity
Referential integrity was maintained using Foreign Key constraints with `ON DELETE CASCADE` (deleting a user account cleans up their posts, likes, and comments) and `ON DELETE SET NULL` (deleting a destination preserves post content).

### 10. Constraint Mapping
Constraints such as `NOT NULL`, `UNIQUE`, `PRIMARY KEY`, `FOREIGN KEY`, `DEFAULT`, and `CHECK` (e.g., `follower_id <> following_id`) were applied to maintain data accuracy and consistency.

### 11. Data Type Mapping
Appropriate data types were selected based on the nature of information stored: `VARCHAR/TEXT` for text values, `BIGINT/INT` for numbers, `DATE/TIMESTAMP` for timestamps, `BOOLEAN` for flags, and `DECIMAL` for coordinates and scores.

---

## 4. DATA DICTIONARY

The following data dictionary describes the tables, columns, data types, keys, and constraints used in the **TripNest 2.0 (Travel Photo Sharing Community Platform)** database.

---

### USERS Table
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `user_id` | `BIGINT / SERIAL` | `PRIMARY KEY` |
| `username` | `VARCHAR(50)` | `UNIQUE, NOT NULL` |
| `email` | `VARCHAR(100)` | `UNIQUE, NOT NULL` |
| `password` | `VARCHAR(255)` | `NOT NULL` |
| `profile_picture` | `VARCHAR(255)` | `-` |
| `bio` | `TEXT` | `-` |
| `date_of_birth` | `DATE` | `-` |
| `gender` | `VARCHAR(20)` | `-` |
| `location` | `VARCHAR(100)` | `-` |
| `account_status` | `VARCHAR(20)` | `DEFAULT 'active'` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

---

### DESTINATIONS Table
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `destination_id` | `BIGINT / SERIAL` | `PRIMARY KEY` |
| `name` | `VARCHAR(100)` | `NOT NULL` |
| `country` | `VARCHAR(100)` | `NOT NULL` |
| `state` | `VARCHAR(100)` | `-` |
| `city` | `VARCHAR(100)` | `-` |
| `latitude` | `DECIMAL(10,8)` | `-` |
| `longitude` | `DECIMAL(11,8)` | `-` |
| `description` | `TEXT` | `-` |
| `image_url` | `VARCHAR(255)` | `-` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

---

### POSTS Table
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `post_id` | `BIGINT / SERIAL` | `PRIMARY KEY` |
| `user_id` | `BIGINT / INT` | `NOT NULL, FOREIGN KEY (USERS)` |
| `destination_id` | `BIGINT / INT` | `FOREIGN KEY (DESTINATIONS)` |
| `title` | `VARCHAR(150)` | `NOT NULL` |
| `captions` | `TEXT` | `-` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

---

### PHOTOS Table (POST_MEDIA)
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `photo_id` | `BIGINT / SERIAL` | `PRIMARY KEY` |
| `post_id` | `BIGINT / INT` | `NOT NULL, FOREIGN KEY (POSTS)` |
| `image_url` | `VARCHAR(255)` | `NOT NULL` |
| `caption` | `VARCHAR(255)` | `-` |
| `display_order` | `INT` | `DEFAULT 0` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

---

### COMMENTS Table
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `comment_id` | `BIGINT / SERIAL` | `PRIMARY KEY` |
| `post_id` | `BIGINT / INT` | `NOT NULL, FOREIGN KEY (POSTS)` |
| `user_id` | `BIGINT / INT` | `NOT NULL, FOREIGN KEY (USERS)` |
| `content` | `TEXT` | `NOT NULL` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

---

### LIKES Table
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `user_id` | `BIGINT / INT` | `NOT NULL, PRIMARY KEY, FOREIGN KEY (USERS)` |
| `post_id` | `BIGINT / INT` | `NOT NULL, PRIMARY KEY, FOREIGN KEY (POSTS)` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

---

### SAVED_POSTS Table
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `user_id` | `BIGINT / INT` | `NOT NULL, PRIMARY KEY, FOREIGN KEY (USERS)` |
| `post_id` | `BIGINT / INT` | `NOT NULL, PRIMARY KEY, FOREIGN KEY (POSTS)` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

---

### FOLLOWS Table
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `follower_id` | `BIGINT / INT` | `NOT NULL, PRIMARY KEY, FOREIGN KEY (USERS)` |
| `following_id` | `BIGINT / INT` | `NOT NULL, PRIMARY KEY, FOREIGN KEY (USERS)` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

---

### TRAVEL_MEMORIES Table
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `memory_id` | `BIGINT / SERIAL` | `PRIMARY KEY` |
| `user_id` | `BIGINT / INT` | `NOT NULL, FOREIGN KEY (USERS)` |
| `destination_id` | `BIGINT / INT` | `FOREIGN KEY (DESTINATIONS)` |
| `title` | `VARCHAR(150)` | `NOT NULL` |
| `description` | `TEXT` | `-` |
| `memory_date` | `DATE` | `NOT NULL` |
| `cover_image` | `VARCHAR(255)` | `-` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

---

### TRIPS Table
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `trip_id` | `BIGINT / SERIAL` | `PRIMARY KEY` |
| `user_id` | `BIGINT / INT` | `NOT NULL, FOREIGN KEY (USERS)` |
| `title` | `VARCHAR(150)` | `NOT NULL` |
| `description` | `TEXT` | `-` |
| `start_date` | `DATE` | `NOT NULL` |
| `end_date` | `DATE` | `NOT NULL` |
| `status` | `VARCHAR(30)` | `DEFAULT 'planned'` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

---

### TRIP_DESTINATIONS Table
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `trip_id` | `BIGINT / INT` | `NOT NULL, PRIMARY KEY, FOREIGN KEY (TRIPS)` |
| `destination_id` | `BIGINT / INT` | `NOT NULL, PRIMARY KEY, FOREIGN KEY (DESTINATIONS)` |
| `visit_order` | `INT` | `DEFAULT 1` |

---

### RECOMMENDATIONS Table
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `recommendation_id` | `BIGINT / SERIAL` | `PRIMARY KEY` |
| `user_id` | `BIGINT / INT` | `NOT NULL, FOREIGN KEY (USERS)` |
| `destination_id` | `BIGINT / INT` | `NOT NULL, FOREIGN KEY (DESTINATIONS)` |
| `reason` | `TEXT` | `-` |
| `score` | `DECIMAL(4,2)` | `DEFAULT 0.00` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

---

### BADGES Table
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `badge_id` | `BIGINT / SERIAL` | `PRIMARY KEY` |
| `name` | `VARCHAR(100)` | `UNIQUE, NOT NULL` |
| `description` | `TEXT` | `-` |
| `icon` | `VARCHAR(255)` | `-` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

---

### USER_BADGES Table
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `user_id` | `BIGINT / INT` | `NOT NULL, PRIMARY KEY, FOREIGN KEY (USERS)` |
| `badge_id` | `BIGINT / INT` | `NOT NULL, PRIMARY KEY, FOREIGN KEY (BADGES)` |
| `earned_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

---

### USER_PRIVACY_SETTINGS Table
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `privacy_id` | `BIGINT / SERIAL` | `PRIMARY KEY` |
| `user_id` | `BIGINT / INT` | `NOT NULL, UNIQUE, FOREIGN KEY (USERS)` |
| `profile_visibility` | `VARCHAR(30)` | `DEFAULT 'public'` |
| `location_visibility` | `BOOLEAN` | `DEFAULT TRUE` |
| `show_travel_map` | `BOOLEAN` | `DEFAULT TRUE` |
| `allow_follow_requests` | `BOOLEAN` | `DEFAULT TRUE` |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

---

### USER_NOTIFICATION_SETTINGS Table
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `notification_settings_id` | `BIGINT / SERIAL` | `PRIMARY KEY` |
| `user_id` | `BIGINT / INT` | `NOT NULL, UNIQUE, FOREIGN KEY (USERS)` |
| `likes_enabled` | `BOOLEAN` | `DEFAULT TRUE` |
| `comments_enabled` | `BOOLEAN` | `DEFAULT TRUE` |
| `followers_enabled` | `BOOLEAN` | `DEFAULT TRUE` |
| `recommendations_enabled` | `BOOLEAN` | `DEFAULT TRUE` |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

---

### NOTIFICATIONS Table
| Column Name | Data Type | Key / Constraint |
| :--- | :--- | :--- |
| `notification_id` | `BIGINT / SERIAL` | `PRIMARY KEY` |
| `user_id` | `BIGINT / INT` | `NOT NULL, FOREIGN KEY (USERS)` |
| `message` | `TEXT` | `NOT NULL` |
| `type` | `VARCHAR(50)` | `-` |
| `reference_id` | `BIGINT / INT` | `-` |
| `is_read` | `BOOLEAN` | `DEFAULT FALSE` |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |
