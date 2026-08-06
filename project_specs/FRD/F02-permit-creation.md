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
