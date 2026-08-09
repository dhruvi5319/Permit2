---
phase: build-the-full-permit2-permit-management
plan: 02
type: execute
wave: 2
depends_on: [1]
files_modified:
  - permit2/lib/auth.ts
  - permit2/lib/permit-service.ts
  - permit2/lib/validations/auth.schema.ts
  - permit2/lib/validations/permit.schema.ts
  - permit2/lib/utils/api-response.ts
  - permit2/lib/utils/errors.ts
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
autonomous: true

features:
  implements: ["F0", "F8"]
  depends_on: ["F9"]
  enables: ["F1", "F2", "F3", "F4", "F5", "F6", "F7"]

must_haves:
  truths:
    - "POST /api/auth/login returns 200 with JWT token + user profile in { data, error, meta } envelope"
    - "POST /api/auth/logout returns 200 and clears httpOnly cookie"
    - "GET /api/auth/me returns 200 with current user profile when valid JWT present"
    - "All /api/permits/* routes reject requests without valid JWT (401)"
    - "GET /api/permits returns paginated list with search/filter/sort support"
    - "GET /api/permits/stats returns { total, pending, approved, rejected, revoked } counts"
    - "POST /api/permits creates permit with status PENDING, created_by from JWT, returns 201"
    - "GET /api/permits/:id returns full permit including status_history array"
    - "PATCH /api/permits/:id/approve transitions PENDING→APPROVED and writes history entry"
    - "PATCH /api/permits/:id/reject transitions PENDING→REJECTED with rejection_reason"
    - "PATCH /api/permits/:id/revoke transitions APPROVED→REVOKED with revocation_reason"
    - "Invalid state machine transitions return 400 INVALID_TRANSITION"
    - "middleware.ts protects all /api routes (except /api/auth/login) at the edge"
  artifacts:
    - path: "permit2/lib/auth.ts"
      provides: "JWT sign/verify, requireAuth middleware helper, extractUser"
      exports: ["signToken", "verifyToken", "requireAuth"]
    - path: "permit2/lib/permit-service.ts"
      provides: "State machine validator + permit CRUD business logic"
      exports: ["validateTransition", "createPermit", "listPermits", "getPermit", "approvePermit", "rejectPermit", "revokePermit", "getStats"]
    - path: "permit2/lib/utils/api-response.ts"
      provides: "{ data, error, meta } envelope helpers"
      exports: ["ok", "created", "badRequest", "unauthorized", "notFound", "serverError"]
    - path: "permit2/lib/utils/errors.ts"
      provides: "Custom error classes: AppError, InvalidTransitionError, NotFoundError"
      exports: ["AppError", "InvalidTransitionError", "NotFoundError"]
    - path: "permit2/lib/validations/auth.schema.ts"
      provides: "Zod schema for login request"
      exports: ["loginSchema"]
    - path: "permit2/lib/validations/permit.schema.ts"
      provides: "Zod schemas: create, approve, reject, revoke, list query"
      exports: ["createPermitSchema", "approveSchema", "rejectSchema", "revokeSchema", "listQuerySchema"]
    - path: "permit2/middleware.ts"
      provides: "Next.js middleware that validates JWT on all /api routes except /api/auth/login"
      contains: "matcher"
    - path: "permit2/app/api/auth/login/route.ts"
      provides: "POST /api/auth/login"
      exports: ["POST"]
    - path: "permit2/app/api/auth/logout/route.ts"
      provides: "POST /api/auth/logout"
      exports: ["POST"]
    - path: "permit2/app/api/auth/me/route.ts"
      provides: "GET /api/auth/me"
      exports: ["GET"]
    - path: "permit2/app/api/permits/route.ts"
      provides: "GET /api/permits, POST /api/permits"
      exports: ["GET", "POST"]
    - path: "permit2/app/api/permits/stats/route.ts"
      provides: "GET /api/permits/stats"
      exports: ["GET"]
    - path: "permit2/app/api/permits/[id]/route.ts"
      provides: "GET /api/permits/[id]"
      exports: ["GET"]
    - path: "permit2/app/api/permits/[id]/approve/route.ts"
      provides: "PATCH /api/permits/[id]/approve"
      exports: ["PATCH"]
    - path: "permit2/app/api/permits/[id]/reject/route.ts"
      provides: "PATCH /api/permits/[id]/reject"
      exports: ["PATCH"]
    - path: "permit2/app/api/permits/[id]/revoke/route.ts"
      provides: "PATCH /api/permits/[id]/revoke"
      exports: ["PATCH"]
  key_links:
    - from: "permit2/app/api/auth/login/route.ts"
      to: "permit2/lib/auth.ts"
      via: "signToken to produce JWT; bcrypt.compare against prisma.user"
      pattern: "signToken"
    - from: "permit2/app/api/permits/[id]/approve/route.ts"
      to: "permit2/lib/permit-service.ts"
      via: "validateTransition(permit.status, 'approve') before DB write"
      pattern: "validateTransition"
    - from: "permit2/middleware.ts"
      to: "permit2/lib/auth.ts"
      via: "verifyToken on every matching request"
      pattern: "verifyToken"
    - from: "permit2/app/api/permits/route.ts"
      to: "permit2/lib/db.ts"
      via: "prisma.permit.findMany with where/orderBy/skip/take"
      pattern: "prisma\\.permit\\.findMany"

