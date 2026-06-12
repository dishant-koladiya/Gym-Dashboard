# Gym Dashboard

Full-stack gym management dashboard. Manage members, subscriptions, payments, and admin settings.

## Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4, Lucide icons |
| **Backend** | Node.js, Express, TypeScript, PostgreSQL |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Runtime** | tsx (dev), esbuild (production build) |

## Quick Start

### Prerequisites

- Node.js 22+
- PostgreSQL 13+ running on port 5432

### 1. Database

Create a database named `gym_dashboard` (or set `DB_NAME` in `.env`).

### 2. Backend

```bash
cd Gym-Backend
cp .env.example .env    # edit variables as needed
npm install
npm run dev             # starts on http://localhost:5000
```

The server auto-creates tables and seeds sample data on first run.

### 3. Frontend

```bash
cd Gym-Frontend
npm install
npm run dev             # starts on http://localhost:5173
```

### 4. Open browser

Navigate to `http://localhost:5173`. Default login credentials:
- **Email:** `koladiyadishant11@gmail.com`
- **Password:** `admin123`

## Environment Variables (Backend)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | API server port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `gym_dashboard` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | `postgres` | Database password |
| `JWT_SECRET` | _(required)_ | Secret key for JWT signing |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

## Docker

```bash
# Start all services (PostgreSQL + Backend + Frontend)
npm run docker:up

# Stop
npm run docker:down
```

Frontend will be available at `http://localhost:8080`.

## Scripts

```bash
npm run dev          # Run both backend & frontend concurrently
npm run lint         # TypeScript check both projects
npm test             # Run backend tests
npm run build        # Build both projects for production
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/register` | No | Register |
| GET | `/api/auth/profile` | Yes | Get profile |
| GET | `/api/health` | No | Health check |
| GET | `/api/dashboard/stats` | Yes | Dashboard stats |
| GET | `/api/members` | Yes | List members |
| POST | `/api/members` | Yes | Create member |
| PUT | `/api/members/:id` | Yes | Update member |
| DELETE | `/api/members/:id` | Yes | Delete member |
| GET | `/api/transactions` | Yes | List transactions |
| POST | `/api/transactions` | Yes | Create transaction |
| GET | `/api/subscription-plans` | Yes | List plans |
| POST | `/api/subscription-plans` | Yes | Create plan |
| PUT | `/api/subscription-plans/:id` | Yes | Update plan |
| DELETE | `/api/subscription-plans/:id` | Yes | Delete plan |
| GET | `/api/admin` | Yes | Get admin profile |
| POST | `/api/admin` | Yes | Update admin |
| POST | `/api/admin/avatar` | Yes | Upload avatar |
| GET | `/api/gym` | No | Get gym info |
| POST | `/api/gym` | Yes | Update gym |
| GET | `/api/settings` | No | Get settings |
| POST | `/api/settings` | Yes | Update settings |
