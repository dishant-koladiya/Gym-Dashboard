# Gym-Dashboard

Comprehensive documentation for the Gym-Dashboard full-stack project.

This repository contains two main workspaces:

- Gym-Backend — Node.js + TypeScript backend using Express, Prisma ORM and PostgreSQL
- Gym-Frontend — React + TypeScript frontend built with Vite and styled with Tailwind CSS

This README explains the project, prerequisites, installation and configuration, how to run locally (including Prisma/PostgreSQL), API reference, environment variables, Docker setup, and common troubleshooting tips.

---

## Table of Contents

- Project overview
- Tech stack
- Features
- Project structure
- Prerequisites
- Environment variables
- Backend setup (Gym-Backend)
  - Install
  - Database setup (PostgreSQL + Prisma)
  - Run
  - Common commands
- Frontend setup (Gym-Frontend)
  - Install
  - Configure backend connection
  - Run
- API reference (common endpoints)
- Docker / docker-compose (optional)
- Troubleshooting
- Contributing
- License

---

## Project overview

Gym-Dashboard is a full-stack admin console for gym management. It provides tools for member management, authentication, billing/transactions, check-ins, and admin settings. The frontend is an interactive React app while the backend is an API server using Prisma to talk to a PostgreSQL database.

---

## Tech stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, TypeScript, Express
- ORM: Prisma
- Database: PostgreSQL
- Auth: JWT (recommended)
- Other: dotenv, bcrypt (password hashing), jsonwebtoken

---

## Features

- Secure authentication (login endpoint: `POST /api/auth/login`)
- Member CRUD (create, read, update, delete)
- Billing & transactions (checkout, payments, invoices)
- Check-in / Check-out tracking
- Admin settings UI with dynamic backend connection
- Prisma models & migrations for easy schema evolution

---

## Project structure

Top-level layout:

Gym-Dashboard/
- Gym-Backend/
  - prisma/           # Prisma schema & migration files
  - src/              # Backend source (routes, controllers, services)
  - package.json
  - tsconfig.json
- Gym-Frontend/
  - src/              # React app
  - package.json
  - vite.config.ts
- README.md

---

## Prerequisites

- Node.js 18+ and npm (or yarn)
- PostgreSQL (local, Docker, or hosted)
- Git (to clone the repository)

Optional but recommended:
- Docker & docker-compose (for local PostgreSQL and reproducible dev environment)

---

## Environment variables

Create a `.env` file in `Gym-Backend/` with the following variables (example):

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
PORT=5000
JWT_SECRET=your_jwt_secret

Frontend can store minimal runtime settings (if used), for example in `Gym-Frontend/.env`:

VITE_API_BASE_URL=http://localhost:5000

Note: Vite env variables must be prefixed with `VITE_` to be embedded in the client.

---

## Backend (Gym-Backend)

### Install

1. Open a terminal and go to the backend directory:

```bash
cd Gym-Backend
npm install
```

### Database setup (PostgreSQL + Prisma)

1. Ensure PostgreSQL is running and you have created a database.
2. Update `Gym-Backend/.env` with your `DATABASE_URL`.
3. Generate the Prisma client:

```bash
npx prisma generate
```

4. Create and apply migrations (development):

```bash
npx prisma migrate dev --name init
```

This will create the database schema based on `prisma/schema.prisma` and update the migrations folder.

You can inspect and manage data using Prisma Studio:

```bash
npx prisma studio
```

### Run backend

Start the development server:

```bash
npm run dev
```

Common npm scripts you may find in `package.json`:
- `dev` — start the server using ts-node-dev / nodemon
- `build` — compile TypeScript to JavaScript
- `start` — start compiled production server

The backend typically listens on port `5000` (set with PORT in `.env`).

---

## Frontend (Gym-Frontend)

### Install

Open a terminal and install frontend dependencies:

```bash
cd Gym-Frontend
npm install
```

### Configure connection to backend

There are two ways to configure the frontend to talk to your backend:

Option A — UI (recommended):
- Start the frontend and use the built-in **Database Backend Connection** panel in the Settings screen to set the API base URL (for example `http://localhost:5000`) and, optionally, a JWT Bearer token.

Option B — Code (default values):
- Edit `src/data.ts` (or whichever settings file the app uses) and set `defaultSettings.backendUrl = 'http://localhost:5000'` and `defaultSettings.backendToken = 'YOUR_JWT_TOKEN'`.

Note: If you're using Vite and want to use env variables, set `VITE_API_BASE_URL` and read process.env.VITE_API_BASE_URL in the client.

### Run frontend

Start the Vite dev server:

```bash
npm run dev
```

This usually runs on `http://localhost:3000` or a port Vite prints to the console.

---

## API reference (common endpoints)

The backend API organizes routes under `/api`. The exact routes and request/response shapes live in `Gym-Backend/src`. Below are typical endpoints the frontend expects; verify actual paths and payloads in the backend code.

- POST /api/auth/login
  - Body: { email, password }
  - Response: { token, user }

- GET /api/members
  - Headers: Authorization: Bearer <token>
  - Response: list of members

- GET /api/members/:id
  - Response: member details

- POST /api/members
  - Body: member payload
  - Creates a new member

- PUT /api/members/:id
  - Body: fields to update

- DELETE /api/members/:id
  - Deletes a member

- POST /api/transactions/checkout
  - Body: { memberId, amount, ... }
  - Creates a payment/transaction record

- POST /api/checkin
  - Body: { memberId, timestamp }

Adjust headers and payloads according to backend controller implementations. Protected endpoints will require `Authorization: Bearer <token>`.

---

## Docker (optional)

Below is a minimal `docker-compose.yml` example to run a PostgreSQL database for local development. Place this at the repository root if you want a quick local DB.

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: gymdb
    ports:
      - 5432:5432
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

After starting the DB with `docker-compose up -d`, set `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gymdb?schema=public"` in `Gym-Backend/.env` and run Prisma migrate.

You can also containerize backend and frontend; add service definitions and build steps for each app.

---

## Troubleshooting

- "Database connection failed": Verify `DATABASE_URL` is correct and the DB server accepts connections. If using Docker, ensure the container is running and ports are exposed.
- "Prisma migrate" errors: Check `prisma/schema.prisma` for syntax issues; run `npx prisma format` to check.
- CORS errors: If the frontend can't reach the backend, enable CORS in the backend Express server or ensure the frontend uses the correct base URL.
- Environment variables not applied in frontend: With Vite, env variables must use the `VITE_` prefix.

---

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repository and create a branch for your change: `git checkout -b feat/my-change`
2. Make changes and add tests where appropriate.
3. Run the app locally and verify behavior.
4. Create a pull request with a clear description of your changes.

Please follow the existing code style and include clear commit messages.

---

## License

This repository does not include a license file. Add a LICENSE (for example MIT) if you want to permit reuse.

---

If you want, I can also:
- Add `Gym-Backend/.env.example` and `Gym-Frontend/.env.example` to the repo
- Add a `docker-compose.yml` file to the repo and a simple `Makefile` or npm script to run the full stack locally
- Generate a sample Postman collection or curl examples for the main API endpoints

