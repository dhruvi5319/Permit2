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
