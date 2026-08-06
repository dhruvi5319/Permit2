# Functional Requirements Document
## Permit2 — Permit Management System (POC)

**Document Version:** 1.0
**Date:** 2026-08-06
**Status:** Active
**Acronym:** Permit2
**Derived From:** PRD-Permit2.md v1.0

---

## Scope

This FRD specifies the functional behaviour of every feature in the Permit2 POC. It is the authoritative reference for implementation: developers must be able to build each feature from this document alone without returning to the PRD. The FRD covers all layers — frontend screens and flows, backend REST API, and database schema — for all ten PRD features (F0–F9).

---

## Conventions

- **Feature IDs** match PRD: `F0`–`F9`. Chunk filenames use zero-padded form (`F00`, `F01`, …, `F09`) for correct lexicographic sort.
- **Status enum values** are written in `SCREAMING_SNAKE_CASE` throughout (e.g., `PENDING`, `APPROVED`).
- **HTTP methods** are written in `UPPER CASE`; paths use `:param` notation for path parameters.
- **Required** fields are marked `(required)`; optional fields `(optional)`.
- **Cross-references** use the pattern `→ F{n}` or `→ Y0-schema.md §TableName`.
- **Error table columns:** Scenario | HTTP Status | Error Code | Message.
- **API summary tables** in feature chunks are abbreviated; full request/response schemas live in `Y1-api.md`.
- **DDL** in feature chunks is abbreviated; full DDL lives in `Y0-schema.md`.

---

## Master Table of Contents

| Chunk File | Section |
|---|---|
| `00-header.md` | This file — conventions, TOC, shared terminology |
| `F00-auth.md` | F0: Manager Authentication |
| `F01-dashboard.md` | F1: Manager Dashboard |
| `F02-permit-creation.md` | F2: Permit Creation |
| `F03-permit-list.md` | F3: Permit List / Table View |
| `F04-search-filter.md` | F4: Search & Filter |
| `F05-permit-detail.md` | F5: Permit Detail View |
| `F06-lifecycle-actions.md` | F6: Permit Lifecycle Actions (Approve / Reject / Revoke) |
| `F07-design-system.md` | F7: UI Design System & Visual Polish |
| `F08-api.md` | F8: Permit Data API (Backend REST Endpoints) |
| `F09-data-model.md` | F9: Permit Data Model & Persistence |
| `Y0-schema.md` | Database DDL — all tables |
| `Y1-api.md` | REST API catalog — all endpoints |
| `Y2-errors.md` | Cross-feature error catalog |
| `Y3-integrations.md` | External integration points |

---

## Shared Terminology

| Term | Definition |
|---|---|
| **Manager** | The sole user persona; a team lead or department manager who creates and acts on permits. |
| **Permit** | A formal record representing a work, access, activity, or safety authorization. |
| **Permit Lifecycle** | The ordered state machine: `PENDING` → `APPROVED` or `REJECTED`; `APPROVED` → `REVOKED`. |
| **Terminal State** | A permit status from which no further transitions are allowed: `REJECTED`, `REVOKED`. |
| **Session** | An authenticated context established after login; persists across page refreshes until logout. |
| **JWT** | JSON Web Token used as the bearer token for API authentication. |
| **Toast** | A transient, non-blocking notification message displayed in the UI corner. |
| **Skeleton Screen** | A loading placeholder that mimics the shape of the content being loaded. |
| **Status Badge** | A color-coded pill-shaped UI element showing the current permit status. |
| **Confirmation Dialog** | A modal overlay requiring explicit user confirmation before executing a destructive or irreversible action. |
| **POC** | Proof of Concept — this project's scope boundary. |
| **CRUD** | Create, Read, Update, Delete — standard data operations. |
| **ORM** | Object-Relational Mapper (Prisma in the recommended stack). |

---

## Permit Status State Machine

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
        │ APPROVED │         │ REJECTED │  (terminal)
        └────┬─────┘         └──────────┘
             │ revoke
             ▼
        ┌─────────┐
        │ REVOKED │  (terminal)
        └─────────┘
```

Valid transitions:
- `PENDING` → `APPROVED` (approve action)
- `PENDING` → `REJECTED` (reject action)
- `APPROVED` → `REVOKED` (revoke action)

Invalid transitions (all others) return `400 Bad Request`.

---

## Permit Type Enum

| Value | Display Label |
|---|---|
| `WORK` | Work Permit |
| `ACCESS` | Access Permit |
| `ACTIVITY` | Activity Authorization |
| `SAFETY` | Safety Permit |
| `OTHER` | Other |

---

*End of header — continue to F00-auth.md*
---

## F00: Manager Authentication

**Priority:** P0 — Critical
**PRD Reference:** F0

---

### Description

Manager Authentication is the security gate for the entire Permit2 application. It provides a credential-based login flow (email + password), establishes a persistent session, and enforces route protection across all pages. No application functionality is accessible without an authenticated session. For the POC, a single user type (Manager) exists; multi-role and SSO are out of scope.

---

### Terminology

- **Credentials:** Email address and plaintext password submitted by the user during login.
- **Password Hash:** bcrypt-hashed representation of the password stored in the database (never stored in plaintext).
- **Session Token:** A JWT or session cookie issued on successful login; sent with every subsequent API request.
- **Protected Route:** Any application page that requires an authenticated session; unauthenticated access triggers a redirect to `/login`.
- **Redirect-After-Login:** The URL the user originally attempted to access, to which they are sent after successful login.

---

### Sub-features

- **F00.1 — Login Page UI:** A styled login page with email and password inputs, a submit button, and inline validation error states.
- **F00.2 — Credential Validation:** Client-side format validation (non-empty, valid email format) before submission.
- **F00.3 — Server-Side Authentication:** API verifies email exists and bcrypt-compares the submitted password against the stored hash.
- **F00.4 — Session Establishment:** On success, a JWT (or session cookie) is issued and stored client-side (httpOnly cookie preferred).
- **F00.5 — Persistent Session:** Session survives page refreshes; the user is not required to re-login on every visit.
- **F00.6 — Logout:** A logout action in the navigation header clears the session on both server and client, then redirects to `/login`.
- **F00.7 — Protected Route Guard:** A client-side route guard checks for a valid session on every navigation; unauthenticated users are redirected to `/login` with the original URL preserved as a query parameter (`?redirect=...`).
- **F00.8 — Seed Manager Account:** At least one manager account is pre-seeded in the database for demo use (see → F09).

---

### Screens & UI Flows

#### Screen: Login Page (`/login`)

**Layout:**
- Centered card on a full-height background using the brand primary color gradient or a subtle pattern.
- Application logo / wordmark "Permit2" above the form card.
- Card contains:
  - Heading: "Sign in to Permit2"
  - Subheading: "Manage your permits in one place"
  - Email input field (label: "Email address", type: `email`, placeholder: `manager@company.com`)
  - Password input field (label: "Password", type: `password`, placeholder: `••••••••`)
  - "Sign In" primary button (full-width, brand color)
  - Inline error banner below the form for credential errors (see Error States)
- Footer note: "Permit2 POC — Restricted Access"

**UI Behavior:**
- On page load, focus is placed on the email field.
- "Sign In" button enters a loading state (spinner icon + "Signing in…" text) while the API call is in flight; button is disabled during loading.
- On success: redirect to dashboard (`/dashboard`) or the `?redirect` URL if present.
- On failure: display inline error message; password field is cleared; focus returns to the password field.
- The login page is inaccessible to already-authenticated users — navigating to `/login` while logged in redirects to `/dashboard`.

---

### Process

1. User navigates to any protected route or directly to `/login`.
2. System renders the Login Page (F00.1).
3. User enters email and password.
4. Client performs format validation (F00.2): non-empty check, email regex. If invalid, show inline field errors; do not submit.
5. User clicks "Sign In" — button enters loading state; `POST /auth/login` is called with `{ email, password }`.
6. Server looks up user by email; if not found → return `401` with `AUTH_INVALID_CREDENTIALS`.
7. Server bcrypt-compares submitted password with stored hash; if mismatch → return `401` with `AUTH_INVALID_CREDENTIALS`.
8. On match: server generates a JWT (payload: `{ sub: userId, email, name, iat, exp }`); returns it in response body and/or sets httpOnly cookie.
9. Client stores the token (cookie or secure storage); session state is updated.
10. Client redirects to `/dashboard` (or `?redirect` URL).
11. All subsequent API calls include the token in the `Authorization: Bearer <token>` header (or the cookie is sent automatically).
12. On logout: user clicks "Logout" in nav → `POST /auth/logout` called → server invalidates token (or clears cookie) → client clears local session state → redirect to `/login`.

---

### Inputs

**Login Form:**
- `email` (string, required): User's email address. Must be valid email format (`RFC 5322` simplified regex).
- `password` (string, required): User's password. Min 1 character client-side (server validates bcrypt hash).

**Logout:**
- No body; session token extracted from cookie or `Authorization` header.

---

### Outputs

**Successful Login Response (`200 OK`):**
```json
{
  "data": {
    "token": "<JWT string>",
    "user": {
      "id": "uuid",
      "email": "manager@company.com",
      "name": "Jane Manager"
    }
  },
  "error": null,
  "meta": {}
}
```

**Successful Logout Response (`200 OK`):**
```json
{
  "data": { "message": "Logged out successfully" },
  "error": null,
  "meta": {}
}
```

---

### Validation Rules

- `email`: required, non-empty, valid email format (client + server).
- `password`: required, non-empty (client); actual security check is bcrypt comparison (server).
- A generic error message is returned for both "user not found" and "wrong password" — do not disclose which field is wrong (prevents user enumeration).
- JWT expiry: access token `exp` set to `1 hour`. Session cookie `maxAge` set to `24 hours` (sliding window on activity, or fixed — implementer choice for POC).
- No brute-force protection required for POC (out of scope), but the generic error message reduces enumeration risk.

---

### Error States

| Scenario | HTTP Status | Error Code | Message |
|---|---|---|---|
| Empty email or password | 400 | `VALIDATION_ERROR` | "Email and password are required." |
| Invalid email format | 400 | `VALIDATION_ERROR` | "Please enter a valid email address." |
| Invalid credentials (user not found or wrong password) | 401 | `AUTH_INVALID_CREDENTIALS` | "Invalid email or password." |
| Account does not exist (unified message) | 401 | `AUTH_INVALID_CREDENTIALS` | "Invalid email or password." |
| Token expired on a protected API call | 401 | `AUTH_TOKEN_EXPIRED` | "Your session has expired. Please log in again." |
| Missing or malformed token on protected API call | 401 | `AUTH_UNAUTHORIZED` | "Authentication required." |
| Server error during auth | 500 | `SERVER_ERROR` | "An unexpected error occurred. Please try again." |

---

### API Surface (this feature)

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/login` | Authenticate; returns JWT + user info |
| `POST` | `/auth/logout` | Invalidate session / clear cookie |
| `GET` | `/auth/me` | Return current user info from token |

Full request/response schemas → `Y1-api.md` §Auth.

---

### Schema Surface (this feature)

Uses table: `users` (`id`, `email`, `password_hash`, `name`, `created_at`).

Full DDL → `Y0-schema.md` §Users.
---

## F01: Manager Dashboard

**Priority:** P0 — Critical
**PRD Reference:** F1

---

### Description

The Manager Dashboard is the primary landing page after login. It provides an at-a-glance overview of the entire permit landscape through summary stat cards, a visual status chart, a recent activity feed, and a prominent "Create New Permit" call-to-action. The dashboard must reflect real-time database state — no stale caching that would mislead a manager acting on permit data.

---

### Terminology

- **Stat Card:** A card-shaped UI element displaying a single aggregate metric (e.g., "Total Permits: 42").
- **Status Breakdown Chart:** A donut or bar chart visualizing the distribution of permits across all status values.
- **Recent Activity Feed:** A chronological list of the most recently created or updated permits.
- **CTA (Call-to-Action):** A prominent button that drives the primary user action; here, "Create New Permit."
- **Real-Time State:** Dashboard data is fetched fresh on every page load and on focus return; no persistent client-side cache that could show stale counts.

---

### Sub-features

- **F01.1 — Stat Cards:** Five summary count cards showing Total, Pending, Approved, Rejected, Revoked permit counts.
- **F01.2 — Status Breakdown Chart:** Visual chart (donut preferred) showing permit distribution by status.
- **F01.3 — Recent Activity Feed:** A list of the 5–10 most recently created or updated permits with status badge and link to detail.
- **F01.4 — Create New Permit CTA:** A prominent button linking to the permit creation flow (→ F02).
- **F01.5 — Navigation Integration:** Dashboard is accessible via the persistent nav bar (item: "Dashboard").
- **F01.6 — Loading Skeletons:** Skeleton placeholders displayed while dashboard data is being fetched.
- **F01.7 — Empty State:** Graceful empty state when no permits exist yet (first use, or all permits deleted — POC scenario).

