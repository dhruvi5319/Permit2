---

### Screen 03: Permit Creation Form (`/permits/new`)

**Purpose:** Structured form to submit a new permit request. Clean, spacious, logically grouped — completable by Priya in under 3 minutes.
**User Stories:** US-2.1, US-2.2, US-2.3
**Personas:** Priya Nair (PER-02), Marcus Webb (PER-01)

#### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ NAV BAR                                                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Dashboard / Permits / New Permit    ← breadcrumb (14px, gray)  │
│                                                                  │
│  Create New Permit                   ← H1: 30px bold             │
│  Fill in the details below to submit a new permit request.       │
│  (14px, gray-500)                                                │
│                                                                  │
│         ┌────────────────────────────────────────────┐          │
│         │                                            │          │
│         │  ── Basic Information ─────────────────── │          │
│         │                                            │          │
│         │  Permit Title *                            │          │
│         │  ┌──────────────────────────────────────┐ │          │
│         │  │ e.g., Electrical Work — Building A   │ │          │
│         │  └──────────────────────────────────────┘ │          │
│         │                                            │          │
│         │  Permit Type *                             │          │
│         │  ┌──────────────────────────────────────┐ │          │
│         │  │ Select a permit type…              ▾ │ │          │
│         │  └──────────────────────────────────────┘ │          │
│         │  Options: Work Permit | Access Permit |    │          │
│         │           Activity Authorization |         │          │
│         │           Safety Permit | Other            │          │
│         │                                            │          │
│         │  Applicant / Requester Name *              │          │
│         │  ┌──────────────────────────────────────┐ │          │
│         │  │ Full name of the permit requester    │ │          │
│         │  └──────────────────────────────────────┘ │          │
│         │                                            │          │
│         │  ── Dates ──────────────────────────────── │         │
│         │                                            │          │
│         │  Start Date *          End Date *          │          │
│         │  ┌──────────────────┐  ┌────────────────┐ │          │
│         │  │  📅 DD / MM / YY │  │ 📅 DD / MM / YY│ │          │
│         │  └──────────────────┘  └────────────────┘ │          │
│         │                                            │          │
│         │  ── Details ────────────────────────────── │         │
│         │                                            │          │
│         │  Description / Purpose *                   │          │
│         │  ┌──────────────────────────────────────┐ │          │
│         │  │ Describe the purpose of this permit… │ │          │
│         │  │                                      │ │          │
│         │  │ (auto-expands with content, min 4    │ │          │
│         │  │  rows)                               │ │          │
│         │  └──────────────────────────────────────┘ │          │
│         │                                            │          │
│         │  Additional Notes (optional)               │          │
│         │  ┌──────────────────────────────────────┐ │          │
│         │  │ Any additional information…          │ │          │
│         │  │ (min 3 rows)                         │ │          │
│         │  └──────────────────────────────────────┘ │          │
│         │                                            │          │
│         │  ┌────────┐             ┌───────────────┐ │          │
│         │  │ Cancel │             │ Submit Permit │ │          │
│         │  └────────┘             └───────────────┘ │          │
│         │  (secondary)             (Indigo-600 primary)         │
│         │                                            │          │
│         └────────────────────────────────────────────┘          │
│                   max-width: 720px, centered                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Information Hierarchy

| Priority | Content | Placement |
|----------|---------|-----------|
| Primary | Form card (all fields) | Centered, 720px max-width |
| Primary | Submit Permit button | Bottom-right of form card |
| Secondary | Section headings (Basic Info, Dates, Details) | Inside form card, with subtle divider |
| Secondary | Field labels, placeholder text | Above each input; inside input |
| Tertiary | Breadcrumb, page subheading | Above form card |
| Tertiary | Cancel button | Bottom-left of form card |

#### Field-Level Validation Design

```
Valid field (after blur):
  Title *
  ┌──────────────────────────────────────┐
  │ Electrical Work — Building A     ✓  │  ← green checkmark icon right edge
  └──────────────────────────────────────┘

Invalid field (after blur or submit attempt):
  Title *
  ┌──────────────────────────────────────┐
  │                                      │  ← red border
  └──────────────────────────────────────┘
  ⚠ Permit title is required.             ← red-600 text, 12px, below field

Date range error:
  Start Date *          End Date *
  ┌────────────────┐    ┌────────────────┐
  │  10 Aug 2026   │    │  08 Aug 2026  │  ← red border on end date
  └────────────────┘    └────────────────┘
                        ⚠ End date must be on or after the start date.
```

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Default (empty) | All fields empty, no errors shown | Focus on first field (Title) |
| Partially filled | Valid fields: green checkmark; untouched: no indicator | Per-field validation on blur |
| Field error | Red border + inline error message below field | Appears on blur or submit attempt |
| Submitting | Spinner in button: "Submitting…"; all fields + buttons disabled | Loading state prevents double-submit |
| Success | — | Navigates to `/permits/:newId` detail page |
| API Error (400) | Form re-enabled; error toast; field-level errors shown inline | Toast: "Permit could not be created: [reason]" |
| API Error (500) | Form re-enabled | Toast: "An unexpected error occurred. Please try again." |

#### Interactive Elements

| Element | Type | Behavior |
|---------|------|----------|
| Permit Title | Text input (max 255) | Validates non-empty on blur and submit |
| Permit Type | Select dropdown | Validates non-default selection on blur and submit |
| Applicant Name | Text input (max 255) | Validates non-empty |
| Start Date | Date picker | Calendar UI; min = today (soft warning) |
| End Date | Date picker | Calendar UI; min = selected start date; validates ≥ start date |
| Description | Textarea (max 2000) | Auto-expanding; validates non-empty |
| Additional Notes | Textarea (max 1000) | Optional; no required validation |
| Cancel | Secondary button | `window.history.back()` — no data saved |
| Submit Permit | Primary button | Runs full validation → API call → navigate on success |

#### Visual Design Notes
- Form sections separated by a subtle `<hr>` with section label ("Basic Information", "Dates", "Details")
- Section label: 12px uppercase, Gray-400, letter-spacing 0.05em — like a category divider
- Required field asterisk: `*` in Red-500 inline after label text
- Date pickers: use a calendar popover component (shadcn/ui DatePicker); never free-text input
- Form action bar: sticky to bottom of viewport on scroll for long forms, or positioned naturally below form card
