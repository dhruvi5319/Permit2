---

### Flow 02: Permit Creation (JRN-02.1)

**User Stories:** US-2.1, US-2.2, US-2.3
**Trigger:** Priya clicks "Create New Permit" from dashboard or permit list
**Persona:** Priya Nair (PER-02)

```
[Dashboard or Permit List]
        │
        ▼
["Create New Permit" button clicked]
        │
        ▼
[/permits/new — Permit Creation Form]
        │
        ▼
[Section 1: Basic Information]
[Title | Permit Type dropdown | Applicant Name]
        │
[Section 2: Dates]
[Start Date picker | End Date picker]
        │
[Section 3: Details]
[Description textarea | Notes textarea (optional)]
        │
        ├── Blur on required field (empty) ──▶ [Inline error below field, red border]
        │
        ├── End date before start date ──▶ [Inline error: "End date must be on or after the start date."]
        │
        ├── "Cancel" clicked ──▶ [Navigate back (no save)]
        │
        └── "Submit Permit" clicked
                │
                ├── Any required field invalid
                │       └── [Scroll to first error, focus it — do NOT submit]
                │
                └── All valid
                        │
                        ▼
                [Loading state: spinner, all fields disabled, "Submitting…"]
                        │
                        ├── POST /permits — 400 ──▶ [Re-enable form]
                        │                           [Error toast with field details]
                        │                           [Inline errors if field-level errors returned]
                        │
                        └── POST /permits — 201
                                │
                                ▼
                        [Navigate to /permits/:newId]
                        [Status badge: PENDING]
                        [Toast: implicit — user sees the detail page immediately]
```

**Key Moments (from JRN-02.1):**
- **Access form:** CTA must be visible without scrolling — no hunting
- **Fill required fields:** Clear labels and placeholder hints prevent ambiguity that causes rejection
- **Set dates:** Date pickers eliminate manual entry errors; inline validation flags conflicts immediately
- **Verify submission:** Auto-navigation to permit detail with PENDING badge = proof the request was received