---

### Screens & UI Flows

#### Screen: Dashboard (`/dashboard`)

**Page Structure (top to bottom):**

1. **Page Header**
   - Heading: "Dashboard"
   - Subheading: "Welcome back, [Manager Name]"
   - Right side: "Create New Permit" primary button (links to `/permits/new`)

2. **Stat Cards Row** (horizontal row of 5 cards on desktop, 2-column grid on tablet)
   - Each card: icon + metric label + large count number + optional subtle trend indicator
   - Card variants by status:
     - **Total Permits** — neutral/brand color, icon: document stack
     - **Pending** — amber/yellow, icon: clock/hourglass
     - **Approved** — green, icon: checkmark circle
     - **Rejected** — red, icon: X circle
     - **Revoked** — gray/slate, icon: ban/slash circle
   - Card click: navigates to Permit List (`/permits`) filtered to that status (e.g., `/permits?status=PENDING`)

3. **Middle Section** (two-column layout on desktop, stacked on tablet)
   - **Left column (~60%):** Status Breakdown Chart
     - Donut chart with status color legend
     - Center label: total permit count
     - Hover tooltip on each segment: status name + count + percentage
     - Title: "Permits by Status"
   - **Right column (~40%):** Recent Activity Feed
     - Title: "Recent Activity"
     - List of 5–10 most recent permits (ordered by `updated_at DESC`)
     - Each row: status badge + permit title (truncated at ~40 chars) + applicant name + relative time (e.g., "2 hours ago")
     - Each row is clickable → navigates to `/permits/:id`
     - "View all permits" link at bottom → `/permits`

4. **Empty State** (shown when 0 permits exist):
   - Centered illustration or icon
   - Heading: "No permits yet"
   - Body: "Create your first permit to get started."
   - "Create New Permit" button

**Loading State:**
- Stat cards show skeleton rectangles (5 cards, same layout)
- Chart area shows a skeleton circle
- Recent activity shows 5 skeleton rows
- Skeletons animate with a shimmer effect

---

### Process

1. Authenticated manager navigates to `/dashboard` (or is redirected here after login).
2. Dashboard component mounts; triggers parallel API calls:
   - `GET /permits/stats` → returns aggregate counts per status (Total, Pending, Approved, Rejected, Revoked)
   - `GET /permits?limit=10&sort=updated_at:desc` → returns recent 10 permits
3. While API calls are in-flight, skeleton screens are displayed (F01.6).
4. On data receipt, skeletons are replaced with:
   - Populated stat cards (F01.1)
   - Rendered donut chart (F01.2)
   - Populated recent activity list (F01.3)
5. If both API calls resolve with empty data (0 permits), render empty state (F01.7).
6. Manager clicks a stat card → navigates to `/permits?status={STATUS}` (→ F03, F04).
7. Manager clicks a row in recent activity → navigates to `/permits/:id` (→ F05).
8. Manager clicks "Create New Permit" → navigates to `/permits/new` (→ F02).
9. On window focus return (tab switch back), data is re-fetched to reflect any updates made in other tabs (React Query `refetchOnWindowFocus: true`).

---

### Inputs

- No direct user inputs on the dashboard (read-only view).
- Implicit inputs via navigation: status filter (from stat card click) passed as query params to Permit List.

---

### Outputs

**Dashboard Data (from `GET /permits/stats`):**
```json
{
  "data": {
    "total": 42,
    "pending": 8,
    "approved": 25,
    "rejected": 5,
    "revoked": 4
  },
  "error": null,
  "meta": {}
}
```

**Recent Activity (from `GET /permits?limit=10&sort=updated_at:desc`):**
- Array of permit summary objects; full shape defined in `Y1-api.md` §Permits.

---

### Validation Rules

- Stat counts must exactly match the actual database counts at time of fetch — no approximations, no cached totals.
- `total` must equal `pending + approved + rejected + revoked`.
- If the stats endpoint returns data inconsistent with this invariant, log a warning but render whatever the server returns (data integrity is enforced server-side → see F09).
- Recent activity list must be ordered by `updated_at DESC`, not `created_at DESC`, so the most recently actioned permits appear first.

---

### Error States

| Scenario | HTTP Status | Error Code | UI Behaviour |
|---|---|---|---|
| Stats API call fails | 500 | `SERVER_ERROR` | Stat cards show error state with "–" count and a retry icon; toast: "Could not load dashboard stats." |
| Recent activity API call fails | 500 | `SERVER_ERROR` | Recent activity panel shows an error message with a "Retry" button. |
| Both calls fail | 500 | `SERVER_ERROR` | Full-page error message with a "Refresh" button. |
| No permits exist | — | — | Empty state UI (F01.7); no error — this is a valid state. |

---

### API Surface (this feature)

| Method | Path | Description |
|---|---|---|
| `GET` | `/permits/stats` | Returns aggregate counts per status |
| `GET` | `/permits` | Returns paginated permit list (used here with `limit=10&sort=updated_at:desc`) |

Full request/response schemas → `Y1-api.md` §Permits.

---

### Schema Surface (this feature)

Uses table: `permits` (aggregated via `COUNT` + `GROUP BY status`).

Full DDL → `Y0-schema.md` §Permits.
---

## F02: Permit Creation

**Priority:** P0 — Critical
**PRD Reference:** F2

---

### Description

Permit Creation provides managers with a clean, well-structured form to submit new permit requests. On submission, the permit is persisted in the database with status `PENDING` and the manager is directed to the new permit's detail view. The form must be intuitive, with logical field grouping, clear labels, and immediate validation feedback — reflecting the application's visual polish standard.

---

### Terminology

- **Permit Form:** The multi-field creation form accessible at `/permits/new`.
- **Permit Type Selector:** A styled dropdown or segmented control for selecting the permit category (`WORK`, `ACCESS`, `ACTIVITY`, `SAFETY`, `OTHER`).
- **Date Picker:** A calendar-based UI control for selecting start and end dates.
- **Inline Validation Error:** A field-level error message displayed immediately below the relevant input on blur or submit attempt.
- **Optimistic Navigation:** Navigating to the new permit's detail page immediately after a successful API response.

---

### Sub-features

- **F02.1 — Permit Creation Form UI:** A full-page form at `/permits/new` with all required and optional fields.
- **F02.2 — Field Grouping:** Fields logically grouped into sections (Basic Info, Dates, Additional Details).
- **F02.3 — Client-Side Validation:** All required fields validated before API submission; clear inline error messages.
- **F02.4 — Permit Type Selector:** Dropdown populated from the Permit Type Enum (→ 00-header.md §PermitTypeEnum).
- **F02.5 — Date Range Pickers:** Start date and end date pickers; end date must be on or after start date.
- **F02.6 — Form Submission:** `POST /permits` API call; button enters loading state during submission.
- **F02.7 — Post-Submit Navigation:** On success, navigate to `/permits/:newId` (permit detail view).
- **F02.8 — Cancel Action:** "Cancel" button returns to previous page without saving.
- **F02.9 — Accessible Form Labels:** All inputs have associated `<label>` elements for screen reader and click-to-focus support.

---

### Screens & UI Flows

#### Screen: Permit Creation Form (`/permits/new`)

**Page Structure:**

1. **Page Header**
   - Breadcrumb: Dashboard → Permits → New Permit
   - Heading: "Create New Permit"
   - Subheading: "Fill in the details below to submit a new permit request."

2. **Form Card** (centered, max-width ~720px, elevated card style)

   **Section 1 — Basic Information**
   - **Permit Title** (text input, required)
     - Label: "Permit Title"
     - Placeholder: "e.g., Electrical Work — Building A"
     - Max length: 255 characters
   - **Permit Type** (select/dropdown, required)
     - Label: "Permit Type"
     - Options: Work Permit, Access Permit, Activity Authorization, Safety Permit, Other
     - Default: placeholder "Select a permit type…"
   - **Applicant Name** (text input, required)
     - Label: "Applicant / Requester Name"
     - Placeholder: "Full name of the permit requester"
     - Max length: 255 characters

   **Section 2 — Dates**
   - **Start Date** (date picker, required)
     - Label: "Start Date"
     - Minimum: today's date
   - **End Date** (date picker, required)
     - Label: "End Date"
     - Minimum: start date (dynamically updated when start date changes)

   **Section 3 — Details**
   - **Description / Purpose** (textarea, required)
     - Label: "Description / Purpose"
     - Placeholder: "Describe the purpose of this permit…"
     - Rows: 4 minimum; auto-expands with content
     - Max length: 2000 characters
   - **Additional Notes** (textarea, optional)
     - Label: "Additional Notes (optional)"
     - Placeholder: "Any additional information or conditions…"
     - Rows: 3 minimum
     - Max length: 1000 characters

3. **Form Action Bar** (sticky bottom bar or below form card)
   - "Cancel" secondary button (left-aligned)
   - "Submit Permit" primary button (right-aligned)
   - While submitting: button shows spinner + "Submitting…" text; button disabled; all form fields disabled.

**Inline Validation Display:**
- Error messages appear below each field in red text after a blur event or on submit attempt.
- Field border turns red for invalid; green checkmark icon for valid (after blur).
- Required field asterisk (`*`) displayed next to label.

---

### Process

1. Manager clicks "Create New Permit" from Dashboard (→ F01) or Permit List (→ F03).
2. Browser navigates to `/permits/new`; form is rendered empty.
3. Manager fills in fields in any order.
4. On blur from each field, client validates that field:
   - If invalid, inline error message is shown below the field.
   - If valid, error is cleared.
5. Manager clicks "Submit Permit".
6. Client runs full form validation (all required fields):
   - If any field is invalid, scroll to first error and focus it; do not submit.
7. If all valid: disable form + button, show loading state.
8. Client calls `POST /permits` with form data.
9. **API Success (`201 Created`):** Client navigates to `/permits/:newId` (→ F05).
10. **API Error (`400`):** Re-enable form; display error toast "Permit could not be created: [reason]"; inline field errors shown if server returns field-level errors.
11. **API Error (`401`):** Session expired; redirect to `/login?redirect=/permits/new`.
12. **API Error (`500`):** Re-enable form; toast "An unexpected error occurred. Please try again."
13. Manager clicks "Cancel": browser navigates back to previous page; no data is saved.

---

### Inputs

| Field | Type | Required | Validation |
|---|---|---|---|
| `title` | string | Yes | Non-empty; max 255 chars |
| `type` | enum string | Yes | One of: `WORK`, `ACCESS`, `ACTIVITY`, `SAFETY`, `OTHER` |
| `applicant_name` | string | Yes | Non-empty; max 255 chars |
| `start_date` | ISO 8601 date string (`YYYY-MM-DD`) | Yes | Valid date; not in the past (client-side soft warning; server accepts any valid date) |
| `end_date` | ISO 8601 date string (`YYYY-MM-DD`) | Yes | Valid date; ≥ `start_date` |
| `description` | string | Yes | Non-empty; max 2000 chars |
| `notes` | string | No | Max 1000 chars; nullable |

---

### Outputs

**Successful Creation Response (`201 Created`):**
```json
{
  "data": {
    "id": "uuid",
    "title": "Electrical Work — Building A",
    "type": "WORK",
    "applicant_name": "John Smith",
    "description": "Installation of new electrical panels.",
    "notes": null,
    "status": "PENDING",
    "start_date": "2026-08-10",
    "end_date": "2026-08-15",
    "rejection_reason": null,
    "revocation_reason": null,
    "created_at": "2026-08-06T10:30:00.000Z",
    "updated_at": "2026-08-06T10:30:00.000Z"
  },
  "error": null,
  "meta": {}
}
```

---

### Validation Rules

**Client-Side (before API call):**
- `title`: non-empty, ≤255 characters.
- `type`: must be one of the five enum values; cannot be blank.
- `applicant_name`: non-empty, ≤255 characters.
- `start_date`: required; must be a valid date.
- `end_date`: required; must be a valid date; must be ≥ `start_date`. If `end_date` < `start_date`, error: "End date must be on or after the start date."
- `description`: non-empty, ≤2000 characters.
- `notes`: optional; if provided, ≤1000 characters.

**Server-Side (additional):**
- All client-side rules re-validated server-side (never trust client validation alone).
- `type` validated against the enum — reject unknown values with `400 VALIDATION_ERROR`.
- Status is always forced to `PENDING` on creation — client cannot set status.
- `created_by` is set from the authenticated session (manager ID), not from the request body.

---

### Error States

