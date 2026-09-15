# TripNest 2.0 — Social Travel & Discovery Platform

[![Frontend CI](https://github.com/tahirazeem145/TripNest-2.0/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/tahirazeem145/TripNest-2.0/actions/workflows/frontend-ci.yml)
[![Backend CI](https://github.com/tahirazeem145/TripNest-2.0/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/tahirazeem145/TripNest-2.0/actions/workflows/backend-ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)

TripNest 2.0 is a modern, high-performance social travel platform built with **React 18**, **Spring Boot 3.2**, and **Supabase PostgreSQL**. It empowers travelers worldwide to discover unexplored destinations, share authentic multi-photo journey feeds, and connect in real time.

---

## 🔗 Project Links & Live Deployments

- 🌐 **Live Frontend (Netlify)**: [**https://tripnest20.netlify.app**](https://tripnest20.netlify.app)
- 🚀 **Live Backend API (Render)**: [**https://tripnest-backend-ahl5.onrender.com**](https://tripnest-backend-ahl5.onrender.com)

| Module | Live / Deployed URL | Local Development URL | Source Directory | Repository Link |
| :--- | :--- | :--- | :--- | :--- |
| 💻 **Frontend (React + Vite)** | [**tripnest20.netlify.app**](https://tripnest20.netlify.app) | [`http://localhost:5173`](http://localhost:5173) | [`frontend/`](frontend/) | [Frontend Code](https://github.com/tahirazeem145/TripNest-2.0/tree/main/frontend) |
| ⚙️ **Backend (Spring Boot)** | [**tripnest-backend-ahl5.onrender.com**](https://tripnest-backend-ahl5.onrender.com) | [`http://localhost:8081/api`](http://localhost:8081/api) | [`backend/`](backend/) | [Backend Code](https://github.com/tahirazeem145/TripNest-2.0/tree/main/backend) |

---

## 📌 Documentation Index

| Document | Description |
| :--- | :--- |
| 📋 [**Problem Statement**](PROBLEM_STATEMENT.md) | Capstone problem statement, objectives, and domain analysis |
| 🔌 [**REST API Specification**](docs/API_SPECIFICATION.md) | Comprehensive API endpoints, payload contracts, and status codes |
| 📊 [**Entity-Relationship (ER) Diagram**](docs/ER_DIAGRAM.md) | Relational schema, tables, foreign keys, and data dictionary |
| 🔄 [**System Sequence Diagrams**](docs/SEQUENCE_DIAGRAMS.md) | Runtime interaction workflows (Auth, Posting, Interactions) |
| 🏛️ [**System Architecture**](docs/ARCHITECTURE_DIAGRAM.md) | Tiered architectural design and service topologies |
| 📐 [**Class Diagram**](docs/CLASS_DIAGRAM.md) | Object-oriented class relationships and entities |
| 🗄️ [**Database Migration Guide**](docs/DATABASE_MIGRATION_GUIDE.md) | PostgreSQL / Supabase setup and migration guidelines |
| 🚀 [**Production Deployment Guide**](docs/DEPLOYMENT_GUIDE.md) | Netlify, Render, and Docker deployment procedures |
| 🤝 [**Contributing Guidelines**](CONTRIBUTING.md) | Development workflow, branch naming, and pull request conventions |
| 🔒 [**Security Policy**](SECURITY.md) | Vulnerability disclosure policy and security practices |

---

## 🚀 Quick Start Guide

### 1. Backend Setup (Spring Boot)
```bash
cd backend
mvn clean compile spring-boot:run
```
> Runs Spring Boot API server on `http://localhost:8081/api`

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
> Opens Vite frontend dev server on `http://localhost:5173`

### 3. Docker Compose (Full-Stack)
```bash
docker-compose up --build
```

---

## 🔑 Demo Traveler Accounts

| Email | Password | Role |
| :--- | :--- | :--- |
| `test@gmail.com` | `123456` | Standard Traveler |
| `yuva@gmail.com` | `123456` | Standard Traveler |

---

## ✨ Core Features

- **Uncropped Media Layout**: Dynamic `object-fit: contain` presentation with ambient blur backdrop preserving full portrait and landscape aspect ratios.
- **Multi-Photo Carousels**: Upload and manage multi-photo stories and albums.
- **Interactive Social Feed**: Real-time likes, saved post collections, nested comments, and follow system.
- **Traveler Profiles & Discoverability**: Search travelers, explore tagged destinations, and personalize traveler bios.
- **Fault-Tolerant Resilience**: Frontend Error Boundaries, offline network banners, and automated CI pipelines.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
