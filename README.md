<div align="center">

# 🚀 LinearClone — Project Management App

**A full-stack, production-ready project management tool inspired by Linear.app**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-ISC-green?style=for-the-badge)](LICENSE)

<br/>

> 🎯 Manage projects, track tasks, collaborate with teams — all in a sleek dark UI with drag-and-drop Kanban boards.

<br/>

[🌐 Live Demo](#) · [🐛 Report Bug](https://github.com/ayush-ranjan9135/issues) · [✨ Request Feature](https://github.com/ayush-ranjan9135/issues)

</div>

---

## 📌 Problem Statement

Modern software teams struggle with:

- 🔀 **Scattered task tracking** — tasks spread across spreadsheets, chats, and sticky notes
- 👁️ **No real-time visibility** — managers can't see what's in progress, blocked, or overdue
- 🧩 **Poor team coordination** — no clear ownership or role-based access on tasks
- 📉 **Missed deadlines** — no automated alerts or deadline tracking
- 🗂️ **Context switching** — jumping between multiple tools for projects, teams, and tasks

---

## ✅ Solution

**LinearClone** solves these problems by providing a unified workspace where teams can:

- 📋 Create and manage **projects** with role-based access (admin / member)
- 🎯 Track tasks on a **drag-and-drop Kanban board** (Todo → In Progress → Done)
- 👥 Organize **teams** and assign members to projects
- 📊 Get a **real-time dashboard** with stats, overdue alerts, and activity feeds
- 🔐 Authenticate securely with **JWT access + refresh token** rotation
- 🧹 Auto-cleanup completed tasks after **24 hours** to keep boards clean
- ⌨️ Navigate instantly with a **Command Palette** (⌘K)

---

## 🖼️ App Flow

```
🌐 Landing Page
      │
      ▼
 ┌─────────────┐        ┌──────────────┐
 │   Sign Up   │        │    Log In    │
 └──────┬──────┘        └──────┬───────┘
        │                      │
        └──────────┬───────────┘
                   ▼
         🔐 JWT Auth (Access + Refresh Token)
                   │
                   ▼
        ┌──────────────────────┐
        │     App Layout       │
        │  (Protected Routes)  │
        └──────────┬───────────┘
                   │
       ┌───────────┼────────────┬──────────────┐
       ▼           ▼            ▼              ▼
  📊 Dashboard  🎯 Kanban   👥 Team Page   👤 Profile
       │           │
       │     ┌─────┴──────┐
       │     │  Projects  │
       │     │  Selector  │
       │     └─────┬──────┘
       │           │
       │     ┌─────▼──────────────────────┐
       │     │  Columns: Todo / In Progress / Done │
       │     │  Drag & Drop Tasks (dnd-kit)        │
       │     │  Create / Edit / Delete Tasks       │
       │     │  Assign Members + Deadlines         │
       │     └────────────────────────────┘
       │
  ┌────▼──────────────────────────┐
  │  Stats: Total / In Progress   │
  │         Overdue / Completed   │
  │  Recently Assigned Tasks      │
  │  Activity Feed (per project)  │
  └───────────────────────────────┘
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                                                             │
│  React 19 + TypeScript + Vite                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Pages   │  │ Context  │  │   Lib    │  │Components │  │
│  │Dashboard │  │AuthCtx   │  │ axios.ts │  │ Kanban    │  │
│  │Kanban    │  │TaskCtx   │  │ api.ts   │  │ Dialogs   │  │
│  │TeamPage  │  └──────────┘  └──────────┘  │ CmdPalette│  │
│  │Profile   │                              └───────────┘  │
│  └──────────┘                                             │
│                                                             │
│  State: React Context + TanStack Query + Zustand            │
│  Animations: Framer Motion                                  │
│  DnD: @dnd-kit/core + @dnd-kit/sortable                     │
│  Styling: Tailwind CSS v4                                   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP (Axios + JWT Bearer)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVER (Node.js)                         │
│                                                             │
│  Express 5 + ES Modules                                     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Middleware Stack                    │  │
│  │  Helmet → CORS → JSON → CookieParser → RateLimit     │  │
│  │  → Authenticate (JWT) → Authorize (Role) → Validate  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Routes:                                                    │
│  /api/auth      → authController    (signup/login/refresh) │
│  /api/projects  → projectController (CRUD + members)       │
│  /api/projects/:id/tasks → taskController (CRUD + reorder) │
│  /api/teams     → teamController    (CRUD + assign)        │
│  /api/dashboard → dashboardController (stats + overdue)    │
│                                                             │
│  Utils: JWT sign/verify, Activity logger                    │
│  Cleanup: Auto-delete done tasks after 24h (setInterval)   │
└────────────────────────┬────────────────────────────────────┘
                         │ pg (node-postgres)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (PostgreSQL / Supabase)            │
│                                                             │
│  users ──────────────────────────────────────────────────  │
│  projects ──── project_members ──────────────────────────  │
│  tasks ──────── comments ────────────────────────────────  │
│  teams ──────── team_members ────────────────────────────  │
│  activity_logs ──────────────────────────────────────────  │
│                                                             │
│  Indexes on: tasks(project_id, assignee_id, status,        │
│              deadline), activity_logs(project_id),         │
│              project_members(project_id)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

| Table | Key Columns |
|---|---|
| `users` | id, name, email, password (bcrypt), role, refresh_token |
| `projects` | id, name, description, owner_id |
| `project_members` | project_id, user_id, role (admin/member) |
| `tasks` | id, project_id, title, status, priority, assignee_id, deadline, position |
| `teams` | id, name, created_by |
| `team_members` | team_id, user_id |
| `comments` | id, task_id, user_id, content |
| `activity_logs` | id, project_id, task_id, user_id, action, meta (JSONB) |

---

## 🛠️ Tech Stack

### 🖥️ Frontend

| Technology | Purpose |
|---|---|
| ⚛️ React 19 | UI framework |
| 🔷 TypeScript | Type safety |
| ⚡ Vite 8 | Build tool & dev server |
| 🎨 Tailwind CSS v4 | Utility-first styling |
| 🎞️ Framer Motion | Animations & transitions |
| 🖱️ @dnd-kit | Drag-and-drop Kanban |
| 🔄 TanStack Query | Server state management |
| 🐻 Zustand | Client state management |
| 🌐 Axios | HTTP client with interceptors |
| 🔀 React Router v7 | Client-side routing |
| 🔔 Sonner | Toast notifications |
| ⌨️ cmdk | Command palette (⌘K) |
| 🎯 Lucide React | Icon library |

### 🖧 Backend

| Technology | Purpose |
|---|---|
| 🟢 Node.js + Express 5 | REST API server |
| 🔷 ES Modules | Modern JS module system |
| 🐘 PostgreSQL (Supabase) | Primary database |
| 🔌 node-postgres (pg) | DB driver |
| 🔐 jsonwebtoken | JWT access + refresh tokens |
| 🔒 bcryptjs | Password hashing |
| 🛡️ Helmet | HTTP security headers |
| 🌐 CORS | Cross-origin resource sharing |
| 🚦 express-rate-limit | Rate limiting (auth: 20/15min) |
| ✅ express-validator | Request validation |
| 📝 Morgan | HTTP request logging |
| 🍪 cookie-parser | Cookie handling |

---

## 📁 Project Structure

```
ayush/
├── 📂 backend/
│   ├── config/
│   │   └── db.js               # PostgreSQL pool connection
│   ├── controllers/
│   │   ├── authController.js   # signup, login, refresh, logout, me
│   │   ├── projectController.js# CRUD + member management
│   │   ├── taskController.js   # CRUD + reorder
│   │   ├── teamController.js   # CRUD + assign to project
│   │   ├── dashboardController.js # stats, overdue, assigned
│   │   ├── commentController.js   # add/get/delete comments
│   │   └── activityController.js  # project activity feed
│   ├── db/
│   │   └── schema.sql          # Full DB schema with indexes
│   ├── middleware/
│   │   ├── authenticate.js     # JWT Bearer token verification
│   │   ├── authorize.js        # Role-based access (requireRole, requireMember)
│   │   ├── errorHandler.js     # Global error handler
│   │   └── validate.js         # express-validator result handler
│   ├── routes/
│   │   ├── auth.js             # /api/auth/*
│   │   ├── projects.js         # /api/projects/*
│   │   ├── tasks.js            # /api/projects/:id/tasks/*
│   │   ├── teams.js            # /api/teams/*
│   │   └── dashboard.js        # /api/dashboard
│   ├── utils/
│   │   ├── jwt.js              # signAccess, signRefresh, verifyRefresh
│   │   └── activity.js         # logActivity helper
│   └── index.js                # App entry, middleware, routes, cleanup job
│
└── 📂 frontend/
    └── src/
        ├── components/
        │   ├── ui/
        │   │   ├── Button.tsx
        │   │   ├── NewTaskDialog.tsx
        │   │   ├── EditTaskDialog.tsx
        │   │   ├── CreateMemberDialog.tsx
        │   │   ├── SpotlightCard.tsx
        │   │   └── Magnetic.tsx
        │   ├── CommandPalette.tsx  # ⌘K global search
        │   └── Skeleton.tsx
        ├── context/
        │   ├── AuthContext.tsx     # Auth state + login/logout/signup
        │   └── TaskContext.tsx     # Task CRUD state
        ├── lib/
        │   ├── axios.ts            # Axios instance + JWT interceptors
        │   ├── api.ts              # All API calls + TypeScript types
        │   └── utils.ts            # formatDistanceToNow, helpers
        └── pages/
            ├── LandingPage.tsx     # Public landing page
            ├── Login.tsx           # Login form
            ├── Signup.tsx          # Signup form
            ├── Dashboard.tsx       # Stats + activity + assigned tasks
            ├── Kanban.tsx          # Drag-and-drop board
            ├── TeamPage.tsx        # Team management
            └── ProfilePage.tsx     # User profile + avatar
```

---

## 🔐 Authentication Flow

```
1. User logs in → POST /api/auth/login
2. Server returns accessToken (15m) + refreshToken (7d)
3. Tokens stored in localStorage
4. Every request → Authorization: Bearer <accessToken>
5. On 401 → axios interceptor auto-calls POST /api/auth/refresh
6. New tokens issued → request retried transparently
7. On refresh failure → tokens cleared → redirect to /login
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)