| Scenario | HTTP Status | Error Code | Message |
|---|---|---|---|
| Required field missing | 400 | `VALIDATION_ERROR` | "Field '[fieldName]' is required." |
| `end_date` before `start_date` | 400 | `VALIDATION_ERROR` | "End date must be on or after the start date." |
| Invalid `type` value | 400 | `VALIDATION_ERROR` | "Invalid permit type." |
| Field exceeds max length | 400 | `VALIDATION_ERROR` | "'[fieldName]' must not exceed [N] characters." |
| Unauthenticated request | 401 | `AUTH_UNAUTHORIZED` | "Authentication required." |
| Server error during save | 500 | `SERVER_ERROR` | "An unexpected error occurred. Please try again." |

---

### API Surface (this feature)

| Method | Path | Description |
|---|---|---|
| `POST` | `/permits` | Create a new permit; status defaults to `PENDING` |

Full request/response schemas → `Y1-api.md` §Permits.

---

### Schema Surface (this feature)

Inserts a new row into: `permits` (all required fields; `status` = `PENDING`; `rejection_reason`, `revocation_reason` = `NULL`).

Full DDL → `Y0-schema.md` §Permits.
---

## F03: Permit List / Table View

**Priority:** P0 — Critical
**PRD Reference:** F3

---

### Description

The Permit List is the primary navigation surface for the entire permit inventory. It displays all permits in a paginated, sortable table with color-coded status badges, contextual action links, and a loading skeleton. Managers use this screen to survey all permits, identify those needing attention, and navigate to individual permit details. Visual clarity is paramount: status must be immediately scannable.

---

### Terminology

- **Permit Row:** A single table row representing one permit record.
- **Status Badge:** A color-coded pill showing the permit's current status (→ F07 for color spec).
- **Actions Column:** The rightmost table column containing contextual quick-action links for each row.
- **Pagination Controls:** Next/Previous page buttons with page indicator.
- **Loading Skeleton:** Placeholder rows displayed during data fetch (animated shimmer).
- **Empty State:** The UI shown when no permits match the current filters or no permits exist at all.
- **Sort Direction:** `ASC` (ascending) or `DESC` (descending) applied to the sorted column.

---

### Sub-features

- **F03.1 — Permit Table:** A full-width table with the defined column set.
- **F03.2 — Status Badges:** Color-coded pill badges per row.
- **F03.3 — Column Sorting:** Click column header to sort; toggle direction on second click.
- **F03.4 — Pagination:** Server-side pagination; default 20 rows per page.
- **F03.5 — Row Click Navigation:** Clicking anywhere on a row (except action links) navigates to `/permits/:id`.
- **F03.6 — Contextual Actions Column:** Quick-action links rendered based on permit status.
- **F03.7 — Loading Skeleton:** 5 skeleton rows with shimmer animation while fetching.
- **F03.8 — Empty State:** Illustrated/icon-based empty state when no permits match.
- **F03.9 — Search & Filter Integration:** Permit List is the display surface for F04 filters; filter controls render above the table.
- **F03.10 — "Create New Permit" Button:** Displayed in the page header for direct access to F02.

---

### Screens & UI Flows

#### Screen: Permit List (`/permits`)

**Page Structure:**

1. **Page Header**
   - Heading: "Permits"
   - Right side: "Create New Permit" primary button (→ `/permits/new`)

2. **Filter & Search Bar** (→ F04 for full spec)
   - Search input, status filter, type filter, date range pickers, active filter chips, "Clear All" link
   - Positioned above the table, below the page header

3. **Permits Table**

   | Column | Data Source | Sortable | Notes |
   |---|---|---|---|
   | **#** / Reference | `id` (shortened: first 8 chars of UUID) | No | Monospace font |
   | **Title** | `title` | Yes | Clickable → detail; truncated at 50 chars with tooltip |
   | **Type** | `type` | Yes | Display label (e.g., "Work Permit") not raw enum |
   | **Applicant** | `applicant_name` | Yes | — |
   | **Status** | `status` | Yes | Color-coded badge (see status badge spec below) |
   | **Start Date** | `start_date` | Yes | Formatted: `DD MMM YYYY` |
   | **End Date** | `end_date` | Yes | Formatted: `DD MMM YYYY` |
   | **Created** | `created_at` | Yes | Formatted: `DD MMM YYYY` |
   | **Actions** | — | No | Contextual links (see Actions spec below) |

   **Status Badge Colors:**
   - `PENDING` → amber background, dark amber text
   - `APPROVED` → green background, dark green text
   - `REJECTED` → red background, dark red text
   - `REVOKED` → gray background, dark gray text

   **Actions Column (conditional):**
   - `PENDING` permits: "View" link + "Approve" link + "Reject" link
   - `APPROVED` permits: "View" link + "Revoke" link
   - `REJECTED` permits: "View" link only
   - `REVOKED` permits: "View" link only
   - Clicking "Approve", "Reject", or "Revoke" in the list navigates to the permit detail page and opens the relevant confirmation dialog.

4. **Pagination Controls** (below table)
   - Format: `Showing 1–20 of 47 permits`
   - Previous / Next buttons (disabled when at first/last page)
   - Page size selector: 10 / 20 / 50 (optional for POC; default 20 is acceptable)

5. **Loading State**
   - Table header remains visible
   - 5 skeleton rows with shimmer animation replace data rows
   - Filter controls remain interactive

6. **Empty State**
   - Displayed when: (a) no permits exist, or (b) no permits match the active filters
   - Icon: document with magnifying glass (or similar)
   - Heading: "No permits found"
   - Body (when filters are active): "No permits match your current filters. Try adjusting or clearing your filters."
   - Body (when no permits exist): "No permits have been created yet."
   - CTA button: "Create New Permit" (shown only when no permits exist case)
   - "Clear Filters" button (shown only when filters are active case)

---

### Process

1. Manager navigates to `/permits` (from nav bar, breadcrumb, or dashboard).
2. Component mounts; reads query params from URL to determine active filters, sort column, sort direction, and page number (→ F04).
3. Skeleton rows displayed.
4. `GET /permits` called with current query params (search, status, type, date range, sort, page, limit).
5. On response:
   - If `data.items.length > 0`: render table rows with status badges and action links.
   - If `data.items.length === 0`: render empty state (F03.8).
6. Pagination controls rendered using `meta.total`, `meta.page`, `meta.limit` from response.
7. Manager clicks a column header: `sort` and `order` query params updated → URL updated → API re-fetched.
8. Manager clicks "Next" / "Previous": `page` query param incremented/decremented → URL updated → API re-fetched.
9. Manager clicks a row (not an action link): navigate to `/permits/:id`.
10. Manager clicks an action link in a row:
    - "View" → `/permits/:id`
    - "Approve" → `/permits/:id?action=approve` (detail page opens with confirm dialog pre-triggered)
    - "Reject" → `/permits/:id?action=reject`
    - "Revoke" → `/permits/:id?action=revoke`
11. Filter controls change → URL query params update → API re-fetched (→ F04).

---

### Inputs

**Query Parameters (from URL):**
- `search` (string, optional): Free-text search term.
- `status` (string, optional): One of `PENDING`, `APPROVED`, `REJECTED`, `REVOKED`.
- `type` (string, optional): One of `WORK`, `ACCESS`, `ACTIVITY`, `SAFETY`, `OTHER`.
- `start_date_from` (ISO date, optional): Filter permits where `start_date ≥` this value.
- `start_date_to` (ISO date, optional): Filter permits where `start_date ≤` this value.
- `sort` (string, optional): Column to sort by. Valid values: `title`, `type`, `applicant_name`, `status`, `start_date`, `end_date`, `created_at`. Default: `created_at`.
- `order` (string, optional): `asc` or `desc`. Default: `desc`.
- `page` (integer, optional): Page number, 1-indexed. Default: `1`.
- `limit` (integer, optional): Results per page. Default: `20`. Max: `100`.

---

### Outputs

**API Response Structure (`200 OK`):**
```json
{
  "data": {
    "items": [ /* array of permit summary objects */ ],
    "meta": {
      "total": 47,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  },
  "error": null,
  "meta": {}
}
```

Each permit summary object shape → `Y1-api.md` §Permits.

---

### Validation Rules

- `sort` value must be in the allowed list; unknown values default to `created_at`.
- `order` must be `asc` or `desc`; unknown values default to `desc`.
- `page` must be ≥1; values <1 treated as 1.
- `limit` must be 1–100; values outside this range clamped.
- `status` must match enum; unknown values ignored (all statuses returned).
- `type` must match enum; unknown values ignored.
- Date filters: `start_date_from` and `start_date_to` must be valid ISO dates; malformed values are ignored.
- The combination of all filter params is additive (AND logic) — each additional filter narrows the result set.

---

### Error States

| Scenario | HTTP Status | Error Code | UI Behaviour |
|---|---|---|---|
| API call fails | 500 | `SERVER_ERROR` | Error message in table area: "Could not load permits." with "Retry" button |
| Unauthenticated request | 401 | `AUTH_UNAUTHORIZED` | Redirect to `/login?redirect=/permits` |
| No results for active filters | — | — | Empty state with "Clear Filters" option (not an error) |
| Invalid sort/page params | 400 | `VALIDATION_ERROR` | Silently fall back to defaults; no user-visible error |

---

### API Surface (this feature)

| Method | Path | Description |
|---|---|---|
| `GET` | `/permits` | List permits with filtering, sorting, pagination |

Full request/response schemas → `Y1-api.md` §Permits.

---

### Schema Surface (this feature)

Queries table: `permits` (SELECT with WHERE clauses for filters, ORDER BY, LIMIT, OFFSET).

Full DDL → `Y0-schema.md` §Permits.
---

## F04: Search & Filter

**Priority:** P1 — High
**PRD Reference:** F4

---

### Description

Search & Filter provides managers with the ability to quickly locate specific permits within the permit list. Free-text search matches against key text fields; structured filters narrow by status, type, and date range. Filters are combinable, URL-persisted for shareability, and visually indicated so managers always know what is active. Search results update in real-time with debouncing to avoid excessive API calls.

---

### Terminology

- **Free-Text Search:** A text query matched against `title`, `applicant_name`, and `description` fields using case-insensitive substring matching.
- **Structured Filter:** A discrete filter applied to a specific field with predefined values (status, type, date range).
- **Active Filter Chip:** A small pill/tag element showing the name and value of an applied filter with an `×` to remove it.
- **Debounce:** A delay (300ms) applied to the search input so the API is only called after the user stops typing, not on every keystroke.
- **URL State:** Filter and search state is stored in the URL query string so pages can be shared or bookmarked.
- **Combined Filter (AND logic):** When multiple filters are active simultaneously, results must satisfy ALL active filters.

---

### Sub-features

- **F04.1 — Free-Text Search Bar:** A text input that filters permits by `title`, `applicant_name`, and `description`.
- **F04.2 — Status Filter:** A pill/tab group or dropdown for filtering by permit status (All, Pending, Approved, Rejected, Revoked).
- **F04.3 — Type Filter:** A dropdown for filtering by permit type (All Types, Work, Access, Activity, Safety, Other).
- **F04.4 — Date Range Filter:** Two date pickers for `start_date_from` and `start_date_to`.
- **F04.5 — Active Filter Chips:** Visual representation of each currently active filter with individual remove capability.
- **F04.6 — Clear All Filters:** A single control to reset all filters and search to their default state.
- **F04.7 — URL State Sync:** All filter and search state is reflected in the URL query string; changes update the URL; loading a URL with query params restores the filter state.
- **F04.8 — Debounced Search:** Search input calls the API after a 300ms debounce delay.
- **F04.9 — Real-Time Results:** The permit list (→ F03) updates automatically as filters change; no "Apply" button required.

---

### Screens & UI Flows

#### UI Component: Filter Bar (rendered above the permit table on `/permits`)

**Layout (left to right, responsive):**

```
[ 🔍 Search permits...          ] [Status ▼] [Type ▼] [📅 From] [📅 To]
Active filters: [Pending ×] [Work Permit ×]                    [Clear all filters]
```

**Search Input (`F04.1`):**
- Full-width on mobile; ~300px on desktop.
- Placeholder: "Search permits by title, applicant, or description…"
- Leading search icon (🔍).
- Clear button (`×`) appears inside the input when the field has a value; clicking it clears the search.
- Debounce: 300ms after last keystroke before API call fires.

**Status Filter (`F04.2`):**
- Displayed as a segmented pill group (preferred) or a dropdown.
- Options: All | Pending | Approved | Rejected | Revoked
- Default: "All" (no status filter applied).
- Active status tab is highlighted with the status color (amber for Pending, green for Approved, etc.).