integration_contracts:
  requires:
    - from_plan: "01"
      artifact: "permit2/prisma/schema.prisma"
      exports: ["User", "Permit", "PermitStatusHistory", "PermitStatus", "PermitType"]
      verify: "grep -n 'model User' permit2/prisma/schema.prisma && grep -n 'model Permit ' permit2/prisma/schema.prisma && echo CONTRACT_OK"
    - from_plan: "01"
      artifact: "permit2/lib/db.ts"
      exports: ["prisma"]
      verify: "grep -n 'export const prisma' permit2/lib/db.ts && echo CONTRACT_OK"
  provides:
    - artifact: "permit2/lib/auth.ts"
      exports: ["signToken", "verifyToken", "requireAuth"]
      shape: |
        export function signToken(payload: { sub: string; email: string; name: string }): string
        export function verifyToken(token: string): JwtPayload
        export async function requireAuth(request: NextRequest): Promise<JwtPayload>
      verify: "grep -n 'export function signToken' permit2/lib/auth.ts && grep -n 'export function verifyToken' permit2/lib/auth.ts && echo CONTRACT_OK"
    - artifact: "permit2/lib/utils/api-response.ts"
      exports: ["ok", "created", "badRequest", "unauthorized", "notFound", "serverError"]
      shape: |
        export function ok<T>(data: T, meta?: object): NextResponse
        export function created<T>(data: T): NextResponse
        export function badRequest(code: string, message: string, details?: object): NextResponse
        export function unauthorized(code: string, message: string): NextResponse
        export function notFound(message: string): NextResponse
        export function serverError(message: string): NextResponse
      verify: "grep -n 'export function ok' permit2/lib/utils/api-response.ts && grep -n 'export function created' permit2/lib/utils/api-response.ts && echo CONTRACT_OK"
    - artifact: "permit2/lib/permit-service.ts"
      exports: ["validateTransition", "createPermit", "listPermits", "getPermit", "approvePermit", "rejectPermit", "revokePermit", "getStats"]
      shape: |
        export function validateTransition(current: PermitStatus, action: 'approve' | 'reject' | 'revoke'): void  // throws InvalidTransitionError
        export async function createPermit(data: CreatePermitRequest, userId: string): Promise<Permit>
        export async function listPermits(query: PermitListQuery): Promise<{ items: PermitSummary[]; total: number }>
        export async function getPermit(id: string): Promise<Permit>
        export async function approvePermit(id: string, actor: JwtPayload, notes?: string): Promise<Permit>
        export async function rejectPermit(id: string, actor: JwtPayload, reason?: string): Promise<Permit>
        export async function revokePermit(id: string, actor: JwtPayload, reason?: string): Promise<Permit>
        export async function getStats(): Promise<PermitStats>
      verify: "grep -n 'validateTransition' permit2/lib/permit-service.ts && grep -n 'export async function getStats' permit2/lib/permit-service.ts && echo CONTRACT_OK"
    - artifact: "permit2/app/api/auth/login/route.ts"
      exports: ["POST /api/auth/login"]
      shape: |
        POST /api/auth/login
        Request: { email: string, password: string }
        Response 200: { data: { token: string, user: { id, email, name } }, error: null, meta: {} }
        Response 400: { data: null, error: { code: 'VALIDATION_ERROR', message, details? }, meta: {} }
        Response 401: { data: null, error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid email or password.' }, meta: {} }
      verify: "grep -n 'export async function POST' permit2/app/api/auth/login/route.ts && echo CONTRACT_OK"
    - artifact: "permit2/app/api/permits/route.ts"
      exports: ["GET /api/permits", "POST /api/permits"]
      shape: |
        GET /api/permits
        Query: search?, status?, type?, start_date_from?, start_date_to?, sort?, order?, page?, limit?
        Response 200: { data: { items: PermitSummary[] }, error: null, meta: { total, page, limit, totalPages } }

        POST /api/permits
        Request: CreatePermitRequest
        Response 201: { data: Permit, error: null, meta: {} }
      verify: "grep -n 'export async function GET' permit2/app/api/permits/route.ts && grep -n 'export async function POST' permit2/app/api/permits/route.ts && echo CONTRACT_OK"
    - artifact: "permit2/app/api/permits/stats/route.ts"
      exports: ["GET /api/permits/stats"]
      shape: |
        GET /api/permits/stats
        Response 200: { data: { total: number, pending: number, approved: number, rejected: number, revoked: number }, error: null, meta: {} }
      verify: "grep -n 'export async function GET' permit2/app/api/permits/stats/route.ts && echo CONTRACT_OK"
    - artifact: "permit2/app/api/permits/[id]/route.ts"
      exports: ["GET /api/permits/[id]"]
      shape: |
        GET /api/permits/:id
        Response 200: { data: Permit (with status_history array), error: null, meta: {} }
        Response 404: { data: null, error: { code: 'PERMIT_NOT_FOUND', message }, meta: {} }
      verify: "grep -n 'export async function GET' permit2/app/api/permits/\\[id\\]/route.ts && echo CONTRACT_OK"
    - artifact: "permit2/app/api/permits/[id]/approve/route.ts"
      exports: ["PATCH /api/permits/[id]/approve"]
      shape: |
        PATCH /api/permits/:id/approve
        Request: { notes?: string }
        Response 200: { data: Permit (updated, with status_history), error: null, meta: {} }
        Response 400: { data: null, error: { code: 'INVALID_TRANSITION', message }, meta: {} }
      verify: "grep -n 'export async function PATCH' permit2/app/api/permits/\\[id\\]/approve/route.ts && echo CONTRACT_OK"
    - artifact: "permit2/app/api/permits/[id]/reject/route.ts"
      exports: ["PATCH /api/permits/[id]/reject"]
      shape: |
        PATCH /api/permits/:id/reject
        Request: { reason?: string }
        Response 200: { data: Permit (updated, with status_history), error: null, meta: {} }
        Response 400: { data: null, error: { code: 'INVALID_TRANSITION', message }, meta: {} }
      verify: "grep -n 'export async function PATCH' permit2/app/api/permits/\\[id\\]/reject/route.ts && echo CONTRACT_OK"
    - artifact: "permit2/app/api/permits/[id]/revoke/route.ts"
      exports: ["PATCH /api/permits/[id]/revoke"]
      shape: |
        PATCH /api/permits/:id/revoke
        Request: { reason?: string }
        Response 200: { data: Permit (updated, with status_history), error: null, meta: {} }
        Response 400: { data: null, error: { code: 'INVALID_TRANSITION', message }, meta: {} }
      verify: "grep -n 'export async function PATCH' permit2/app/api/permits/\\[id\\]/revoke/route.ts && echo CONTRACT_OK"
---

<objective>
Build the complete Permit2 backend: JWT authentication, all 10 REST API endpoints, state machine enforcement, Zod validation, and Next.js middleware route protection.

Purpose: Wave 3 (UI) depends on all 10 API endpoints being fully functional. This wave delivers auth (F0) and the permit data API (F8) on top of the Wave 1 database foundation.
Output: lib/ support modules (auth.ts, permit-service.ts, validations/, utils/), middleware.ts, and 10 route handler files covering every endpoint in TechArch §4.
</objective>

<feature_dependencies>
Implements: F0: Manager Authentication (login/logout/me, JWT, session, route protection), F8: Permit Data API (all 10 REST endpoints, state machine, search/filter/sort/paginate)
Depends on: F9: Permit Data Model (User, Permit, PermitStatusHistory Prisma models from Wave 1)
Enables: F1 (Dashboard — needs /stats + /permits), F2 (Permit Creation — needs POST /permits), F3 (Permit List — needs GET /permits), F4 (Search & Filter — needs GET /permits query params), F5 (Permit Detail — needs GET /permits/:id), F6 (Lifecycle Actions — needs PATCH /approve /reject /revoke), F7 (Design System — needs data to render)
</feature_dependencies>

<execution_context>
@/root/.local/share/pivota/opencode-xdg/opencode/pivota_spec-framework/workflows/execute-plan.md
</execution_context>

<context>
@permit2/package.json
@permit2/prisma/schema.prisma
@permit2/lib/db.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Utility modules — api-response, errors, auth, validations</name>
  <files>
    permit2/lib/utils/api-response.ts
    permit2/lib/utils/errors.ts
    permit2/lib/auth.ts
    permit2/lib/validations/auth.schema.ts
    permit2/lib/validations/permit.schema.ts
  </files>
  <action>
Work inside `permit2/` (the Next.js app root). Create all utility and validation modules first so route handlers can import them cleanly.

**Step 1 — Create `lib/utils/api-response.ts`**

Every API response uses the `{ data, error, meta }` envelope from TechArch §4:

```typescript
import { NextResponse } from 'next/server';

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function ok<T>(data: T, meta: object = {}): NextResponse {
  return NextResponse.json({ data, error: null, meta }, { status: 200 });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json({ data, error: null, meta: {} }, { status: 201 });
}

export function badRequest(
  code: string,
  message: string,
  details?: Array<{ field: string; message: string }>
): NextResponse {
  const error: ApiError = { code, message, ...(details ? { details } : {}) };
  return NextResponse.json({ data: null, error, meta: {} }, { status: 400 });
}

export function unauthorized(code: string, message: string): NextResponse {
  return NextResponse.json({ data: null, error: { code, message }, meta: {} }, { status: 401 });
}

export function notFound(message: string): NextResponse {
  return NextResponse.json(
    { data: null, error: { code: 'PERMIT_NOT_FOUND', message }, meta: {} },
    { status: 404 }
  );
}

export function serverError(message = 'An unexpected error occurred. Please try again.'): NextResponse {
  return NextResponse.json(
    { data: null, error: { code: 'SERVER_ERROR', message }, meta: {} },
    { status: 500 }
  );
}
```

**Step 2 — Create `lib/utils/errors.ts`**

```typescript
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class InvalidTransitionError extends AppError {
  constructor(current: string, action: string) {
    super(
      'INVALID_TRANSITION',
      `Cannot perform '${action}' on a permit with status '${current}'.`,
      400
    );
    this.name = 'InvalidTransitionError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Permit') {
    super('PERMIT_NOT_FOUND', `${resource} not found.`, 404);
    this.name = 'NotFoundError';
  }
}
```

**Step 3 — Create `lib/auth.ts`**

Uses `jsonwebtoken` (already installed as `jsonwebtoken` or check `package.json`; add if missing: `npm install jsonwebtoken @types/jsonwebtoken`).

```typescript
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { AppError } from './utils/errors';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export function signToken(payload: { sub: string; email: string; name: string }): string {
  if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set.');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError('AUTH_TOKEN_EXPIRED', 'Your session has expired. Please log in again.', 401);
    }
    throw new AppError('AUTH_UNAUTHORIZED', 'Authentication required.', 401);
  }
}

/**
 * Extract and verify the JWT from the Authorization header or the `token` cookie.
 * Throws AppError (401) if missing or invalid.
 */
export async function requireAuth(request: NextRequest): Promise<JwtPayload> {
  // 1. Try Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    return verifyToken(token);
  }
  // 2. Fallback: httpOnly cookie named `token`
  const cookieToken = request.cookies.get('token')?.value;
  if (cookieToken) {
    return verifyToken(cookieToken);
  }
  throw new AppError('AUTH_UNAUTHORIZED', 'Authentication required.', 401);
}
```

**Step 4 — Create `lib/validations/auth.schema.ts`**

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Please enter a valid email address.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

**Step 5 — Create `lib/validations/permit.schema.ts`**

```typescript
import { z } from 'zod';

const permitStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'REVOKED'] as const;
const permitTypes   = ['WORK', 'ACCESS', 'ACTIVITY', 'SAFETY', 'OTHER'] as const;
const sortColumns   = ['title', 'type', 'applicant_name', 'status', 'start_date', 'end_date', 'created_at'] as const;

export const createPermitSchema = z.object({
  title: z
    .string({ required_error: "Field 'title' is required." })
    .min(1, "Field 'title' is required.")
    .max(255, "'title' must not exceed 255 characters."),
  type: z.enum(permitTypes, { required_error: "Field 'type' is required.", invalid_type_error: 'Invalid permit type.' }),
  applicant_name: z
    .string({ required_error: "Field 'applicant_name' is required." })
    .min(1, "Field 'applicant_name' is required.")
    .max(255, "'applicant_name' must not exceed 255 characters."),
  description: z
    .string({ required_error: "Field 'description' is required." })
    .min(1, "Field 'description' is required.")
    .max(2000, "'description' must not exceed 2000 characters."),
  start_date: z
    .string({ required_error: "Field 'start_date' is required." })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "start_date must be in YYYY-MM-DD format."),
  end_date: z
    .string({ required_error: "Field 'end_date' is required." })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "end_date must be in YYYY-MM-DD format."),
  notes: z.string().max(1000, "'notes' must not exceed 1000 characters.").optional().nullable(),
}).refine(
  (d) => new Date(d.end_date) >= new Date(d.start_date),
  { message: 'End date must be on or after the start date.', path: ['end_date'] }
);

export const approveSchema = z.object({
  notes: z.string().max(500).optional().nullable(),
});

export const rejectSchema = z.object({
  reason: z.string().max(500).optional().nullable(),
});

export const revokeSchema = z.object({
  reason: z.string().max(500).optional().nullable(),
});

export const listQuerySchema = z.object({
  search: z.string().max(100).optional(),
  status: z.enum(permitStatuses).optional(),
  type:   z.enum(permitTypes).optional(),
  start_date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  start_date_to:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sort:  z.enum(sortColumns).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreatePermitInput  = z.infer<typeof createPermitSchema>;
export type ApproveInput       = z.infer<typeof approveSchema>;
export type RejectInput        = z.infer<typeof rejectSchema>;
export type RevokeInput        = z.infer<typeof revokeSchema>;
export type ListQueryInput     = z.infer<typeof listQuerySchema>;
```

**Dependency check:** Ensure `jsonwebtoken` and `@types/jsonwebtoken` are installed:
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2
npm list jsonwebtoken 2>/dev/null || npm install jsonwebtoken
npm list @types/jsonwebtoken 2>/dev/null || npm install --save-dev @types/jsonwebtoken
```

Also ensure `zod` is installed (should be present since Next.js 14 installs it):
```bash
npm list zod 2>/dev/null || npm install zod
```
  </action>
  <verify>
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2
grep -n 'export function ok' lib/utils/api-response.ts && echo "API_RESPONSE_OK"
grep -n 'export function signToken' lib/auth.ts && echo "AUTH_SIGN_OK"
grep -n 'export function verifyToken' lib/auth.ts && echo "AUTH_VERIFY_OK"
grep -n 'export async function requireAuth' lib/auth.ts && echo "AUTH_REQUIRE_OK"
grep -n 'InvalidTransitionError' lib/utils/errors.ts && echo "ERRORS_OK"
grep -n 'export const loginSchema' lib/validations/auth.schema.ts && echo "AUTH_SCHEMA_OK"
grep -n 'export const createPermitSchema' lib/validations/permit.schema.ts && echo "PERMIT_SCHEMA_OK"
npx tsc --noEmit --skipLibCheck 2>&1 | head -20 || true
```
  </verify>
  <done>
- `lib/utils/api-response.ts` exports ok, created, badRequest, unauthorized, notFound, serverError
- `lib/utils/errors.ts` exports AppError, InvalidTransitionError, NotFoundError
- `lib/auth.ts` exports signToken, verifyToken, requireAuth — all using JWT_SECRET env var
- `lib/validations/auth.schema.ts` exports loginSchema with email + password validation
- `lib/validations/permit.schema.ts` exports createPermitSchema, approveSchema, rejectSchema, revokeSchema, listQuerySchema with all rules from FRD
- All imports resolve (jsonwebtoken and zod installed)
  </done>
</task>

<task type="auto">
  <name>Task 2: permit-service.ts — state machine, CRUD business logic</name>
  <files>
    permit2/lib/permit-service.ts
  </files>
  <action>
Create `lib/permit-service.ts`. This module is the single source of truth for all permit business logic. Route handlers call service functions; they do NOT query Prisma directly (except for simple read-only queries in the auth routes).

State machine transitions enforced here before any DB write (TechArch §3):
- PENDING → APPROVED (approve)
- PENDING → REJECTED (reject)
- APPROVED → REVOKED (revoke)
- All others → InvalidTransitionError (400)

```typescript
import { Prisma, PermitStatus, PermitType } from '@prisma/client';
import { prisma } from './db';
import { InvalidTransitionError, NotFoundError } from './utils/errors';
import type { CreatePermitInput, ListQueryInput, ApproveInput, RejectInput, RevokeInput } from './validations/permit.schema';
import type { JwtPayload } from './auth';

// ─── State Machine ─────────────────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<string, PermitStatus> = {
  'PENDING:approve':  PermitStatus.APPROVED,
  'PENDING:reject':   PermitStatus.REJECTED,
  'APPROVED:revoke':  PermitStatus.REVOKED,
};

export function validateTransition(
  current: PermitStatus,
  action: 'approve' | 'reject' | 'revoke'
): PermitStatus {
  const key = `${current}:${action}`;
  const next = VALID_TRANSITIONS[key];
  if (!next) throw new InvalidTransitionError(current, action);
  return next;
}

// ─── Type Helpers ──────────────────────────────────────────────────────────────

/** Shape of a permit summary object returned by the list endpoint */
function toSummary(p: {
  id: string; title: string; type: PermitType; applicantName: string;
  status: PermitStatus; startDate: Date; endDate: Date; createdAt: Date; updatedAt: Date;
}) {
  return {
    id: p.id,
    title: p.title,
    type: p.type,
    applicant_name: p.applicantName,
    status: p.status,
    start_date: p.startDate.toISOString().split('T')[0],
    end_date:   p.endDate.toISOString().split('T')[0],
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
  };
}

/** Shape of a full permit object (with status_history) */
function toFull(p: Awaited<ReturnType<typeof prisma.permit.findUniqueOrThrow>> & {
  statusHistory: Array<{
    id: string; status: PermitStatus; event: string; actorName: string; notes: string | null; createdAt: Date;
  }>;
}) {
  return {
    ...toSummary(p),
    description: p.description,
    notes: p.notes,
    rejection_reason: p.rejectionReason,
    revocation_reason: p.revocationReason,
    created_by: p.createdBy,
    status_history: p.statusHistory.map((h) => ({
      id: h.id,
      status: h.status,
      event: h.event,
      actor_name: h.actorName,
      notes: h.notes,
      created_at: h.createdAt.toISOString(),
    })),
  };
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

export async function getStats() {
  const counts = await prisma.permit.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  const result = { total: 0, pending: 0, approved: 0, rejected: 0, revoked: 0 };
  for (const row of counts) {
    const n = row._count.id;
    result.total += n;
    if (row.status === PermitStatus.PENDING)  result.pending  = n;
    if (row.status === PermitStatus.APPROVED) result.approved = n;
    if (row.status === PermitStatus.REJECTED) result.rejected = n;
    if (row.status === PermitStatus.REVOKED)  result.revoked  = n;
  }
  return result;
}

// ─── List ──────────────────────────────────────────────────────────────────────

/** Prisma field name map for sort columns sent from the frontend */
const SORT_FIELD_MAP: Record<string, string> = {
  title: 'title', type: 'type', applicant_name: 'applicantName',
  status: 'status', start_date: 'startDate', end_date: 'endDate', created_at: 'createdAt',
};

export async function listPermits(query: ListQueryInput) {
  const { search, status, type, start_date_from, start_date_to, sort, order, page, limit } = query;

  const where: Prisma.PermitWhereInput = {};

  if (search?.trim()) {
    const term = search.trim();
    where.OR = [
      { title:         { contains: term, mode: 'insensitive' } },
      { applicantName: { contains: term, mode: 'insensitive' } },
      { description:   { contains: term, mode: 'insensitive' } },
    ];
  }
  if (status) where.status = status as PermitStatus;
  if (type)   where.type   = type   as PermitType;

  // Date range on start_date
  if (start_date_from || start_date_to) {
    where.startDate = {};
    if (start_date_from) (where.startDate as Prisma.DateTimeFilter).gte = new Date(start_date_from);
    if (start_date_to)   (where.startDate as Prisma.DateTimeFilter).lte = new Date(start_date_to);
  }

  const sortField = SORT_FIELD_MAP[sort] ?? 'createdAt';
  const orderBy = { [sortField]: order } as Prisma.PermitOrderByWithRelationInput;

  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.permit.findMany({ where, orderBy, skip, take: limit }),
    prisma.permit.count({ where }),
  ]);

  return { items: items.map(toSummary), total };
}

// ─── Create ────────────────────────────────────────────────────────────────────

export async function createPermit(data: CreatePermitInput, userId: string) {
  const permit = await prisma.permit.create({
    data: {
      title:         data.title,
      type:          data.type as PermitType,
      applicantName: data.applicant_name,
      description:   data.description,
      notes:         data.notes ?? null,
      status:        PermitStatus.PENDING,
      startDate:     new Date(data.start_date),
      endDate:       new Date(data.end_date),
      createdBy:     userId,
    },
    include: { statusHistory: true },
  });

  // Write CREATED history entry
  await prisma.permitStatusHistory.create({
    data: {
      permitId:  permit.id,
      status:    PermitStatus.PENDING,
      event:     'CREATED',
      actorId:   userId,
      actorName: permit.creator?.name ?? 'Unknown',
      notes:     null,
    },
  });

  // Re-fetch with history + creator to build full response
  const full = await prisma.permit.findUniqueOrThrow({
    where: { id: permit.id },
    include: { statusHistory: { orderBy: { createdAt: 'asc' } } },
  });
  return toFull(full);
}

// ─── Get One ───────────────────────────────────────────────────────────────────

export async function getPermit(id: string) {
  const permit = await prisma.permit.findUnique({
    where: { id },
    include: { statusHistory: { orderBy: { createdAt: 'asc' } } },
  });
  if (!permit) throw new NotFoundError('Permit');
  return toFull(permit);
}

// ─── Lifecycle Actions ─────────────────────────────────────────────────────────

async function executeTransition(
  id: string,
  actor: JwtPayload,
  action: 'approve' | 'reject' | 'revoke',
  extra?: { rejectionReason?: string; revocationReason?: string; notes?: string }
) {
  return prisma.$transaction(async (tx) => {
    const permit = await tx.permit.findUnique({ where: { id } });
    if (!permit) throw new NotFoundError('Permit');

    const newStatus = validateTransition(permit.status, action);

    const updated = await tx.permit.update({
      where: { id },
      data: {
        status: newStatus,
        ...(extra?.rejectionReason != null  ? { rejectionReason:  extra.rejectionReason }  : {}),
        ...(extra?.revocationReason != null ? { revocationReason: extra.revocationReason } : {}),
      },
      include: { statusHistory: { orderBy: { createdAt: 'asc' } } },
    });

    await tx.permitStatusHistory.create({
      data: {
        permitId:  id,
        status:    newStatus,
        event:     action.toUpperCase(),
        actorId:   actor.sub,
        actorName: actor.name,
        notes:     extra?.notes ?? extra?.rejectionReason ?? extra?.revocationReason ?? null,
      },
    });

    return updated;
  });
}

export async function approvePermit(id: string, actor: JwtPayload, notes?: string | null) {
  const updated = await executeTransition(id, actor, 'approve', { notes: notes ?? undefined });
  return toFull(updated);
}

export async function rejectPermit(id: string, actor: JwtPayload, reason?: string | null) {
  const updated = await executeTransition(id, actor, 'reject', { rejectionReason: reason ?? undefined, notes: reason ?? undefined });
  return toFull(updated);
}

export async function revokePermit(id: string, actor: JwtPayload, reason?: string | null) {
  const updated = await executeTransition(id, actor, 'revoke', { revocationReason: reason ?? undefined, notes: reason ?? undefined });
  return toFull(updated);
}
```

**Note on `createPermit` creator name:** The `creator` relation is not eagerly loaded in the initial `create` call. Refactor to include it by adding a separate lookup for the actor name before the history write, or look up the user once at the route handler layer and pass the name in. The simplest fix: pass `actorName` as a parameter to `createPermit`:

Update the `createPermit` signature to accept `actorName: string`:
```typescript
export async function createPermit(data: CreatePermitInput, userId: string, actorName: string) {
```
And replace `permit.creator?.name ?? 'Unknown'` with `actorName`. The login route handler will pass `user.name` from the JWT payload.
  </action>
  <verify>
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2
grep -n 'validateTransition' lib/permit-service.ts && echo "STATE_MACHINE_OK"
grep -n 'export async function getStats' lib/permit-service.ts && echo "STATS_OK"
grep -n 'export async function listPermits' lib/permit-service.ts && echo "LIST_OK"
grep -n 'export async function createPermit' lib/permit-service.ts && echo "CREATE_OK"
grep -n 'export async function getPermit' lib/permit-service.ts && echo "GET_ONE_OK"
grep -n 'export async function approvePermit' lib/permit-service.ts && echo "APPROVE_OK"
grep -n 'export async function rejectPermit' lib/permit-service.ts && echo "REJECT_OK"
grep -n 'export async function revokePermit' lib/permit-service.ts && echo "REVOKE_OK"
grep -n 'prisma\.\$transaction' lib/permit-service.ts && echo "TX_OK"
npx tsc --noEmit --skipLibCheck 2>&1 | head -20 || true
```
  </verify>
  <done>
- `lib/permit-service.ts` exports validateTransition, createPermit, listPermits, getPermit, approvePermit, rejectPermit, revokePermit, getStats
- validateTransition uses VALID_TRANSITIONS map; throws InvalidTransitionError for any invalid move
- All lifecycle actions use prisma.$transaction to atomically update the permit + insert a history row
- listPermits supports search (OR across title/applicantName/description), status filter, type filter, date range filter, sort, pagination
- toFull() maps snake_case API fields from camelCase Prisma fields (applicant_name ← applicantName, etc.)
  </done>
</task>

<task type="auto">
  <name>Task 3: Auth route handlers (login, logout, me) + middleware</name>
  <files>
    permit2/middleware.ts
    permit2/app/api/auth/login/route.ts
    permit2/app/api/auth/logout/route.ts
    permit2/app/api/auth/me/route.ts
  </files>
  <action>
Create the auth route handlers and Next.js middleware.

**Step 1 — Create `middleware.ts`** (at project root of `permit2/`, i.e. `permit2/middleware.ts`)

The middleware validates JWT on all `/api` routes except `/api/auth/login`. It runs at the edge and returns 401 before the route handler is invoked if the token is missing/invalid/expired.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths — skip auth
  if (pathname === '/api/auth/login') {
    return NextResponse.next();
  }

  // Verify token for all other /api routes
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('token')?.value;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : cookieToken;

  if (!token) {
    return NextResponse.json(
      { data: null, error: { code: 'AUTH_UNAUTHORIZED', message: 'Authentication required.' }, meta: {} },
      { status: 401 }
    );
  }

  try {
    verifyToken(token);
    return NextResponse.next();
  } catch (err: unknown) {
    const appErr = err as { code?: string; message?: string };
    return NextResponse.json(
      {
        data: null,
        error: {
          code:    appErr.code    ?? 'AUTH_UNAUTHORIZED',
          message: appErr.message ?? 'Authentication required.',
        },
        meta: {},
      },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
```

**Step 2 — Create `app/api/auth/login/route.ts`**

```typescript
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations/auth.schema';
import { ok, badRequest, unauthorized, serverError } from '@/lib/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Zod validation
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return badRequest('VALIDATION_ERROR', 'Email and password are required.', details);
    }

    const { email, password } = parsed.data;

    // Look up user — unified error message (never reveal which field is wrong)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return unauthorized('AUTH_INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return unauthorized('AUTH_INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    // Sign JWT
    const token = signToken({ sub: user.id, email: user.email, name: user.name });

    // Set httpOnly cookie (24h) + return token in body
    const response = ok({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return serverError();
  }
}
```

**Step 3 — Create `app/api/auth/logout/route.ts`**

```typescript
import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Require auth so the middleware hasn't already rejected (belt-and-suspenders)
    await requireAuth(request).catch(() => null);

    const response = ok({ message: 'Logged out successfully' });
    // Clear the httpOnly cookie by setting maxAge=0
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('[POST /api/auth/logout]', err);
    return serverError();
  }
}
```

**Step 4 — Create `app/api/auth/me/route.ts`**

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { ok, unauthorized, serverError } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return unauthorized('AUTH_UNAUTHORIZED', 'User not found.');
    }

    return ok({ id: user.id, email: user.email, name: user.name });
  } catch (err: unknown) {
    const appErr = err as { code?: string; message?: string; status?: number };
    if (appErr.status === 401) {
      return unauthorized(appErr.code ?? 'AUTH_UNAUTHORIZED', appErr.message ?? 'Authentication required.');
    }
    console.error('[GET /api/auth/me]', err);
    return serverError();
  }
}
```

**Note on `bcryptjs`:** Ensure `bcryptjs` is installed (Wave 1 seed.ts uses it, so it should be present). Confirm:
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2
npm list bcryptjs 2>/dev/null || npm install bcryptjs
npm list @types/bcryptjs 2>/dev/null || npm install --save-dev @types/bcryptjs
```
  </action>
  <verify>
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2
grep -n 'export async function POST' app/api/auth/login/route.ts && echo "LOGIN_ROUTE_OK"
grep -n 'export async function POST' app/api/auth/logout/route.ts && echo "LOGOUT_ROUTE_OK"
grep -n 'export async function GET' app/api/auth/me/route.ts && echo "ME_ROUTE_OK"
grep -n 'matcher' middleware.ts && echo "MIDDLEWARE_MATCHER_OK"
grep -n "'/api/auth/login'" middleware.ts && echo "MIDDLEWARE_SKIP_OK"
grep -n 'bcrypt.compare' app/api/auth/login/route.ts && echo "BCRYPT_OK"
grep -n 'AUTH_INVALID_CREDENTIALS' app/api/auth/login/route.ts && echo "ERROR_CODE_OK"
npx tsc --noEmit --skipLibCheck 2>&1 | head -20 || true
```
  </verify>
  <done>
- `middleware.ts` has `matcher: ['/api/:path*']` and skips `/api/auth/login` only
- Login route: validates with loginSchema, does bcrypt.compare, returns { data: { token, user }, error: null, meta: {} }, sets httpOnly cookie
- Login returns unified 'Invalid email or password.' for both user-not-found and password-mismatch (no enumeration)
- Logout route: clears httpOnly cookie (maxAge=0), returns { data: { message }, error: null, meta: {} }
- Me route: requires auth, looks up user from JWT sub, returns { id, email, name }
  </done>
</task>

<task type="auto">
  <name>Task 4: Permit route handlers — list, stats, create, detail, lifecycle actions</name>
  <files>
    permit2/app/api/permits/route.ts
    permit2/app/api/permits/stats/route.ts
    permit2/app/api/permits/[id]/route.ts
    permit2/app/api/permits/[id]/approve/route.ts
    permit2/app/api/permits/[id]/reject/route.ts
    permit2/app/api/permits/[id]/revoke/route.ts
  </files>
  <action>
Create all 7 permit route handlers. All are protected (middleware enforces JWT before these execute). Route handlers parse/validate input, call service functions, and return envelope responses.

**Create `app/api/permits/route.ts`** — GET (list) + POST (create)

```typescript
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { listPermits, createPermit } from '@/lib/permit-service';
import { listQuerySchema, createPermitSchema } from '@/lib/validations/permit.schema';
import { ok, created, badRequest, unauthorized, serverError } from '@/lib/utils/api-response';
import type { PaginationMeta } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = request.nextUrl;
    const rawQuery = Object.fromEntries(searchParams.entries());

    const parsed = listQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      // Silently fall back to defaults per FRD validation rules
      const withDefaults = listQuerySchema.parse({});
      const result = await listPermits(withDefaults);
      const meta: PaginationMeta = {
        total: result.total,
        page: withDefaults.page,
        limit: withDefaults.limit,
        totalPages: Math.ceil(result.total / withDefaults.limit),
      };
      return ok({ items: result.items }, meta);
    }

    const query = parsed.data;
    const result = await listPermits(query);
    const meta: PaginationMeta = {
      total: result.total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(result.total / query.limit),
    };
    return ok({ items: result.items }, meta);
  } catch (err: unknown) {
    const appErr = err as { status?: number; code?: string; message?: string };
    if (appErr.status === 401) return unauthorized(appErr.code ?? 'AUTH_UNAUTHORIZED', appErr.message ?? 'Authentication required.');
    console.error('[GET /api/permits]', err);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAuth(request);

    const body = await request.json().catch(() => ({}));
    const parsed = createPermitSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
      return badRequest('VALIDATION_ERROR', details[0]?.message ?? 'Validation error.', details);
    }

    const permit = await createPermit(parsed.data, actor.sub, actor.name);
    return created(permit);
  } catch (err: unknown) {
    const appErr = err as { status?: number; code?: string; message?: string };
    if (appErr.status === 401) return unauthorized(appErr.code ?? 'AUTH_UNAUTHORIZED', appErr.message ?? 'Authentication required.');
    console.error('[POST /api/permits]', err);
    return serverError();
  }
}
```

**Create `app/api/permits/stats/route.ts`** — GET stats

IMPORTANT: In Next.js App Router, `stats/route.ts` is a static segment and is resolved BEFORE `[id]/route.ts`. No special ordering needed — the file-system handles it.

```typescript
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getStats } from '@/lib/permit-service';
import { ok, unauthorized, serverError } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const stats = await getStats();
    return ok(stats);
  } catch (err: unknown) {
    const appErr = err as { status?: number; code?: string; message?: string };
    if (appErr.status === 401) return unauthorized(appErr.code ?? 'AUTH_UNAUTHORIZED', appErr.message ?? 'Authentication required.');
    console.error('[GET /api/permits/stats]', err);
    return serverError();
  }
}
```

**Create `app/api/permits/[id]/route.ts`** — GET single permit

```typescript
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPermit } from '@/lib/permit-service';
import { ok, unauthorized, notFound, serverError } from '@/lib/utils/api-response';
import { NotFoundError } from '@/lib/utils/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const permit = await getPermit(id);
    return ok(permit);
  } catch (err: unknown) {
    if (err instanceof NotFoundError) return notFound(err.message);
    const appErr = err as { status?: number; code?: string; message?: string };
    if (appErr.status === 401) return unauthorized(appErr.code ?? 'AUTH_UNAUTHORIZED', appErr.message ?? 'Authentication required.');
    console.error('[GET /api/permits/[id]]', err);
    return serverError();
  }
}
```

**Create `app/api/permits/[id]/approve/route.ts`**

```typescript
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { approvePermit } from '@/lib/permit-service';
import { approveSchema } from '@/lib/validations/permit.schema';
import { ok, badRequest, unauthorized, notFound, serverError } from '@/lib/utils/api-response';
import { NotFoundError, InvalidTransitionError } from '@/lib/utils/errors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAuth(request);
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const parsed = approveSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('VALIDATION_ERROR', 'Invalid request body.');
    }

    const permit = await approvePermit(id, actor, parsed.data.notes);
    return ok(permit);
  } catch (err: unknown) {
    if (err instanceof InvalidTransitionError) return badRequest(err.code, err.message);
    if (err instanceof NotFoundError) return notFound(err.message);
    const appErr = err as { status?: number; code?: string; message?: string };
    if (appErr.status === 401) return unauthorized(appErr.code ?? 'AUTH_UNAUTHORIZED', appErr.message ?? 'Authentication required.');
    console.error('[PATCH /api/permits/[id]/approve]', err);
    return serverError();
  }
}
```

**Create `app/api/permits/[id]/reject/route.ts`**

```typescript
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { rejectPermit } from '@/lib/permit-service';
import { rejectSchema } from '@/lib/validations/permit.schema';
import { ok, badRequest, unauthorized, notFound, serverError } from '@/lib/utils/api-response';
import { NotFoundError, InvalidTransitionError } from '@/lib/utils/errors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAuth(request);
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const parsed = rejectSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('VALIDATION_ERROR', 'Invalid request body.');
    }

    const permit = await rejectPermit(id, actor, parsed.data.reason);
    return ok(permit);
  } catch (err: unknown) {
    if (err instanceof InvalidTransitionError) return badRequest(err.code, err.message);
    if (err instanceof NotFoundError) return notFound(err.message);
    const appErr = err as { status?: number; code?: string; message?: string };
    if (appErr.status === 401) return unauthorized(appErr.code ?? 'AUTH_UNAUTHORIZED', appErr.message ?? 'Authentication required.');
    console.error('[PATCH /api/permits/[id]/reject]', err);
    return serverError();
  }
}
```

**Create `app/api/permits/[id]/revoke/route.ts`**

```typescript
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { revokePermit } from '@/lib/permit-service';
import { revokeSchema } from '@/lib/validations/permit.schema';
import { ok, badRequest, unauthorized, notFound, serverError } from '@/lib/utils/api-response';
import { NotFoundError, InvalidTransitionError } from '@/lib/utils/errors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAuth(request);
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const parsed = revokeSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('VALIDATION_ERROR', 'Invalid request body.');
    }

    const permit = await revokePermit(id, actor, parsed.data.reason);
    return ok(permit);
  } catch (err: unknown) {
    if (err instanceof InvalidTransitionError) return badRequest(err.code, err.message);
    if (err instanceof NotFoundError) return notFound(err.message);
    const appErr = err as { status?: number; code?: string; message?: string };
    if (appErr.status === 401) return unauthorized(appErr.code ?? 'AUTH_UNAUTHORIZED', appErr.message ?? 'Authentication required.');
    console.error('[PATCH /api/permits/[id]/revoke]', err);
    return serverError();
  }
}
```

**Security note — no X-Frame-Options DENY:** Do NOT add `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'` in middleware or next.config.ts. The Pivota preview uses an iframe and these headers would break it.

