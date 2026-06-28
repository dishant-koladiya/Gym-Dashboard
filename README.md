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

Create a `.env` file in the `Gym-Backend` directory with the following variables:

| Variable | Description |
|---|---|
| `PORT` | API server port (default: `5000`) |
| `DB_HOST` | PostgreSQL host (default: `localhost`) |
| `DB_PORT` | PostgreSQL port (default: `5432`) |
| `DB_NAME` | Database name (default: `gym_dashboard`) |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key for JWT signing (required) |
| `CORS_ORIGIN` | Allowed CORS origin (default: `http://localhost:5173`) |

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