**Type Filter (`F04.3`):**
- Dropdown selector.
- Options: All Types | Work Permit | Access Permit | Activity Authorization | Safety Permit | Other
- Default: "All Types" (no type filter applied).

**Date Range Filter (`F04.4`):**
- Two labeled date pickers: "From" and "To".
- "From" picker populates `start_date_from` (permits with `start_date ≥` this value).
- "To" picker populates `start_date_to` (permits with `start_date ≤` this value).
- If only "From" is set: shows all permits starting on or after that date.
- If only "To" is set: shows all permits starting on or before that date.

**Active Filter Chips (`F04.5`):**
- Appear in a row below the filter controls when any non-default filter is active.
- Each chip: filter name + value + `×` button.
  - Example: `Status: Pending ×`, `Type: Work Permit ×`, `From: 01 Aug 2026 ×`
- Clicking `×` on a chip removes that filter and re-fetches results.

**Clear All Filters (`F04.6`):**
- Appears as a link/text button: "Clear all filters" aligned right below filter bar.
- Only visible when at least one filter is active (including search).
- Clicking it resets: `search = ""`, `status = all`, `type = all`, `start_date_from = null`, `start_date_to = null`, `page = 1`.
- URL is updated to `/permits` (no query params) after clearing.

---

### Process

1. Manager navigates to `/permits`; existing URL query params are read to restore filter state.
2. Filter bar renders with active state matching the query params (e.g., status pill "Pending" is active if `?status=PENDING` is in the URL).
3. Manager types in the search bar → 300ms debounce → `search` query param updated in URL → `GET /permits?search=...` called → permit list re-renders.
4. Manager clicks a status pill → `status` query param updated → URL updated → API re-fetched → permit list re-renders.
5. Manager selects a type from dropdown → `type` query param updated → URL updated → API re-fetched.
6. Manager selects date range values → date query params updated → URL updated → API re-fetched.
7. When any filter is active, active filter chips appear below the filter bar.
8. Manager clicks `×` on a chip → that filter is removed → URL updated → API re-fetched.
9. Manager clicks "Clear all filters" → all filters reset → URL becomes `/permits` → API re-fetched with no filters.
10. Manager copies URL and shares with a colleague → colleague opens URL → same filter state is restored.
11. Filter state is preserved when navigating to a permit detail and pressing "Back" (browser back button or breadcrumb) — URL retains query params.

---

### Inputs

**Search Input:**
- `search` (string, optional): Free-text query. Min 1 char to trigger search. Max 100 chars.

**Status Filter:**
- `status` (string, optional): `PENDING` | `APPROVED` | `REJECTED` | `REVOKED`. Absence = all statuses.

**Type Filter:**
- `type` (string, optional): `WORK` | `ACCESS` | `ACTIVITY` | `SAFETY` | `OTHER`. Absence = all types.

**Date Range:**
- `start_date_from` (ISO 8601 date, optional): `YYYY-MM-DD`. Inclusive lower bound on `start_date`.
- `start_date_to` (ISO 8601 date, optional): `YYYY-MM-DD`. Inclusive upper bound on `start_date`.

---

### Outputs

- Updated URL query string (client-side routing; no page reload).
- Updated permit list (→ F03) reflecting filtered results.
- Active filter chips matching the applied filters.

---

### Validation Rules

- `search` query with only whitespace is treated as empty (trimmed before querying).
- `start_date_from` and `start_date_to` must be valid dates. If `start_date_from` > `start_date_to`, show a validation warning: "Start of range must be before end of range." and do not apply the invalid filter pair.
- If a URL is loaded with an invalid `status` or `type` value, the filter is silently ignored (treated as "all").
- Debounce timing: 300ms. If the user clears the search field entirely, fire the API call immediately (no debounce needed for empty string).
- Maximum search query length enforced at 100 characters; characters beyond this are not entered.
- Filters are combined with AND logic on the server; there is no OR filter capability in the POC.

---

### Error States

| Scenario | UI Behaviour |
|---|---|
| Search/filter returns 0 results | Empty state with "No permits match your current filters. Try adjusting or clearing your filters." and "Clear Filters" button. Not an error — valid state. |
| `start_date_from` > `start_date_to` | Inline warning below date pickers: "Start date must be before end date." Date filters not applied until corrected. |
| API error during filtered search | Permit list shows error state with "Could not load permits. Retry" (same error handling as F03). |

---

### API Surface (this feature)

All filtering is handled by the same endpoint as permit listing:

| Method | Path | Description |
|---|---|---|
| `GET` | `/permits` | Accepts `search`, `status`, `type`, `start_date_from`, `start_date_to` query params |

Full request/response schemas → `Y1-api.md` §Permits.

---

### Schema Surface (this feature)

Queries table: `permits` with WHERE clauses:
- `ILIKE '%search%'` on `title`, `applicant_name`, `description`
- `status = $1` if status filter active
- `type = $2` if type filter active
- `start_date >= $3` if `start_date_from` set
- `start_date <= $4` if `start_date_to` set

Full DDL → `Y0-schema.md` §Permits.
---

## F05: Permit Detail View

**Priority:** P0 — Critical
**PRD Reference:** F5

---

### Description

The Permit Detail View is a dedicated page presenting all information for a single permit. It is the primary action surface for the permit lifecycle — managers approve, reject, or revoke permits from this page. The design must make it easy to absorb all permit information at a glance and take action with a single click. After an action is taken, the page updates in place without requiring full navigation.

---

### Terminology

- **Status History Timeline:** A vertical timeline component showing each state transition with actor name and timestamp.
- **Action Buttons:** The Approve, Reject, or Revoke buttons shown conditionally based on the permit's current status.
- **Confirmation Dialog:** A modal overlay requiring explicit confirmation before executing a lifecycle action (→ F06 for full spec).
- **Breadcrumb Trail:** A navigation aid showing the path: Dashboard → Permits → [Permit Title].
- **In-Place Update:** After an action, the page reflects the new status without a full page reload — achieved via API response data and React state update.
- **Back-Navigation:** Returning to the Permit List page with the filter/scroll position preserved (URL state preservation).

---

### Sub-features

- **F05.1 — Permit Header:** Title, status badge, permit type label, and action buttons prominently displayed at the top.
- **F05.2 — Permit Details Panel:** Full display of all permit fields in a clean card layout.
- **F05.3 — Status History Timeline:** Chronological list of all state transitions with timestamps.
- **F05.4 — Action Buttons (Conditional):** Approve/Reject shown for `PENDING`; Revoke shown for `APPROVED`; nothing shown for terminal states.
- **F05.5 — Confirmation Dialog Integration:** Each action button opens a dialog (→ F06) before executing.
- **F05.6 — In-Place Status Update:** After a successful action, the detail page refreshes the permit data and updates the status badge and action buttons without navigating away.
- **F05.7 — Breadcrumb Navigation:** Three-level breadcrumb: Dashboard → Permits → [Permit Title].
- **F05.8 — Back to List Link:** Explicit "← Back to Permits" link that returns to the list preserving filter state.
- **F05.9 — Loading Skeleton:** Skeleton layout while permit data is being fetched.
- **F05.10 — 404 State:** Graceful error when a permit ID does not exist.
- **F05.11 — Action Query Param Pre-trigger:** When the URL contains `?action=approve|reject|revoke` (set by list view quick-action links), the corresponding confirmation dialog opens automatically on page load.

---

### Screens & UI Flows

#### Screen: Permit Detail (`/permits/:id`)

**Page Structure:**

1. **Breadcrumb Bar** (top of page content)
   - `Dashboard / Permits / [Permit Title]`
   - Each segment is a clickable link.

2. **Permit Header Card** (hero-style card with elevated appearance)
   - Left: Permit title (large, bold heading)
   - Below title: Permit type label (e.g., "Work Permit") in muted text + Permit ID (short reference)
   - Right: Current status badge (large, prominent pill)
   - Below status badge: Action buttons (conditional, see Action Button Logic below)

   **Action Button Logic:**
   - `status === PENDING`:
     - "Approve" primary button (green)
     - "Reject" secondary/danger button (red)
   - `status === APPROVED`:
     - "Revoke" danger button (red/amber)
   - `status === REJECTED` or `status === REVOKED`:
     - No action buttons. Display a muted label: "This permit is in a terminal state and cannot be modified."

3. **Details Grid** (below header card, two-column on desktop)

   **Left column:**
   - **Applicant Name** — labeled field
   - **Permit Type** — labeled field (display label, not enum value)
   - **Description / Purpose** — labeled multiline field
   - **Additional Notes** — labeled field (only shown if `notes` is non-null/non-empty)

   **Right column:**
   - **Start Date** — formatted `DD MMM YYYY`
   - **End Date** — formatted `DD MMM YYYY`
   - **Created** — formatted `DD MMM YYYY, HH:MM`
   - **Last Updated** — formatted `DD MMM YYYY, HH:MM`
   - **Rejection Reason** — shown only if `status === REJECTED` and `rejection_reason` is non-null
   - **Revocation Reason** — shown only if `status === REVOKED` and `revocation_reason` is non-null

4. **Status History Timeline** (below details grid, full-width card)
   - Title: "Status History"
   - A vertical timeline, ordered chronologically (oldest at top)
   - Each event row:
     - Status badge (colored)
     - Event label: "Created", "Approved", "Rejected", or "Revoked"
     - Actor: "by [Manager Name]"
     - Timestamp: `DD MMM YYYY, HH:MM`
   - Minimum events: always includes the "Created — PENDING" event.
   - Additional events are derived from the `permit_status_history` table (→ Y0-schema.md).

5. **Loading State:**
   - Skeleton for header card (title block + status badge placeholder)
   - Skeleton for details grid (6 field placeholders)
   - Skeleton for timeline (3 event row placeholders)
   - All skeletons animate with shimmer

6. **404 / Not Found State:**
   - Shown when `GET /permits/:id` returns `404`.
   - Heading: "Permit Not Found"
   - Body: "The permit you're looking for doesn't exist or has been removed."
   - CTA: "Back to Permits" button → `/permits`

---

### Process

1. Manager navigates to `/permits/:id` (from list row click, breadcrumb, or action link).
2. Component mounts; `GET /permits/:id` is called; skeleton displayed.
3. On `200` response: permit data is populated into all sections.
4. If URL contains `?action=approve|reject|revoke`: confirm that the action is valid for the current status, then open the corresponding confirmation dialog (→ F06). If the action is invalid for the current status (e.g., `?action=approve` but permit is already `APPROVED`), ignore the query param and display a toast: "This action is not available for the current permit status."
5. Manager reads permit details and decides to act.
6. Manager clicks an action button (e.g., "Approve"):
   - Confirmation dialog opens (→ F06).
   - Manager confirms.
   - API call is made (e.g., `PATCH /permits/:id/approve`).
   - On success: page re-fetches permit data OR updates state from response → status badge, action buttons, and timeline all update in place.
   - Toast: "Permit approved successfully."
7. Manager clicks "← Back to Permits": navigate to `/permits` preserving the previous URL's query params (extracted from the referrer or stored in navigation state).
8. Manager clicks breadcrumb segments: navigate to the respective page.

---

### Inputs

- No direct form inputs on the detail page (read-only data display).
- Action inputs (reason text) are captured in the Confirmation Dialog (→ F06).
- URL path parameter: `id` (string, required) — permit UUID or ID.

---

### Outputs

**Permit Detail API Response (`200 OK`):**
```json
{
  "data": {
    "id": "uuid",
    "title": "Electrical Work — Building A",
    "type": "WORK",
    "applicant_name": "John Smith",
    "description": "Installation of new electrical panels.",
    "notes": null,
    "status": "PENDING",
    "start_date": "2026-08-10",
    "end_date": "2026-08-15",
    "rejection_reason": null,
    "revocation_reason": null,
    "created_at": "2026-08-06T10:30:00.000Z",
    "updated_at": "2026-08-06T10:30:00.000Z",
    "status_history": [
      {
        "status": "PENDING",
        "event": "CREATED",
        "actor_name": "Jane Manager",
        "timestamp": "2026-08-06T10:30:00.000Z"
      }
    ]
  },
  "error": null,
  "meta": {}
}
```

---

### Validation Rules

- Permit `id` in URL must be a valid UUID (or integer ID if using auto-increment); malformed IDs return `400` before any DB query.
- `?action` query param is only honoured for valid actions for the current status; invalid combinations are silently ignored with a toast.
- Rejection reason and revocation reason fields are only rendered when the permit is in the matching terminal state AND the value is non-empty.

---

### Error States

