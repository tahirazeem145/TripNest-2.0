# TripNest 2.0 - Database Migration & Setup Guide

This document outlines the database schema architecture, migration procedures, and table relationship structures for TripNest 2.0.

---

## 1. Supported DBMS Engines

- **Production / Cloud**: Supabase PostgreSQL (Postgres 15+)
- **Alternative / Self-Hosted**: MySQL 8.0+

---

## 2. Schema Scripts

| File | Target Engine | Description |
|---|---|---|
| `backend/supabase_schema.sql` | PostgreSQL / Supabase | Core tables, foreign keys, RLS policies, trigger functions, and storage bucket definitions. |
| `backend/tripnest_mysql_schema.sql` | MySQL 8.0 | Standalone relational schema with indexes and mock test data. |

---

## 3. PostgreSQL / Supabase Migration Steps

1. **Access Supabase Project**:
   Log in to the [Supabase Dashboard](https://app.supabase.com) and navigate to your project's **SQL Editor**.

2. **Execute Base Schema**:
   Paste and run the contents of `backend/supabase_schema.sql`.

3. **Verify Core Tables**:
   Confirm the following tables are created:
   - `users` (User profiles, bios, avatars, follower counts)
   - `posts` (Travel posts, locations, captions, tags)
   - `post_media` (Media attachments with URLs and order index)
   - `comments` (Hierarchical and flat discussion threads)
   - `likes` (User post engagement)
   - `bookmarks` / `saved_posts` (User saved collection)
   - `follows` (Social follower relationships)
   - `notifications` (Real-time activity alerts)

4. **Verify Storage Buckets**:
   Navigate to **Storage** and ensure the `tripnest-media` bucket is public with policies allowing authenticated uploads.

---

## 4. Troubleshooting & Maintenance

- **Foreign Key Constraints**: Ensure `users` are created before referencing user IDs in `posts` and `comments`.
- **Row-Level Security (RLS)**: If clients receive empty queries directly from Supabase, ensure RLS policies allow SELECT for public data.
