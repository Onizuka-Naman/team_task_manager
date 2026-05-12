# Team Task Manager

A full-stack Team Task Manager built with React, Node.js, Express, and MongoDB. The app lets teams create projects, assign tasks, and track progress — with different access levels for Admins and Members.

I built this to get hands-on experience with real-world full-stack concepts like JWT auth, role-based access control, REST APIs, and cloud deployment.

---

## Features

- User Signup & Login (JWT-based)
- Role-Based Access Control (Admin / Member)
- Admins can create/delete projects and tasks, assign tasks to members
- Members can view tasks and update their status
- Overdue task detection and highlighting
- Dashboard with task stats (total, in progress, overdue, completed)
- Project management with descriptions
- Responsive UI — works on mobile and desktop

---

## Tech Stack

**Frontend**
- React + Vite
- React Router DOM
- Axios
- CSS (Inter font, no frameworks)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- bcryptjs (password hashing)
- JSON Web Tokens (JWT)

---

## Folder Structure

```
backend/
  config/db.js          # MongoDB connection with reconnect
  middleware/           # Auth + role middleware
  models/               # User, Project, Task schemas
  routes/               # Auth, Project, Task routes
  server.js

frontend/
  src/
    pages/              # Login, Register, Dashboard
    api.js              # Axios instance with auth interceptor
    styles.css
  index.html
```

---

## Local Setup

```bash
# Backend
cd backend
npm install
# create a .env file with MONGO_URI and JWT_SECRET
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## Deployment

Deployed on [Railway](https://railway.app) — backend and frontend run as separate services.

Environment variables set in Railway dashboard:
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — secret key for signing tokens
- `VITE_API_URL` — backend URL (set in frontend service)