| Scenario | HTTP Status | Error Code | UI Behaviour |
|---|---|---|---|
| Permit ID not found | 404 | `PERMIT_NOT_FOUND` | 404 state shown (heading + back button) |
| Invalid/malformed permit ID | 400 | `VALIDATION_ERROR` | Redirect to `/permits` with toast "Invalid permit reference." |
| API error loading permit | 500 | `SERVER_ERROR` | Error state with "Could not load permit details." and "Retry" button |
| Action executed on terminal state permit | 400 | `INVALID_TRANSITION` | Toast: "This action is not available for the current permit status." |
| Unauthenticated request | 401 | `AUTH_UNAUTHORIZED` | Redirect to `/login?redirect=/permits/:id` |

---

### API Surface (this feature)

| Method | Path | Description |
|---|---|---|
| `GET` | `/permits/:id` | Retrieve full permit detail including status history |
| `PATCH` | `/permits/:id/approve` | Transition to APPROVED (opens dialog, see F06) |
| `PATCH` | `/permits/:id/reject` | Transition to REJECTED with optional reason (see F06) |
| `PATCH` | `/permits/:id/revoke` | Transition to REVOKED with optional reason (see F06) |

Full request/response schemas → `Y1-api.md` §Permits.

---

### Schema Surface (this feature)

Reads from:
- `permits` (full row by `id`)
- `permit_status_history` (ordered by `created_at ASC` where `permit_id = :id`)

Full DDL → `Y0-schema.md` §Permits and §PermitStatusHistory.
---

## F06: Permit Lifecycle Actions (Approve / Reject / Revoke)

**Priority:** P0 — Critical
**PRD Reference:** F6

---

### Description

Lifecycle Actions are the core business operations of Permit2. They represent the state machine transitions that move a permit through its lifecycle: Approve (PENDING→APPROVED), Reject (PENDING→REJECTED), and Revoke (APPROVED→REVOKED). Each action follows a consistent interaction pattern — button click → confirmation dialog → API call → UI update — ensuring managers never accidentally execute an irreversible action. All three actions are atomic at the server level and surface clear success/failure feedback via toast notifications.

---

### Terminology

- **Lifecycle Action:** An API-backed operation that mutates a permit's `status` field and appends a record to `permit_status_history`.
- **Confirmation Dialog:** A modal overlay that presents the action's implications and requires explicit confirmation before the API call is made.
- **Reason Field:** An optional text area in the Reject and Revoke dialogs where managers may provide a reason; stored as `rejection_reason` or `revocation_reason`.
- **Atomic Action:** The state transition either fully completes (status updated + history record inserted) or fully fails (no partial state); a database transaction ensures this.
- **Toast Notification:** A transient UI notification confirming the action's outcome (success or failure).
- **Invalid Transition:** Any attempt to apply an action to a permit whose current status does not allow that action (e.g., approving an already-approved permit).

---

### Sub-features

- **F06.1 — Approve Action:** Transitions a `PENDING` permit to `APPROVED`; no mandatory reason required.
- **F06.2 — Reject Action:** Transitions a `PENDING` permit to `REJECTED`; optional rejection reason captured.
- **F06.3 — Revoke Action:** Transitions an `APPROVED` permit to `REVOKED`; optional revocation reason captured.
- **F06.4 — Confirmation Dialog (all actions):** A modal dialog rendering action-specific copy, optional reason field, and Confirm / Cancel buttons.
- **F06.5 — Loading State During Execution:** Confirm button enters loading state while API call is in flight; all dialog controls are disabled.
- **F06.6 — Success Feedback:** Toast notification on successful action.
- **F06.7 — Error Feedback:** Error toast on API failure; dialog remains open (or re-openable) for retry.
- **F06.8 — Invalid Transition Enforcement:** Action buttons hidden/disabled for statuses that don't support them; server also rejects invalid transitions.
- **F06.9 — In-Place Page Update:** After a successful action, the Permit Detail page (→ F05) updates in place to reflect the new status, action buttons, and timeline entry.

---

### Screens & UI Flows

#### Action: Approve

**Entry Points:**
- "Approve" button on Permit Detail page (F05) — only shown when `status === PENDING`
- "Approve" quick-link in Permit List actions column (→ F03) — navigates to detail + auto-opens dialog

**Confirmation Dialog — Approve:**
- Title: "Approve Permit?"
- Body: "This will mark the permit **"[Permit Title]"** as **Approved** and activate it. This action cannot be undone."
- Optional notes field: Label "Approval Notes (optional)", placeholder "Add any notes about this approval…" (text area, max 500 chars)
- Buttons:
  - "Approve Permit" — primary green button (confirm)
  - "Cancel" — secondary button (dismiss dialog, no action taken)
- Keyboard: `Enter` triggers confirm; `Escape` cancels.

---

#### Action: Reject

**Entry Points:**
- "Reject" button on Permit Detail page — only shown when `status === PENDING`
- "Reject" quick-link in Permit List actions column

**Confirmation Dialog — Reject:**
- Title: "Reject Permit?"
- Body: "This will mark the permit **"[Permit Title]"** as **Rejected**. The applicant will not be authorized."
- Reason field: Label "Rejection Reason (optional)", placeholder "Provide a reason for rejection…" (text area, max 500 chars)
- Buttons:
  - "Reject Permit" — primary red/danger button (confirm)
  - "Cancel" — secondary button
- Note: Reason is optional in POC; future versions may make it mandatory.

---

#### Action: Revoke

**Entry Points:**
- "Revoke" button on Permit Detail page — only shown when `status === APPROVED`
- "Revoke" quick-link in Permit List actions column

**Confirmation Dialog — Revoke:**
- Title: "Revoke Permit?"
- Body: "This will immediately **deactivate** the permit **"[Permit Title]"**. The permit will no longer be valid."
- Reason field: Label "Revocation Reason (optional)", placeholder "Provide a reason for revocation…" (text area, max 500 chars)
- Buttons:
  - "Revoke Permit" — primary amber/danger button (confirm)
  - "Cancel" — secondary button

---

#### Shared Dialog Behavior

- Dialog opens as a centered modal with a backdrop overlay.
- Modal open/close is animated (scale + fade, ~150ms).
- On "Confirm": button enters loading state (spinner icon + "Processing…"), dialog backdrop click and `Escape` are disabled to prevent accidental dismissal.
- On API success: dialog closes; toast appears (bottom-right); Permit Detail page updates in place.
- On API error: dialog remains open; error message displayed inside dialog (below the reason field): "Action failed. Please try again."; button exits loading state; dialog is interactive again.
- Clicking "Cancel" or pressing `Escape` at any time (when not in loading state): closes dialog; no API call is made; permit remains unchanged.

---

### Process

**Approve Flow:**
1. Manager views a `PENDING` permit on the detail page.
2. Manager clicks "Approve".
3. Approve Confirmation Dialog opens (F06.4).
4. Manager optionally enters approval notes.
5. Manager clicks "Approve Permit".
6. Confirm button enters loading state (F06.5).
7. `PATCH /permits/:id/approve` called with `{ notes: "..." }` (notes may be null/empty).
8. **Server validates:** permit exists + current status is `PENDING`. If not, returns `400 INVALID_TRANSITION`.
9. **Server executes (in transaction):** `UPDATE permits SET status='APPROVED', updated_at=now() WHERE id=:id` + `INSERT INTO permit_status_history (permit_id, status, event, actor_id, created_at)`.
10. Server returns `200` with updated permit object.
11. Client: dialog closes; toast "Permit approved successfully."; permit detail page reflects `APPROVED` status; Action buttons update to show "Revoke" only.

**Reject Flow:**
1–4. Same as approve flow; dialog is the Reject dialog.
5. Manager clicks "Reject Permit".
6–7. `PATCH /permits/:id/reject` called with `{ reason: "..." }`.
8. Server validates `status === PENDING`.
9. Server executes: `UPDATE permits SET status='REJECTED', rejection_reason='...', updated_at=now()` + history insert.
10. Server returns `200` with updated permit.
11. Client: dialog closes; toast "Permit rejected."; page shows `REJECTED` status; no action buttons shown.

**Revoke Flow:**
1. Manager views an `APPROVED` permit.
2–4. Same pattern; dialog is the Revoke dialog.
5. Manager clicks "Revoke Permit".
6–7. `PATCH /permits/:id/revoke` called with `{ reason: "..." }`.
8. Server validates `status === APPROVED`.
9. Server executes: `UPDATE permits SET status='REVOKED', revocation_reason='...', updated_at=now()` + history insert.
10. Server returns `200` with updated permit.
11. Client: dialog closes; toast "Permit revoked."; page shows `REVOKED` status; terminal-state message shown.

---

### Inputs

**Approve (`PATCH /permits/:id/approve`):**
- `notes` (string, optional): Max 500 characters. Stored for future use; not displayed prominently in POC. May be null.

**Reject (`PATCH /permits/:id/reject`):**
- `reason` (string, optional): Rejection reason. Max 500 characters. Stored in `permits.rejection_reason`. May be null.

**Revoke (`PATCH /permits/:id/revoke`):**
- `reason` (string, optional): Revocation reason. Max 500 characters. Stored in `permits.revocation_reason`. May be null.

---

### Outputs

**Success Response (all three actions, `200 OK`):**
```json
{
  "data": {
    "id": "uuid",
    "status": "APPROVED",
    "updated_at": "2026-08-06T11:00:00.000Z",
    "rejection_reason": null,
    "revocation_reason": null
  },
  "error": null,
  "meta": {}
}
```
(Full permit object returned so the client can update all displayed fields from a single response.)

---

### Validation Rules

**Server-Side State Machine Enforcement:**
- `approve` action: permit must have `status === PENDING`. Any other status → `400 INVALID_TRANSITION`.
- `reject` action: permit must have `status === PENDING`. Any other status → `400 INVALID_TRANSITION`.
- `revoke` action: permit must have `status === APPROVED`. Any other status → `400 INVALID_TRANSITION`.

**Input Validation:**
- `notes` / `reason`: optional string; if provided, max 500 characters. Exceeding max returns `400 VALIDATION_ERROR`.
- Permit must exist; if `id` not found → `404 PERMIT_NOT_FOUND`.
- Request must be authenticated → `401 AUTH_UNAUTHORIZED` if not.

**Atomicity:**
- Status update and history record insert must succeed together. If either fails, the entire transaction is rolled back and `500 SERVER_ERROR` is returned. No partial state is persisted.

---

### Error States

| Scenario | HTTP Status | Error Code | Message |
|---|---|---|---|
| Invalid transition (e.g., approve already-approved permit) | 400 | `INVALID_TRANSITION` | "This permit cannot be [action]: it is currently [status]." |
| Permit not found | 404 | `PERMIT_NOT_FOUND` | "Permit not found." |
| Reason exceeds max length | 400 | `VALIDATION_ERROR` | "Reason must not exceed 500 characters." |
| Unauthenticated request | 401 | `AUTH_UNAUTHORIZED` | "Authentication required." |
| Database/transaction failure | 500 | `SERVER_ERROR` | "An unexpected error occurred. Please try again." |

---

### API Surface (this feature)

| Method | Path | Description |
|---|---|---|
| `PATCH` | `/permits/:id/approve` | Transition permit to APPROVED |
| `PATCH` | `/permits/:id/reject` | Transition permit to REJECTED with optional reason |
| `PATCH` | `/permits/:id/revoke` | Transition permit to REVOKED with optional reason |

Full request/response schemas → `Y1-api.md` §Permits.

---

### Schema Surface (this feature)

Updates table: `permits` (`status`, `rejection_reason` or `revocation_reason`, `updated_at`).
Inserts into: `permit_status_history` (`permit_id`, `status`, `event`, `actor_id`, `created_at`).

Full DDL → `Y0-schema.md` §Permits and §PermitStatusHistory.
---

## F07: UI Design System & Visual Polish

**Priority:** P0 — Critical
**PRD Reference:** F7

---

### Description

The visual design quality of Permit2 is an explicit, first-class requirement, not a nice-to-have. The application must look and feel beautiful, modern, and professional — indistinguishable from a production SaaS product on first impression. This feature defines the design system that governs the appearance and interaction behavior of every screen, component, and state in the application. All feature implementations must adhere to this design system; inconsistency is a defect.

---

### Terminology

- **Design Token:** A named, reusable value (color, spacing, font size) used consistently throughout the application.
- **Brand Primary Color:** The dominant color used for primary buttons, active states, links, and nav highlights.
- **Semantic Color:** A color associated with a specific meaning (green = success/approved, amber = warning/pending, red = error/rejected/revoked, gray = neutral/inactive).
- **Typography Scale:** A defined set of font sizes, weights, and line heights used for headings, body text, labels, and captions.
- **Spacing System:** A consistent set of spacing values (typically multiples of 4px) used for padding, margin, and gap.
- **Micro-animation:** A subtle, brief animation applied to UI state changes (hover, focus, modal open/close) that improves perceived polish without distracting.
- **Skeleton Screen:** A placeholder that mimics the shape of loading content, animated with a shimmer/pulse effect.
- **Component Library:** The set of reusable UI components (shadcn/ui + Radix UI recommended) that serve as the implementation foundation.

