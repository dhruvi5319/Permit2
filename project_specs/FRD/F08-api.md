---

## F08: Permit Data API (Backend REST Endpoints)

**Priority:** P0 — Critical
**PRD Reference:** F8

---

### Description

The backend exposes a RESTful API that powers all frontend features. Every user action in the Permit2 UI is backed by an API call to this layer. The API is internal — consumed only by the Permit2 frontend — and does not require public versioning, external documentation, or client SDKs. All endpoints require authentication; all responses use a consistent JSON envelope; all inputs are validated server-side before any database operation.

---

### Terminology

- **JSON Response Envelope:** The standard response structure `{ data, error, meta }` used by every endpoint.
- **Bearer Token:** The JWT included in the `Authorization: Bearer <token>` request header for authentication.
- **Path Parameter:** A value embedded in the URL path (e.g., `:id` in `/permits/:id`).
- **Query Parameter:** A key-value pair in the URL query string (e.g., `?status=PENDING`).
- **Request Body:** JSON payload sent with `POST` and `PATCH` requests.
- **Idempotency:** `GET` requests are always idempotent. `PATCH` lifecycle actions are not idempotent (a second approve on an already-approved permit returns `400`).
- **Middleware:** Server-side functions run before route handlers: authentication check, input validation, error handling.

---

### Sub-features

- **F08.1 — Authentication Endpoints:** Login and logout (→ F00 for full auth spec).
- **F08.2 — Permit List Endpoint:** Paginated, filtered, sorted list of permits.
- **F08.3 — Permit Stats Endpoint:** Aggregate counts by status for the dashboard.
- **F08.4 — Permit Create Endpoint:** Persist a new permit with status `PENDING`.
- **F08.5 — Permit Detail Endpoint:** Retrieve full permit data including status history.
- **F08.6 — Approve Endpoint:** Transition `PENDING` → `APPROVED`.
- **F08.7 — Reject Endpoint:** Transition `PENDING` → `REJECTED` with optional reason.
- **F08.8 — Revoke Endpoint:** Transition `APPROVED` → `REVOKED` with optional reason.
- **F08.9 — Authentication Middleware:** Every non-auth endpoint validates the Bearer token before processing.
- **F08.10 — Input Validation Middleware:** Validate request body and query params; return structured errors on failure.
- **F08.11 — Error Handler Middleware:** Catch unhandled errors; return consistent `500` responses without leaking stack traces.
- **F08.12 — Current User Endpoint:** Return the authenticated manager's profile.

---

### Response Envelope

Every API response — success or failure — uses this structure:

```json
{
  "data": { ... } | null,
  "error": null | { "code": "ERROR_CODE", "message": "Human-readable message", "details": [...] },
  "meta": { ... }
}
```

- `data`: the response payload (object, array, or null on error).
- `error`: null on success; structured error object on failure.
- `meta`: pagination info, timestamps, or empty object `{}`.

---

### Authentication Middleware Specification

Applied to all routes except `POST /auth/login`:

1. Extract `Authorization` header; expect `Bearer <token>` format.
2. If header missing or malformed → `401 AUTH_UNAUTHORIZED`.
3. Verify JWT signature using the server secret.
4. If signature invalid or token malformed → `401 AUTH_UNAUTHORIZED`.
5. Check `exp` claim; if expired → `401 AUTH_TOKEN_EXPIRED`.
6. Extract `sub` (user ID) from token; attach `req.user = { id, email, name }` for downstream handlers.
7. If user no longer exists in the database → `401 AUTH_UNAUTHORIZED` (optional DB check; recommended for POC simplicity to skip and trust the token).

---

### Endpoint Catalog

#### Auth Endpoints

**`POST /auth/login`**
- Auth required: No
- Body: `{ email: string, password: string }`
- Success: `200` `{ data: { token, user } }`
- Errors: `400 VALIDATION_ERROR`, `401 AUTH_INVALID_CREDENTIALS`

**`POST /auth/logout`**
- Auth required: Yes
- Body: none
- Success: `200` `{ data: { message: "Logged out successfully" } }`
- Notes: For stateless JWT, this is a client-side clear (server acknowledges). If using a token denylist, invalidate the token.

**`GET /auth/me`**
- Auth required: Yes
- Success: `200` `{ data: { id, email, name } }`
- Errors: `401 AUTH_UNAUTHORIZED`

---

#### Permit Endpoints

**`GET /permits`**
- Auth required: Yes
- Query params: `search`, `status`, `type`, `start_date_from`, `start_date_to`, `sort`, `order`, `page`, `limit`
- Success: `200` with paginated items array + pagination meta
- Errors: `401`, `500`

