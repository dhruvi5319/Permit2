---

### Flow 04: Permit Lifecycle Actions — Approve / Reject / Revoke (JRN-01.1, JRN-03.2)

**User Stories:** US-6.1, US-6.2, US-6.3, US-6.4
**Trigger:** Manager views a permit detail and initiates a lifecycle action
**Persona:** Marcus Webb (PER-01)

```
[/permits/:id — Permit Detail Page]
        │
        ├── status === PENDING
        │       │
        │       ├── "Approve" button clicked
        │       │       │
        │       │       ▼
        │       │   [Approve Dialog opens — scale+fade 150ms]
        │       │   Title: "Approve Permit?"
        │       │   Body: "This will mark '[Title]' as Approved and activate it."
        │       │   Optional: Approval Notes textarea
        │       │   Buttons: [Approve Permit ✓] [Cancel]
        │       │       │
        │       │       ├── "Cancel" or Escape ──▶ [Dialog closes, no change]
        │       │       │
        │       │       └── "Approve Permit" clicked
        │       │               │
        │       │               ▼
        │       │           [Loading: spinner + "Processing…", dialog non-dismissible]
        │       │               │
        │       │               ├── PATCH 200 ──▶ [Dialog closes]
        │       │               │               [Toast: "Permit approved successfully." — green]
        │       │               │               [Status badge → APPROVED]
        │       │               │               [Action buttons → "Revoke" only]
        │       │               │               [Status History: new "Approved" event appended]
        │       │               │
        │       │               └── PATCH error ──▶ [Dialog stays open]
        │       │                                   [Error inline: "Action failed. Please try again."]
        │       │
        │       └── "Reject" button clicked
        │               │
        │               ▼
        │           [Reject Dialog opens]
        │           Title: "Reject Permit?"
        │           Body: "This will mark '[Title]' as Rejected."
        │           Optional: Rejection Reason textarea (max 500 chars)
        │           Buttons: [Reject Permit ✗] [Cancel]
        │               │
        │               └── "Reject Permit" clicked ──▶ [PATCH /reject]
        │                       │
        │                       ├── 200 ──▶ [Toast: "Permit rejected." — red toast]
        │                       │         [Status → REJECTED, no action buttons]
        │                       │         [Rejection Reason section visible if reason provided]
        │                       │         [Terminal state label shown]
        │                       │
        │                       └── Error ──▶ [Dialog stays open, inline error]
        │
        ├── status === APPROVED
        │       │
        │       └── "Revoke" button clicked
        │               │
        │               ▼
        │           [Revoke Dialog opens]
        │           Title: "Revoke Permit?"
        │           Body: "This will immediately deactivate '[Title]'. The permit will no longer be valid."
        │           Optional: Revocation Reason textarea (max 500 chars)
        │           Buttons: [Revoke Permit ⚠] [Cancel]
        │               │
        │               └── "Revoke Permit" ──▶ [PATCH /revoke]
        │                       │
        │                       ├── 200 ──▶ [Toast: "Permit revoked." — amber toast]
        │                       │         [Status → REVOKED, no action buttons]
        │                       │         [Revocation Reason visible if provided]
        │                       │         [Terminal state label shown]
        │                       │
        │                       └── Error ──▶ [Dialog stays open, inline error]
        │
        └── status === REJECTED or REVOKED
                │
                └── [No action buttons — terminal state]
                    [Muted label: "This permit is in a terminal state and cannot be modified."]

─────────────────────────────────────────────────────────────

[Quick-action from Permit List]
        │
        ▼
[Row: "Approve" link clicked]
        │
        ▼
[Navigate to /permits/:id?action=approve]
        │
        ▼
[Detail page loads → auto-opens Approve dialog]
        │
        └── (same flow as above from dialog step)
```

**Key Moments:**
- Confirmation dialog must repeat the permit TITLE inside it — Marcus must be 100% certain which permit he is acting on
- Dialog is non-dismissible during API call (prevents double-submit)
- Invalid `?action` for current status: dialog does NOT open; toast shown instead
