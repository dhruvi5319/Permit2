# Permit2 — Permit Management System

A beautiful, modern permit management POC for small teams. Managers can create, approve, reject, and revoke permits through a polished web interface with real-time status tracking.

---

## Demo Credentials

| Field    | Value                  |
|----------|------------------------|
| Email    | `manager@permit2.dev`  |
| Password | `demo1234`             |

The seed script creates 1 manager account and 15 realistic permits across all statuses (Pending, Approved, Rejected, Revoked).

---

## Quick Start

### Prerequisites

- **Node.js** 18+ (LTS)
- **PostgreSQL** 15+ (local install or Docker)
- **npm** 9+

### 1. Clone & Install

```bash
git clone <repo-url>
cd Permit2/permit2
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set the required values:

| Variable         | Description                                                  | Example                                         |
|------------------|--------------------------------------------------------------|-------------------------------------------------|
| `DATABASE_URL`   | PostgreSQL connection string                                  | `postgresql://user:pass@localhost:5432/permit2` |
| `JWT_SECRET`     | Random string ≥ 32 chars (generate: `openssl rand -base64 32`) | `super-secret-key-min-32-chars-long`           |
| `JWT_EXPIRES_IN` | Token expiry (optional, default: `1h`)                        | `1h`, `30m`, `7d`                               |
| `NODE_ENV`       | Environment mode                                              | `development` or `production`                   |

### 3. Set Up the Database

```bash
# Run migrations (creates tables)
npm run db:migrate

# Seed demo data (1 manager + 15 permits)
npm run db:seed
```

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with the demo credentials above.

---

## Running in Production / Docker

Bind the server to all interfaces (required for container environments):

```bash
HOST=0.0.0.0 npm run start
```

Or add `HOST=0.0.0.0` to your `.env` file.

---

## Available Scripts

| Script               | Description                                               |
|----------------------|-----------------------------------------------------------|
| `npm run dev`        | Start Next.js dev server with hot-reload (port 3000)      |
| `npm run build`      | Production build — exits non-zero on TypeScript errors    |
| `npm run start`      | Start production server (run `build` first)               |
| `npm run lint`       | ESLint across the project                                 |
| `npm run typecheck`  | TypeScript type-check without emitting files              |
| `npm run db:migrate` | Run Prisma migrations against the configured database     |
| `npm run db:push`    | Push schema changes without migration history (dev only)  |
| `npm run db:seed`    | Seed demo data (idempotent — safe to re-run)              |
| `npm run db:studio`  | Open Prisma Studio (visual DB browser) at port 5555       |

---

## Project Structure

```
permit2/                     # Next.js 16 App Router project
├── app/
│   ├── (auth)/login/        # Login page (unauthenticated route group)
│   ├── (protected)/         # Auth-guarded route group
│   │   ├── dashboard/       # F1: Dashboard — stats + chart + recent activity
│   │   └── permits/
│   │       ├── page.tsx     # F3/F4: Permit list with search/filter/sort
│   │       ├── new/         # F2: Create new permit form
│   │       └── [id]/        # F5/F6: Permit detail + lifecycle actions
│   └── api/
│       ├── auth/            # POST /login, POST /logout, GET /me
│       └── permits/         # CRUD + stats + approve/reject/revoke
├── components/
│   ├── dashboard/           # StatCard, StatsRow, StatusDonutChart, RecentActivityFeed
│   ├── layout/              # NavBar, Breadcrumb
│   ├── permits/             # PermitTable, PermitForm, PermitDetailHeader, ActionDialog
│   ├── providers/           # QueryProvider, LayoutShell
│   ├── shared/              # StatusBadge, Skeleton, EmptyState, Pagination, ErrorState
│   └── ui/                  # StatusBadge, Toast, Skeleton
├── lib/
│   ├── auth.ts              # JWT sign/verify/requireAuth
│   ├── db.ts                # Prisma client singleton
│   ├── permit-service.ts    # State machine + permit CRUD business logic
│   ├── api-client.ts        # Typed fetch wrapper for all API endpoints
│   ├── hooks/               # TanStack Query hooks (usePermits, usePermit, mutations)
│   ├── types/               # Shared TypeScript types (PermitSummary, PermitDetail, etc.)
│   └── validations/         # Zod schemas for API input validation
├── middleware.ts             # JWT route guard: redirects unauthenticated users to /login
├── prisma/
│   ├── schema.prisma         # User, Permit, PermitStatusHistory models
│   └── seed.ts              # Demo data seeder
└── next.config.ts           # Security headers (CSP, HSTS, etc.)
```

---

## Key Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Full-stack framework | Next.js 16 (App Router) | Single repo, file-based routing, API routes co-located with UI |
| Database | PostgreSQL + Prisma ORM | Type-safe queries, migrations, easy schema evolution |
| Authentication | JWT in httpOnly cookie | Stateless, secure against XSS, works with Next.js middleware |
| UI styling | Tailwind CSS v4 | Utility-first, no runtime overhead |
| Data fetching | TanStack Query (React Query) | Automatic cache invalidation after lifecycle mutations |
| Form validation | React Hook Form + Zod | Type-safe schemas shared between API and UI |
| State machine | Permit service layer | PENDING→APPROVED/REJECTED, APPROVED→REVOKED enforced server-side |

---

## Permit Lifecycle

```
         ┌─────────┐
    ┌───▶│ PENDING │───▶ APPROVED ───▶ REVOKED
    │    └─────────┘
    │         └──────▶ REJECTED
    │
CREATE (always starts PENDING)
```

Terminal states: REJECTED, REVOKED (no further transitions allowed).

---

## Security Notes

- Passwords stored as bcrypt hashes (cost factor 10)
- JWT signed with HS256, validated in Next.js Edge middleware on every request
- `httpOnly` cookie prevents XSS-based token theft
- Security headers applied globally via `next.config.ts` (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- X-Frame-Options intentionally omitted for Pivota preview iframe compatibility
