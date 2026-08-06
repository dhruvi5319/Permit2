---

### Screen 04: Permit Detail View (`/permits/:id`)

**Purpose:** The single source of truth for a permit. Primary action surface for lifecycle operations. Serves three reading modes simultaneously: Marcus (action buttons), Priya (rejection reason), Daniel (status history timeline).
**User Stories:** US-5.1, US-5.2, US-5.3, US-6.1, US-6.2, US-6.3, US-6.4
**Personas:** All three personas

#### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ NAV BAR                                                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Dashboard / Permits / Electrical Work — Building A              │
│  (breadcrumb — each segment is a clickable link)                 │
│  ← Back to Permits                                               │
│                                                                  │
│  ── PERMIT HEADER CARD ─────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  Electrical Work — Building A        [  APPROVED  ]     │   │
│  │  (H1: 30px bold)                     (large badge)      │   │
│  │                                                          │   │
│  │  Work Permit  ·  Ref: P-001A2B3C                        │   │
│  │  (14px, gray-500)                                        │   │
│  │                                                          │   │
│  │  ── Action Buttons (PENDING state) ──                    │   │
│  │  [  ✓ Approve  ] [  ✗ Reject  ]                         │   │
│  │  (green primary) (red danger)                            │   │
│  │                                                          │   │
│  │  ── Action Buttons (APPROVED state) ──                   │   │
│  │  [ ⊘ Revoke ]                                           │   │
│  │  (amber danger)                                          │   │
│  │                                                          │   │
│  │  ── Terminal state (REJECTED or REVOKED) ──              │   │
│  │  "This permit is in a terminal state and cannot be       │   │
│  │   modified." (muted gray, 14px italic)                   │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ── DETAILS GRID ────────────────────────────────────────────── │
│  ┌────────────────────────────┐  ┌───────────────────────────┐  │
│  │ PERMIT INFORMATION         │  │ DATES & STATUS            │  │
│  │                            │  │                           │  │
│  │ Applicant Name             │  │ Start Date                │  │
│  │ John Smith                 │  │ 10 Aug 2026               │  │
│  │                            │  │                           │  │
│  │ Permit Type                │  │ End Date                  │  │
│  │ Work Permit                │  │ 15 Aug 2026               │  │
│  │                            │  │                           │  │
│  │ Description / Purpose      │  │ Created                   │  │
│  │ Installation of new        │  │ 06 Aug 2026, 10:30        │  │
│  │ electrical panels in the   │  │                           │  │
│  │ main distribution board…   │  │ Last Updated              │  │
│  │                            │  │ 06 Aug 2026, 11:00        │  │
│  │ Additional Notes           │  │                           │  │
│  │ (only if non-empty)        │  │ Rejection Reason          │  │
│  │ Crew must wear PPE class 2 │  │ (only if REJECTED)        │  │
│  │                            │  │ "Dates were incorrect."   │  │
│  │                            │  │ (amber alert block)       │  │
│  │                            │  │                           │  │
│  │                            │  │ Revocation Reason         │  │
│  │                            │  │ (only if REVOKED)         │  │
│  │                            │  │ "Site conditions changed."│  │
│  └────────────────────────────┘  └───────────────────────────┘  │
│  (~55% width)                        (~45% width)                │
│                                                                  │
│  ── STATUS HISTORY TIMELINE ────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Status History                                           │   │
│  │                                                          │   │
│  │  ●  [PENDING]   Created                                  │   │
│  │  │              by Jane Manager                          │   │
│  │  │              06 Aug 2026, 10:30                       │   │
│  │  │                                                       │   │
│  │  ●  [APPROVED]  Approved                                 │   │
│  │  │              by Marcus Webb                           │   │
│  │  │              06 Aug 2026, 11:00                       │   │
│  │  │                                                       │   │
│  │  ●  [REVOKED]   Revoked                                  │   │
│  │                 by Marcus Webb                           │   │
│  │                 07 Aug 2026, 09:15                       │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Information Hierarchy

| Priority | Content | Placement |
|----------|---------|-----------|
| Primary | Permit title + status badge | Header card top — first thing visible |
| Primary | Action buttons (Approve/Reject/Revoke) | Header card — right side or below title |
| Primary | Rejection/Revocation reason | Right column details — highlighted alert block |
| Secondary | Permit details grid (applicant, type, description, dates) | Two-column grid below header card |
| Secondary | Status history timeline | Full-width card below details grid |
| Tertiary | Breadcrumb, back link, reference number, permit type label | Above header card; inside header card subtitle |

#### Rejection/Revocation Reason — Visual Treatment

When `status === REJECTED` and `rejection_reason` is non-null:
```
┌──────────────────────────────────────────────────────┐
│ ⚠  Rejection Reason                                  │
│    Dates were incorrect — the end date falls before  │
│    the scheduled site prep completion.               │
└──────────────────────────────────────────────────────┘
```
- Background: Red-50; left border: 4px Red-400; padding 12px
- Label: "Rejection Reason" 12px uppercase, Red-600
- Body: reason text, 14px, Gray-700
- **Positioned prominently in the right column** (not buried below the fold)
- Same treatment for Revocation Reason but with Amber-50 / Amber-400

#### Status History Timeline

Each timeline event:
```
  ● [STATUS BADGE]  Event Label
  │                 by [Actor Name]
  │                 DD MMM YYYY, HH:MM
  │
  ● [STATUS BADGE]  ...next event...
```
- Vertical line connecting dots: Gray-200, 2px
- Dot: 10px circle in semantic color of the status
- Oldest event at top, newest at bottom
- Timeline is read-only (no interactive elements)
- Timestamps: exact format `DD MMM YYYY, HH:MM` — critical for Daniel's compliance tracing (JRN-03.2)

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Loading | Skeleton for header card (title block + badge placeholder) + details grid (6 field skeletons) + timeline (3 event skeletons) | All shimmer |
| Default (PENDING) | Full detail + Approve + Reject buttons | — |
| Default (APPROVED) | Full detail + Revoke button | — |
| Default (REJECTED) | Full detail + rejection reason alert block + terminal label + no buttons | — |
| Default (REVOKED) | Full detail + revocation reason alert block + terminal label + no buttons | — |
| Post-action success | Status badge updated + action buttons updated + new timeline event appended | Toast notification |
| 404 Not Found | "Permit Not Found" centered + "The permit you're looking for doesn't exist." + "Back to Permits" button | — |
| API error | "Could not load permit details." + "Retry" button | — |
| Invalid `?action` | Detail page loads normally; toast: "This action is not available for the current permit status." | — |

#### Interactive Elements

| Element | Type | Behavior |
|---------|------|----------|
| Breadcrumb segments | Nav links | "Dashboard" → `/dashboard`; "Permits" → `/permits`; "[Title]" = current page (not linked) |
| ← Back to Permits | Text link | Navigate to `/permits` preserving prior filter state |
| Approve button | Primary green button | Opens Approve confirmation dialog |
| Reject button | Danger red button | Opens Reject confirmation dialog |
| Revoke button | Danger amber button | Opens Revoke confirmation dialog |
| Timeline | Read-only | No interaction; scroll to view all events |
