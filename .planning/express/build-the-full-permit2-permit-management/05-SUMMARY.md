---
phase: build-the-full-permit2-permit-management
plan: "05"
subsystem: integration
tags: [security-headers, build-verification, next-config, env, readme, typescript-fixes]

dependency_graph:
  requires:
    - plan: "01"
      artifact: "permit2/prisma/seed.ts"
    - plan: "02"
      artifact: "permit2/app/api/**"
    - plan: "03"
      artifact: "permit2/app/(protected)/dashboard/page.tsx"
    - plan: "04"
      artifact: "permit2/app/(auth)/login/page.tsx"
  provides:
    - "permit2/next.config.ts — security headers + iframe-compatible configuration"
    - "permit2/.env.example — comprehensive env var documentation"
    - "README.md — setup guide, demo credentials, scripts"
    - "Zero-error production build (npm run build exit 0)"
  affects:
    - "All routes (security headers applied globally)"
    - "Login page (Suspense boundary fix)"
    - "DB layer (lazy Prisma initialization)"

tech_stack:
  added: []
  patterns:
    - "Next.js headers() API for global security headers"
    - "Prisma lazy initialization via Proxy for build-time compatibility"
    - "React Suspense boundary for useSearchParams() in App Router"

key_files:
  created:
    - "README.md (repo root)"
  modified:
    - "permit2/next.config.ts — security headers configuration"
    - "permit2/.env.example — expanded with HOST, PORT, documented comments"
    - "permit2/lib/db.ts — lazy Prisma singleton via Proxy"
    - "permit2/app/(auth)/login/page.tsx — Suspense boundary wrapper"

decisions:
  - "Omit X-Frame-Options DENY intentionally for Pivota preview iframe compatibility"
  - "Use Proxy-based lazy Prisma singleton so build doesn't require DATABASE_URL at compile time"
  - "Wrap LoginPage with Suspense boundary to satisfy Next.js 16 useSearchParams() requirements"
  - "README.md at repo root (not inside permit2/) per standard monorepo conventions"

metrics:
  duration: "~25 minutes"
  completed: "2026-08-09"
  tasks_completed: 3
  files_changed: 5
---

# Phase build-the-full-permit2-permit-management Plan 05: Integration — Security Headers, ENV, README, Build Verification Summary

**One-liner:** Production build passes with security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) configured without iframe-blocking, backed by lazy Prisma initialization and Suspense-wrapped login page.

---

## Build Result

**Exit code:** 0  
**TypeScript:** 0 errors (`tsc --noEmit` clean)

**Pages compiled:**
```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/auth/login
├ ƒ /api/auth/logout
├ ƒ /api/auth/me
├ ƒ /api/permits
├ ƒ /api/permits/[id]
├ ƒ /api/permits/[id]/approve
├ ƒ /api/permits/[id]/reject
├ ƒ /api/permits/[id]/revoke
├ ƒ /api/permits/stats
├ ƒ /dashboard
├ ○ /login
├ ƒ /permits
├ ƒ /permits/[id]
└ ƒ /permits/new
```

All 15 routes compiled successfully. ○ = static, ƒ = dynamic (server-rendered on demand).

---

## Security Headers Applied

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'` |

**Intentionally omitted:**
- `X-Frame-Options: DENY` — Pivota preview embeds the app in an iframe
- `frame-ancestors` from CSP — same reason

---

## Missing Packages Installed

None — all packages (`date-fns`, `recharts`, `react-hook-form`, `@hookform/resolvers`, `lucide-react`, `@tanstack/react-query`) were already installed from prior waves.

---

## Build Issues Fixed

### Issue 1: Prisma client initialization at build time

**Problem:** `lib/db.ts` threw `Error: DATABASE_URL environment variable is not set` when Next.js tried to evaluate the module during static page generation. This caused all API routes to fail during `npm run build`.

**Fix:** Replaced the eager `createPrismaClient()` call with a `Proxy`-based lazy singleton. The actual `PrismaClient` is only instantiated when the first database operation is called at runtime, not when the module is imported.

**Files:** `permit2/lib/db.ts`

### Issue 2: `useSearchParams()` without Suspense boundary in login page

**Problem:** Next.js 16 App Router requires components that call `useSearchParams()` to be wrapped in a `<Suspense>` boundary when the page is statically pre-rendered. Without it, `npm run build` fails with "useSearchParams() should be wrapped in a suspense boundary at page /login".

