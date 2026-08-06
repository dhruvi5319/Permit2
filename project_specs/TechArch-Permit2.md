# Technical Architecture Document
## Permit2 — Permit Management System (POC)

**Document Version:** 1.0
**Date:** 2026-08-06
**Status:** Active
**Acronym:** Permit2
**Derived From:** PRD-Permit2.md v1.0, FRD-Permit2.md v1.0

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Component Architecture](#2-component-architecture)
3. [Data Model](#3-data-model)
4. [API Design](#4-api-design)
5. [Security Architecture](#5-security-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Integration Points](#7-integration-points)

---

## 1. Architectural Overview

### Architecture Pattern

Permit2 uses a **Full-Stack Monorepo** architecture built on Next.js 14 (App Router). The frontend and backend live in a single repository; the backend is exposed as Next.js API Routes (`/app/api/...`). This eliminates cross-origin complexity for the POC, enables shared TypeScript types between frontend and backend, and deploys to Vercel with zero additional configuration.

The application follows a **client-server model** with a clear separation of concerns:
- **Frontend:** React Server Components + Client Components render all UI. React Query manages server state on the client.
- **API Layer:** Next.js Route Handlers implement the REST API, validated by Zod, guarded by JWT middleware.
- **Data Layer:** Prisma ORM communicates exclusively with PostgreSQL; no raw SQL from route handlers.

### Architecture Decision Records

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack single repo; Vercel-native; RSC for fast initial load |
| Database | PostgreSQL | Relational model fits permit lifecycle; enum support; indexing for search |
| ORM | Prisma | Type-safe queries; migration files; schema-first development |
| Auth | JWT (jsonwebtoken) + bcrypt | Stateless, no session store needed for POC; lightweight |
| UI Library | shadcn/ui + Radix UI | Accessible components; matches the "beautiful UI" requirement; Tailwind-first |
| State Management | TanStack Query (React Query) | Server state caching, refetch-on-focus, loading/error states out of the box |
| Validation | Zod | Runtime validation on both client (forms) and server (API inputs); shared schemas |
| Styling | Tailwind CSS v3 | Utility-first; pairs perfectly with shadcn/ui; design token support via CSS vars |

---

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                             │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Next.js Frontend                          │  │
│  │                                                              │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │  │
│  │  │  /login     │  │  /dashboard  │  │  /permits          │  │  │
│  │  │  Auth Page  │  │  Stats+Feed  │  │  List + Filters    │  │  │
│  │  └─────────────┘  └──────────────┘  └────────────────────┘  │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐   │  │
│  │  │  /permits/new (Create)  │  /permits/[id] (Detail)    │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  │                                                              │  │
│  │  ┌──────────────┐  ┌─────────────────────────────────────┐  │  │
│  │  │ TanStack     │  │  shadcn/ui Component Library        │  │  │
│  │  │ Query        │  │  (StatusBadge, Card, Toast, etc.)   │  │  │
│  │  └──────────────┘  └─────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           │  HTTP / fetch                           │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Next.js API Routes  (/app/api)                  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Middleware Layer                          │   │
│  │   JWT Auth Guard  │  Zod Input Validation  │  Error Handler │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌───────────────┐  ┌──────────────────────────────────────────┐   │
│  │  /api/auth    │  │  /api/permits                            │   │
│  │  login        │  │  GET  (list + search + filter + sort)    │   │
│  │  logout       │  │  POST (create)                           │   │
│  │  me           │  │  GET  /stats                             │   │
│  └───────────────┘  │  GET  /[id]                              │   │
│                     │  PATCH /[id]/approve                     │   │
│                     │  PATCH /[id]/reject                      │   │
│                     │  PATCH /[id]/revoke                      │   │
│                     └──────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Business Logic Layer                      │   │
│  │   State Machine Validator  │  Permit Service  │  Auth Svc   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Prisma ORM                                │   │
│  └────────────────────────────┬────────────────────────────────┘   │
└───────────────────────────────┼─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Database                          │
│                                                                     │
│   ┌────────────┐    ┌──────────────────┐    ┌─────────────────┐    │
│   │   users    │    │     permits      │    │ permit_status_  │    │
│   │            │───<│  (created_by FK) │───<│    history      │    │
│   └────────────┘    └──────────────────┘    └─────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Deployment Topology

```
┌──────────────────────────────────────────────────────┐
│                     Vercel                           │
│                                                      │
│   ┌──────────────────────────────────────────────┐   │
│   │     Next.js Application (Serverless)         │   │
│   │     - Frontend pages (SSR / SSG / RSC)       │   │
│   │     - API Routes (Edge or Node runtime)      │   │
│   │     Environment vars: JWT_SECRET,            │   │
│   │                       DATABASE_URL           │   │
│   └──────────────────────┬───────────────────────┘   │
│                          │ TLS / TCP                  │
└──────────────────────────┼───────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────┐
│       Railway / Supabase / Render PostgreSQL         │
│       Database: permit2                              │
│       Tables: users, permits, permit_status_history  │
└──────────────────────────────────────────────────────┘
```

**Local Development:**
```
Browser  →  Next.js dev server (localhost:3000)  →  PostgreSQL (localhost:5432 or file:./dev.db)
```

---

## 2. Component Architecture

### Frontend Component Tree

```
app/
├── layout.tsx                    ← Root layout: NavBar, Toast provider, Query client provider
├── (auth)/
│   └── login/
│       └── page.tsx              ← Login page (public route)
├── (protected)/
│   ├── layout.tsx                ← Auth guard: redirects to /login if no session
│   ├── dashboard/
│   │   └── page.tsx              ← Dashboard page
│   └── permits/
│       ├── page.tsx              ← Permit list page
│       ├── new/
│       │   └── page.tsx          ← Permit creation form
│       └── [id]/
│           └── page.tsx          ← Permit detail view
│
components/
├── ui/                           ← shadcn/ui primitives (Button, Input, Select, Dialog…)
├── layout/
│   ├── NavBar.tsx                ← Persistent top nav (logo, links, logout)
│   └── Breadcrumb.tsx            ← Three-level breadcrumb
├── permits/
│   ├── PermitTable.tsx           ← Sortable data table with status badges + action links
│   ├── PermitRow.tsx             ← Single table row
│   ├── PermitFilterBar.tsx       ← Search + status/type/date filters
│   ├── PermitForm.tsx            ← Create permit form (all fields, validation)
│   ├── PermitDetailHeader.tsx    ← Hero card: title, status badge, action buttons
│   ├── PermitDetailFields.tsx    ← Two-column detail grid
│   ├── PermitStatusTimeline.tsx  ← Chronological history list
│   ├── ActionDialog.tsx          ← Reusable confirm dialog (Approve/Reject/Revoke)
│   └── StatusBadge.tsx           ← Color-coded pill badge (PENDING/APPROVED/etc.)
├── dashboard/
│   ├── StatCard.tsx              ← Single metric card (icon + count + label)
│   ├── StatsRow.tsx              ← Row of 5 StatCards
│   ├── StatusDonutChart.tsx      ← Recharts donut chart with legend
│   └── RecentActivityFeed.tsx    ← List of 10 most-recent permits
└── shared/
    ├── SkeletonCard.tsx          ← Shimmer skeleton for cards
    ├── SkeletonTable.tsx         ← Shimmer skeleton for table rows
    ├── EmptyState.tsx            ← Icon + heading + body + optional CTA
    ├── ErrorState.tsx            ← Error display with retry button
    └── Pagination.tsx            ← Previous/Next + page info
```

### Backend Module Structure

```
app/api/
├── auth/
│   ├── login/route.ts            ← POST /api/auth/login
│   ├── logout/route.ts           ← POST /api/auth/logout
│   └── me/route.ts               ← GET  /api/auth/me
└── permits/
    ├── route.ts                  ← GET /api/permits, POST /api/permits
    ├── stats/route.ts            ← GET /api/permits/stats  [registered before [id]]
    └── [id]/
        ├── route.ts              ← GET /api/permits/[id]
        ├── approve/route.ts      ← PATCH /api/permits/[id]/approve
        ├── reject/route.ts       ← PATCH /api/permits/[id]/reject
        └── revoke/route.ts       ← PATCH /api/permits/[id]/revoke

lib/
├── auth.ts                       ← JWT sign/verify, auth middleware helper
├── db.ts                         ← Prisma client singleton
├── permit-service.ts             ← Permit business logic (state machine, CRUD)
├── validations/
│   ├── auth.schema.ts            ← Zod schema: login body
│   └── permit.schema.ts          ← Zod schemas: create, lifecycle action bodies, query params
└── utils/
    ├── api-response.ts           ← { data, error, meta } response helpers
    └── errors.ts                 ← Custom error classes (InvalidTransitionError, etc.)

prisma/
├── schema.prisma                 ← Canonical data model
├── migrations/                   ← Migration files
└── seed.ts                       ← Demo seed data script
```

### Component Responsibilities

| Component | Layer | Responsibility |
|---|---|---|
| `NavBar` | Layout | Persistent top navigation; active link detection; logout trigger |
| `StatusBadge` | Shared UI | Renders colored pill for any `PermitStatus` value |
| `PermitTable` | Feature | Sortable table; delegates row rendering; integrates with filter bar |
| `PermitFilterBar` | Feature | Manages filter state; syncs to URL query params; debounced search |
| `ActionDialog` | Feature | Reusable modal for Approve/Reject/Revoke with reason field |
| `PermitStatusTimeline` | Feature | Renders `status_history` array as chronological event list |
| `StatusDonutChart` | Dashboard | Recharts donut chart from `PermitStats` data |
| `permit-service.ts` | Backend | Validates state machine transitions; executes DB transactions |
| `auth.ts` | Backend | JWT creation and verification; auth middleware extractor |
| `api-response.ts` | Backend | Consistent `{ data, error, meta }` serialization helpers |

---

## 3. Data Model

### Entity-Relationship Diagram

```
┌──────────────────────────────┐
│           users              │
├──────────────────────────────┤
│ PK  id            UUID       │
│     email         VARCHAR    │◄──────────────────────────────────┐
│     password_hash VARCHAR    │                                   │
│     name          VARCHAR    │                                   │
│     created_at    TIMESTAMPTZ│                                   │
└──────────────┬───────────────┘                                   │
               │ 1                                                 │
               │                                                   │
               │ created_by (FK)          actor_id (FK)           │
               ▼ ∞                              ∞ ▼               │
┌──────────────────────────────┐    ┌──────────────────────────────┤
│           permits            │    │    permit_status_history     │
├──────────────────────────────┤    ├──────────────────────────────┤
│ PK  id                UUID   │    │ PK  id           UUID        │
│     title             VARCHAR│    │ FK  permit_id    UUID        │
│     type              ENUM   │    │     status       ENUM        │
│     applicant_name    VARCHAR│    │     event        VARCHAR     │
│     description       TEXT   │    │ FK  actor_id     UUID        │
│     notes             TEXT   │    │     actor_name   VARCHAR     │
│     status            ENUM   │◄──<│     notes        TEXT        │
│     start_date        DATE   │ 1:∞│     created_at   TIMESTAMPTZ │
│     end_date          DATE   │    └──────────────────────────────┘
│     rejection_reason  TEXT   │
│     revocation_reason TEXT   │
│ FK  created_by        UUID   │
│     created_at        TIMESTAMPTZ│
│     updated_at        TIMESTAMPTZ│
└──────────────────────────────┘

PermitStatus ENUM: PENDING | APPROVED | REJECTED | REVOKED
PermitType   ENUM: WORK | ACCESS | ACTIVITY | SAFETY | OTHER
```

---

### Database DDL — Complete

#### Enums

```sql
-- Permit lifecycle status
CREATE TYPE "PermitStatus" AS ENUM (
  'PENDING',    -- Initial state on creation; awaiting action
  'APPROVED',   -- Permit has been approved and is active
  'REJECTED',   -- Permit has been rejected (terminal state)
  'REVOKED'     -- Previously approved permit has been revoked (terminal state)
);

-- Permit category
CREATE TYPE "PermitType" AS ENUM (
  'WORK',       -- Work permit
  'ACCESS',     -- Access permit
  'ACTIVITY',   -- Activity authorization
  'SAFETY',     -- Safety permit
  'OTHER'       -- Catch-all
);
```

#### Table: users

```sql
CREATE TABLE users (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255)  NOT NULL,
  password_hash  VARCHAR(255)  NOT NULL,
  name           VARCHAR(255)  NOT NULL,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT uq_users_email UNIQUE (email)
);

-- Index: login lookup by email
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

**Field Notes:**
- `id`: UUID v4, auto-generated. Used as the `sub` claim in JWTs.
- `email`: Login identifier. Unique constraint enforced at DB and application layers.
- `password_hash`: bcrypt hash (min cost factor 10). Never store plaintext passwords.
- `name`: Display name shown in the nav bar and status history timeline entries.
- `created_at`: Immutable once set; no `updated_at` needed for users in POC.

#### Table: permits

```sql
CREATE TABLE permits (
  id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  title               VARCHAR(255)   NOT NULL,
  type                "PermitType"   NOT NULL,
  applicant_name      VARCHAR(255)   NOT NULL,
  description         TEXT           NOT NULL,
  notes               TEXT           NULL,
  status              "PermitStatus" NOT NULL DEFAULT 'PENDING',
  start_date          DATE           NOT NULL,
  end_date            DATE           NOT NULL,
  rejection_reason    TEXT           NULL,
  revocation_reason   TEXT           NULL,
  created_by          UUID           NOT NULL REFERENCES users(id),
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),

  CONSTRAINT chk_end_date_after_start CHECK (end_date >= start_date)
);

-- Core filter indexes
CREATE INDEX idx_permits_status          ON permits(status);
CREATE INDEX idx_permits_type            ON permits(type);
CREATE INDEX idx_permits_created_at      ON permits(created_at DESC);
CREATE INDEX idx_permits_updated_at      ON permits(updated_at DESC);
CREATE INDEX idx_permits_start_date      ON permits(start_date);
CREATE INDEX idx_permits_created_by      ON permits(created_by);

-- Composite index for combined status+type filter (dashboard + list)
CREATE INDEX idx_permits_status_type     ON permits(status, type);

-- Full-text trigram search (requires pg_trgm extension)
-- Run first: CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_permits_title_trgm      ON permits USING GIN (title gin_trgm_ops);
CREATE INDEX idx_permits_applicant_trgm  ON permits USING GIN (applicant_name gin_trgm_ops);
```

**Field Notes:**
- `status`: Always starts as `PENDING`. Updated only through lifecycle action endpoints.
- `rejection_reason`: Non-null only when `status = 'REJECTED'`; set at rejection time.
- `revocation_reason`: Non-null only when `status = 'REVOKED'`; set at revocation time.
- `created_by`: Set from `req.user.id` (authenticated session) — never from request body.
- `updated_at`: Auto-managed by Prisma `@updatedAt`; reflects every mutation.
- `CHECK (end_date >= start_date)`: Database-level constraint supplements application validation.

#### Table: permit_status_history

```sql
CREATE TABLE permit_status_history (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_id   UUID           NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
  status      "PermitStatus" NOT NULL,
  event       VARCHAR(50)    NOT NULL,   -- CREATED | APPROVED | REJECTED | REVOKED
  actor_id    UUID           NOT NULL REFERENCES users(id),
  actor_name  VARCHAR(255)   NOT NULL,   -- Denormalized for timeline resilience
  notes       TEXT           NULL,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- Index: fetch all history for a permit (most frequent query)
CREATE INDEX idx_permit_history_permit_id  ON permit_status_history(permit_id);
CREATE INDEX idx_permit_history_created_at ON permit_status_history(created_at);
```

**Field Notes:**
- `event`: Valid values: `CREATED`, `APPROVED`, `REJECTED`, `REVOKED`. Matches the action that triggered the transition.
- `status`: The status value **after** this event (e.g., the `CREATED` event has `status = 'PENDING'`).
- `actor_name`: **Denormalized** copy of `users.name` at the time of the event. Ensures the timeline display remains accurate even if the manager's name is later changed.
- `notes`: Optional reason text from the confirmation dialog; nullable.
- `created_at`: Immutable. Never updated after insert.
- `ON DELETE CASCADE`: If a permit is deleted, its history entries are removed automatically.

#### Auto-update trigger for `updated_at` (alternative to Prisma `@updatedAt`)

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_permits_updated_at
BEFORE UPDATE ON permits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

### Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum PermitStatus {
  PENDING
  APPROVED
  REJECTED
  REVOKED
}

enum PermitType {
  WORK
  ACCESS
  ACTIVITY
  SAFETY
  OTHER
}

model User {
  id            String                @id @default(uuid())
  email         String                @unique
  passwordHash  String                @map("password_hash")
  name          String
  createdAt     DateTime              @default(now()) @map("created_at")
  permits       Permit[]              @relation("CreatedBy")
  historyEvents PermitStatusHistory[]

  @@map("users")
}

model Permit {
  id                String                @id @default(uuid())
  title             String                @db.VarChar(255)
  type              PermitType
  applicantName     String                @map("applicant_name") @db.VarChar(255)
  description       String                @db.Text
  notes             String?               @db.Text
  status            PermitStatus          @default(PENDING)
  startDate         DateTime              @map("start_date") @db.Date
  endDate           DateTime              @map("end_date")   @db.Date
  rejectionReason   String?               @map("rejection_reason")  @db.Text
  revocationReason  String?               @map("revocation_reason") @db.Text
  createdBy         String                @map("created_by")
  creator           User                  @relation("CreatedBy", fields: [createdBy], references: [id])
  createdAt         DateTime              @default(now())   @map("created_at")
  updatedAt         DateTime              @updatedAt        @map("updated_at")
  statusHistory     PermitStatusHistory[]

  @@index([status])
  @@index([type])
  @@index([createdAt])
  @@index([updatedAt])
  @@index([startDate])
  @@index([createdBy])
  @@index([status, type])
  @@map("permits")
}

model PermitStatusHistory {
  id        String       @id @default(uuid())
  permitId  String       @map("permit_id")
  permit    Permit       @relation(fields: [permitId], references: [id], onDelete: Cascade)
  status    PermitStatus
  event     String       @db.VarChar(50)
  actorId   String       @map("actor_id")
  actor     User         @relation(fields: [actorId], references: [id])
  actorName String       @map("actor_name") @db.VarChar(255)
  notes     String?      @db.Text
  createdAt DateTime     @default(now()) @map("created_at")

  @@index([permitId])
  @@index([createdAt])
  @@map("permit_status_history")
}
```

---

### State Machine

The permit lifecycle is enforced at the **application layer** (in `permit-service.ts`) before any database write. The database enums prevent invalid values from ever being stored, but transition logic lives in code.

```
                    ┌─────────┐
           create   │         │
        ──────────► │ PENDING │
                    │         │
                    └────┬────┘
                         │
              ┌──────────┴──────────┐
              │ approve             │ reject
              ▼                     ▼
        ┌──────────┐         ┌──────────┐
        │ APPROVED │         │ REJECTED │  ← terminal
        └────┬─────┘         └──────────┘
             │ revoke
             ▼
        ┌─────────┐
        │ REVOKED │  ← terminal
        └─────────┘
```

**Valid transitions:**
- `PENDING` → `APPROVED` (approve action)
- `PENDING` → `REJECTED` (reject action)
- `APPROVED` → `REVOKED` (revoke action)

All other transitions return `400 INVALID_TRANSITION`.

---

## 4. API Design

### Base URL

```
/api
```

All endpoints are prefixed with `/api`. Example: `POST /api/auth/login`.

### Response Envelope

Every API response uses this consistent structure:

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta: PaginationMeta | Record<string, never>;
}

interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### Authentication

All endpoints except `POST /api/auth/login` require:
```
Authorization: Bearer <JWT>
```
Missing or invalid tokens return `401 AUTH_UNAUTHORIZED`. Expired tokens return `401 AUTH_TOKEN_EXPIRED`.

---

### TypeScript Type Definitions

```typescript
// ─── Enums ─────────────────────────────────────────────────────────────────
type PermitStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';
type PermitType   = 'WORK' | 'ACCESS' | 'ACTIVITY' | 'SAFETY' | 'OTHER';

// ─── Auth ───────────────────────────────────────────────────────────────────
interface LoginRequest {
  email: string;       // required, valid email
  password: string;    // required, non-empty
}

interface LoginResponse {
  token: string;       // JWT access token
  user: UserProfile;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
}

interface JwtPayload {
  sub: string;         // user id
  email: string;
  name: string;
  iat: number;
  exp: number;         // iat + 3600 (1 hour)
}

// ─── Permits ────────────────────────────────────────────────────────────────

// Summary object — returned by GET /permits (list)
interface PermitSummary {
  id: string;
  title: string;
  type: PermitType;
  applicant_name: string;
  status: PermitStatus;
  start_date: string;    // ISO date: YYYY-MM-DD
  end_date: string;      // ISO date: YYYY-MM-DD
  created_at: string;    // ISO datetime
  updated_at: string;    // ISO datetime
}

// Full permit — returned by GET /permits/:id and lifecycle action responses
interface Permit extends PermitSummary {
  description: string;
  notes: string | null;
  rejection_reason: string | null;
  revocation_reason: string | null;
  created_by: string;
  status_history: PermitHistoryEvent[];
}

// Status history event
interface PermitHistoryEvent {
  id: string;
  status: PermitStatus;
  event: 'CREATED' | 'APPROVED' | 'REJECTED' | 'REVOKED';
  actor_name: string;
  notes: string | null;
  created_at: string;    // ISO datetime
}

// Dashboard stats
interface PermitStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  revoked: number;
}

// ─── Request Bodies ─────────────────────────────────────────────────────────

interface CreatePermitRequest {
  title: string;           // 1–255 chars
  type: PermitType;
  applicant_name: string;  // 1–255 chars
  description: string;     // 1–2000 chars
  start_date: string;      // YYYY-MM-DD
  end_date: string;        // YYYY-MM-DD; >= start_date
  notes?: string;          // max 1000 chars; optional
}

interface ApprovePermitRequest {
  notes?: string;          // max 500 chars; optional
}

interface RejectPermitRequest {
  reason?: string;         // max 500 chars; stored in rejection_reason
}

interface RevokePermitRequest {
  reason?: string;         // max 500 chars; stored in revocation_reason
}

// ─── List Query Params ───────────────────────────────────────────────────────
interface PermitListQuery {
  search?: string;           // substring match on title, applicant_name, description
  status?: PermitStatus;     // filter by status
  type?: PermitType;         // filter by type
  start_date_from?: string;  // YYYY-MM-DD; start_date >= value
  start_date_to?: string;    // YYYY-MM-DD; start_date <= value
  sort?: 'title' | 'type' | 'applicant_name' | 'status' | 'start_date' | 'end_date' | 'created_at';
  order?: 'asc' | 'desc';   // default: desc
  page?: number;             // default: 1
  limit?: number;            // default: 20, max: 100
}
```

---

### API Endpoint Catalog

| Method | Path | Auth | Description | Success |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | No | Authenticate; return JWT + user | `200` |
| `POST` | `/api/auth/logout` | Yes | Acknowledge logout; client discards token | `200` |
| `GET` | `/api/auth/me` | Yes | Return current user profile | `200` |
| `GET` | `/api/permits` | Yes | List permits (search, filter, sort, paginate) | `200` |
| `GET` | `/api/permits/stats` | Yes | Aggregate counts by status for dashboard | `200` |
| `POST` | `/api/permits` | Yes | Create new permit (status=PENDING) | `201` |
| `GET` | `/api/permits/:id` | Yes | Full permit detail + status history | `200` |
| `PATCH` | `/api/permits/:id/approve` | Yes | Transition PENDING → APPROVED | `200` |
| `PATCH` | `/api/permits/:id/reject` | Yes | Transition PENDING → REJECTED | `200` |
| `PATCH` | `/api/permits/:id/revoke` | Yes | Transition APPROVED → REVOKED | `200` |

> **Router note:** `/api/permits/stats` must be declared before `/api/permits/[id]` in Next.js file-system routing. In the App Router, a `stats/route.ts` file at the same level as `[id]/` is resolved first because static segments take precedence over dynamic segments.

---

### Endpoint Details

#### POST /api/auth/login

**Request:**
```json
{ "email": "manager@permit2.dev", "password": "demo1234" }
```

**Success `200`:**
```json
{
  "data": {
    "token": "eyJ...",
    "user": { "id": "uuid", "email": "manager@permit2.dev", "name": "Alex Manager" }
  },
  "error": null,
  "meta": {}
}
```

**Errors:** `400 VALIDATION_ERROR`, `401 AUTH_INVALID_CREDENTIALS`

---

#### GET /api/permits

**Query params:** `search`, `status`, `type`, `start_date_from`, `start_date_to`, `sort`, `order`, `page`, `limit`

**Success `200`:**
```json
{
  "data": {
    "items": [ /* PermitSummary[] */ ]
  },
  "error": null,
  "meta": { "total": 47, "page": 1, "limit": 20, "totalPages": 3 }
}
```

**Prisma query pattern:**
```typescript
const where: Prisma.PermitWhereInput = {};
if (search) {
  where.OR = [
    { title: { contains: search, mode: 'insensitive' } },
    { applicantName: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
  ];
}
if (status) where.status = status;
if (type) where.type = type;
if (start_date_from) where.startDate = { gte: new Date(start_date_from) };
if (start_date_to) where.startDate = { ...where.startDate, lte: new Date(start_date_to) };
```

---

#### GET /api/permits/stats

**Success `200`:**
```json
{
  "data": { "total": 15, "pending": 4, "approved": 5, "rejected": 3, "revoked": 3 },
  "error": null,
  "meta": {}
}
```

**Prisma implementation:**
```typescript
const counts = await prisma.permit.groupBy({
  by: ['status'],
  _count: { id: true },
});
```

---

#### POST /api/permits

**Request body:** `CreatePermitRequest`

**Success `201`:** Full `Permit` object (without `status_history` for creation response).

**Server sets:** `status = 'PENDING'`, `created_by = req.user.id` (from JWT — never from request body).

---

#### PATCH /api/permits/:id/approve | /reject | /revoke

**Approve request body:** `{ notes?: string }`
**Reject request body:** `{ reason?: string }` → stored in `rejection_reason`
**Revoke request body:** `{ reason?: string }` → stored in `revocation_reason`

**Success `200`:** Full `Permit` object including updated `status_history`.

**Transaction (pseudo-code):**
```typescript
await prisma.$transaction(async (tx) => {
  const permit = await tx.permit.findUniqueOrThrow({ where: { id } });
  validateTransition(permit.status, action);  // throws 400 if invalid
  await tx.permit.update({
    where: { id },
    data: { status: newStatus, rejectionReason: reason, updatedAt: new Date() }
  });
  await tx.permitStatusHistory.create({
    data: {
      permitId: id, status: newStatus, event: action.toUpperCase(),
      actorId: req.user.id, actorName: req.user.name, notes: notes ?? null
    }
  });
});
```

---

### Error Codes Reference

| Error Code | HTTP | Description |
|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | 401 | Login: email not found or password incorrect |
| `AUTH_UNAUTHORIZED` | 401 | Missing or malformed JWT |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT has passed expiry |
| `VALIDATION_ERROR` | 400 | Field validation failure; includes `details` array |
| `INVALID_TRANSITION` | 400 | State machine violation |
| `PERMIT_NOT_FOUND` | 404 | No permit with given ID |
| `NOT_FOUND` | 404 | Route does not exist |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Request body is not `application/json` |
| `SERVER_ERROR` | 500 | Unexpected server error (never leaks stack trace) |

---

## 5. Security Architecture

### Authentication

**Mechanism:** JWT Bearer tokens (stateless).

**Flow:**
1. Manager submits `{ email, password }` to `POST /api/auth/login`.
2. Server looks up user by email; verifies password with `bcrypt.compare()`.
3. On match: sign a JWT with payload `{ sub: userId, email, name }`, signed with `JWT_SECRET` (HS256), expiry 1 hour.
4. Client receives token; stores in `localStorage` or `httpOnly` cookie (httpOnly cookie preferred for XSS protection).
5. All subsequent requests include `Authorization: Bearer <token>`.
6. Auth middleware in `lib/auth.ts` verifies the token on every protected route handler.

**Logout:** Client discards the token. For POC, no server-side token denylist. (A denylist would require a Redis store — out of POC scope.)

**Password Storage:** bcrypt with minimum cost factor 10. Never log or return password hashes in any response.

---

### Authorization

**Model:** Single role — all authenticated users are Managers with identical permissions.

**Route Protection:**
- All `/api` routes (except `/api/auth/login`) are protected by auth middleware.
- All frontend pages except `/login` are wrapped in the `(protected)` route group layout, which checks for a valid session token on every render.

**Business Rules Enforced Server-Side:**
- `created_by` is always set from `req.user.id` — a manager cannot create permits on behalf of another user.
- State machine transitions are validated before any database write.
- Invalid transitions return `400` before any DB operation begins.

---

### Data Protection

| Concern | Measure |
|---|---|
| Password storage | bcrypt hash, cost factor ≥10. `password_hash` column never returned in API responses. |
| JWT secret | `JWT_SECRET` env var; minimum 32 chars; never committed to source control. |
| Database credentials | `DATABASE_URL` env var; never committed; use `.env.example` for documentation. |
| HTTPS | Enforced at the hosting platform layer (Vercel/Railway/Render); all traffic is TLS in production. |
| XSS | React's JSX escapes all rendered values by default. Token stored in httpOnly cookie if possible. |
| CSRF | For JWT Bearer auth (not cookies), CSRF is not applicable. If using cookies, add SameSite=Strict. |
| Input validation | Zod schemas validate all API inputs server-side before any business logic or DB operation. |
| Error messages | Generic error messages returned to clients; internal error details are never leaked. |
| Request size | Max body size: 64KB (configured in Next.js route handlers to prevent request flooding). |

---

### Security Headers (Next.js `next.config.js`)

```javascript
const securityHeaders = [
  { key: 'X-Content-Type-Options',   value: 'nosniff' },
  { key: 'X-Frame-Options',          value: 'DENY' },
  { key: 'X-XSS-Protection',         value: '1; mode=block' },
  { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
];
```

---

### Environment Variables

| Variable | Required | Example | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/permit2` | PostgreSQL connection string |
| `JWT_SECRET` | Yes | `super-secret-at-least-32-characters` | JWT signing key (HS256); ≥32 chars |
| `JWT_EXPIRES_IN` | No | `1h` | JWT expiry duration (default: `1h`) |
| `NODE_ENV` | No | `production` | `development` or `production` |
| `PORT` | No | `3000` | Server port (Next.js dev) |
| `BCRYPT_COST_FACTOR` | No | `10` | bcrypt rounds (default: `10`, min: `10`) |

---

## 6. Technology Stack

### Full Stack Overview

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 14.x | Full-stack React framework; API routes + pages in one repo |
| **Language** | TypeScript | 5.x | Type safety across frontend and backend; strict mode enabled |
| **Frontend UI** | React | 18.x | Component model; Server + Client Components |
| **UI Components** | shadcn/ui | latest | Pre-built accessible components built on Radix UI |
| **Primitive UI** | Radix UI | latest | Headless accessible primitives (Dialog, Select, Popover…) |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS; custom design tokens via CSS variables |
| **Icons** | Lucide React | latest | Consistent SVG icon library |
| **Charts** | Recharts | 2.x | Donut chart for dashboard status breakdown |
| **Server State** | TanStack Query (React Query) | 5.x | Server state fetching, caching, refetch-on-focus |
| **Form Management** | React Hook Form | 7.x | Performant forms with Zod resolver |
| **Validation (shared)** | Zod | 3.x | Runtime schema validation on client and server |
| **Animation** | Framer Motion | 11.x | Page transitions, modal animations, micro-animations |
| **Date formatting** | date-fns | 3.x | Date parsing and display formatting |
| **Database** | PostgreSQL | 15.x | Relational data store; enum support; GIN indexes |
| **ORM** | Prisma | 5.x | Type-safe queries; schema migrations; seed scripts |
| **Authentication** | jsonwebtoken | 9.x | JWT sign/verify |
| **Password hashing** | bcrypt (bcryptjs) | 2.x | Password hashing at cost factor ≥10 |
| **Runtime** | Node.js | 20.x LTS | Server runtime |
| **Package manager** | npm | 10.x | Dependency management |
| **Linting** | ESLint + eslint-config-next | latest | Code quality; Next.js rules |
| **Formatting** | Prettier | 3.x | Consistent code style |
| **Hosting** | Vercel | — | Zero-config Next.js deployment |
| **DB Hosting** | Railway / Supabase | — | Managed PostgreSQL for deployed demo |

### Key Dependency Rationale

**shadcn/ui** was chosen over alternatives (MUI, Ant Design, Chakra) because:
- Components are copied into the project (not a black-box dependency) — fully customizable.
- Built on Radix UI primitives ensuring WCAG AA accessibility out of the box.
- Tailwind-native — no CSS-in-JS, no runtime style injection.
- Matches the "beautiful, modern UI" requirement with minimal custom CSS work.

**TanStack Query** was chosen over SWR or custom `useEffect` because:
- Built-in loading/error/refetching states eliminate boilerplate.
- `refetchOnWindowFocus: true` ensures dashboard stat cards reflect real-time state.
- Devtools integration aids POC debugging.

**Prisma** was chosen over Drizzle/Knex because:
- Schema-first with auto-generated types that match the Permit/User/History interfaces.
- Migration workflow (`prisma migrate dev`) suits the POC's iterative development.
- Seed script integration (`prisma db seed`) satisfies NFR-8 demo-readiness.

---

### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "typecheck": "tsc --noEmit"
  }
}
```

### Setup Instructions

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET

# 3. Initialize database schema
npx prisma migrate dev --name init

# 4. Seed demo data
npx prisma db seed

# 5. Start development server
npm run dev
# App available at http://localhost:3000

# Demo login:
# Email:    manager@permit2.dev
# Password: demo1234
```

---

## 7. Integration Points

### Internal Dependencies Only

Permit2 POC is explicitly self-contained. There are **no external business integrations** (email, SMS, ERP, HRMS, webhooks). The only external dependencies are infrastructure-level:

| Dependency | Type | Contract |
|---|---|---|
| PostgreSQL | Database | Connection via `DATABASE_URL` env var. App fails to start if unreachable. |
| Node.js 20 LTS | Runtime | Required for Next.js 14 server-side rendering and API routes. |
| npm registry | Build | `npm install` resolves all dependencies from the public registry. |
| Vercel | Hosting | Connected via GitHub repo. Build: `npm run build`. Env vars configured in dashboard. |
| Google Fonts CDN | Font | Serves `Inter` font via `<link>` in the root layout. Can be self-hosted if CDN unavailable. |

### Database Connection

**Technology:** Prisma Client connects to PostgreSQL.

```typescript
// lib/db.ts — Prisma singleton (prevents multiple connections in dev hot-reload)
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query'] : [] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Startup validation:** If `DATABASE_URL` is unset, Prisma Client throws on first query. A startup check in `next.config.js` or a health-check route can catch this early.

### Deployment Integration

**Vercel (recommended):**
- Connect GitHub repository → Vercel auto-detects Next.js and configures build pipeline.
- Set `DATABASE_URL` and `JWT_SECRET` in Vercel → Settings → Environment Variables.
- Use Railway PostgreSQL or Supabase free tier as the database; copy the connection string.
- Deploy: `git push origin main` → Vercel builds and deploys automatically.

**Railway:**
- Create a Railway project; add a PostgreSQL service.
- Railway auto-injects `DATABASE_URL` into the web service.
- Set `JWT_SECRET` via Railway's variable management.
- Deploy: `railway up` or via GitHub integration.

**Render:**
- Create a "Web Service" connected to the GitHub repo.
- Add a Render PostgreSQL database; connection string is auto-injected.
- Set remaining env vars via Render's environment settings.

### Explicitly Out of Scope Integrations

The following are excluded from Permit2 POC (see PRD §9):

| Integration | Excluded Because |
|---|---|
| Email (SendGrid, Resend) | Notifications out of scope (OOS-3) |
| SMS (Twilio) | Notifications out of scope (OOS-3) |
| SSO / External Auth (Auth0, Okta) | Credential login sufficient for POC (OOS-4) |
| ERP / HRMS systems | No external integrations required (OOS-6) |
| File storage (S3, R2) | File attachments out of scope (OOS-8) |
| Analytics (Mixpanel, Segment) | Advanced analytics out of scope (OOS-10) |
| Webhooks / Event bus | No external consumers in scope (OOS-7) |

---

## Appendix: Related Documents

| Document | Path | Description |
|---|---|---|
| PROJECT.md | `.planning/PROJECT.md` | Project goals and constraints |
| PRD | `project_specs/PRD-Permit2.md` | Product Requirements Document |
| FRD | `project_specs/FRD-Permit2.md` | Functional Requirements Document |
| UserStories | `project_specs/UserStories-Permit2.md` | User Stories |

---

*TechArch generated: 2026-08-06 | Project: Permit2 | Version: 1.0*
