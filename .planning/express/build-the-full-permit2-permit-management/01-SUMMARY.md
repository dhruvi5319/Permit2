---
phase: build-the-full-permit2-permit-management
plan: "01"
subsystem: database
tags: [prisma, postgresql, schema, seed, docker]
dependency_graph:
  requires: []
  provides: [User, Permit, PermitStatusHistory, PermitStatus, PermitType, prisma-singleton, seed-data]
  affects: [F0-auth, F8-api-routes, F1-F7-ui-features]
tech_stack:
  added: [prisma@7.9.1, ts-node@10.9.2, "@types/bcryptjs", "@types/jsonwebtoken"]
  patterns: [prisma-global-singleton, idempotent-seed, docker-healthcheck]
key_files:
  created:
    - permit2/prisma/schema.prisma
    - permit2/prisma/seed.ts
    - permit2/lib/db.ts
    - permit2/.env.example
    - permit2/prisma.config.ts
    - permit2/Dockerfile
    - docker-compose.yml
  modified:
    - permit2/package.json
    - permit2/package-lock.json
decisions:
  - "Prisma 7 requires datasource URL in prisma.config.ts (not schema.prisma) — created prisma.config.ts with defineConfig"
  - "Used bcryptjs (already in dependencies) for seed password hashing"
  - ".env.example force-added to git since .gitignore uses .env* glob pattern"
metrics:
  duration: "~8 minutes"
  completed: "2026-08-09"
  tasks_completed: 2
  files_created: 7
  files_modified: 2
---

# Phase build-the-full-permit2-permit-management Plan 01: Database Layer Summary

**One-liner:** PostgreSQL schema with User/Permit/PermitStatusHistory models via Prisma 7 ORM, seeded with 15 realistic permits and 1 manager user, with Docker Compose for containerized deployment.

## What Was Created

### permit2/prisma/schema.prisma
Prisma ORM schema defining the complete data model for Permit2:
- **Enums:** `PermitStatus` (PENDING, APPROVED, REJECTED, REVOKED) and `PermitType` (WORK, ACCESS, ACTIVITY, SAFETY, OTHER)
- **Model `User`** → table `users`: id (uuid), email (unique), passwordHash, name, createdAt; relations to Permit and PermitStatusHistory
- **Model `Permit`** → table `permits`: id, title, type, applicantName, description, notes, status, startDate, endDate, rejectionReason, revocationReason, createdBy (FK→users), createdAt, updatedAt, statusHistory; indexes on status, type, createdAt, updatedAt, startDate, createdBy, composite (status+type)
- **Model `PermitStatusHistory`** → table `permit_status_history`: id, permitId (FK→permits onDelete:Cascade), status, event, actorId (FK→users), actorName, notes, createdAt; indexes on permitId, createdAt

### permit2/prisma.config.ts
Prisma 7 configuration file (required in v7 — datasource URL moved out of schema.prisma):
- Uses `defineConfig` from `@prisma/config`
- Sets `schema: 'prisma/schema.prisma'` and `datasource.url: process.env.DATABASE_URL`

### permit2/lib/db.ts
Prisma client singleton with dev hot-reload guard:
```typescript
export const prisma = globalForPrisma.prisma || new PrismaClient({ log: [...] });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```
Import as: `import { prisma } from '@/lib/db'`

### permit2/prisma/seed.ts
Idempotent seed script creating:
- **1 manager user:** email `manager@permit2.dev`, password `demo1234` (bcrypt cost 10), name `Alex Manager`
- **15 permits** distributed: 4 PENDING, 4 APPROVED, 4 REJECTED, 3 REVOKED
- All 5 PermitType values represented (WORK, ACCESS, ACTIVITY, SAFETY, OTHER)
- Each permit has CREATED history entry; non-PENDING permits have additional transition entries
- **Idempotency:** skips permit creation if `prisma.permit.count() >= 15`

**Seed credentials:** `manager@permit2.dev` / `demo1234`

### permit2/.env.example
Documents required environment variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — JWT signing key (min 32 chars)
- `JWT_EXPIRES_IN` — JWT expiry (default: 1h)
- `BCRYPT_COST_FACTOR` — bcrypt cost (default: 10)
- `PORT` — server port
- `NODE_ENV` — development | production

### permit2/package.json
Added scripts:
- `db:migrate` → `prisma migrate dev`
- `db:push` → `prisma db push`
- `db:seed` → `prisma db seed`
- `db:studio` → `prisma studio`
- `typecheck` → `tsc --noEmit`

Added `prisma.seed` config: `ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts`

### docker-compose.yml (workspace root)
- **db service:** postgres:16, healthcheck via `pg_isready`, persistent volume
- **app service:** depends_on db with `condition: service_healthy`; entrypoint runs `prisma migrate deploy && prisma db seed && node server.js`; `DATABASE_URL` points to `db` service; published on `3000:3000`

## Exact Field Names (for Wave 2 API Prisma queries)

```
prisma.user: { id, email, passwordHash, name, createdAt }
prisma.permit: { id, title, type, applicantName, description, notes, status, startDate, endDate, rejectionReason, revocationReason, createdBy, createdAt, updatedAt }
prisma.permitStatusHistory: { id, permitId, status, event, actorId, actorName, notes, createdAt }
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Prisma 7 datasource URL format change**
- **Found during:** Task 1 (npx prisma validate)
- **Issue:** Prisma 7.9.1 removed support for `url = env("DATABASE_URL")` in `schema.prisma`; datasource URL must now be configured via `prisma.config.ts`
- **Fix:** Created `permit2/prisma.config.ts` using `defineConfig({ datasource: { url: process.env.DATABASE_URL } })`; removed `url` field from `schema.prisma` datasource block
- **Files modified:** `permit2/prisma/schema.prisma`, `permit2/prisma.config.ts` (new)
- **Commit:** 861e85a

**2. [Rule 2 - Missing] .env.example not committable via gitignore**
- **Found during:** Task 1 commit
- **Issue:** `.gitignore` uses `.env*` glob which blocks `.env.example`; example file is safe to commit (no real secrets)
- **Fix:** Used `git add -f` to force-add `.env.example`; real `.env` files still protected by gitignore
- **Files modified:** none (commit procedure adjustment)

## Known Stubs

None found — all implementations are complete and functional.

## Self-Check: PASSED

- [x] `permit2/prisma/schema.prisma` — FOUND
- [x] `permit2/prisma/seed.ts` — FOUND
- [x] `permit2/lib/db.ts` — FOUND
- [x] `permit2/.env.example` — FOUND
- [x] `permit2/prisma.config.ts` — FOUND
- [x] `docker-compose.yml` — FOUND
- [x] `permit2/Dockerfile` — FOUND
- [x] Commit 861e85a (Task 1) — FOUND
- [x] Commit 75aa6df (Task 2) — FOUND
- [x] Commit cf73da0 (Docker) — FOUND
- [x] `npx prisma validate` → exit 0, "The schema at prisma/schema.prisma is valid 🚀"
- [x] `npx prisma generate` → exit 0, "Generated Prisma Client (v7.9.1)"
- [x] No blocking stubs found in changed files
