
# CareConnect Frontend – Build Plan

Your backend is a Node/Express + MongoDB API with JWT auth, Socket.IO, and Cloudinary uploads. I've mapped every route in `/api/*` (auth, users, patients, caregivers, services, bookings, careNotes, complaints, notifications, reviews, documents, sos, medications, admin).

## Important scope note (read first)

What you're asking for is roughly **40–50 premium pages** (landing + 6 auth screens + family dashboard with 10 modules + caregiver dashboard + admin panel + shared components), all wired to 60+ endpoints, all animated, all responsive. That is **several days of focused work**, not one message. If I try to slam it all into one turn you get shallow, half-broken slop — the opposite of what you want.

So I'll deliver it in **4 phases**, each phase shippable on its own. After you approve, I start Phase 1 immediately. You can steer between phases.

## Stack decision

- Your prompt says "React + Vite + React Router". Your Lovable project is **TanStack Start** (Vite + React 19 + TanStack Router + TanStack Query already wired). It's strictly better than React Router for this and swapping would waste a day. **I'll keep TanStack Start** — same DX, same folder feel, all your requirements met.
- Backend URL comes from `VITE_API_URL` env var (you set it to your deployed backend, e.g. `https://your-backend.onrender.com/api`). Locally it defaults to `http://localhost:5000/api`.
- Auth: JWT stored in `localStorage`, attached via Axios interceptor, refresh-token flow on 401. Socket.IO client for notifications/SOS.

## Phase 1 — Foundation + Landing + Auth (this turn)

1. **Design system** in `src/styles.css` — your exact palette (`#0F4C81`, `#17A589`, `#6C63FF`, etc.), Inter font via `<link>`, 16px radius, soft shadows, semantic tokens only.
2. **Folder structure**: `src/{api,components,pages,layouts,hooks,contexts,lib,constants,types}` + route files under `src/routes/`.
3. **API layer**: Axios client with interceptors, typed service modules for every backend resource, React Query hooks.
4. **Auth**: `AuthContext`, login / register (role picker: FamilyMember / Caregiver) / forgot / reset password pages, protected route wrapper (`_authenticated` layout).
5. **Premium landing page**: sticky glass navbar, editorial hero (not gradient blob), stats strip, services grid, categories, why-us, AI recommendation teaser, health-risk teaser, how-it-works, testimonials, FAQ, footer. Framer Motion scroll reveals.
6. Shared UI: Button variants, Card, Input, Badge, Toast (Sonner), Skeleton, Loader.

## Phase 2 — Family Dashboard (next turn)

Sidebar shell + Dashboard home (widgets + Recharts) + Patients CRUD + Caregiver directory with filters + Caregiver profile + Booking wizard (6 steps) + Booking list & timeline.

## Phase 3 — Family modules + Caregiver dashboard

Medications (calendar + reminders) + Documents (upload/preview) + Care Notes timeline + Notifications center (Socket.IO live) + Reviews + SOS emergency page + Caregiver dashboard (today's visits, availability toggle, care notes create, reviews).

## Phase 4 — Admin panel + polish

Admin stats, users management, caregiver verification, bookings oversight, complaints, services CRUD, analytics charts. Final a11y pass, mobile QA, empty states, error boundaries.

## Backend changes I may need

Mostly none — your API is complete. Two small adds I'll flag if needed:
- `GET /api/auth/me` (if not already covered by `/api/users/profile` — it is, so probably skip).
- Ensure CORS `CLIENT_URL` includes the Lovable preview domain (you set that in your backend `.env`).

## What you need to provide

- **`VITE_API_URL`** — your deployed backend URL. If you don't have one yet, I'll default to `http://localhost:5000/api` and you can change it later in `.env`.

## Deliverable this turn

A running app with: design system, API+auth plumbing, protected routing, premium landing page, and all 4 auth pages fully wired to your backend. Everything else follows in Phase 2 once you say "continue".
