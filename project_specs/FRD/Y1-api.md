---

## Y1: REST API Catalog — Full Endpoint Specifications

**Document:** Permit2 FRD — Cross-Feature Chunk
**Section:** API Endpoints

Complete request/response schemas for all Permit2 REST API endpoints.

**Base URL:** `/api` (all endpoints are prefixed; e.g., `POST /api/auth/login`)
**Content-Type:** `application/json` for all request bodies and responses.
**Authentication:** All endpoints except `POST /auth/login` require `Authorization: Bearer <token>` header.

---

### Response Envelope (All Endpoints)

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

---

## §Auth — Authentication Endpoints

### POST /auth/login

Authenticate a manager with email and password.

**Auth Required:** No

**Request Body:**
```json
{
  "email": "manager@permit2.dev",
  "password": "demo1234"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Non-empty |

**Success Response: `200 OK`**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "a0000000-0000-0000-0000-000000000001",
      "email": "manager@permit2.dev",
      "name": "Alex Manager"
    }
  },
  "error": null,
  "meta": {}
}
```

**JWT Payload:**
```json
{
  "sub": "a0000000-0000-0000-0000-000000000001",
  "email": "manager@permit2.dev",
  "name": "Alex Manager",
  "iat": 1754467200,
  "exp": 1754470800
}
```
Token expiry: 1 hour (`exp = iat + 3600`).

**Error Responses:**
- `400 VALIDATION_ERROR`: Missing or invalid email/password format.
- `401 AUTH_INVALID_CREDENTIALS`: Email not found or password mismatch.

---

### POST /auth/logout

Invalidate the current session.

**Auth Required:** Yes

**Request Body:** None

**Success Response: `200 OK`**
```json
{
  "data": { "message": "Logged out successfully" },
  "error": null,
  "meta": {}
}
```

**Notes:** For stateless JWT, this endpoint acknowledges the logout; the client must discard the token. If a token denylist is implemented, the token is invalidated server-side.

---

### GET /auth/me

Return the authenticated manager's profile.

**Auth Required:** Yes

**Success Response: `200 OK`**
```json
{
  "data": {
    "id": "a0000000-0000-0000-0000-000000000001",
    "email": "manager@permit2.dev",
    "name": "Alex Manager"
  },
  "error": null,
  "meta": {}
}
```

---

## §Permits — Permit Endpoints

### GET /permits

List permits with filtering, sorting, and pagination.

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Type | Default | Rules |
|---|---|---|---|
| `search` | string | — | Substring match on `title`, `applicant_name`, `description` (case-insensitive) |
| `status` | string | — | One of: `PENDING`, `APPROVED`, `REJECTED`, `REVOKED` |
| `type` | string | — | One of: `WORK`, `ACCESS`, `ACTIVITY`, `SAFETY`, `OTHER` |
| `start_date_from` | ISO date | — | `YYYY-MM-DD`; filters permits where `start_date >= value` |
| `start_date_to` | ISO date | — | `YYYY-MM-DD`; filters permits where `start_date <= value` |
| `sort` | string | `created_at` | One of: `title`, `type`, `applicant_name`, `status`, `start_date`, `end_date`, `created_at` |
| `order` | string | `desc` | `asc` or `desc` |
| `page` | integer | `1` | Min 1 |
| `limit` | integer | `20` | Min 1, Max 100 |

