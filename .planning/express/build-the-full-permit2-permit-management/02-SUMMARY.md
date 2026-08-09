---
phase: build-the-full-permit2-permit-management
plan: "02"
subsystem: backend-api
tags: [api, authentication, jwt, state-machine, prisma, zod, middleware]
dependency_graph:
  requires: ["01"]
  provides: ["auth-api", "permits-api", "jwt-auth", "state-machine"]
  affects: ["03"]
tech_stack:
  added: ["jsonwebtoken", "bcryptjs", "@prisma/adapter-pg", "pg"]
  patterns: ["JWT HS256 + httpOnly cookie", "Prisma driver adapter", "{ data, error, meta } envelope", "state machine via VALID_TRANSITIONS map"]
key_files:
  created:
    - permit2/lib/utils/api-response.ts
    - permit2/lib/utils/errors.ts
    - permit2/lib/auth.ts
    - permit2/lib/validations/auth.schema.ts
    - permit2/lib/validations/permit.schema.ts
    - permit2/lib/permit-service.ts
    - permit2/middleware.ts
    - permit2/app/api/auth/login/route.ts
    - permit2/app/api/auth/logout/route.ts
    - permit2/app/api/auth/me/route.ts
    - permit2/app/api/permits/route.ts
    - permit2/app/api/permits/stats/route.ts
    - permit2/app/api/permits/[id]/route.ts
    - permit2/app/api/permits/[id]/approve/route.ts
    - permit2/app/api/permits/[id]/reject/route.ts
    - permit2/app/api/permits/[id]/revoke/route.ts
  modified:
    - permit2/lib/db.ts
    - permit2/package.json
decisions:
  - "Used Zod v4 API (.issues instead of .errors, removed required_error/invalid_type_error) — project has zod@4.4.3"
  - "Installed @prisma/adapter-pg for Prisma 7.9.1 driver adapter requirement — schema datasource has no url field"
  - "lib/db.ts updated to use PrismaPg adapter with DATABASE_URL env var"
metrics:
  duration: "~20 minutes"
  completed_date: "2026-08-09"
  tasks_completed: 4
  files_created: 16
  files_modified: 2
---

# Phase build-the-full-permit2-permit-management Plan 02: Backend API + Authentication Layer Summary

JWT authentication + 10 REST API endpoints with Zod validation, state machine enforcement, and Next.js middleware route protection using Prisma 7.9.1 driver adapter pattern.

## What Was Built

### Utility Modules

**`lib/utils/api-response.ts`** — `{ data, error, meta }` envelope helpers:
- `ok<T>(data, meta?)` → 200
- `created<T>(data)` → 201
- `badRequest(code, message, details?)` → 400
- `unauthorized(code, message)` → 401
- `notFound(message)` → 404 (code: `PERMIT_NOT_FOUND`)
- `serverError(message?)` → 500 (code: `SERVER_ERROR`)

**`lib/utils/errors.ts`** — Custom error classes:
- `AppError(code, message, status)` — base class
- `InvalidTransitionError(current, action)` → code: `INVALID_TRANSITION`, status: 400
- `NotFoundError(resource?)` → code: `PERMIT_NOT_FOUND`, status: 404

**`lib/auth.ts`** — JWT helpers:
- `signToken({ sub, email, name })` → HS256 JWT using `JWT_SECRET` env
- `verifyToken(token)` → `JwtPayload` or throws `AppError(401)`
- `requireAuth(request)` → reads Bearer header OR `token` cookie, throws `AppError(401)` if missing/invalid

**`lib/validations/auth.schema.ts`** — Zod v4 login schema:
- `loginSchema`: email (email format) + password (min 1)

**`lib/validations/permit.schema.ts`** — Zod v4 schemas:
- `createPermitSchema`: title, type (enum), applicant_name, description, start_date (YYYY-MM-DD), end_date (YYYY-MM-DD ≥ start_date), notes (optional)
- `approveSchema`, `rejectSchema`, `revokeSchema`: optional notes/reason
- `listQuerySchema`: search, status, type, date ranges, sort (enum), order, page/limit (coerced, with defaults)

### Business Logic

**`lib/permit-service.ts`** — State machine + CRUD:

**State machine:**
```
VALID_TRANSITIONS:
  'PENDING:approve'  → APPROVED
  'PENDING:reject'   → REJECTED
  'APPROVED:revoke'  → REVOKED
  All others         → InvalidTransitionError (400 INVALID_TRANSITION)
```

**Field name mapping (Prisma camelCase → API snake_case):**
| Prisma field | API field |
|---|---|
| `applicantName` | `applicant_name` |
| `startDate` | `start_date` |
| `endDate` | `end_date` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |
| `rejectionReason` | `rejection_reason` |
| `revocationReason` | `revocation_reason` |
| `createdBy` | `created_by` |
| `actorName` | `actor_name` |

