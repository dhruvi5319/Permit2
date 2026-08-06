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