**Fix:** Extracted the `LoginForm` component (which uses `useSearchParams`) from `LoginPage`. The `LoginPage` default export now renders `LoginForm` inside `<Suspense>` with a loading skeleton fallback.

**Files:** `permit2/app/(auth)/login/page.tsx`

---

## Nav Links Verified

All nav destinations have real page files:

| Route | File | Status |
|---|---|---|
| `/login` | `app/(auth)/login/page.tsx` | ✅ ROUTE_LOGIN_OK |
| `/dashboard` | `app/(protected)/dashboard/page.tsx` | ✅ ROUTE_DASHBOARD_OK |
| `/permits` | `app/(protected)/permits/page.tsx` | ✅ ROUTE_PERMITS_OK |
| `/permits/new` | `app/(protected)/permits/new/page.tsx` | ✅ ROUTE_NEW_OK |
| `/permits/[id]` | `app/(protected)/permits/[id]/page.tsx` | ✅ ROUTE_DETAIL_OK |

NavBar links (`/dashboard`, `/permits`) resolve to existing pages.  
Stat card links (`/permits?status=PENDING`, `/permits?status=APPROVED`, etc.) resolve to the permits list page with filter params.  
Breadcrumb links (`/dashboard`, `/permits`) resolve to existing pages.

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Prisma initialization throws at build time**
- **Found during:** Task 3 (Build verification)
- **Issue:** `lib/db.ts` called `createPrismaClient()` at module load time, throwing when `DATABASE_URL` was absent during `next build`
- **Fix:** Wrapped in `Proxy`-based lazy singleton — client only created on first actual use
- **Files modified:** `permit2/lib/db.ts`
- **Commit:** `89bb7cd`

**2. [Rule 1 - Bug] Login page useSearchParams() missing Suspense boundary**
- **Found during:** Task 3 (Build verification) — `next build` error during static page generation
- **Issue:** `useSearchParams()` in a statically-rendered page without `<Suspense>` boundary causes build failure in Next.js 16
- **Fix:** Split `LoginPage` into wrapper (`LoginPage`) + inner form (`LoginForm`); wrapped with `<Suspense>`
- **Files modified:** `permit2/app/(auth)/login/page.tsx`
- **Commit:** `89bb7cd`

---

## Known Stubs

None found. All handlers implement real business logic. No hardcoded responses, placeholder returns, or TODO/FIXME comments in changed files.

---

## Commits

| Task | Commit | Description |
|---|---|---|
| Task 1 | `2d2ed1d` | feat: security headers in next.config.ts + .env.example docs |
| Task 2 | `db5bd1d` | docs: add README.md with setup guide and demo credentials |
| Task 3 | `89bb7cd` | fix: build errors — lazy Prisma init + Suspense boundary for login |

---

## Final E2E Flow Confirmation

Route structure confirms full flow is wired:
1. `/login` → `LoginPage` → POSTs to `/api/auth/login` → sets httpOnly JWT cookie
2. Middleware (`middleware.ts`) guards all `(protected)` routes → redirects to `/login` if no valid token
3. `/dashboard` → shows stat cards (link to `/permits?status=X`) + donut chart + recent activity
4. `/permits` → filterable/sortable permit list → each row links to `/permits/[id]`
5. `/permits/new` → `PermitForm` → POSTs to `/api/permits` → redirects to `/permits/[id]`
6. `/permits/[id]` → detail view + action buttons → PATCH to approve/reject/revoke endpoints
7. Logout → POSTs to `/api/auth/logout` → clears cookie → redirects to `/login`

---

## Self-Check: PASSED

- ✅ All 5 page routes exist on disk
- ✅ `next.config.ts` has security headers, no X-Frame-Options DENY
- ✅ `.env.example` documents DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV, HOST, PORT
- ✅ `README.md` at repo root with `manager@permit2.dev` / `demo1234` credentials
- ✅ `npm run build` exits 0 — BUILD_EXIT:0 confirmed
- ✅ TypeScript: `tsc --noEmit` exits 0 — TSC_EXIT:0 confirmed
- ✅ No blocking stubs found in changed files
- ✅ All commits verified: 2d2ed1d, db5bd1d, 89bb7cd
