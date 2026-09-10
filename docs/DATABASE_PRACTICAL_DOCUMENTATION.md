# TRAVEL PHOTO SHARING COMMUNITY PLATFORM
## TripNest 2.0 / TripTales AI
### Supabase PostgreSQL SQL Queries, Relational JOINs & Constraint Testing

```
========================================================================================
Project Name:     TripNest 2.0 (Travel Photo Sharing Community)
Database Engine:  Supabase Cloud (PostgreSQL 15+)
Environment:      Supabase Web SQL Editor & PostgreSQL psql
Report Type:      Database Practical / Project Documentation
Department:       Computer Science & Engineering (CSE)
========================================================================================
```

---

## 1. Objective

The objective of this practical work is to design, implement, and verify the relational database schema for **TripNest 2.0** using the **Supabase Cloud SQL Editor**. The practical covers table verification, row count aggregation, relational JOIN queries (`INNER`, `LEFT`, and `FULL OUTER JOIN`), and constraint security error handling (`SQLSTATE 23505`, `23503`).

---

## 2. Database Structure & Table Listing Query

In the **Supabase SQL Editor**, we list all active public tables using the query below:

### **SQL Editor Query:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### **Supabase SQL Editor Output (Results Panel):**
```
+---------------+
| table_name    |
+---------------+
| journeys      |
| likes         |
| notifications |
| posts         |
| profiles      |
| saved_posts   |
+---------------+
(6 rows)
```

---

## 3. Sample Data Insertion & Row Count Verification

The query below verifies row counts across all tables directly in the Supabase SQL Editor:

### **SQL Editor Query:**
```sql
SELECT 'profiles' AS table_name, COUNT(*) AS records FROM public.profiles
UNION ALL
SELECT 'posts', COUNT(*) FROM public.posts
UNION ALL
SELECT 'journeys', COUNT(*) FROM public.journeys
UNION ALL
SELECT 'likes', COUNT(*) FROM public.likes
UNION ALL
SELECT 'saved_posts', COUNT(*) FROM public.saved_posts
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications;
```

### **Supabase SQL Editor Output (Results Panel):**
```
+---------------+---------+
| table_name    | records |
+---------------+---------+
| profiles      |       5 |
| posts         |       6 |
| journeys      |      11 |
| likes         |       9 |
| saved_posts   |       6 |
| notifications |       7 |
+---------------+---------+
(6 rows)
```

---

## 4. Supabase Relational JOIN Operations

---

### 4.1 INNER JOIN (Matching Profiles & Posts)
Retrieves only the traveler profiles who have published travel posts.

#### **SQL Editor Query:**
```sql
SELECT 
    pr.full_name,
    p.destination,
    p.caption
FROM public.profiles pr
INNER JOIN public.posts p 
    ON pr.id = p.user_id;
```

#### **Supabase SQL Editor Output (Results Panel):**
```
+---------------------+-------------+----------------------------------------+
| full_name           | destination | caption                                |
+---------------------+-------------+----------------------------------------+
| Wanderlust Explorer | Ooty        | Misty mornings in the Nilgiri hills.   |
| Wanderlust Explorer | Munnar      | Hiking through lush green tea gardens. |
| Road Trip Hunter    | Goa         | Sunset golden hour at Palolem beach.   |
| Solo Backpacker     | Munnar      | Tranquil nature trails & fresh air.    |
| Heritage Traveler   | Jaipur      | Intricate architecture of Hawa Mahal.  |
| Mountain Lover      | Manali      | Snow peaks & chilly Himalayan trails.  |
+---------------------+-------------+----------------------------------------+
(6 rows)
```

---

### 4.2 LEFT JOIN (All Profiles + Matching Posts)
Retrieves all traveler profiles, showing `No Posts Yet` if the user has 0 posts.

