# TripNest 2.0 - Production Deployment Guide

This guide details how to configure, build, and deploy the TripNest 2.0 full-stack application across cloud providers (Render for backend, Netlify / Vercel for frontend, and Supabase for database & storage).

---

## 1. Architecture Overview

- **Frontend**: Single Page Application built with React 18, Vite, and Bootstrap 5. Hosted on **Netlify** or **Vercel**.
- **Backend**: Spring Boot 3 Java service running inside a containerized environment on **Render**.
- **Database & Storage**: Managed PostgreSQL and Storage buckets on **Supabase**.

---

## 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and execute:
   - `backend/supabase_schema.sql` (to provision tables, RLS policies, and triggers).
3. Create a public storage bucket named:
   - `tripnest-media` (for user avatars and post images).
4. Note down the following project credentials from **Project Settings > API**:
   - `Project URL`
   - `anon public key`
   - `service_role secret key`

---

## 3. Backend Deployment (Render)

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect the GitHub repository `tahirazeem145/TripNest-2.0`.
3. Set the **Root Directory** to `backend`.
4. Choose **Docker** as the runtime (Render will automatically pick up `backend/Dockerfile`).
5. Configure Environment Variables:
   - `PORT`: `8080`
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_KEY`: `your-supabase-anon-key`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your-supabase-service-role-key`
6. Click **Deploy**.

---

## 4. Frontend Deployment (Netlify)

1. Connect the repository on [Netlify](https://app.netlify.com).
2. Base directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `frontend/dist`
5. Configure Environment Variables in Netlify UI:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com/api`
6. Deploy site.

---

## 5. Domain & CORS Configuration

Ensure that your backend `CorsConfig.java` allows requests from your production frontend domain (e.g. `https://tripnest.netlify.app`).
