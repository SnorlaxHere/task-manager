# TaskFlow — Team Task Manager

A full-stack team collaboration platform with role-based access control, project management, task tracking, and real-time progress monitoring.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, React Router, Zustand, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) + bcrypt |
| Styling | Vanilla CSS ("Playful Professionalism" design system), Glassmorphism, `@phosphor-icons/react` |

## 📁 Project Structure

```
Task-Manager/
├── backend/
│   ├── models/         # User, Project, Task schemas
│   ├── routes/         # auth, users, projects, tasks, dashboard
│   ├── middleware/     # JWT auth, error handler
│   ├── seed.js         # Demo data seeder
│   └── server.js       # Express entry point
└── frontend/
    └── src/
        ├── components/ # AppLayout, Avatar, Badge, Modal, ProgressBar
        ├── lib/        # Axios instance with interceptors
        ├── pages/      # Landing, Login, Register, Dashboard, Projects, Tasks…
        └── store/      # Zustand auth store
```

## ⚙️ Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB running locally (or provide a cloud URI)

### 1. Backend

```bash
cd backend
npm install
# Edit .env with your MONGO_URI and JWT secrets
npm run seed      # Load demo data (optional)
npm run dev       # Start backend on :5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev       # Start frontend on :5173
```

Open **http://localhost:5173** in your browser.

## 🔑 Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | alice@example.com | Admin123 |
| Member | bob@example.com | Member123 |
| Member | carol@example.com | Member123 |

## 🌐 API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `POST /api/auth/refresh` — Refresh token
- `GET  /api/auth/me` — Current user

### Projects
- `GET/POST /api/projects`
- `GET/PUT/DELETE /api/projects/:id`
- `GET/POST /api/projects/:id/members`

### Tasks
- `GET/POST /api/tasks`
- `GET/PUT/DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `POST/DELETE /api/tasks/:id/assign/:userId`

### Dashboard
- `GET /api/dashboard/stats`
- `GET /api/dashboard/my-tasks`
- `GET /api/dashboard/overdue`
- `GET /api/dashboard/project/:id/stats`

## 📄 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```