### 1️⃣ Clone the repo

```bash
git clone https://github.com/ayush-ranjan9135/linearclone.git
cd linearclone
```

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

Create `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-long-random-secret"
JWT_REFRESH_SECRET="your-long-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

Run the schema:

```bash
# Run schema.sql against your PostgreSQL database
psql $DATABASE_URL -f db/schema.sql
```

Start the server:

```bash
npm run dev
```

### 3️⃣ Setup Frontend

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL="http://localhost:5000/api"
```

Start the dev server:

```bash
npm run dev
```

### 4️⃣ Open the app

```
http://localhost:5173
```

> 💡 The first user to sign up is automatically assigned the **admin** role.

---

## 🌐 API Endpoints

### 🔐 Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register new user |
| POST | `/login` | Login + get tokens |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Invalidate refresh token |
| GET | `/me` | Get current user |
| PATCH | `/me` | Update profile |

### 📁 Projects — `/api/projects`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all projects |
| POST | `/` | Create project |
| GET | `/:id` | Get project details |
| PATCH | `/:id` | Update project (admin) |
| DELETE | `/:id` | Delete project (admin) |
| POST | `/:id/members` | Invite member by email |
| PATCH | `/:id/members/:uid` | Update member role |
| DELETE | `/:id/members/:uid` | Remove member |
| GET | `/:id/activity` | Get activity feed |