**Create required directories** before writing files:
```bash
mkdir -p /root/pivota-workspaces/dhruvi/Permit2/permit2/app/api/auth/login
mkdir -p /root/pivota-workspaces/dhruvi/Permit2/permit2/app/api/auth/logout
mkdir -p /root/pivota-workspaces/dhruvi/Permit2/permit2/app/api/auth/me
mkdir -p /root/pivota-workspaces/dhruvi/Permit2/permit2/app/api/permits/stats
mkdir -p /root/pivota-workspaces/dhruvi/Permit2/permit2/app/api/permits/\[id\]/approve
mkdir -p /root/pivota-workspaces/dhruvi/Permit2/permit2/app/api/permits/\[id\]/reject
mkdir -p /root/pivota-workspaces/dhruvi/Permit2/permit2/app/api/permits/\[id\]/revoke
mkdir -p /root/pivota-workspaces/dhruvi/Permit2/permit2/lib/validations
mkdir -p /root/pivota-workspaces/dhruvi/Permit2/permit2/lib/utils
```
  </action>
  <verify>
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2
# Verify all route files exist with correct exports
grep -n 'export async function GET' app/api/permits/route.ts && echo "PERMITS_GET_OK"
grep -n 'export async function POST' app/api/permits/route.ts && echo "PERMITS_POST_OK"
grep -n 'export async function GET' app/api/permits/stats/route.ts && echo "STATS_GET_OK"
grep -n 'export async function GET' app/api/permits/\[id\]/route.ts && echo "PERMIT_ID_GET_OK"
grep -n 'export async function PATCH' app/api/permits/\[id\]/approve/route.ts && echo "APPROVE_OK"
grep -n 'export async function PATCH' app/api/permits/\[id\]/reject/route.ts && echo "REJECT_OK"
grep -n 'export async function PATCH' app/api/permits/\[id\]/revoke/route.ts && echo "REVOKE_OK"
# Verify state machine error handling
grep -n 'InvalidTransitionError' app/api/permits/\[id\]/approve/route.ts && echo "TRANSITION_ERR_OK"
# TypeScript check
npx tsc --noEmit --skipLibCheck 2>&1 | head -30 || true
```
  </verify>
  <done>
- All 7 permit route files exist with correct HTTP method exports
- GET /api/permits: parses listQuerySchema, calls listPermits, returns items + PaginationMeta
- GET /api/permits/stats: returns { total, pending, approved, rejected, revoked }
- POST /api/permits: validates createPermitSchema, calls createPermit with actor.sub + actor.name, returns 201
- GET /api/permits/[id]: returns full permit with status_history, 404 if not found
- PATCH /api/permits/[id]/approve|reject|revoke: validates body, calls service, returns updated permit; 400 INVALID_TRANSITION for invalid state moves; 404 if not found
- No X-Frame-Options DENY or CSP frame-ancestors headers added
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client→API | HTTP request bodies and query params from browser crossing into Next.js route handlers |
| JWT→handler | Token from Authorization header or httpOnly cookie crossing into auth middleware and requireAuth |
| handler→DB | Prisma queries with user-controlled filter/sort values crossing into PostgreSQL |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-01 | Spoofing | `app/api/auth/login/route.ts` — credential check | mitigate | `bcrypt.compare()` against `user.passwordHash` in `app/api/auth/login/route.ts`. Unified `AUTH_INVALID_CREDENTIALS` response for both user-not-found and wrong-password — no field-level enumeration. |
| T-02-02 | Information disclosure | `app/api/auth/login/route.ts` — password hash exposure | mitigate | `passwordHash` column is never included in any API response. Login returns only `{ id, email, name }`. `prisma.user.findUnique` result used for bcrypt only; response object is constructed explicitly without spreading the Prisma row. |
| T-02-03 | Spoofing | `middleware.ts` — JWT forgery | mitigate | `verifyToken` in `lib/auth.ts` calls `jwt.verify(token, JWT_SECRET)` using HS256. Any tampered token fails verification and returns 401. JWT_SECRET must be ≥32 chars (documented in .env.example). |
| T-02-04 | Elevation of privilege | `app/api/permits/route.ts` POST — created_by injection | mitigate | `created_by` (mapped to `createdBy`) is always set from `actor.sub` extracted from the verified JWT in `requireAuth`. The request body `createPermitSchema` does NOT include a `created_by` field — it cannot be injected by the client. |
| T-02-05 | Elevation of privilege | `app/api/permits/[id]/approve|reject|revoke` — invalid state transition | mitigate | `validateTransition(permit.status, action)` in `lib/permit-service.ts` enforces the state machine before any DB write. Invalid transitions throw `InvalidTransitionError` (400 INVALID_TRANSITION) and abort the Prisma `$transaction` before any mutation. |
| T-02-06 | Tampering | `app/api/permits/route.ts` GET — SQL injection via sort/filter params | mitigate | `listQuerySchema` (Zod) validates `sort` against a closed enum of allowed column names and maps it through `SORT_FIELD_MAP` in `lib/permit-service.ts`. Prisma's parameterized query builder is used for all filter conditions — no string interpolation into SQL. |
| T-02-07 | Information disclosure | `middleware.ts` — internal error detail in 401 response | mitigate | `middleware.ts` catches all errors from `verifyToken` and returns only `{ code, message }` — no stack trace, no internal detail. `catch` block uses the `AppError` shape (`code`, `message`) which is safe to expose. |
| T-02-08 | Denial of service | Route handlers — unbounded request body | accept | Next.js default body limit applies (1MB). For POC, this is acceptable. A production hardening pass would add `export const config = { api: { bodyParser: { sizeLimit: '64kb' } } }` per TechArch §5. Residual risk owned by infrastructure. |
</threat_model>

<verification>
Run after all tasks complete to confirm Wave 2 is green:

```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2

