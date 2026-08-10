---
slug: build-the-full-permit2-permit-management
description: Build the full Permit2 permit management application
scope: full
date: 2026-08-10
total_plans: 5
total_waves: 4
uat: 42/42
---

# Express Task: Build the Full Permit2 Permit Management Application — Summary

## Execution Overview

**Scope:** Full (multi-plan wave execution)
**Plans:** 5 across 4 waves
**Date:** 2026-08-10
**UAT:** 42/42 tests passed (5 fix cycles)
**Final commit:** 2e9a05d

### Wave Breakdown

| Wave | Plans | What it builds | Status |
|------|-------|----------------|--------|
| 1 | 01 | Database layer — PostgreSQL schema, Prisma 7 ORM, seed data, Docker Compose | ✓ Complete |
| 2 | 02 | Backend API — 10 REST endpoints, JWT auth, state machine, Zod validation | ✓ Complete |
| 3 | 03, 04 | Frontend — design system, dashboard, permit list, login, forms, detail views | ✓ Complete |
| 4 | 05 | Integration — security headers, lazy Prisma, production build, README | ✓ Complete |

---

### Per-Plan Details

**01 — Database Layer**
PostgreSQL schema with Prisma 7 ORM, User/Permit/PermitStatusHistory models, seeded with 15 realistic permits and 1 manager user, with Docker Compose for containerised deployment.
- Tasks: 2 completed
- Files created: 7 (schema.prisma, seed.ts, db.ts, .env.example, prisma.config.ts, Dockerfile, docker-compose.yml)
- Files modified: 2 (package.json, package-lock.json)
- Commits: 861e85a, 75aa6df, cf73da0

**02 — Backend API**
10 REST API routes under `/api/` — authentication (login/logout/me), permit CRUD, status lifecycle actions (approve/reject/revoke), status history — with JWT HS256 httpOnly cookies, Zod v4 validation, and state machine enforcement.
- Tasks: 4 completed
- Files created: 16
- Files modified: 2
- Duration: ~20 minutes

**03 — Frontend UI (Dashboard & Permit List)**
Design system (Tailwind tokens, shared components), dashboard with stat cards + Recharts donut chart + recent activity feed, permit list with filter/sort/pagination, TanStack Query v5 API client.
- Files created: 22
- Files modified: 2
- Duration: ~25 minutes

**04 — Frontend UI (Auth, Forms & Detail Views)**
Login page, permit creation form (react-hook-form + Zod), permit detail view, approve/reject/revoke action dialogs, TanStack Query mutations wired to the backend API.
- Tasks: 3 completed
- Files created: 20
- Files modified: 1
- Duration: ~25 minutes

**05 — Integration**
Security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy — no iframe-blocking), lazy Prisma singleton via Proxy (build-time DATABASE_URL not required), Suspense-wrapped login page for Next.js 16, expanded .env.example, repo README.
- Tasks: 3 completed
- Files changed: 5
- Duration: ~25 minutes

---

### Aggregated Stats

- **Total tasks:** 14+
- **Total files created:** ~70
- **Total waves:** 4
- **UAT result:** 42/42 passed

---

### Deviations

**01 — Prisma 7 datasource URL format change (Rule 1 auto-fix)**
Prisma 7.9.1 removed `url = env("DATABASE_URL")` from `schema.prisma`; created `prisma.config.ts` with `defineConfig` instead.

**01 — .env.example gitignore bypass (Rule 2 auto-fix)**
`.gitignore` uses `.env*` glob; used `git add -f` to force-add the example file (safe — no real secrets).

**05 — X-Frame-Options intentionally omitted**
`X-Frame-Options: DENY` and `frame-ancestors` CSP removed to allow Pivota preview iframe to function.

**05 — Lazy Prisma singleton**
Proxy-based lazy initialisation added so Next.js production build succeeds without `DATABASE_URL` at compile time.

**05 — Suspense boundary on login page**
`useSearchParams()` in Next.js 16 requires a Suspense boundary; wrapped `LoginPage` accordingly.

---

### Demo Credentials

- **URL:** http://localhost:3000
- **Email:** `manager@permit2.dev`
- **Password:** `demo1234`

### Running the App

```bash
docker compose up --build
```

The app service waits for PostgreSQL to be healthy, then runs `prisma migrate deploy && prisma db seed && node server.js`.