---

### Sub-features

- **F07.1 — Color Palette & Tokens:** Defined brand and semantic colors applied globally.
- **F07.2 — Typography Scale:** Font family, size scale, weight, and line-height definitions.
- **F07.3 — Spacing System:** Base unit (4px) with a consistent scale applied to all layout and component spacing.
- **F07.4 — Status Badge System:** Color-coded, pill-shaped badges for each permit status — used consistently across all screens.
- **F07.5 — Micro-animations:** Hover states, page transitions, modal animations, button feedback.
- **F07.6 — Card System:** Elevated card component used for stat blocks, form containers, detail panels.
- **F07.7 — Navigation Bar:** Persistent top navigation with active state indicators and user profile/logout.
- **F07.8 — Empty States:** Designed empty states (icon + heading + body + optional CTA) for all list and data surfaces.
- **F07.9 — Loading Skeletons:** Skeleton screen components for each major data surface.
- **F07.10 — Toast Notifications:** Styled success and error toast notifications (bottom-right).
- **F07.11 — Responsive Layout Grid:** 12-column grid at 1440px; 8-column at 1024px; 4-column at 768px.
- **F07.12 — Accessible Focus States:** Visible keyboard focus indicators on all interactive elements.
- **F07.13 — Icon System:** Consistent icon library (Lucide Icons recommended) applied throughout.

---

### Design Specifications

#### F07.1 — Color Palette

| Token | Value (Example) | Usage |
|---|---|---|
| `--color-brand-primary` | `#4F46E5` (Indigo-600) | Primary buttons, nav active, links |
| `--color-brand-primary-hover` | `#4338CA` (Indigo-700) | Hover state on primary elements |
| `--color-brand-light` | `#EEF2FF` (Indigo-50) | Subtle backgrounds, icon container fills |
| `--color-status-pending` | `#D97706` (Amber-600) | PENDING badge text |
| `--color-status-pending-bg` | `#FEF3C7` (Amber-100) | PENDING badge background |
| `--color-status-approved` | `#059669` (Emerald-600) | APPROVED badge text |
| `--color-status-approved-bg` | `#D1FAE5` (Emerald-100) | APPROVED badge background |
| `--color-status-rejected` | `#DC2626` (Red-600) | REJECTED badge text |
| `--color-status-rejected-bg` | `#FEE2E2` (Red-100) | REJECTED badge background |
| `--color-status-revoked` | `#6B7280` (Gray-500) | REVOKED badge text |
| `--color-status-revoked-bg` | `#F3F4F6` (Gray-100) | REVOKED badge background |
| `--color-surface` | `#FFFFFF` | Card and panel backgrounds |
| `--color-background` | `#F9FAFB` (Gray-50) | Page background |
| `--color-border` | `#E5E7EB` (Gray-200) | Card borders, dividers |
| `--color-text-primary` | `#111827` (Gray-900) | Primary body text |
| `--color-text-secondary` | `#6B7280` (Gray-500) | Labels, captions, muted text |
| `--color-danger` | `#DC2626` (Red-600) | Danger/destructive action buttons |
| `--color-success` | `#059669` (Emerald-600) | Success toast, approve button |

> Note: Exact hex values are recommendations. Implementer may adjust while preserving the semantic intent of each token. WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text) must be maintained.

---

#### F07.2 — Typography Scale

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `display` | 2.25rem (36px) | 700 Bold | 1.2 | Page headings (H1) |
| `heading-xl` | 1.875rem (30px) | 700 Bold | 1.3 | Section headings |
| `heading-lg` | 1.5rem (24px) | 600 SemiBold | 1.35 | Card titles |
| `heading-md` | 1.25rem (20px) | 600 SemiBold | 1.4 | Sub-section titles |
| `body-lg` | 1rem (16px) | 400 Regular | 1.6 | Body text |
| `body-sm` | 0.875rem (14px) | 400 Regular | 1.5 | Secondary text, table cells |
| `label` | 0.875rem (14px) | 500 Medium | 1.4 | Form labels, column headers |
| `caption` | 0.75rem (12px) | 400 Regular | 1.4 | Timestamps, helper text |

Font family: `Inter` (via Google Fonts or system stack: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`).

---

#### F07.4 — Status Badge Specification

All status badges must be:
- Pill-shaped (`border-radius: 9999px`)
- Horizontal padding: 12px; vertical padding: 4px
- Font: `body-sm` (14px), weight 500 (Medium)
- Color pairs: text color on matching background (see F07.1 color tokens)
- Size: consistent across all screens (same component, same sizing)
- Never use icons inside badges (text only for status badges)

```
[  Pending  ]  ← amber bg, amber text, pill shape
[  Approved ]  ← green bg, green text
[  Rejected ]  ← red bg, red text
[  Revoked  ]  ← gray bg, gray text
```

---

#### F07.5 — Micro-animations

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Primary button hover | Background darken + slight scale (1.01) | 150ms | ease-in-out |
| Secondary button hover | Border/text color change | 150ms | ease-in-out |
| Modal / Dialog open | Scale 0.95→1.0 + fade in | 150ms | ease-out |
| Modal / Dialog close | Scale 1.0→0.95 + fade out | 100ms | ease-in |
| Page transitions | Fade in (opacity 0→1) | 200ms | ease-in |
| Toast appear | Slide in from right + fade | 300ms | spring/ease-out |
| Toast dismiss | Fade out + slide right | 200ms | ease-in |
| Skeleton shimmer | Gradient sweep left→right | 1.5s | linear, infinite |

---

#### F07.6 — Card System

All cards use:
- Background: `--color-surface` (white)
- Border: 1px `--color-border`
- Border radius: `0.75rem` (12px)
- Shadow: `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` (subtle elevation)
- Padding: 24px on desktop, 16px on mobile

Elevated cards (used for stat cards, hero sections): use a slightly stronger shadow: `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)`.

---

#### F07.7 — Navigation Bar

**Top Navigation Bar:**
- Height: 64px
- Background: white with a bottom border (`1px --color-border`)
- Position: `sticky top-0`; `z-index: 50`
- Left: App logo/wordmark "Permit2" (brand primary color)
- Center/Right: Navigation links — "Dashboard", "Permits"
- Active link: brand primary color underline or highlight indicator
- Far right: User name + "Logout" button (secondary/ghost style)

**Navigation Link Active States:**
- Active page link has bottom border in brand primary color (or background highlight in indigo-50)
- Hover state: light background highlight

---

#### F07.8 — Empty States

Every empty state must include:
- A centered icon or simple illustration (SVG, ~80px)
- Heading text (heading-md)
- Body text (body-sm, muted)
- Optional CTA button (if an action is available)

Empty state icons:
- No permits (ever): document-plus icon
- No results (filtered): magnifying glass / no-results icon
- Error state: exclamation triangle icon

---

#### F07.9 — Loading Skeletons

Each skeleton element:
- Background: `--color-border` (#E5E7EB) with shimmer animation
- Border radius: matches the content element it represents (pill for badges, rounded for cards)
- Dimensions: approximate actual content dimensions

---

#### F07.10 — Toast Notifications

- Position: bottom-right, 16px from edge
- Max width: 380px
- Types: Success (green left border), Error (red left border), Info (blue left border)
- Auto-dismiss: 5 seconds for success, 8 seconds for errors
- Manual dismiss: `×` button on every toast
- Stack: up to 3 toasts visible simultaneously; older ones push up

---

#### F07.11 — Responsive Layout

| Viewport | Layout | Columns |
|---|---|---|
| 1440px (desktop) | Side-nav or top-nav + content | 12-column |
| 1280px (laptop) | Top-nav + content | 12-column |
| 1024px (small laptop) | Top-nav + content, narrower | 8-column |
| 768px (tablet) | Top-nav + stacked layout | 4-column, graceful degradation |

The primary target is 1024–1440px. All screens must be fully functional at 1024px. 768px is a graceful degradation target.

---

#### F07.12 — Accessibility

- All interactive elements must have visible focus indicators (outline or ring, not `outline: none` without replacement).
- Focus ring: `2px solid --color-brand-primary`, `2px offset`.
- Color must not be the sole differentiator — status badges use both color AND text labels.
- All images and icons have `alt` text or `aria-label`.
- Form inputs have associated `<label>` elements (not just `placeholder`).
- Confirm dialogs trap focus while open (focus cycling within the dialog).
- WCAG AA: 4.5:1 contrast ratio for normal text; 3:1 for large text (≥18px bold or ≥24px regular).

---

### Process

This feature does not have a discrete user flow — it is a set of cross-cutting standards applied during implementation of all other features. Implementation checklist:

1. Configure Tailwind CSS with custom design tokens matching the palette above.
2. Install and configure the component library (shadcn/ui recommended).
3. Create a `StatusBadge` component accepting `status` as a prop; apply the correct color pair.
4. Create a `Card` component with the standard shadow, border, and padding.
5. Create `Skeleton` wrapper components for each major data surface (stat cards, table rows, detail panels).
6. Create `Toast` component with success/error variants; hook into global state (Zustand or React Query).
7. Implement `NavBar` component with active link detection.
8. Implement `EmptyState` component accepting icon, heading, body, and optional CTA props.
9. Enforce `Inter` font loaded globally.
10. Write a Storybook (optional for POC) or a `/design-system` route to preview components in isolation.
11. Before demo, conduct a visual QA pass: compare all screens against the design spec; correct any spacing, color, or typography inconsistencies.

---

### Error States

This feature has no runtime error states. Design system violations are implementation-time defects, not runtime errors.

---

### API Surface (this feature)

None — this feature is purely frontend.

---

### Schema Surface (this feature)

None — this feature is purely frontend.
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
---

## F09: Permit Data Model & Persistence

**Priority:** P0 — Critical
**PRD Reference:** F9

---

### Description

The data model defines the relational database schema that persists all Permit2 data. It is designed to support the full permit lifecycle, all search and filter queries, and the status history timeline — while remaining clean, normalized, and extensible. An ORM (Prisma) manages the schema via migration files for reproducible setup. A seed script pre-populates realistic sample data for demo readiness.

---

### Terminology

- **Migration File:** A version-controlled database change script generated by Prisma that applies schema changes in sequence.
- **Seed Script:** A script that populates the database with realistic sample data; run once during setup or reset.
- **UUID:** Universally Unique Identifier; the recommended primary key format for permits and users.
- **Enum (database):** A database-level enum type constraining a column to a predefined set of values (`PermitStatus`, `PermitType`).
- **Cascade Delete:** On deletion of a parent record, child records are automatically deleted (e.g., deleting a permit deletes its history entries — not expected in POC, but defined for schema integrity).
- **Soft Delete:** Marking a record as deleted without removing it from the database; NOT used in this POC.

---

### Sub-features

- **F09.1 — Users Table:** Stores manager accounts with hashed passwords.
- **F09.2 — Permits Table:** Stores all permit records with full lifecycle fields.
- **F09.3 — PermitStatusHistory Table:** Records each status transition event for a permit.
- **F09.4 — Database Enums:** `PermitStatus` and `PermitType` as database-level enum types.
- **F09.5 — Indexes:** Performance indexes on commonly queried/filtered columns.
- **F09.6 — Migrations:** Schema managed via Prisma migration files; reproducible with `npx prisma migrate deploy`.
- **F09.7 — Seed Script:** Realistic sample data (minimum 15 permits across all statuses + 1 manager account).
- **F09.8 — Server-Side Transition Enforcement:** Status transitions validated at the application layer before any database write.

---

### Entity Definitions

#### F09.1 — Users

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Manager account ID |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login identifier |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash, never plaintext |
| `name` | VARCHAR(255) | NOT NULL | Display name (first + last) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Account creation time |

---

#### F09.2 — Permits

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Permit ID |
| `title` | VARCHAR(255) | NOT NULL | Permit title / name |
| `type` | PermitType ENUM | NOT NULL | `WORK`, `ACCESS`, `ACTIVITY`, `SAFETY`, `OTHER` |
| `applicant_name` | VARCHAR(255) | NOT NULL | Name of permit requester |
| `description` | TEXT | NOT NULL | Permit purpose / description |
| `notes` | TEXT | NULL | Optional additional notes |
| `status` | PermitStatus ENUM | NOT NULL, DEFAULT 'PENDING' | Current lifecycle state |
| `start_date` | DATE | NOT NULL | Permit validity start |
| `end_date` | DATE | NOT NULL | Permit validity end; >= start_date |
| `rejection_reason` | TEXT | NULL | Populated on REJECTED transition |
| `revocation_reason` | TEXT | NULL | Populated on REVOKED transition |
| `created_by` | UUID | NOT NULL, FK → users.id | Manager who created the permit |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp (auto-updated) |

---

#### F09.3 — PermitStatusHistory

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | History record ID |
| `permit_id` | UUID | NOT NULL, FK → permits.id ON DELETE CASCADE | Parent permit |
| `status` | PermitStatus ENUM | NOT NULL | The status after this transition |
| `event` | VARCHAR(50) | NOT NULL | Event label: `CREATED`, `APPROVED`, `REJECTED`, `REVOKED` |
| `actor_id` | UUID | NOT NULL, FK → users.id | Manager who performed the action |
| `actor_name` | VARCHAR(255) | NOT NULL | Denormalized name for display (snapshot at time of action) |
| `notes` | TEXT | NULL | Optional notes/reason recorded at time of action |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | When this event occurred |

> **Design note:** `actor_name` is denormalized into the history table so that the timeline display is resilient to future user name changes. This is intentional.

---

#### F09.4 — Database Enums

```sql
CREATE TYPE "PermitStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'REVOKED'
);