# 1. All utility exports present
grep -n 'export function ok' lib/utils/api-response.ts && echo "API_RESPONSE_OK"
grep -n 'InvalidTransitionError' lib/utils/errors.ts && echo "ERRORS_OK"
grep -n 'export function signToken' lib/auth.ts && echo "AUTH_OK"
grep -n 'export const loginSchema' lib/validations/auth.schema.ts && echo "AUTH_SCHEMA_OK"
grep -n 'export const createPermitSchema' lib/validations/permit.schema.ts && echo "PERMIT_SCHEMA_OK"

# 2. Service exports
grep -n 'validateTransition\|listPermits\|createPermit\|getPermit\|approvePermit\|rejectPermit\|revokePermit\|getStats' lib/permit-service.ts | wc -l

# 3. All 10 route handler files exist with correct exports
grep -n 'export async function POST' app/api/auth/login/route.ts && echo "LOGIN_OK"
grep -n 'export async function POST' app/api/auth/logout/route.ts && echo "LOGOUT_OK"
grep -n 'export async function GET' app/api/auth/me/route.ts && echo "ME_OK"
grep -n 'export async function GET' app/api/permits/route.ts && echo "PERMITS_LIST_OK"
grep -n 'export async function POST' app/api/permits/route.ts && echo "PERMITS_CREATE_OK"
grep -n 'export async function GET' app/api/permits/stats/route.ts && echo "STATS_OK"
grep -n 'export async function GET' app/api/permits/\[id\]/route.ts && echo "PERMIT_DETAIL_OK"
grep -n 'export async function PATCH' app/api/permits/\[id\]/approve/route.ts && echo "APPROVE_OK"
grep -n 'export async function PATCH' app/api/permits/\[id\]/reject/route.ts && echo "REJECT_OK"
grep -n 'export async function PATCH' app/api/permits/\[id\]/revoke/route.ts && echo "REVOKE_OK"

