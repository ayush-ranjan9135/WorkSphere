# Initial Setup

This guide walks you through uploading the database schema to Supabase and connecting the backend to PostgreSQL.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [Supabase](https://supabase.com/) account (free tier works)
- Git

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Fill in:
   - **Project name** — e.g. `linearclone`
   - **Database password** — save this, you'll need it later
   - **Region** — pick the closest to you
4. Click **Create new project** and wait for it to provision (~1 min).

---

## 2. Upload the Schema to Supabase

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open the file `backend/db/schema.sql` from this project in any text editor.
4. Copy the entire contents and paste it into the SQL Editor.
5. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
6. You should see a success message. All tables (`users`, `projects`, `project_members`, `tasks`, `comments`, `activity_logs`) and indexes will be created.

> If you see an error about `uuid-ossp`, make sure the first line `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` ran successfully. Supabase supports this extension by default.

---

## 3. Get Your Database Connection String

1. In your Supabase dashboard, go to **Project Settings** → **Database**.
2. Scroll down to **Connection string** and select the **URI** tab.
3. Copy the connection string. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with the database password you set in Step 1.

> For connection pooling (recommended for production), use the **Session pooler** URI found under **Connection pooling** on the same page. Change the port to `5432` and append `?pgbouncer=true` if using transaction mode.

---

## 4. Configure the Backend Environment

1. In the `backend/` directory, copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Open `backend/.env` and fill in the values:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   JWT_SECRET="replace-with-a-long-random-secret"
   JWT_REFRESH_SECRET="replace-with-another-long-random-secret"
   JWT_EXPIRES_IN="15m"
   JWT_REFRESH_EXPIRES_IN="7d"
   CSRF_SECRET="replace-with-a-long-random-secret"
   CLIENT_URL="http://localhost:5173"
   ```

   | Variable               | Description                                              |
   |------------------------|----------------------------------------------------------|
   | `PORT`                 | Port the backend server listens on                       |
   | `DATABASE_URL`         | Full PostgreSQL connection string from Supabase          |
   | `JWT_SECRET`           | Secret used to sign access tokens (keep this private)    |
   | `JWT_REFRESH_SECRET`   | Secret used to sign refresh tokens (keep this private)   |
   | `JWT_EXPIRES_IN`       | Access token expiry e.g. `15m`, `1h`                     |
   | `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry e.g. `7d`, `30d`                 |
   | `CSRF_SECRET`          | Secret used for CSRF double-submit cookie protection     |
   | `CLIENT_URL`           | Frontend origin for CORS (e.g. `http://localhost:5173`)  |

---

## 5. Install Dependencies and Start the Backend

```bash
cd backend
npm install
npm run dev
```

The server will start on `http://localhost:5000`.

To verify the connection is working, open:
```
http://localhost:5000/api/health
```
You should see:
```json
{ "status": "ok" }
```

---

## 6. Configure the Frontend Environment

1. In the `frontend/` directory, copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Open `frontend/.env` and set:
   ```env
   VITE_API_URL="http://localhost:5000/api"
   ```

3. Install dependencies and start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `ECONNREFUSED` on startup | Check that `DATABASE_URL` is correct and Supabase project is active |
| `SSL required` error | Supabase requires SSL — the backend already sets `rejectUnauthorized: true` in production |
| `uuid-ossp` extension error | Go to Supabase → **Database** → **Extensions** and enable `uuid-ossp` manually |
| `Missing required env var` error | Make sure all variables in `.env` are filled in, especially `JWT_SECRET` and `JWT_REFRESH_SECRET` |
| CORS errors in browser | Make sure `CLIENT_URL` in `.env` matches the exact origin of your frontend including port |