CREATE TYPE "PermitType" AS ENUM (
  'WORK',
  'ACCESS',
  'ACTIVITY',
  'SAFETY',
  'OTHER'
);
```

---

#### F09.5 — Indexes

| Table | Column(s) | Type | Rationale |
|---|---|---|---|
| `permits` | `status` | B-tree | Filter by status (list + dashboard stats) |
| `permits` | `type` | B-tree | Filter by permit type |
| `permits` | `created_at` | B-tree | Sort by creation date (default list sort) |
| `permits` | `updated_at` | B-tree | Sort by last-updated (recent activity feed) |
| `permits` | `start_date` | B-tree | Date range filter |
| `permits` | `created_by` | B-tree | Lookup permits by creator |
| `permits` | `(status, type)` | Composite | Combined status+type filter |
| `permit_status_history` | `permit_id` | B-tree | Fetch all history for a permit |
| `users` | `email` | B-tree (UNIQUE) | Login lookup |

---

#### F09.6 — Prisma Schema (abbreviated)

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
  id            String        @id @default(uuid())
  email         String        @unique
  passwordHash  String        @map("password_hash")
  name          String
  createdAt     DateTime      @default(now()) @map("created_at")
  permits       Permit[]      @relation("CreatedBy")
  historyEvents PermitStatusHistory[]
  @@map("users")
}

model Permit {
  id                String        @id @default(uuid())
  title             String
  type              PermitType
  applicantName     String        @map("applicant_name")
  description       String
  notes             String?
  status            PermitStatus  @default(PENDING)
  startDate         DateTime      @map("start_date")
  endDate           DateTime      @map("end_date")
  rejectionReason   String?       @map("rejection_reason")
  revocationReason  String?       @map("revocation_reason")
  createdBy         String        @map("created_by")
  creator           User          @relation("CreatedBy", fields: [createdBy], references: [id])
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")
  statusHistory     PermitStatusHistory[]
  @@index([status])
  @@index([type])
  @@index([createdAt])
  @@index([updatedAt])
  @@index([startDate])
  @@map("permits")
}

model PermitStatusHistory {
  id         String        @id @default(uuid())
  permitId   String        @map("permit_id")
  permit     Permit        @relation(fields: [permitId], references: [id], onDelete: Cascade)
  status     PermitStatus
  event      String
  actorId    String        @map("actor_id")
  actor      User          @relation(fields: [actorId], references: [id])
  actorName  String        @map("actor_name")
  notes      String?
  createdAt  DateTime      @default(now()) @map("created_at")
  @@index([permitId])
  @@map("permit_status_history")
}
```

---

#### F09.7 — Seed Data Specification

The seed script must produce:

**Manager Accounts (minimum 1):**
- Email: `manager@permit2.dev` / Password: `demo1234` (hashed)
- Name: "Alex Manager"

**Permits (minimum 15 records) with the following distribution:**
- 4 × `PENDING` (mix of types)
- 5 × `APPROVED` (mix of types, with history entries)
- 3 × `REJECTED` (with rejection reasons)
- 3 × `REVOKED` (with revocation reasons, prior APPROVED history entry)

**Sample permit titles (suggestions):**
- "Building Roof Access — Maintenance Team"
- "Electrical Panel Installation — Floor 3"
- "Hot Works — Welding Workshop"
- "Chemical Storage Area Access — Safety Inspection"
- "Construction Vehicle Entry — Car Park Extension"
- "Night Works Authorization — Server Room Upgrade"
- etc.

All seed permits must have realistic dates (mix of past, present, near-future start/end dates). Each permit must have at least one `PermitStatusHistory` entry (the `CREATED` event). APPROVED/REJECTED/REVOKED permits must have corresponding history entries.

---

### Process

**Database Setup:**
1. Configure `DATABASE_URL` in `.env` file.
2. Run `npx prisma migrate dev` (development) or `npx prisma migrate deploy` (production).
3. Run `npx prisma db seed` to populate seed data.
4. Database is ready.

**Transition Enforcement (Server Logic):**
1. Before any `PATCH /permits/:id/[action]` call modifies the database:
   - Load current permit status from DB.
   - Validate transition is allowed (state machine → see 00-header.md §StateMachine).
   - If invalid: throw `InvalidTransitionError(400)` before any write.
2. If valid: begin database transaction:
   - `UPDATE permits SET status = $newStatus, [reason field] = $reason, updated_at = now() WHERE id = $id`
   - `INSERT INTO permit_status_history (permit_id, status, event, actor_id, actor_name, notes, created_at) VALUES (...)`
3. Commit transaction on success; rollback on any error.

---

### Validation Rules

- `end_date` must be >= `start_date` at the database constraint level (CHECK constraint) and application layer.
- `status` and `type` are constrained to their respective enums at the database level.
- `created_by` is always set from `req.user.id` (authenticated session), never from request body.
- `updated_at` is auto-managed by Prisma's `@updatedAt` directive — no manual updates required.
- `actor_name` in history is denormalized at insert time from `req.user.name`.

---

### Error States

| Scenario | Behaviour |
|---|---|
| Migration fails (incompatible schema change) | `npx prisma migrate dev` will prompt for a migration name; implementer resolves. |
| Seed script run twice | Must be idempotent — check for existing data before inserting, or use `upsert`. |
| `DATABASE_URL` not set | Application fails to start with a clear configuration error message. |
| Invalid transition attempted | Application layer throws before DB write; transaction never starts. |

---

### API Surface (this feature)

No additional API surface beyond F08. This feature defines the data layer that F08 endpoints operate on.

---

### Schema Surface (this feature)

This feature IS the schema. Full DDL → `Y0-schema.md`.
---

## Y0: Database Schema — Full DDL

**Document:** Permit2 FRD — Cross-Feature Chunk
**Section:** Database Schema

All tables, enums, indexes, and constraints for the Permit2 database.
Implementer note: Use Prisma schema (`schema.prisma`) as the canonical source; the SQL DDL below is the logical equivalent for documentation purposes.

---

### Enums

```sql
-- Permit lifecycle status values
CREATE TYPE "PermitStatus" AS ENUM (
  'PENDING',    -- Initial state on creation; awaiting action
  'APPROVED',   -- Permit has been approved and is active
  'REJECTED',   -- Permit has been rejected (terminal state)
  'REVOKED'     -- Previously approved permit has been revoked (terminal state)
);

-- Permit category values
CREATE TYPE "PermitType" AS ENUM (
  'WORK',       -- Work permit
  'ACCESS',     -- Access permit
  'ACTIVITY',   -- Activity authorization
  'SAFETY',     -- Safety permit
  'OTHER'       -- Catch-all for types not listed
);
```

---

### Table: users

Stores manager accounts. All authenticated sessions are linked to a user record.

```sql
CREATE TABLE users (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255)  NOT NULL UNIQUE,
  password_hash  VARCHAR(255)  NOT NULL,
  name           VARCHAR(255)  NOT NULL,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
```

**Field Notes:**
- `id`: UUID v4, auto-generated. Used as the `sub` claim in JWT.
- `email`: Used as the login identifier. Must be unique across all accounts.
- `password_hash`: bcrypt hash with minimum cost factor 10. NEVER store plaintext passwords.
- `name`: Full display name shown in the navigation bar and status history entries.
- `created_at`: Immutable once set.

---

### Table: permits

Core permit records. One row per permit throughout its entire lifecycle.

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

-- Indexes for common query patterns
CREATE INDEX idx_permits_status          ON permits(status);
CREATE INDEX idx_permits_type            ON permits(type);
CREATE INDEX idx_permits_created_at      ON permits(created_at DESC);
CREATE INDEX idx_permits_updated_at      ON permits(updated_at DESC);
CREATE INDEX idx_permits_start_date      ON permits(start_date);
CREATE INDEX idx_permits_created_by      ON permits(created_by);
CREATE INDEX idx_permits_status_type     ON permits(status, type);

-- Full-text search index (PostgreSQL) — optional for POC, improves ILIKE performance
CREATE INDEX idx_permits_title_trgm      ON permits USING GIN (title gin_trgm_ops);
CREATE INDEX idx_permits_applicant_trgm  ON permits USING GIN (applicant_name gin_trgm_ops);
```

> Note: GIN trigram indexes require `CREATE EXTENSION IF NOT EXISTS pg_trgm;`. Use `ILIKE` for simple substring matching in the POC if trigram extension is unavailable.

**Field Notes:**
- `title`: 1–255 characters; required.
- `type`: Must match `PermitType` enum.
- `applicant_name`: Name of the person requesting the permit.
- `description`: Purpose / scope of the permit; required, up to 2000 chars in practice (TEXT allows more).
- `notes`: Optional supplementary information.
- `status`: Always starts as `PENDING`. Updated by lifecycle action endpoints only.
- `start_date` / `end_date`: Permit validity window. `end_date >= start_date` enforced by CHECK constraint.
- `rejection_reason`: Non-null only when `status = 'REJECTED'`.
- `revocation_reason`: Non-null only when `status = 'REVOKED'`.
- `created_by`: References the manager who created the permit via the API. Set from `req.user.id`, never from request body.
- `updated_at`: Auto-updated by Prisma `@updatedAt` or a database trigger.

---

### Table: permit_status_history

Immutable event log of every status transition for every permit. Used to render the status timeline on the detail view (→ F05).

```sql
CREATE TABLE permit_status_history (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_id   UUID           NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
  status      "PermitStatus" NOT NULL,
  event       VARCHAR(50)    NOT NULL,
  actor_id    UUID           NOT NULL REFERENCES users(id),
  actor_name  VARCHAR(255)   NOT NULL,
  notes       TEXT           NULL,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_permit_history_permit_id ON permit_status_history(permit_id);
CREATE INDEX idx_permit_history_created_at ON permit_status_history(created_at);
```

**Field Notes:**
- `permit_id`: Foreign key to `permits.id`. CASCADE DELETE ensures history is cleaned up if a permit is deleted (not expected in POC, but schema-safe).
- `status`: The status value AFTER this event (e.g., the `CREATED` event has `status = 'PENDING'`).
- `event`: A human-readable event label. Valid values: `CREATED`, `APPROVED`, `REJECTED`, `REVOKED`.
- `actor_id`: References the manager who performed the action.
- `actor_name`: Denormalized copy of `users.name` at the time of the event. This ensures the timeline display remains accurate even if the user's name is later changed.
- `notes`: Optional reason or notes captured at time of action (from the confirmation dialog).
- `created_at`: Immutable timestamp of the event. Never updated after insert.

---

### Relationships

```
users ─────────────────────────────────────────────────────────────────
  │                                                                     │
  │ 1                                                               1   │
  │                                                                     │
  ├─< permits (created_by FK) >─────────────────────────────── 1:many  │
  │                                                                     │
  └─< permit_status_history (actor_id FK) >──────────────────── 1:many │
                                                                        │
permits ──────────────────────────────────────────────────────────────  │
  │                                                                     │
  └─< permit_status_history (permit_id FK, CASCADE DELETE) >─── 1:many
```

**Cardinality:**
- 1 `user` → many `permits` (a manager can create many permits)
- 1 `user` → many `permit_status_history` events (a manager can act on many permits)
- 1 `permit` → many `permit_status_history` events (min 1: the CREATED event)

---

### Database Trigger: auto-update `updated_at` (optional)

If not using Prisma `@updatedAt`, add a trigger:

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

### Migration Sequence

Using Prisma:
```bash
# First-time setup
npx prisma migrate dev --name init

# Production deploy
npx prisma migrate deploy

# Seed data
npx prisma db seed
```

SQLite variant (for POC with simpler setup):
- Replace `UUID` with `TEXT DEFAULT (lower(hex(randomblob(16))))`
- Replace `TIMESTAMPTZ` with `DATETIME`
- Enums are emulated as TEXT with CHECK constraints
- GIN indexes are not available; use LIKE for search

---

### Seed Data SQL (Abbreviated)

```sql
-- Seed manager account (password: demo1234)
INSERT INTO users (id, email, password_hash, name)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'manager@permit2.dev',
  '$2b$10$...', -- bcrypt hash of 'demo1234'
  'Alex Manager'
);

