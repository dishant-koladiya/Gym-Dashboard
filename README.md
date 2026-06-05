# Gym-Dashboard

A full-stack Gym Management Dashboard with a React + Tailwind frontend and a Node.js + TypeScript backend using Prisma ORM and PostgreSQL.

This README summarizes the project layout, features, required dependencies, and step-by-step instructions to run the frontend and backend locally.

---

## Project structure

- Gym-Backend/  - Node.js + TypeScript backend using Express, Prisma ORM and PostgreSQL
- Gym-Frontend/ - React + TypeScript frontend built with Vite and styled with Tailwind CSS

---

## Features

- User authentication (login endpoint: `api/auth/login`)
- Member management (create, update, list members)
- Billing & transactions (checkout, payments, invoices)
- Check-in / Check-out tracking
- Admin settings and a Database Backend Connection panel in the UI
- Prisma for database modeling and migrations

---

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or hosted)

---

## Backend (Gym-Backend)

Dependencies (typical):
- Node.js + TypeScript
- Express
- Prisma
- @prisma/client
- dotenv
- jsonwebtoken (if JWT auth used)
- bcrypt (or bcryptjs) for password hashing

Environment variables (in Gym-Backend/.env):
- DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
- PORT=5000
- JWT_SECRET=your_jwt_secret

How to run backend locally:
1. Change into the backend folder:
   ```bash
   cd Gym-Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your PostgreSQL database and update `DATABASE_URL` in `Gym-Backend/.env`.
4. Run Prisma generate / migrate (create the DB schema):
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
   If you only want to explore the DB, you can also run:
   ```bash
   npx prisma studio
   ```
5. Start the backend in development mode:
   ```bash
   npm run dev
   ```
   The backend will usually run on: http://localhost:5000 (adjust PORT in `.env` if needed)

Notes:
- The backend expects a PostgreSQL database. Make sure the database is created and reachable from your machine.
- Prisma Studio provides a browser GUI to view and edit data.

---

## Frontend (Gym-Frontend)

Dependencies (typical):
- React + TypeScript
- Vite
- Tailwind CSS
- Axios or fetch for HTTP requests

How to run frontend locally:
1. Change into the frontend folder:
   ```bash
   cd Gym-Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure connection to your backend. Two options:
   - Option A (UI): Start the frontend and use the Settings > Database Backend Connection panel to enter the backend URL (e.g. `http://localhost:5000`) and a Bearer token if routes are protected.
   - Option B (code): Edit `src/data.ts` and set `defaultSettings.backendUrl` to your backend URL and `defaultSettings.backendToken` if needed.
4. Start the frontend dev server:
   ```bash
   npm run dev
   ```
   The frontend will usually run on: http://localhost:3000

---

## Run both locally (recommended flow)

1. Start the PostgreSQL server and ensure `Gym-Backend/.env` DATABASE_URL is correct.
2. Start the backend (Gym-Backend):
   ```bash
   cd Gym-Backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run dev
   ```
3. Start the frontend (Gym-Frontend):
   ```bash
   cd ../Gym-Frontend
   npm install
   npm run dev
   ```
4. Open the frontend at `http://localhost:3000` and configure the backend URL (if not hardcoded) to `http://localhost:5000`.

---

## API notes

- Authentication: `POST /api/auth/login` (returns JWT token if enabled)
- Protected routes likely require `Authorization: Bearer <token>` header
- Check the backend `src` folder for full API route list and payload shapes

---

## Helpful commands

- Launch Prisma Studio: `npx prisma studio`
- Create or run migrations: `npx prisma migrate dev --name <name>`
- Regenerate Prisma client: `npx prisma generate`

---

If you want, I can also:
- Add example `.env` templates for backend and frontend
- Add short HOWTO for creating a PostgreSQL Docker container for local dev