#### **SQL Editor Query:**
```sql
SELECT 
    pr.full_name,
    COALESCE(p.destination, 'No Posts Yet') AS destination,
    p.caption
FROM public.profiles pr
LEFT JOIN public.posts p 
    ON pr.id = p.user_id;
```

#### **Supabase SQL Editor Output (Results Panel):**
```
+---------------------+-------------+----------------------------------------+
| full_name           | destination | caption                                |
+---------------------+-------------+----------------------------------------+
| Wanderlust Explorer | Ooty        | Misty mornings in the Nilgiri hills.   |
| Wanderlust Explorer | Munnar      | Hiking through lush green tea gardens. |
| Road Trip Hunter    | Goa         | Sunset golden hour at Palolem beach.   |
| Solo Backpacker     | Munnar      | Tranquil nature trails & fresh air.    |
| Heritage Traveler   | Jaipur      | Intricate architecture of Hawa Mahal.  |
| Mountain Lover      | Manali      | Snow peaks & chilly Himalayan trails.  |
+---------------------+-------------+----------------------------------------+
(6 rows)
```

---

### 4.3 FULL OUTER JOIN (Native PostgreSQL Syntax)
Retrieves all records from both tables, with NULL on missing sides.

#### **SQL Editor Query:**
```sql
SELECT 
    pr.full_name,
    p.destination
FROM public.profiles pr
FULL OUTER JOIN public.posts p 
    ON pr.id = p.user_id;
```

#### **Supabase SQL Editor Output (Results Panel):**
```
+---------------------+-------------+
| full_name           | destination |
+---------------------+-------------+
| Wanderlust Explorer | Ooty        |
| Wanderlust Explorer | Munnar      |
| Road Trip Hunter    | Goa         |
| Solo Backpacker     | Munnar      |
| Heritage Traveler   | Jaipur      |
| Mountain Lover      | Manali      |
+---------------------+-------------+
(6 rows)
```

---

## 5. Composite Key & Intentional Error Testing

---

### 5.1 Test 1: Duplicate Composite Key (SQLSTATE 23505)
Attempting to like the same post a second time:

#### **SQL Editor Query:**
```sql
INSERT INTO public.likes (user_id, post_id) 
VALUES ('c1a8d052-1111-4f40-8b6b-888888888888', 'b2b9e163-2222-4a51-9c7c-999999999999');
```

#### **Supabase Error Panel Output:**
```
ERROR: duplicate key value violates unique constraint "likes_pkey"
DETAIL: Key (user_id, post_id)=(c1a8d052-1111-4f40-8b6b-888888888888, b2b9e163-2222-4a51-9c7c-999999999999) already exists.
SQLSTATE: 23505
```

---

### 5.2 Test 2: Foreign Key Constraint Violation (SQLSTATE 23503)
Attempting to insert a post referencing a non-existent user UID:

#### **SQL Editor Query:**
```sql
INSERT INTO public.posts (user_id, image_url, destination, caption)
VALUES ('00000000-0000-0000-0000-000000000000', 'https://example.com/cover.jpg', 'Paris', 'Ghost Post');
```

#### **Supabase Error Panel Output:**
```
ERROR: insert or update on table "posts" violates foreign key constraint "posts_user_id_fkey"
DETAIL: Key (user_id)=(00000000-0000-0000-0000-000000000000) is not present in table "users".
SQLSTATE: 23503
```

---

## 6. Summary Table

| Requirement | Status | Supabase PostgreSQL Validation |
| :--- | :--- | :--- |
| **Table Listing Query** | ✅ Verified | Tested via `information_schema.tables` in SQL Editor. |
| **Row Counts Query** | ✅ Verified | Aggregated record counts across core tables. |
| **JOIN Queries** | ✅ Verified | INNER, LEFT, and FULL OUTER JOINs executed. |
| **Constraint Security** | ✅ Protected | Errors 23505 & 23503 confirmed database integrity. |

---
*TripNest 2.0 — Supabase SQL Editor Practical Execution Documentation.*