-- Sample PENDING permits (4)
INSERT INTO permits (title, type, applicant_name, description, status, start_date, end_date, created_by)
VALUES
  ('Roof Access — Maintenance', 'ACCESS', 'Tom Bradley', 'Routine maintenance inspection of HVAC units on roof level.', 'PENDING', '2026-08-10', '2026-08-11', 'a0000000-...'),
  ('Electrical Panel Upgrade — Floor 2', 'WORK', 'Sarah Chen', 'Replacement of main distribution board.', 'PENDING', '2026-08-12', '2026-08-14', 'a0000000-...'),
  ...

-- Each permit gets a CREATED history entry
INSERT INTO permit_status_history (permit_id, status, event, actor_id, actor_name)
VALUES ('...', 'PENDING', 'CREATED', 'a0000000-...', 'Alex Manager');
```

Full seed script lives at `prisma/seed.ts` (or `prisma/seed.js`) in the repository.
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
---

## Y2: Cross-Feature Error Catalog

**Document:** Permit2 FRD — Cross-Feature Chunk
**Section:** Error Catalog

All error codes, HTTP status codes, messages, and client-handling guidance for the Permit2 API.

---

### Error Response Format

All API errors use the standard envelope:

```json
{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": [
      { "field": "fieldName", "message": "Field-specific error" }
    ]
  },
  "meta": {}
}
```

`details` is only present for `VALIDATION_ERROR` responses (field-level errors). All other error types omit `details` or set it to `[]`.

---

### Error Code Registry

| Error Code | HTTP Status | Category | Description | Client Handling |
|---|---|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | 401 | Auth | Email not found or password incorrect. Generic message to prevent user enumeration. | Show inline form error: "Invalid email or password." |
| `AUTH_UNAUTHORIZED` | 401 | Auth | Request is missing a valid authentication token (not present, malformed). | Redirect to `/login` with current path as `?redirect=` param. |
| `AUTH_TOKEN_EXPIRED` | 401 | Auth | JWT token has passed its expiry time. | Clear session; redirect to `/login` with toast: "Your session has expired. Please sign in again." |
| `VALIDATION_ERROR` | 400 | Validation | One or more request fields failed validation. See `details` array for field-level messages. | Display field-level errors inline below the relevant inputs; scroll to first error. |
| `INVALID_TRANSITION` | 400 | Business Logic | Attempted lifecycle action is not valid for the permit's current status (e.g., approving an already-approved permit). | Show error toast: "This action is not available for the current permit status." Keep dialog closed. |
| `PERMIT_NOT_FOUND` | 404 | Not Found | No permit exists with the given ID. | Show 404 state on the detail page; offer "Back to Permits" link. |
| `NOT_FOUND` | 404 | Not Found | The requested API route does not exist. | Log to console; show generic error to user. |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Request Format | Request body is not `application/json`. | Developer error; should not surface to end users in production. |
| `SERVER_ERROR` | 500 | Server | Unexpected server-side error. Stack trace is never returned; only the generic message. | Show error toast: "An unexpected error occurred. Please try again." Offer retry if applicable. |

---

### Validation Error Detail Format

When `code === "VALIDATION_ERROR"`, the `details` array contains one entry per failing field:

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": [
      { "field": "title", "message": "Title is required." },
      { "field": "end_date", "message": "End date must be on or after the start date." },
      { "field": "type", "message": "Invalid permit type." }
    ]
  },
  "meta": {}
}
```

**Field Error Messages by Field:**

| Field | Condition | Message |
|---|---|---|
| `email` | Missing or empty | "Email is required." |
| `email` | Invalid format | "Please enter a valid email address." |
| `password` | Missing or empty | "Password is required." |
| `title` | Missing or empty | "Permit title is required." |
| `title` | Exceeds 255 chars | "Permit title must not exceed 255 characters." |
| `type` | Missing | "Permit type is required." |
| `type` | Invalid value | "Invalid permit type. Must be one of: WORK, ACCESS, ACTIVITY, SAFETY, OTHER." |
| `applicant_name` | Missing or empty | "Applicant name is required." |
| `applicant_name` | Exceeds 255 chars | "Applicant name must not exceed 255 characters." |
| `description` | Missing or empty | "Description is required." |
| `description` | Exceeds 2000 chars | "Description must not exceed 2000 characters." |
| `notes` | Exceeds 1000 chars | "Notes must not exceed 1000 characters." |
| `start_date` | Missing | "Start date is required." |
| `start_date` | Invalid date format | "Start date must be a valid date (YYYY-MM-DD)." |
| `end_date` | Missing | "End date is required." |
| `end_date` | Invalid date format | "End date must be a valid date (YYYY-MM-DD)." |
| `end_date` | Before `start_date` | "End date must be on or after the start date." |
| `reason` | Exceeds 500 chars | "Reason must not exceed 500 characters." |
| `notes` (lifecycle) | Exceeds 500 chars | "Notes must not exceed 500 characters." |

---

### Invalid Transition Error Messages

| Action | Current Status | Error Message |
|---|---|---|
| `approve` | `APPROVED` | "This permit cannot be approved: it is already approved." |
| `approve` | `REJECTED` | "This permit cannot be approved: it has been rejected." |
| `approve` | `REVOKED` | "This permit cannot be approved: it has been revoked." |
| `reject` | `APPROVED` | "This permit cannot be rejected: it has already been approved." |
| `reject` | `REJECTED` | "This permit cannot be rejected: it has already been rejected." |
| `reject` | `REVOKED` | "This permit cannot be rejected: it has been revoked." |
| `revoke` | `PENDING` | "This permit cannot be revoked: it is still pending approval." |
| `revoke` | `REJECTED` | "This permit cannot be revoked: it has been rejected." |
| `revoke` | `REVOKED` | "This permit cannot be revoked: it has already been revoked." |

---

### Client-Side Error Handling Guidelines

**Toast display rules:**
- Success toasts: green, auto-dismiss after 5 seconds.
- Error toasts: red, auto-dismiss after 8 seconds + manual dismiss button.
- Never show raw error codes to end users (display human-readable messages only).
- Never show stack traces or internal error details to end users.

**Authentication error handling:**
- Any `401` response from any endpoint: clear client session state and redirect to `/login?redirect=[current path]`.
- Show toast before redirect: "Your session has expired. Please sign in again."

**Network/timeout error handling (no HTTP response received):**
- Show error toast: "Connection failed. Please check your network and try again."
- Retry button where applicable.

**Form submission error handling:**
- On `400 VALIDATION_ERROR`: re-enable form; map `details` array to inline field errors.
- On `401`: redirect to login (session expired during form fill).
- On `500`: re-enable form; show error toast; do not clear form data so the user can retry.

---

### HTTP Status Code Summary

| Status | Used For |
|---|---|
| `200 OK` | Successful GET, successful PATCH (lifecycle actions), successful logout |
| `201 Created` | Successful POST /permits |
| `400 Bad Request` | Validation errors, invalid state transitions |
| `401 Unauthorized` | Missing/invalid/expired auth token, invalid credentials |
| `404 Not Found` | Permit not found, unknown route |
| `415 Unsupported Media Type` | Non-JSON request body |
| `500 Internal Server Error` | Unexpected server errors |
---

## Y3: External Integration Points

**Document:** Permit2 FRD — Cross-Feature Chunk
**Section:** External Integrations

---

### Overview

Permit2 POC is explicitly designed with **no external system integrations** (see PRD §9 Out of Scope: OOS-6). The application is entirely self-contained: a frontend, a backend API, and a database. There are no webhooks, no third-party APIs, no message queues, and no event buses in scope for this POC.

This document enumerates the minimal external dependencies that exist at the infrastructure/tooling level (not business integrations) and defines their contracts.

---

### Infrastructure Dependencies

| Dependency | Type | Required | POC Usage |
|---|---|---|---|
| PostgreSQL (or SQLite) | Database | Yes | Primary data store for all Permit2 records |
| Node.js runtime | Runtime | Yes | Backend API server |
| npm / package registry | Build tool | Yes | Dependency installation (`npm install`) |
| Vercel / Railway / Render | Hosting | Yes (for deployed demo) | Zero-config deployment target |
| Google Fonts CDN | Font delivery | Optional | Serves `Inter` font; can be self-hosted |

---

### Database Connection

**Contract:**
- Connection string via `DATABASE_URL` environment variable.
- Format: `postgresql://user:password@host:port/database` (PostgreSQL) or `file:./dev.db` (SQLite).
- The application will not start if `DATABASE_URL` is unset or the connection fails.
- Prisma Client is the only consumer of the database; no direct SQL queries from the API layer (all queries go through Prisma).

**Environment Variables Required:**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/permit2
```

---

### JWT Secret

**Contract:**
- JWT signing secret via `JWT_SECRET` environment variable.
- Must be a cryptographically random string, minimum 32 characters.
- If unset, the application refuses to start (fail-fast on startup).

**Environment Variables Required:**
```
JWT_SECRET=your-secret-key-minimum-32-chars
JWT_EXPIRES_IN=1h
```

---

### Environment Configuration Summary

All required environment variables for Permit2:

| Variable | Required | Example | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://...` | Database connection string |
| `JWT_SECRET` | Yes | `supersecret...` | JWT signing secret (≥32 chars) |
| `JWT_EXPIRES_IN` | No | `1h` | JWT expiry duration (default: `1h`) |
| `NODE_ENV` | No | `production` | `development` or `production` |
| `PORT` | No | `3000` | Server port (default: `3000`) |
| `BCRYPT_COST_FACTOR` | No | `10` | bcrypt rounds (default: `10`, min: `10`) |

---

### Out of Scope Integrations (Explicitly Excluded)

The following integrations are out of scope for the Permit2 POC and must not be introduced without explicit re-scoping:

| Integration | Reason Excluded |
|---|---|
| Email provider (SendGrid, Resend, etc.) | Notifications are out of scope (OOS-3) |
| SMS provider (Twilio, etc.) | Notifications are out of scope (OOS-3) |
| External auth provider (Auth0, Okta, Azure AD) | Credential-based login sufficient for POC (OOS-4) |
| ERP / HRMS systems | No external integrations required (OOS-6) |
| File storage (S3, Cloudflare R2) | File attachments are out of scope (OOS-8) |
| Analytics (Mixpanel, Segment, etc.) | Advanced analytics out of scope (OOS-10) |
| Webhook endpoints | No external consumers in scope (OOS-7) |

---

### Deployment Integration Contracts

#### Vercel (Recommended)

- Connect GitHub repository to Vercel project.
- Set environment variables in the Vercel dashboard.
- Build command: `npm run build` (Next.js) or equivalent.
- No additional configuration required for POC.
- Database: use Railway PostgreSQL addon or a Supabase free tier database; set `DATABASE_URL` in Vercel environment settings.

#### Railway

- Deploy via Railway's GitHub integration or CLI (`railway up`).
- Add a PostgreSQL service within the same Railway project; `DATABASE_URL` is auto-injected.
- All other env vars set via Railway's variable management.

#### Render

- Connect GitHub repository; select "Web Service."
- Add a Render PostgreSQL database; `DATABASE_URL` auto-injected.
- Set remaining env vars via Render's environment settings.

---

### Security Notes for Infrastructure

- `JWT_SECRET` must never be committed to source control. Use `.env` (git-ignored) locally and platform env vars in production.
- `DATABASE_URL` must never be committed to source control.
- The `.env.example` file in the repository should list all required variables with placeholder values (not real secrets).
- bcrypt cost factor must be ≥10 in all environments (including development).
- All API routes must enforce HTTPS in production deployments (handled by Vercel/Railway/Render platform layer).

---

### README Setup Instructions (Required per NFR-6)

The repository `README.md` must include:

```markdown
## Setup

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your values
4. Run `npx prisma migrate dev`
5. Run `npx prisma db seed`
6. Run `npm run dev`
7. Open http://localhost:3000

## Demo Login
- Email: manager@permit2.dev
- Password: demo1234
```

---

*End of FRD — Permit2 v1.0 — Generated 2026-08-06*