# 4. Middleware protection in place
grep -n "matcher.*api" middleware.ts && echo "MIDDLEWARE_OK"

# 5. TypeScript compiles cleanly
npx tsc --noEmit --skipLibCheck 2>&1 | head -30

# 6. Next.js build (if DATABASE_URL is set)
# npm run build 2>&1 | tail -20
```
</verification>

<success_criteria>
- [ ] `lib/utils/api-response.ts` — ok, created, badRequest, unauthorized, notFound, serverError all exported; every function returns `{ data, error, meta }` envelope
- [ ] `lib/utils/errors.ts` — AppError, InvalidTransitionError, NotFoundError exported
- [ ] `lib/auth.ts` — signToken (HS256 JWT), verifyToken (throws typed AppError), requireAuth (checks Bearer header + cookie)
- [ ] `lib/validations/auth.schema.ts` — loginSchema with email + password rules
- [ ] `lib/validations/permit.schema.ts` — createPermitSchema (end_date ≥ start_date refine), approveSchema, rejectSchema, revokeSchema, listQuerySchema (sort enum, order enum, coerce page/limit)
- [ ] `lib/permit-service.ts` — validateTransition enforces VALID_TRANSITIONS map; all lifecycle actions use prisma.$transaction; listPermits supports all query params; toFull maps camelCase to snake_case
- [ ] `middleware.ts` — matcher covers `/api/:path*`; skips `/api/auth/login`; returns 401 envelope for missing/invalid/expired tokens
- [ ] All 3 auth routes: login (bcrypt + JWT + cookie), logout (clear cookie), me (JWT → user lookup)
- [ ] All 7 permit routes: list (pagination meta in `meta` field), stats, create (201, created_by from JWT), detail (status_history included), approve/reject/revoke (state machine + InvalidTransitionError → 400)
- [ ] No X-Frame-Options DENY or CSP frame-ancestors headers
- [ ] `npx tsc --noEmit --skipLibCheck` exits 0
</success_criteria>

<output>
After completion, create `.planning/express/build-the-full-permit2-permit-management/02-SUMMARY.md` documenting:
- All files created and their exports
- API contract shapes (exact response envelopes for each of the 10 endpoints)
- State machine implementation (VALID_TRANSITIONS map keys and values)
- Auth mechanism (JWT HS256, httpOnly cookie + Bearer header dual support)
- Field name mapping (Prisma camelCase → API snake_case: applicantName→applicant_name, etc.)
- Any deviations from TechArch spec
- Note: params are `Promise<{ id: string }>` in Next.js 16 (App Router) — awaited with `const { id } = await params`
</output>
