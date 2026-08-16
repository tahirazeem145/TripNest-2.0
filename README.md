# TripNest 2.0 — Social Travel & Discovery Platform

TripNest 2.0 is a modern, high-performance social travel app built with **React 18**, **Spring Boot 3.2**, and **Supabase PostgreSQL**.

---

## 📌 Quick Documentation Links

- 📋 [**Problem Statement & Overview**](PROBLEM_STATEMENT.md)
- 📊 [**Entity-Relationship (ER) Diagram**](docs/ER_DIAGRAM.md)
- 🏛️ [**System Architecture Diagram**](docs/ARCHITECTURE_DIAGRAM.md)
- 📐 [**Class Diagram**](docs/CLASS_DIAGRAM.md)

---

## 🚀 Quick Start Guide

### 1. Backend Setup (Spring Boot)
```bash
cd backend
mvn clean compile spring-boot:run
```
> Runs Spring Boot API server on `http://localhost:8080`

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
> Opens Vite frontend dev server on `http://localhost:5174` (or `5173`)

---

## 🔑 Key Credentials (Demo Users)
| Email | Password | Role |
| :--- | :--- | :--- |
| `test@gmail.com` | `123456` | Standard Traveler |
| `yuva@gmail.com` | `123456` | Standard Traveler |

---

## ✨ Features Implemented
- **Uncropped Photos**: Dynamic `object-fit: contain` layout with ambient blur backdrop preserving full portrait and landscape aspects.
- **Multi-Photo Carousels**: Supports uploading and reordering up to 10 photos per post.
- **Social Interactions**: Real-time double-tap likes, bookmarks/saved posts, nested comments, and follow system.
- **Traveler Profiles**: Customizable avatars, bios, follower counts, and shared moment galleries.