**Service functions:**
- `validateTransition(current, action)` → `PermitStatus` or throws `InvalidTransitionError`
- `listPermits(query)` → `{ items: PermitSummary[], total }` with search/filter/sort/pagination
- `createPermit(data, userId, actorName)` → full permit + CREATED history entry
- `getPermit(id)` → full permit with `status_history[]` or throws `NotFoundError`
- `approvePermit/rejectPermit/revokePermit` → `prisma.$transaction` (update permit + insert history atomically)
- `getStats()` → `{ total, pending, approved, rejected, revoked }`

### Middleware

**`middleware.ts`** — JWT protection:
- Matcher: `['/api/:path*']`
- Public path: `/api/auth/login` (bypassed)
- All other `/api/*` routes: reads Bearer header or `token` cookie → `verifyToken` → 401 envelope on failure

### API Endpoints (10 total)

#### Auth Routes

| Method | Path | Response | Notes |
|--------|------|----------|-------|
| POST | `/api/auth/login` | 200: `{ data: { token, user: { id, email, name } }, error: null, meta: {} }` | Zod validation, bcrypt.compare, sets httpOnly cookie (24h) |
| POST | `/api/auth/logout` | 200: `{ data: { message }, error: null, meta: {} }` | Clears `token` cookie (maxAge=0) |
| GET | `/api/auth/me` | 200: `{ data: { id, email, name }, error: null, meta: {} }` | JWT → user lookup |

#### Permit Routes

| Method | Path | Response | Notes |
|--------|------|----------|-------|
| GET | `/api/permits` | 200: `{ data: { items: PermitSummary[] }, error: null, meta: PaginationMeta }` | search, status, type, date range, sort, order, page, limit |
| POST | `/api/permits` | 201: `{ data: Permit, error: null, meta: {} }` | created_by from JWT, status=PENDING |
| GET | `/api/permits/stats` | 200: `{ data: { total, pending, approved, rejected, revoked }, error: null, meta: {} }` | Static segment, wins over [id] |
| GET | `/api/permits/[id]` | 200: `{ data: Permit+status_history, error: null, meta: {} }` | 404 on not found |
| PATCH | `/api/permits/[id]/approve` | 200: `{ data: Permit, error: null, meta: {} }` | PENDING→APPROVED, 400 INVALID_TRANSITION |
| PATCH | `/api/permits/[id]/reject` | 200: `{ data: Permit, error: null, meta: {} }` | PENDING→REJECTED, 400 INVALID_TRANSITION |
| PATCH | `/api/permits/[id]/revoke` | 200: `{ data: Permit, error: null, meta: {} }` | APPROVED→REVOKED, 400 INVALID_TRANSITION |

### `lib/db.ts` Update

Updated to use `@prisma/adapter-pg` (required by Prisma 7.9.1):
```typescript
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter, log: [...] });
```

**Note on `params` in Next.js 16:** Route handler params are `Promise<{ id: string }>` and must be awaited: `const { id } = await params`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Zod v4 API compatibility**
- **Found during:** Task 1 TypeScript check
- **Issue:** Plan used Zod v3 API (`required_error`, `invalid_type_error` in schema params; `.errors` on ZodError). Project has `zod@4.4.3` which changed these APIs.
- **Fix:** Replaced `required_error`/`invalid_type_error` with Zod v4 `error` param; changed `.errors` to `.issues` on ZodError; simplified string validators using `.min(1, msg)` pattern
- **Files modified:** `lib/validations/auth.schema.ts`, `lib/validations/permit.schema.ts`, `app/api/auth/login/route.ts`

**2. [Rule 1 - Bug] Prisma 7.9.1 driver adapter requirement**
- **Found during:** Task 4 build check
- **Issue:** `lib/db.ts` used `new PrismaClient()` without options, but Prisma 7.9.1 requires a driver adapter when no `url` in schema's datasource block. The schema uses `prisma.config.ts` for URL (Wave 1 pattern).
- **Fix:** Installed `@prisma/adapter-pg` + `pg`, updated `lib/db.ts` to use `PrismaPg` adapter with `DATABASE_URL` env var
- **Files modified:** `lib/db.ts`, `package.json`
- **Commit:** 80e3e9a

## Known Stubs

None found — all handlers contain real implementation logic.

## Commits

| Hash | Task | Description |
|------|------|-------------|
| 83c8f15 | Task 1 | Utility modules — api-response, errors, auth, validations |
| 993f241 | Task 2 | permit-service.ts with state machine and CRUD business logic |
| 565731e | Task 3 | Auth route handlers (login, logout, me) + middleware |
| 80e3e9a | Task 4 | Permit route handlers + Prisma driver adapter fix |

## Self-Check: PASSED

- [x] All 16 files created: route handlers, lib modules, validations, middleware
- [x] All 4 commits exist in git log
- [x] Build verified: `npm run build` succeeded with all 10 API routes in route manifest
- [x] TypeScript: `npx tsc --noEmit --skipLibCheck` exits 0
- [x] No stubs found (`grep -rn "TODO|FIXME|placeholder"`)
- [x] `## Known Stubs`: None found