**`GET /permits/stats`**
- Auth required: Yes
- No query params
- Success: `200` `{ data: { total, pending, approved, rejected, revoked } }`
- Errors: `401`, `500`
- Notes: `/permits/stats` must be registered BEFORE `/permits/:id` in the router to avoid `stats` being matched as a permit ID.

**`POST /permits`**
- Auth required: Yes
- Body: `{ title, type, applicant_name, description, start_date, end_date, notes? }`
- Success: `201` with full permit object
- Errors: `400 VALIDATION_ERROR`, `401`, `500`

**`GET /permits/:id`**
- Auth required: Yes
- Path param: `id` (UUID or integer)
- Success: `200` with full permit object including `status_history` array
- Errors: `400 VALIDATION_ERROR`, `401`, `404 PERMIT_NOT_FOUND`, `500`

**`PATCH /permits/:id/approve`**
- Auth required: Yes
- Body: `{ notes?: string }` (optional, max 500 chars)
- Success: `200` with updated permit object
- Errors: `400 INVALID_TRANSITION`, `400 VALIDATION_ERROR`, `401`, `404`, `500`

**`PATCH /permits/:id/reject`**
- Auth required: Yes
- Body: `{ reason?: string }` (optional, max 500 chars)
- Success: `200` with updated permit object
- Errors: `400 INVALID_TRANSITION`, `400 VALIDATION_ERROR`, `401`, `404`, `500`

**`PATCH /permits/:id/revoke`**
- Auth required: Yes
- Body: `{ reason?: string }` (optional, max 500 chars)
- Success: `200` with updated permit object
- Errors: `400 INVALID_TRANSITION`, `400 VALIDATION_ERROR`, `401`, `404`, `500`

---

### Input Validation Specification

All validation runs server-side (client validation is defence-in-depth, not the primary gate).

**Shared permit field rules:**
- `title`: string, required, 1–255 chars
- `type`: required, must be one of `WORK`, `ACCESS`, `ACTIVITY`, `SAFETY`, `OTHER`
- `applicant_name`: string, required, 1–255 chars
- `description`: string, required, 1–2000 chars
- `notes`: string, optional, max 1000 chars, nullable
- `start_date`: required, ISO 8601 date format `YYYY-MM-DD`, parseable by the database
- `end_date`: required, ISO 8601 date format, `end_date >= start_date`
- `reason` (on lifecycle actions): string, optional, max 500 chars

**Validation error response format:**
```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": [
      { "field": "title", "message": "Title is required." },
      { "field": "end_date", "message": "End date must be on or after the start date." }
    ]
  },
  "meta": {}
}
```

---

### Pagination Response Meta

All paginated endpoints (`GET /permits`) return:
```json
{
  "meta": {
    "total": 47,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### Process

**Request Lifecycle (every API call):**
1. Request arrives at the server.
2. Authentication middleware: validates Bearer token; attaches `req.user` or returns `401`.
3. Route handler: validates path params, query params, request body.
4. Business logic layer: validates state machine rules (for lifecycle actions).
5. Database operation (Prisma/ORM).
6. Response serialized to JSON envelope and returned.
7. Any unhandled error caught by global error handler middleware; sanitized `500` returned.

---

### Inputs

See per-endpoint input specs above and full request schemas → `Y1-api.md`.

---

### Outputs

See per-endpoint success/error specs above and full response schemas → `Y1-api.md`.

---

### Validation Rules

- All routes (except login) require valid JWT in `Authorization` header.
- Server always re-validates inputs regardless of client-side validation.
- State machine transitions validated before any DB write.
- Max request body size: 64KB (to prevent request flooding in POC context).
- Content-Type for all POST/PATCH requests must be `application/json`; mismatched type returns `415 Unsupported Media Type`.

---

### Error States

| Scenario | HTTP Status | Error Code | Message |
|---|---|---|---|
| Missing/invalid auth token | 401 | `AUTH_UNAUTHORIZED` | "Authentication required." |
| Expired token | 401 | `AUTH_TOKEN_EXPIRED` | "Your session has expired." |
| Input validation failure | 400 | `VALIDATION_ERROR` | "Validation failed." + field details |
| Invalid state transition | 400 | `INVALID_TRANSITION` | "This permit cannot be [action]: it is currently [status]." |
| Resource not found | 404 | `PERMIT_NOT_FOUND` | "Permit not found." |
| Route not found | 404 | `NOT_FOUND` | "The requested resource does not exist." |
| Wrong content type | 415 | `UNSUPPORTED_MEDIA_TYPE` | "Content-Type must be application/json." |
| Internal server error | 500 | `SERVER_ERROR` | "An unexpected error occurred." |

---

### API Surface (this feature)

This feature IS the API surface. Full schemas → `Y1-api.md`.

---

### Schema Surface (this feature)

All database tables → `Y0-schema.md`.
