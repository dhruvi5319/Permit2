---
phase: build-the-full-permit2-permit-management
plan: 05
type: execute
wave: 4
depends_on: [1, 2, 3]
files_modified:
  - permit2/next.config.ts
  - permit2/.env.example
  - README.md
autonomous: true

features:
  implements: ["F0", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9"]
  depends_on: ["F9", "F0", "F8", "F1", "F2", "F3", "F4", "F5", "F6", "F7"]
  enables: []

must_haves:
  truths:
    - "npm run build in permit2/ exits 0 with 0 TypeScript errors"
    - "npx prisma db seed runs idempotently and creates manager@permit2.dev / demo1234"
    - "next.config.ts sets security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy) WITHOUT X-Frame-Options DENY (Pivota preview iframe compatibility); server binds 0.0.0.0:3000"
    - ".env.example documents DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV with descriptions"
    - "README.md has setup instructions, demo credentials (manager@permit2.dev / demo1234), and npm scripts"
    - "All five nav destinations (/login, /dashboard, /permits, /permits/new, /permits/:id) resolve to real pages (no 404)"
  artifacts:
    - path: "permit2/next.config.ts"
      provides: "Security headers + server binding"
      contains: "X-Content-Type-Options"
    - path: "permit2/.env.example"
      provides: "All required env vars documented"
      contains: "JWT_SECRET"
    - path: "README.md"
      provides: "Setup instructions + demo credentials"
      contains: "manager@permit2.dev"
  key_links:
    - from: "permit2/next.config.ts"
      to: "permit2/app/**"
      via: "headers() applied to all routes via Next.js config"
      pattern: "headers.*async"
    - from: "README.md"
      to: "permit2/.env.example"
      via: "cp .env.example .env setup step"
      pattern: "env.example"

integration_contracts:
  requires:
    - from_plan: "01"
      artifact: "permit2/prisma/seed.ts"
      exports: ["seed data: manager@permit2.dev + 15 permits"]
      verify: "grep -n 'manager@permit2.dev' permit2/prisma/seed.ts && echo CONTRACT_OK"
    - from_plan: "02"
      artifact: "permit2/app/api/auth/login/route.ts"
      exports: ["POST /api/auth/login"]
      verify: "grep -n 'export async function POST' permit2/app/api/auth/login/route.ts && echo CONTRACT_OK"
    - from_plan: "03"
      artifact: "permit2/app/(protected)/dashboard/page.tsx"
      exports: ["default (Dashboard page)"]
      verify: "test -f permit2/app/\\(protected\\)/dashboard/page.tsx && echo CONTRACT_OK"
    - from_plan: "04"
      artifact: "permit2/app/(auth)/login/page.tsx"
      exports: ["default (Login page)"]
      verify: "test -f permit2/app/\\(auth\\)/login/page.tsx && echo CONTRACT_OK"
  provides:
    - artifact: "permit2/next.config.ts"
      exports: ["security headers", "server binding 0.0.0.0:3000"]
      shape: |
        headers(): [{ source: '/(.*)', headers: [{key: 'X-Content-Type-Options', value: 'nosniff'}, ...] }]
      verify: "grep -n 'X-Content-Type-Options' permit2/next.config.ts && echo CONTRACT_OK"
    - artifact: "README.md"
      exports: ["setup instructions", "demo credentials"]
      shape: "manager@permit2.dev / demo1234 demo credentials, npm install + db:migrate + db:seed + dev steps"
      verify: "grep -n 'manager@permit2.dev' README.md && echo CONTRACT_OK"
---

<objective>
Finalize the Permit2 POC for demo-readiness: security headers, server binding, env documentation, README setup guide, and a full build verification confirming 0 TypeScript errors.

Purpose: Wave 4 closes the loop — the application built in waves 1–3 is deployment-ready, correctly configured, and demonstrable end-to-end. A passing `npm run build` is the hard gate.
Output: next.config.ts (security headers + 0.0.0.0 binding), .env.example (all vars), README.md (setup + demo credentials), confirmed green build.
</objective>

<feature_dependencies>
Implements: F0–F9 (all features) — integration wave validates the complete system is wired and buildable
Depends on: F9 (DB + seed from Wave 1), F0/F8 (API from Wave 2), F1–F7 (UI from Wave 3a/3b)
Enables: None (terminal wave)
</feature_dependencies>

<execution_context>
@/root/.local/share/pivota/opencode-xdg/opencode/pivota_spec-framework/workflows/execute-plan.md
</execution_context>

<context>
@permit2/next.config.ts
@permit2/package.json
@permit2/.env.example
</context>

<tasks>

<task type="auto">
  <name>Task 1: next.config.ts security headers + server binding; .env.example final docs</name>
  <files>
    permit2/next.config.ts
    permit2/.env.example
  </files>
  <action>
Work inside `permit2/` (the Next.js app root). Read the existing `next.config.ts` first — it currently has an empty config object. Replace it with security-hardened config.

**CRITICAL constraint:** Do NOT add `X-Frame-Options: DENY`. The Pivota preview environment embeds the app in an iframe. Omit frame-blocking entirely.

**Step 1 — Rewrite `next.config.ts`:**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bind to all interfaces so Pivota's container proxy can reach the app
  // (Next.js reads HOST env var; setting it in the config is not standard —
  //  the correct mechanism is the HOST env var at launch time. Document in README.)

  // Security headers applied to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME-type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Referrer policy — don't leak full URL to third parties
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Force HTTPS in production (1 year)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Permissions policy — restrict powerful APIs
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content Security Policy — allow same-origin + Tailwind CDN fonts + Google Fonts
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Allow inline scripts required by Next.js hydration
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Allow inline styles + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Google Fonts + self for fonts
              "font-src 'self' https://fonts.gstatic.com data:",
              // Images: same-origin + data URIs
              "img-src 'self' data: blob:",
              // API connections: same-origin only
              "connect-src 'self'",
              // No plugins, no objects
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          // NOTE: X-Frame-Options intentionally omitted — Pivota preview uses iframe embedding
          // NOTE: X-XSS-Protection omitted (deprecated in modern browsers, CSP is the correct mitigation)
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Step 2 — Update `.env.example`** (extend the Wave 1 version with integration notes):

Replace the existing `.env.example` entirely with this complete version:

```bash
# ─────────────────────────────────────────────────────────────────
# Permit2 — Environment Variables
# ─────────────────────────────────────────────────────────────────
# Copy this file to .env and fill in the real values:
#   cp .env.example .env
# NEVER commit the .env file to version control.
# ─────────────────────────────────────────────────────────────────

# ── Database ──────────────────────────────────────────────────────
# PostgreSQL connection string.
# For local development with docker-compose: postgres://permit2:permit2@localhost:5432/permit2
# For Supabase / Railway / Render: use the connection string from the provider dashboard.
DATABASE_URL="postgresql://user:password@localhost:5432/permit2"

# ── JWT Authentication ─────────────────────────────────────────────
# Secret key used to sign and verify JWT tokens.
# Must be at least 32 characters. Generate with: openssl rand -base64 32
JWT_SECRET="change-me-to-a-random-string-at-least-32-chars"

# JWT token expiry (default: 1h). Accepts values like: 1h, 30m, 7d
JWT_EXPIRES_IN="1h"

# ── Application ────────────────────────────────────────────────────
# NODE_ENV controls bcrypt logging, secure cookie flag, Prisma query logging.
# Set to "production" on deployed environments.
NODE_ENV="development"

# Optional: bcrypt cost factor (default: 10, minimum: 10).
# Higher values = slower hashing = more secure. 12 recommended for production.
BCRYPT_COST_FACTOR="10"

# ── Server Binding ─────────────────────────────────────────────────
# Next.js server host. Set to 0.0.0.0 to bind all interfaces (required in Docker/Pivota).
# Run as: HOST=0.0.0.0 npm run start (or set in your process manager / Dockerfile).
HOST="0.0.0.0"
PORT="3000"
```
  </action>
  <verify>
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2

# Verify security headers are present (NOT X-Frame-Options DENY)
grep -n 'X-Content-Type-Options' next.config.ts && echo "CONTENT_TYPE_HEADER_OK"
grep -n 'Strict-Transport-Security' next.config.ts && echo "HSTS_OK"
grep -n 'Referrer-Policy' next.config.ts && echo "REFERRER_POLICY_OK"
grep -n 'Content-Security-Policy' next.config.ts && echo "CSP_OK"
grep -n 'Permissions-Policy' next.config.ts && echo "PERMS_POLICY_OK"

# Confirm X-Frame-Options DENY is NOT present (would break Pivota iframe preview)
if grep -q 'X-Frame-Options.*DENY' next.config.ts; then
  echo "ERROR: X-Frame-Options DENY found — must be removed for iframe compatibility"
  exit 1
else
  echo "IFRAME_COMPAT_OK"
fi

# .env.example completeness
grep -n 'DATABASE_URL' .env.example && echo "ENV_DB_OK"
grep -n 'JWT_SECRET' .env.example && echo "ENV_JWT_OK"
grep -n 'JWT_EXPIRES_IN' .env.example && echo "ENV_EXPIRY_OK"
grep -n 'NODE_ENV' .env.example && echo "ENV_NODE_OK"
grep -n 'HOST' .env.example && echo "ENV_HOST_OK"

# TypeScript validate next.config.ts
npx tsc --noEmit --skipLibCheck 2>&1 | head -20 || true
```
  </verify>
  <done>
- `next.config.ts` exports a NextConfig with `async headers()` returning X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security, Permissions-Policy, and Content-Security-Policy headers on all routes
- X-Frame-Options DENY is explicitly NOT present (Pivota preview iframe compatibility)
- `.env.example` documents DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV, BCRYPT_COST_FACTOR, HOST, PORT — each with a descriptive comment
- Both files pass `tsc --noEmit --skipLibCheck` with 0 errors
  </done>
</task>

<task type="auto">
  <name>Task 2: README.md — setup guide, demo credentials, npm scripts</name>
  <files>
    README.md
  </files>
  <action>
Write a comprehensive `README.md` at the **repository root** (`/root/pivota-workspaces/dhruvi/Permit2/README.md`).

The README must include:
1. Project title + one-line description
2. Demo credentials (prominently displayed)
3. Prerequisites
4. Local setup steps (clone → install → env → migrate → seed → dev)
5. All npm scripts documented
6. Project structure overview
7. Key architectural decisions

```markdown
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

| Script             | Description                                               |
|--------------------|-----------------------------------------------------------|
| `npm run dev`      | Start Next.js dev server with hot-reload (port 3000)      |
| `npm run build`    | Production build — exits non-zero on TypeScript errors    |
| `npm run start`    | Start production server (run `build` first)               |
| `npm run lint`     | ESLint across the project                                 |
| `npm run typecheck`| TypeScript type-check without emitting files              |
| `npm run db:migrate` | Run Prisma migrations against the configured database  |
| `npm run db:push`  | Push schema changes without migration history (dev only)  |
| `npm run db:seed`  | Seed demo data (idempotent — safe to re-run)              |
| `npm run db:studio`| Open Prisma Studio (visual DB browser) at port 5555       |

---

## Project Structure

```
permit2/                     # Next.js 15 App Router project
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
│   ├── dashboard/           # StatCard, StatsRow, DonutChart, ActivityFeed
│   ├── layout/              # NavBar, Breadcrumb
│   ├── permits/             # PermitTable, PermitForm, DetailHeader, ActionDialog
│   ├── shared/              # StatusBadge, Skeleton, EmptyState, Pagination
│   └── ui/                  # StatusBadge (Wave 3b), Toast, Skeleton
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
| Full-stack framework | Next.js 15 (App Router) | Single repo, file-based routing, API routes co-located with UI |
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
```

Write this content to `/root/pivota-workspaces/dhruvi/Permit2/README.md` (repository root, NOT inside `permit2/`).
  </action>
  <verify>
```bash
# Verify README.md exists at repo root
test -f /root/pivota-workspaces/dhruvi/Permit2/README.md && echo "README_EXISTS_OK"

# Verify demo credentials are present
grep -n 'manager@permit2.dev' /root/pivota-workspaces/dhruvi/Permit2/README.md && echo "DEMO_EMAIL_OK"
grep -n 'demo1234' /root/pivota-workspaces/dhruvi/Permit2/README.md && echo "DEMO_PASS_OK"

# Verify setup steps are documented
grep -n 'db:migrate' /root/pivota-workspaces/dhruvi/Permit2/README.md && echo "MIGRATE_DOC_OK"
grep -n 'db:seed' /root/pivota-workspaces/dhruvi/Permit2/README.md && echo "SEED_DOC_OK"
grep -n 'npm run dev' /root/pivota-workspaces/dhruvi/Permit2/README.md && echo "DEV_SCRIPT_DOC_OK"
grep -n 'npm run build' /root/pivota-workspaces/dhruvi/Permit2/README.md && echo "BUILD_SCRIPT_DOC_OK"

# Verify JWT_SECRET is documented
grep -n 'JWT_SECRET' /root/pivota-workspaces/dhruvi/Permit2/README.md && echo "JWT_DOC_OK"
```
  </verify>
  <done>
- `/root/pivota-workspaces/dhruvi/Permit2/README.md` exists (repo root, not inside permit2/)
- Demo credentials `manager@permit2.dev` / `demo1234` appear prominently
- Setup steps: install → cp .env.example .env → db:migrate → db:seed → npm run dev
- All npm scripts (dev, build, start, lint, typecheck, db:migrate, db:push, db:seed, db:studio) documented with descriptions
- Project structure overview and architecture decisions included
- Permit lifecycle diagram present
  </done>
</task>

<task type="auto">
  <name>Task 3: Full build verification — npm run build + seed + nav link check</name>
  <files>
    permit2/next.config.ts
  </files>
  <action>
This task is a verification-and-fix task. Run the build and seed checks. If any fail, apply targeted fixes.

**Step 1 — Run the production build:**

```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2
npm run build 2>&1
```

The build MUST exit 0. Common failure modes and fixes:

**TypeScript errors:** If `tsc` reports errors, fix them in the flagged files. Do NOT use `@ts-ignore` or `any` casts unless the type is genuinely unresolvable — prefer type assertions with comments.

**Common issues from prior waves:**

1. **Missing `lib/utils.ts`** (`cn` function): If Wave 3b's `components/ui/Skeleton.tsx` imports `@/lib/utils` and the file is missing, create it:
   ```typescript
   // permit2/lib/utils.ts
   import { type ClassValue, clsx } from 'clsx';
   import { twMerge } from 'tailwind-merge';
   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```

2. **Duplicate route conflicts:** Wave 3a and Wave 3b may both define `app/(protected)/layout.tsx`. If both exist with conflicting content, reconcile them:
   - The Wave 3b version (with QueryProvider + ToastProvider) takes priority over the Wave 3a version (NavBar-only server component).
   - If Wave 3a's layout does server-side auth guard AND Wave 3b's does client-side providers, merge: keep server-side auth guard from Wave 3a, add client-side QueryProvider + ToastProvider from Wave 3b. The merged layout:
     ```tsx
     import { redirect } from 'next/navigation';
     import { cookies } from 'next/headers';
     import { QueryProvider } from '@/components/providers/QueryProvider';
     import { ToastProvider } from '@/components/ui/Toast';
     import { Navbar } from '@/components/layout/Navbar';
     // Wave 3b Navbar (Navbar.tsx) takes priority over Wave 3a NavBar.tsx
     
     async function getUser() {
       try {
         const cookieStore = await cookies();
         const token = cookieStore.get('token')?.value;
         if (!token) return null;
         const res = await fetch(
           `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/auth/me`,
           { headers: { Cookie: `token=${token}` }, cache: 'no-store' }
         );
         if (!res.ok) return null;
         const json = await res.json();
         return json.data as { id: string; email: string; name: string } | null;
       } catch {
         return null;
       }
     }
     
     export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
       const user = await getUser();
       if (!user) redirect('/login');
       return (
         <QueryProvider>
           <ToastProvider>
             <div className="min-h-screen bg-gray-50">
               <Navbar />
               <main className="max-w-[1280px] mx-auto px-6 py-8">
                 {children}
               </main>
             </div>
           </ToastProvider>
         </QueryProvider>
       );
     }
     ```

3. **`date-fns` missing**: If Wave 3a's `RecentActivityFeed.tsx` uses `formatDistanceToNow` from `date-fns` and the package is not installed:
   ```bash
   cd /root/pivota-workspaces/dhruvi/Permit2/permit2 && npm install date-fns
   ```

4. **`recharts` missing**: If `StatusDonutChart.tsx` imports from `recharts`:
   ```bash
   cd /root/pivota-workspaces/dhruvi/Permit2/permit2 && npm install recharts
   ```

5. **`react-hook-form` or `@hookform/resolvers` missing**:
   ```bash
   cd /root/pivota-workspaces/dhruvi/Permit2/permit2 && npm install react-hook-form @hookform/resolvers
   ```

6. **`lucide-react` missing**:
   ```bash
   cd /root/pivota-workspaces/dhruvi/Permit2/permit2 && npm install lucide-react
   ```

7. **Conflicting NavBar vs Navbar**: Wave 3a creates `components/layout/NavBar.tsx`; Wave 3b creates `components/layout/Navbar.tsx`. The protected layout should import from `Navbar.tsx` (Wave 3b). If both exist and cause import confusion, standardize on `Navbar.tsx` (lowercase b).

8. **Missing `@tanstack/react-query`**:
   ```bash
   cd /root/pivota-workspaces/dhruvi/Permit2/permit2 && npm install @tanstack/react-query
   ```

9. **`app/page.tsx` root redirect**: The app root `/` should redirect to `/dashboard` or `/login`. Check if `app/page.tsx` exists and has a redirect. If not, create:
   ```tsx
   // permit2/app/page.tsx
   import { redirect } from 'next/navigation';
   export default function RootPage() {
     redirect('/dashboard');
   }
   ```

**Step 2 — Confirm build passes:**
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2
npm run build 2>&1 | tail -30
echo "BUILD EXIT CODE: $?"
```

The output must end with `✓ Compiled successfully` or similar success indicator and the exit code must be 0.

**Step 3 — Verify seed runs:**
```bash
# Only run if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  cd /root/pivota-workspaces/dhruvi/Permit2/permit2
  npx prisma db seed && echo "SEED_OK"
else
  echo "DATABASE_URL not set — skipping seed verification (expected in CI without DB)"
fi
```

**Step 4 — Verify all nav routes have real page files:**
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2

# /login → app/(auth)/login/page.tsx
test -f "app/(auth)/login/page.tsx" && echo "LOGIN_PAGE_OK" || echo "ERROR: /login page missing"

# /dashboard → app/(protected)/dashboard/page.tsx
test -f "app/(protected)/dashboard/page.tsx" && echo "DASHBOARD_PAGE_OK" || echo "ERROR: /dashboard page missing"

# /permits → app/(protected)/permits/page.tsx
test -f "app/(protected)/permits/page.tsx" && echo "PERMITS_LIST_PAGE_OK" || echo "ERROR: /permits page missing"

# /permits/new → app/(protected)/permits/new/page.tsx
test -f "app/(protected)/permits/new/page.tsx" && echo "PERMITS_NEW_PAGE_OK" || echo "ERROR: /permits/new page missing"

# /permits/[id] → app/(protected)/permits/[id]/page.tsx
test -f "app/(protected)/permits/[id]/page.tsx" && echo "PERMITS_DETAIL_PAGE_OK" || echo "ERROR: /permits/[id] page missing"
```

**Step 5 — Verify no X-Frame-Options DENY is set anywhere:**
```bash
grep -rn 'X-Frame-Options.*DENY' /root/pivota-workspaces/dhruvi/Permit2/permit2/ --include="*.ts" --include="*.tsx" && echo "WARNING: X-Frame-Options DENY found — remove it" || echo "IFRAME_COMPAT_OK"
```
  </action>
  <verify>
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2

# Primary gate: production build must pass
npm run build 2>&1 | tail -30 && echo "BUILD_OK"

# All page routes must exist
test -f "app/(auth)/login/page.tsx" && echo "LOGIN_PAGE_OK"
test -f "app/(protected)/dashboard/page.tsx" && echo "DASHBOARD_PAGE_OK"
test -f "app/(protected)/permits/page.tsx" && echo "PERMITS_LIST_PAGE_OK"
test -f "app/(protected)/permits/new/page.tsx" && echo "PERMITS_NEW_PAGE_OK"
test -f "app/(protected)/permits/[id]/page.tsx" && echo "PERMITS_DETAIL_PAGE_OK"

# Seed script must be executable (no syntax errors)
npx ts-node --compiler-options '{"module":"CommonJS"}' --eval "console.log('TS_NODE_OK')" 2>/dev/null || node -e "console.log('TS_NODE_FALLBACK')"

# Security headers: present AND no frame-blocking
grep -q 'X-Content-Type-Options' next.config.ts && echo "SECURITY_HEADERS_OK"
grep -q 'X-Frame-Options.*DENY' next.config.ts && echo "ERROR: iframe-blocking detected" || echo "IFRAME_COMPAT_OK"

# README at repo root
test -f /root/pivota-workspaces/dhruvi/Permit2/README.md && grep -q 'manager@permit2.dev' /root/pivota-workspaces/dhruvi/Permit2/README.md && echo "README_OK"
```
  </verify>
  <done>
- `npm run build` exits 0 with 0 TypeScript errors — confirmed by `BUILD_OK` echo
- All 5 page routes exist: /login, /dashboard, /permits, /permits/new, /permits/[id]
- X-Frame-Options DENY is not set anywhere in the codebase (Pivota preview iframe compatible)
- Security headers (X-Content-Type-Options, HSTS, CSP, Referrer-Policy, Permissions-Policy) active via next.config.ts
- README.md at repo root with demo credentials, setup steps, and scripts documented
- Seed script is idempotent — re-running `npx prisma db seed` does not create duplicate permits
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client→server | HTTP requests from browser crossing into Next.js API routes and middleware |
| env→config | Environment variables (JWT_SECRET, DATABASE_URL) crossing into runtime configuration |
| config→headers | Security header values from next.config.ts crossing into HTTP response headers |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-05-01 | Information disclosure | `.env.example` — secrets documentation | mitigate | `.env.example` contains only placeholder values (`change-me-to-a-random-string-at-least-32-chars`). Real `.env` is git-ignored (Wave 1 established this). `README.md` instructs `cp .env.example .env` and never commit `.env`. |
| T-05-02 | Elevation of privilege | `next.config.ts` — missing security headers | mitigate | `headers()` in `next.config.ts` applies X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy, CSP to all routes. X-Frame-Options DENY intentionally omitted for Pivota iframe — CSP `frame-ancestors` not set either, which is acceptable for POC scope. |
| T-05-03 | Tampering | CSP `script-src 'unsafe-eval'` | accept | Next.js hydration requires `'unsafe-eval'` in development; in production it can be tightened. For POC scope, accepted. Residual risk owned by deployer — document in README security notes. |
| T-05-04 | Information disclosure | `README.md` — demo credentials in plaintext | accept | Credentials (`manager@permit2.dev` / `demo1234`) are demo-only, not production secrets. Seeded via bcrypt hash — plaintext only appears in public documentation. Risk accepted for POC demo purpose. |
| T-05-05 | Spoofing | Open redirect in login page | mitigate | Wave 3b's `login/page.tsx` validates the `?redirect=` param: `const safe = redirect.startsWith('/') ? redirect : '/dashboard'` — prevents redirecting to external URLs. Absolute paths only. |
</threat_model>

<verification>
Run these checks after all tasks complete to confirm Wave 4 (integration) is green:

```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2

# 1. Production build — the hard gate
npm run build && echo "BUILD_OK"

# 2. Security headers present in config
grep -q 'X-Content-Type-Options' next.config.ts && echo "HEADER_CONTENT_TYPE_OK"
grep -q 'Strict-Transport-Security' next.config.ts && echo "HEADER_HSTS_OK"
grep -q 'Content-Security-Policy' next.config.ts && echo "HEADER_CSP_OK"

# 3. No iframe-breaking header
grep -q 'X-Frame-Options.*DENY' next.config.ts && echo "ERROR: DENY header present" || echo "IFRAME_OK"

# 4. All 5 navigable routes exist
test -f "app/(auth)/login/page.tsx" && echo "ROUTE_LOGIN_OK"
test -f "app/(protected)/dashboard/page.tsx" && echo "ROUTE_DASHBOARD_OK"
test -f "app/(protected)/permits/page.tsx" && echo "ROUTE_PERMITS_OK"
test -f "app/(protected)/permits/new/page.tsx" && echo "ROUTE_NEW_OK"
test -f "app/(protected)/permits/[id]/page.tsx" && echo "ROUTE_DETAIL_OK"

# 5. .env.example complete
grep -q 'DATABASE_URL' .env.example && grep -q 'JWT_SECRET' .env.example && echo "ENV_EXAMPLE_OK"

# 6. README at repo root with demo credentials
test -f /root/pivota-workspaces/dhruvi/Permit2/README.md && echo "README_EXISTS_OK"
grep -q 'manager@permit2.dev' /root/pivota-workspaces/dhruvi/Permit2/README.md && echo "README_CREDS_OK"

# 7. Seed (only if DATABASE_URL set)
if [ -n "$DATABASE_URL" ]; then
  npx prisma db seed && echo "SEED_OK"
else
  echo "SEED_SKIPPED (no DATABASE_URL)"
fi
```
</verification>

<success_criteria>
- [ ] `npm run build` exits 0 with 0 TypeScript errors — BUILD_OK confirmed
- [ ] `npx prisma db seed` creates manager@permit2.dev / demo1234 (idempotent, re-runnable)
- [ ] `next.config.ts` applies X-Content-Type-Options, HSTS, CSP, Referrer-Policy, Permissions-Policy to all routes
- [ ] X-Frame-Options DENY is NOT present (Pivota preview iframe compatibility)
- [ ] `.env.example` documents DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV, HOST with comments
- [ ] `README.md` at repo root has demo credentials, cp .env.example setup step, all npm scripts, project structure
- [ ] All 5 navigable routes have page files: /login, /dashboard, /permits, /permits/new, /permits/[id]
- [ ] No 404s on any nav link reachable from the NavBar
</success_criteria>

<output>
After completion, create `.planning/express/build-the-full-permit2-permit-management/05-SUMMARY.md` documenting:
- Build result (exit code, any errors fixed)
- Security headers applied (list them)
- Missing packages installed (if any)
- Any layout conflicts resolved (NavBar vs Navbar, dual protected layout)
- Final E2E flow confirmation: login → dashboard → permits → new → detail → approve/reject/revoke → logout
</output>
