-- ====================================================================
-- TRIPNEST 2.0 / TRIPTALES AI — TRAVEL PHOTO SHARING COMMUNITY PLATFORM
-- Database Engine: MySQL 8.4
-- Practical Report & Schema Implementation Script
-- ====================================================================

-- 1. Database Creation & Context
DROP DATABASE IF EXISTS tripnest_db;
CREATE DATABASE tripnest_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tripnest_db;

-- 2. DDL: Table Creation in Foreign Key Safe Order
-- --------------------------------------------------------------------

-- 2.1 USERS Table
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    bio TEXT,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    location VARCHAR(100),
    account_status ENUM('active', 'suspended', 'deactivated') DEFAULT 'active',
    theme VARCHAR(30) DEFAULT 'system',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2.2 USER PRIVACY SETTINGS Table
CREATE TABLE user_privacy_settings (
    privacy_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    profile_visibility ENUM('public', 'followers_only', 'private') DEFAULT 'public',
    location_visibility BOOLEAN DEFAULT TRUE,
    show_travel_map BOOLEAN DEFAULT TRUE,
    allow_follow_requests BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_privacy_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- 2.3 USER NOTIFICATION SETTINGS Table
CREATE TABLE user_notification_settings (
    notification_settings_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    likes_enabled BOOLEAN DEFAULT TRUE,
    comments_enabled BOOLEAN DEFAULT TRUE,
    followers_enabled BOOLEAN DEFAULT TRUE,
    recommendations_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_settings_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- 2.4 DESTINATIONS Table
CREATE TABLE destinations (
    destination_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2.5 POSTS Table
CREATE TABLE posts (
    post_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    destination_id BIGINT,
    title VARCHAR(150) NOT NULL,
    captions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_post_destination FOREIGN KEY (destination_id) REFERENCES destinations (destination_id) ON DELETE SET NULL
);

-- 2.6 PHOTOS Table
CREATE TABLE photos (
    photo_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_photo_post FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE
);

-- 2.7 COMMENTS Table
CREATE TABLE comments (
    comment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- 2.8 LIKES Table (Composite Primary Key)
CREATE TABLE likes (
    like_id BIGINT AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    UNIQUE KEY uq_like_id (like_id),
    CONSTRAINT fk_like_post FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE,
    CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- 2.9 SAVES Table (Composite Primary Key)
CREATE TABLE saves (
    save_id BIGINT AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    UNIQUE KEY uq_save_id (save_id),
    CONSTRAINT fk_save_post FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE,
    CONSTRAINT fk_save_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- 2.10 FOLLOWS Table (Composite Primary Key with Check Constraint)
CREATE TABLE follows (
    follow_id BIGINT AUTO_INCREMENT,
    follower_id BIGINT NOT NULL,
    following_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    UNIQUE KEY uq_follow_id (follow_id),
    CONSTRAINT chk_not_self_follow CHECK (follower_id <> following_id),
    CONSTRAINT fk_follow_follower FOREIGN KEY (follower_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_follow_following FOREIGN KEY (following_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- 2.11 TRAVEL MEMORIES Table
CREATE TABLE travel_memories (
    memory_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    destination_id BIGINT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    memory_date DATE NOT NULL,
    cover_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_memory_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_memory_destination FOREIGN KEY (destination_id) REFERENCES destinations (destination_id) ON DELETE SET NULL
);

-- 2.12 TRIPS Table
CREATE TABLE trips (
    trip_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('planned', 'ongoing', 'completed', 'cancelled') DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_trip_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- 2.13 TRIP DESTINATIONS Table (Composite Primary Key)
CREATE TABLE trip_destinations (
    trip_destination_id BIGINT AUTO_INCREMENT,
    trip_id BIGINT NOT NULL,
    destination_id BIGINT NOT NULL,
    visit_order INT DEFAULT 1,
    PRIMARY KEY (trip_id, destination_id),
    UNIQUE KEY uq_trip_dest_id (trip_destination_id),
    CONSTRAINT fk_td_trip FOREIGN KEY (trip_id) REFERENCES trips (trip_id) ON DELETE CASCADE,
    CONSTRAINT fk_td_destination FOREIGN KEY (destination_id) REFERENCES destinations (destination_id) ON DELETE CASCADE
);

-- 2.14 RECOMMENDATIONS Table
CREATE TABLE recommendations (
    recommendation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    destination_id BIGINT NOT NULL,
    reason TEXT,
    score DECIMAL(4, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rec_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_rec_dest FOREIGN KEY (destination_id) REFERENCES destinations (destination_id) ON DELETE CASCADE
);

-- 2.15 BADGES Table
CREATE TABLE badges (
    badge_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.16 USER BADGES Table (Composite Primary Key)
CREATE TABLE user_badges (
    user_badge_id BIGINT AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    badge_id BIGINT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_id),
    UNIQUE KEY uq_user_badge_id (user_badge_id),
    CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_ub_badge FOREIGN KEY (badge_id) REFERENCES badges (badge_id) ON DELETE CASCADE
);

-- 2.17 NOTIFICATIONS Table
CREATE TABLE notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    reference_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- ====================================================================
-- 3. Sample Data Insertion (Foreign Key Order)
-- ====================================================================

-- 3.1 Insert Users (5 users)
INSERT INTO users (username, email, password, profile_picture, bio, date_of_birth, gender, location) VALUES
('traveluser01', 'traveluser01@example.com', '$2a$12$e0MYzXy8u87w', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', 'Wanderlust explorer | Mountain lover', '1995-04-12', 'female', 'Bangalore, India'),
('traveluser02', 'traveluser02@example.com', '$2a$12$pQ82hxK81jKs', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 'Photographer & coastal road tripper', '1992-08-23', 'male', 'Mumbai, India'),
('traveluser03', 'traveluser03@example.com', '$2a$12$lO99xXy097aL', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', 'Solo backpacker capturing memories', '1998-11-05', 'female', 'Kochi, India'),
('traveluser04', 'traveluser04@example.com', '$2a$12$rP12zxQ788bK', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', 'Heritage architecture & food trails', '1990-02-17', 'male', 'Delhi, India'),
('traveluser05', 'traveluser05@example.com', '$2a$12$wE44zxM554cV', 'https://images.unsplash.com/photo-1517841905240-472988babdf9', 'Hiking trails and alpine sunsets', '1996-07-30', 'other', 'Shimla, India');

-- 3.2 Insert User Privacy Settings (5 rows)
INSERT INTO user_privacy_settings (user_id, profile_visibility, location_visibility, show_travel_map, allow_follow_requests) VALUES
(1, 'public', TRUE, TRUE, TRUE),
(2, 'public', TRUE, TRUE, TRUE),
(3, 'followers_only', TRUE, TRUE, TRUE),
(4, 'public', FALSE, TRUE, TRUE),
(5, 'public', TRUE, FALSE, TRUE);

-- 3.3 Insert User Notification Settings (5 rows)
INSERT INTO user_notification_settings (user_id, likes_enabled, comments_enabled, followers_enabled, recommendations_enabled) VALUES
(1, TRUE, TRUE, TRUE, TRUE),
(2, TRUE, TRUE, TRUE, FALSE),
(3, TRUE, FALSE, TRUE, TRUE),
(4, TRUE, TRUE, FALSE, TRUE),
(5, FALSE, TRUE, TRUE, TRUE);

-- 3.4 Insert Destinations (5 destinations)
INSERT INTO destinations (name, country, state, city, latitude, longitude, description, image_url) VALUES
('Ooty', 'India', 'Tamil Nadu', 'Ootacamund', 11.4102, 76.6950, 'Queen of Hill Stations surrounded by Nilgiri tea estates', 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0'),
('Goa', 'India', 'Goa', 'Panaji', 15.2993, 74.1240, 'Sunny coastal paradise with golden beaches and Portuguese architecture', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2'),
('Munnar', 'India', 'Kerala', 'Idukki', 10.0889, 77.0595, 'Misty rolling hills with sprawling emerald green tea plantations', 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2'),
('Jaipur', 'India', 'Rajasthan', 'Jaipur', 26.9124, 75.7873, 'The Pink City famous for royal palaces, forts, and rich heritage', 'https://images.unsplash.com/photo-1599661046289-e31897846e41'),
('Manali', 'India', 'Himachal Pradesh', 'Kullu', 32.2432, 77.1892, 'High-altitude Himalayan resort town for snow, trails, and rivers', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23');

-- 3.5 Insert Posts (6 posts)
INSERT INTO posts (user_id, destination_id, title, captions) VALUES
(1, 1, 'Beautiful Ooty Trip', 'Misty mornings and aromatic tea gardens in the Nilgiris.'),
(1, 3, 'Another Munnar Experience', 'Hiking through lush green mountain passes and clouds.'),
(2, 2, 'Exploring Goa', 'Golden hour at Palolem beach with great seafood and sunsets.'),
(3, 3, 'Munnar Tea Gardens', 'The perfect escape into nature tea trails and fresh air.'),
(4, 4, 'Jaipur Heritage Tour', 'Marveling at the intricate architecture of Hawa Mahal and Amer Fort.'),
(5, 5, 'Mountain Adventure in Manali', 'Chilly pine forests and panoramic snow-capped peaks.');

-- 3.6 Insert Photos (11 photos)
INSERT INTO photos (post_id, image_url, caption, display_order) VALUES
(1, 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0', 'Nilgiri Mountain Railway', 0),
(1, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', 'Doddabetta Peak View', 1),
(2, 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2', 'Munnar mist over tea fields', 0),
(2, 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05', 'Echo Point Lake', 1),
(3, 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2', 'Sunset at Palolem', 0),
(3, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', 'Old Goa Basilica', 1),
(4, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', 'Lush tea carpets', 0),
(5, 'https://images.unsplash.com/photo-1599661046289-e31897846e41', 'Hawa Mahal facade', 0),
(5, 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da', 'Amer Fort courtyard', 1),
(6, 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23', 'Solang Valley snowline', 0),
(6, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', 'Beas River rapids', 1);

-- 3.7 Insert Comments (6 comments)
INSERT INTO comments (post_id, user_id, content) VALUES
(1, 2, 'Stunning capture! The Nilgiri mountains look mesmerizing.'),
(1, 3, 'Adding Ooty to my bucket list right now!'),
(2, 4, 'Munnar during monsoon is heaven on Earth.'),
(3, 1, 'Which beach was this taken at? Great colors!'),
(4, 5, 'The gradient of green in this shot is unreal.'),
(5, 3, 'Jaipur heritage never fails to impress.');

-- 3.8 Insert Likes (9 likes)
INSERT INTO likes (post_id, user_id) VALUES
(1, 2), (1, 3), (1, 4),
(2, 1), (2, 5),
(3, 1), (3, 4),
(4, 2),
(5, 3);

-- 3.9 Insert Saves (6 saves)
INSERT INTO saves (post_id, user_id) VALUES
(1, 2), (1, 5),
(2, 3),
(3, 4),
(4, 1),
(5, 2);

-- 3.10 Insert Follows (8 follows)
INSERT INTO follows (follower_id, following_id) VALUES
(1, 2), (1, 3),
(2, 1), (2, 4),
(3, 1), (3, 2),
(4, 5),
(5, 1);

-- 3.11 Insert Travel Memories (4 memories)
INSERT INTO travel_memories (user_id, destination_id, title, description, memory_date, cover_image) VALUES
(1, 1, 'First Solo Mountain Trek', 'Walked 18km across tea trails and pine ridges.', '2024-03-15', 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0'),
(2, 2, 'Goa Sunset Serenade', 'Evening music by the shore with old friends.', '2024-01-20', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2'),
(3, 3, 'Camp Under Kerala Stars', 'Starry clear skies over the highest tea gardens.', '2024-04-10', 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2'),
(4, 4, 'Royal Architecture Walk', 'Explored hidden corridors of Rajput forts.', '2024-02-12', 'https://images.unsplash.com/photo-1599661046289-e31897846e41');

-- 3.12 Insert Trips (3 trips)
INSERT INTO trips (user_id, title, description, start_date, end_date, status) VALUES
(1, 'South India Highlands Expedition', 'A 10-day scenic road trip from Ooty to Munnar', '2024-10-01', '2024-10-10', 'planned'),
(2, 'Western Ghats Coastal Odyssey', 'Exploring scenic beaches from Mumbai down to Goa', '2024-11-05', '2024-11-15', 'ongoing'),
(4, 'Golden Triangle Heritage Safari', 'Historic monument exploration in Delhi and Jaipur', '2024-09-01', '2024-09-07', 'completed');

-- 3.13 Insert Trip Destinations (6 associations)
INSERT INTO trip_destinations (trip_id, destination_id, visit_order) VALUES
(1, 1, 1),
(1, 3, 2),
(2, 2, 1),
(3, 4, 1),
(3, 5, 2),
(2, 1, 2);

-- 3.14 Insert Recommendations (6 recommendations)
INSERT INTO recommendations (user_id, destination_id, reason, score) VALUES
(1, 3, 'Based on your love for misty tea gardens and tranquil heights', 9.45),
(2, 5, 'Recommended for scenic high altitude landscape photography', 8.90),
(3, 1, 'Top-rated mountain destination for solo backpackers', 9.15),
(4, 2, 'Popular destination with rich colonial history and beaches', 8.60),
(5, 4, 'Recommended for heritage walks and authentic regional food', 8.75),
(1, 5, 'Alpine hiking trails recommended for adventure enthusiasts', 9.30);

-- 3.15 Insert Badges (5 badges)
INSERT INTO badges (name, description, icon) VALUES
('Trailblazer', 'Created 5+ original travel posts with photo carousels', 'compass'),
('Globetrotter', 'Visited destinations across 3+ distinct states or regions', 'globe'),
('Top Contributor', 'Received more than 50 likes on shared travel stories', 'star'),
('Wanderlust Guide', 'Authored insightful community travel recommendations', 'map-pin'),
('Master Photographer', 'Published high-resolution multi-photo carousels', 'camera');

-- 3.16 Insert User Badges (9 badges earned)
INSERT INTO user_badges (user_id, badge_id) VALUES
(1, 1), (1, 2), (1, 5),
(2, 1), (2, 3),
(3, 1), (3, 4),
(4, 2),
(5, 5);

-- 3.17 Insert Notifications (7 notifications)
INSERT INTO notifications (user_id, type, message, reference_id, is_read) VALUES
(1, 'like', 'traveluser02 liked your post: Beautiful Ooty Trip', 1, TRUE),
(1, 'comment', 'traveluser03 commented on your post: Beautiful Ooty Trip', 1, FALSE),
(1, 'follow', 'traveluser02 started following your travel journey', 2, TRUE),
(2, 'like', 'traveluser01 liked your post: Exploring Goa', 3, TRUE),
(3, 'comment', 'traveluser05 commented on your post: Munnar Tea Gardens', 4, FALSE),
(4, 'like', 'traveluser03 liked your post: Jaipur Heritage Tour', 5, TRUE),
(5, 'follow', 'traveluser04 started following you', 4, FALSE);

-- ====================================================================
-- 4. Verification: Row Counts Across All 17 Tables
-- ====================================================================

SELECT 'users' AS table_name, COUNT(*) AS records FROM users
UNION ALL
SELECT 'destinations', COUNT(*) FROM destinations
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'photos', COUNT(*) FROM photos
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'likes', COUNT(*) FROM likes
UNION ALL
SELECT 'saves', COUNT(*) FROM saves
UNION ALL
SELECT 'follows', COUNT(*) FROM follows
UNION ALL
SELECT 'travel_memories', COUNT(*) FROM travel_memories
UNION ALL
SELECT 'trips', COUNT(*) FROM trips
UNION ALL
SELECT 'trip_destinations', COUNT(*) FROM trip_destinations
UNION ALL
SELECT 'recommendations', COUNT(*) FROM recommendations
UNION ALL
SELECT 'badges', COUNT(*) FROM badges
UNION ALL
SELECT 'user_badges', COUNT(*) FROM user_badges
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'user_privacy_settings', COUNT(*) FROM user_privacy_settings
UNION ALL
SELECT 'user_notification_settings', COUNT(*) FROM user_notification_settings;

-- ====================================================================
-- 5. Practical JOIN Queries Implementation
-- ====================================================================

-- 5.1 INNER JOIN: Users and their created Posts
SELECT 
    u.username,
    p.title
FROM users u
INNER JOIN posts p
    ON u.user_id = p.user_id;

-- 5.2 LEFT JOIN: All Users and their Posts (Including users with no posts)
SELECT 
    u.username,
    p.title
FROM users u
LEFT JOIN posts p
    ON u.user_id = p.user_id;

-- 5.3 RIGHT JOIN: All Destinations and matching Posts
SELECT 
    d.name AS destination,
    p.title
FROM posts p
RIGHT JOIN destinations d
    ON p.destination_id = d.destination_id;

-- 5.4 FULL JOIN (Simulated via LEFT JOIN UNION RIGHT JOIN in MySQL)
SELECT 
    u.username,
    p.title
FROM users u
LEFT JOIN posts p
    ON u.user_id = p.user_id
UNION
SELECT 
    u.username,
    p.title
FROM users u
RIGHT JOIN posts p
    ON u.user_id = p.user_id;

-- 5.5 NATURAL JOIN: Join on identical column names (e.g., user_id)
SELECT 
    user_id,
    username,
    post_id,
    title
FROM users
NATURAL JOIN posts;

-- ====================================================================
-- 6. Composite Key & Intentional Constraint Testing (Validation)
-- ====================================================================

-- Test 6.1: Duplicate Composite Primary Key in Likes (Expected Error: 1062)
-- INSERT INTO likes (user_id, post_id) VALUES (2, 1); -- (Already exists, triggers Duplicate entry error)

-- Test 6.2: Foreign Key Constraint Violation (Expected Error: 1452)
-- INSERT INTO posts (user_id, destination_id, title) VALUES (999, 1, 'Invalid Post'); -- (Non-existent user_id)

-- Test 6.3: Self-follow Check Constraint Violation (Expected Error: 3819)
-- INSERT INTO follows (follower_id, following_id) VALUES (1, 1); -- (Violates chk_not_self_follow)

-- Test 6.4: Unique Email Constraint Violation (Expected Error: 1062)
-- INSERT INTO users (username, email, password) VALUES ('duplicate_user', 'traveluser01@example.com', 'pwd');