### ✅ Tasks — `/api/projects/:projectId/tasks`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List tasks (with filters) |
| POST | `/` | Create task |
| GET | `/:taskId` | Get task |
| PATCH | `/:taskId` | Update task |
| DELETE | `/:taskId` | Delete task |
| POST | `/reorder` | Reorder tasks (drag-and-drop) |
| GET | `/:taskId/comments` | Get comments |
| POST | `/:taskId/comments` | Add comment |
| DELETE | `/:taskId/comments/:cid` | Delete comment |

### 👥 Teams — `/api/teams`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List teams |
| POST | `/` | Create team |
| DELETE | `/:teamId` | Delete team |
| POST | `/:teamId/members` | Add member |
| DELETE | `/:teamId/members/:uid` | Remove member |
| POST | `/:teamId/assign` | Assign team to project |

---

## ✨ Key Features

- 🎯 **Kanban Board** — Drag-and-drop tasks across Todo / In Progress / Done columns
- 📊 **Dashboard** — Live stats, overdue tasks, assigned tasks, activity feed
- 👥 **Team Management** — Create teams, add/remove members, assign to projects
- 🔐 **Role-Based Access** — Admin and member roles per project
- 🔄 **Token Rotation** — Silent JWT refresh with axios interceptors
- 🧹 **Auto Cleanup** — Completed tasks auto-deleted after 24 hours
- ⌨️ **Command Palette** — ⌘K to navigate anywhere instantly
- 🌙 **Dark UI** — Glassmorphism design with animated gradients
- 📱 **Responsive** — Works on desktop and tablet
- 🚦 **Rate Limiting** — Auth routes limited to 20 req/15min
- 🛡️ **Security** — Helmet headers, bcrypt passwords, JWT auth

---

## 👨‍💻 Author

<div align="center">

### Ayush Ranjan

*Full Stack Developer*

[![Portfolio](https://img.shields.io/badge/🌐_Portfolio-Visit-6c63ff?style=for-the-badge)](https://alpha-portfolio-five.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-ayush--ranjan9135-181717?style=for-the-badge&logo=github)](https://github.com/ayush-ranjan9135)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-ayush--ranjan-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/ayush-ranjan-9135d3/)
[![Instagram](https://img.shields.io/badge/Instagram-ayush.___.srivastava-E4405F?style=for-the-badge&logo=instagram)](https://www.instagram.com/ayush.__.srivastava?igsh=dW1zdHFjcTZnenV2)
[![Facebook](https://img.shields.io/badge/Facebook-Profile-1877F2?style=for-the-badge&logo=facebook)](https://www.facebook.com/share/1AhB4q1WeW/)

</div>

---

<div align="center">

Made with ❤️ by **Ayush Ranjan**

⭐ Star this repo if you found it helpful!

</div>