**Success Response: `200 OK`**
```json
{
  "data": {
    "items": [
      {
        "id": "b1000000-0000-0000-0000-000000000001",
        "title": "Roof Access — Maintenance",
        "type": "ACCESS",
        "applicant_name": "Tom Bradley",
        "status": "PENDING",
        "start_date": "2026-08-10",
        "end_date": "2026-08-11",
        "created_at": "2026-08-06T09:00:00.000Z",
        "updated_at": "2026-08-06T09:00:00.000Z"
      }
    ]
  },
  "error": null,
  "meta": {
    "total": 47,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

> Note: The list endpoint returns a **summary object** (excludes `description`, `notes`, `rejection_reason`, `revocation_reason`, `status_history`). Full data is returned by `GET /permits/:id`.

---

### GET /permits/stats

Return aggregate permit counts by status.

**Auth Required:** Yes

**No query parameters.**

**Success Response: `200 OK`**
```json
{
  "data": {
    "total": 15,
    "pending": 4,
    "approved": 5,
    "rejected": 3,
    "revoked": 3
  },
  "error": null,
  "meta": {}
}
```

**Implementation Note:** `GET /permits/stats` must be registered BEFORE `GET /permits/:id` in the router so the literal string `stats` is not treated as a permit ID.

---

### POST /permits

Create a new permit.

**Auth Required:** Yes

**Request Body:**
```json
{
  "title": "Electrical Panel Upgrade — Floor 2",
  "type": "WORK",
  "applicant_name": "Sarah Chen",
  "description": "Replacement of the main distribution board on floor 2. Requires power isolation for approximately 4 hours.",
  "start_date": "2026-08-12",
  "end_date": "2026-08-14",
  "notes": "Notify building manager 24h in advance."
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `title` | string | Yes | 1–255 chars |
| `type` | string | Yes | Valid `PermitType` enum value |
| `applicant_name` | string | Yes | 1–255 chars |
| `description` | string | Yes | 1–2000 chars |
| `start_date` | ISO date | Yes | `YYYY-MM-DD`; valid date |
| `end_date` | ISO date | Yes | `YYYY-MM-DD`; `>= start_date` |
| `notes` | string | No | Max 1000 chars; nullable |

**Success Response: `201 Created`**
```json
{
  "data": {
    "id": "b1000000-0000-0000-0000-000000000002",
    "title": "Electrical Panel Upgrade — Floor 2",
    "type": "WORK",
    "applicant_name": "Sarah Chen",
    "description": "Replacement of the main distribution board on floor 2.",
    "notes": "Notify building manager 24h in advance.",
    "status": "PENDING",
    "start_date": "2026-08-12",
    "end_date": "2026-08-14",
    "rejection_reason": null,
    "revocation_reason": null,
    "created_by": "a0000000-0000-0000-0000-000000000001",
    "created_at": "2026-08-06T10:30:00.000Z",
    "updated_at": "2026-08-06T10:30:00.000Z"
  },
  "error": null,
  "meta": {}
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Any field fails validation.
- `401 AUTH_UNAUTHORIZED`: Not authenticated.

---

### GET /permits/:id

Retrieve full permit detail including status history.

**Auth Required:** Yes

**Path Parameter:** `id` — permit UUID

**Success Response: `200 OK`**
```json
{
  "data": {
    "id": "b1000000-0000-0000-0000-000000000002",
    "title": "Electrical Panel Upgrade — Floor 2",
    "type": "WORK",
    "applicant_name": "Sarah Chen",
    "description": "Replacement of the main distribution board on floor 2.",
    "notes": "Notify building manager 24h in advance.",
    "status": "APPROVED",
    "start_date": "2026-08-12",
    "end_date": "2026-08-14",
    "rejection_reason": null,
    "revocation_reason": null,
    "created_by": "a0000000-0000-0000-0000-000000000001",
    "created_at": "2026-08-06T10:30:00.000Z",
    "updated_at": "2026-08-06T11:00:00.000Z",
    "status_history": [
      {
        "id": "h1000000-0000-0000-0000-000000000001",
        "status": "PENDING",
        "event": "CREATED",
        "actor_name": "Alex Manager",
        "notes": null,
        "created_at": "2026-08-06T10:30:00.000Z"
      },
      {
        "id": "h1000000-0000-0000-0000-000000000002",
        "status": "APPROVED",
        "event": "APPROVED",
        "actor_name": "Alex Manager",
        "notes": null,
        "created_at": "2026-08-06T11:00:00.000Z"
      }
    ]
  },
  "error": null,
  "meta": {}
}
```

**Error Responses:**
- `400 VALIDATION_ERROR`: Malformed `id`.
- `401 AUTH_UNAUTHORIZED`: Not authenticated.
- `404 PERMIT_NOT_FOUND`: No permit with that ID.

---

### PATCH /permits/:id/approve

Transition permit from `PENDING` to `APPROVED`.

**Auth Required:** Yes

**Path Parameter:** `id` — permit UUID

**Request Body:**
```json
{
  "notes": "Approved after safety review."
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `notes` | string | No | Max 500 chars; nullable |

**Success Response: `200 OK`**
```json
{
  "data": {
    "id": "b1000000-...",
    "status": "APPROVED",
    "updated_at": "2026-08-06T11:00:00.000Z",
    "rejection_reason": null,
    "revocation_reason": null,
    "status_history": [ ... ]
  },
  "error": null,
  "meta": {}
}
```

**Error Responses:**
- `400 INVALID_TRANSITION`: Permit is not in `PENDING` state.
- `400 VALIDATION_ERROR`: `notes` exceeds 500 chars.
- `401 AUTH_UNAUTHORIZED`
- `404 PERMIT_NOT_FOUND`

---

### PATCH /permits/:id/reject

Transition permit from `PENDING` to `REJECTED`.

**Auth Required:** Yes

**Request Body:**
```json
{
  "reason": "Incomplete safety documentation provided."
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `reason` | string | No | Max 500 chars; stored in `rejection_reason` |

**Success Response: `200 OK`**
```json
{
  "data": {
    "id": "b1000000-...",
    "status": "REJECTED",
    "rejection_reason": "Incomplete safety documentation provided.",
    "revocation_reason": null,
    "updated_at": "2026-08-06T11:05:00.000Z",
    "status_history": [ ... ]
  },
  "error": null,
  "meta": {}
}
```

**Error Responses:**
- `400 INVALID_TRANSITION`: Permit is not in `PENDING` state.
- `401 AUTH_UNAUTHORIZED`
- `404 PERMIT_NOT_FOUND`

---

### PATCH /permits/:id/revoke

Transition permit from `APPROVED` to `REVOKED`.

**Auth Required:** Yes

**Request Body:**
```json
{
  "reason": "Work conditions have changed; permit no longer safe."
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `reason` | string | No | Max 500 chars; stored in `revocation_reason` |

**Success Response: `200 OK`**
```json
{
  "data": {
    "id": "b1000000-...",
    "status": "REVOKED",
    "rejection_reason": null,
    "revocation_reason": "Work conditions have changed; permit no longer safe.",
    "updated_at": "2026-08-06T14:00:00.000Z",
    "status_history": [ ... ]
  },
  "error": null,
  "meta": {}
}
```

**Error Responses:**
- `400 INVALID_TRANSITION`: Permit is not in `APPROVED` state.
- `401 AUTH_UNAUTHORIZED`
- `404 PERMIT_NOT_FOUND`

---

## §Shared — TypeScript Type Definitions

```typescript
// Shared enum types
type PermitStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';
type PermitType = 'WORK' | 'ACCESS' | 'ACTIVITY' | 'SAFETY' | 'OTHER';

// Permit summary (used in GET /permits list)
interface PermitSummary {
  id: string;
  title: string;
  type: PermitType;
  applicant_name: string;
  status: PermitStatus;
  start_date: string;   // ISO date YYYY-MM-DD
  end_date: string;     // ISO date YYYY-MM-DD
  created_at: string;   // ISO datetime
  updated_at: string;   // ISO datetime
}

// Full permit (used in GET /permits/:id and lifecycle action responses)
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
  created_at: string;
}

// Dashboard stats
interface PermitStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  revoked: number;
}
```
