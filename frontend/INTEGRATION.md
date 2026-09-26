# CareConnect — Full Stack Integration Guide

## Backend (Node/Express + MongoDB)

```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT secrets, SMTP, Cloudinary
npm install
npm run dev               # starts on http://localhost:5000
```

All routes are mounted under **`/api/v1`** (see `src/app.js`).
Health check: `GET http://localhost:5000/health`.

CORS default now allows `http://localhost:8080` (Vite), `http://localhost:3000`
and `http://localhost:5173`. Override with a comma-separated `CLIENT_URL`.

## Frontend (TanStack Start + React 19)

```bash
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api/v1
bun install               # or npm install
bun run dev               # http://localhost:8080
```

### API base URL
`src/lib/api.ts` defaults to `http://localhost:5000/api/v1`, matching the
backend `/api/v1` mount prefix. **Do not omit `/api/v1`** or every request will 404.

## Feature ↔ Endpoint map

| Frontend page | Backend routes |
| --- | --- |
| `/auth/*` | `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/refresh-token`, `/auth/forgot-password`, `/auth/reset-password` |
| `/dashboard` | `/admin/dashboard`, `/notifications`, `/bookings` |
| `/patients` | `GET/POST/PUT/DELETE /patients` |
| `/caregivers` | `GET /caregivers?specialization=...`, `/caregivers/:id`, `/caregivers/recommend/:patientId` |
| `/bookings` | `GET/POST /bookings`, `PATCH /bookings/status` |
| `/care-notes` | `GET/POST/PUT /care-notes` |
| `/medications` | `GET/POST/PUT/DELETE /medications` |
| `/documents` | `GET /documents`, `POST /documents` (multipart), `DELETE /documents/:id` |
| `/notifications` | `GET /notifications`, `PATCH /notifications/read`, `DELETE /notifications/:id` |
| `/reviews` | `GET /reviews/caregiver/:id`, `POST /reviews` |
| `/sos` | `GET /sos`, `POST /sos`, `PATCH /sos/:id/resolve` |
| `/profile` | `GET/PUT /users/profile` |

## Deployment
- Backend: Render / Railway / Fly.io (set `CLIENT_URL` to your deployed frontend URL).
- Frontend: Set `VITE_API_URL=https://<your-backend>/api/v1` before build.
