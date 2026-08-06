# UX Mockup — Permit2 Permit Management System

**Project:** Permit2
**Generated:** 2026-08-06
**Based on:** UserStories-Permit2.md, PRD-Permit2.md, FRD-Permit2.md, JOURNEYS-Permit2.md

---

## Overview

Permit2 is a proof-of-concept permit management system for small operational teams. Its defining characteristic is **beautiful, production-grade visual design** — this is an explicit first-class requirement, not an enhancement. The UX must reflect a polished, modern SaaS product that instills confidence in stakeholders during live demonstrations.

### Design Philosophy

1. **Clarity through hierarchy** — Status is always the most prominent signal. Color-coded badges, card elevation, and typography weight collectively guide the eye to what matters most.
2. **Speed of action** — Every key workflow (triage, lookup, creation, approval) is completable in under 2 minutes from the landing page. Navigation is never more than 2 clicks deep.
3. **Confidence through feedback** — Every action has a visible response: loading states, success toasts, inline errors. Users are never left wondering if something worked.
4. **Progressive disclosure** — Complex detail (status history, rejection reasons, notes) is available but does not compete with primary content.
5. **Delight through polish** — Micro-animations, shimmer skeletons, hover states, and smooth modal transitions elevate the experience beyond a standard CRUD app.

### Design System Summary

| Token | Value | Use |
|-------|-------|-----|
| Brand Primary | Indigo-600 `#4F46E5` | Buttons, nav active, links |
| Brand Hover | Indigo-700 `#4338CA` | Hover states |
| Status: Pending | Amber-600 on Amber-100 | Pending badges everywhere |
| Status: Approved | Emerald-600 on Emerald-100 | Approved badges everywhere |
| Status: Rejected | Red-600 on Red-100 | Rejected badges everywhere |
| Status: Revoked | Gray-500 on Gray-100 | Revoked badges everywhere |
| Surface | White `#FFFFFF` | Cards, panels |
| Background | Gray-50 `#F9FAFB` | Page background |
| Border | Gray-200 `#E5E7EB` | Card borders, dividers |
| Text Primary | Gray-900 `#111827` | Headings, body text |
| Text Secondary | Gray-500 `#6B7280` | Labels, captions |
| Font | Inter | All text |
| Base Spacing | 4px | All spacing multiples |
| Card Radius | 12px | All card borders |

### Personas

| ID | Name | Role | Primary Journey |
|----|------|------|-----------------|
| PER-01 | Marcus Webb | Operations Manager | Daily triage, approvals, rapid lookup |
| PER-02 | Priya Nair | Department Team Lead | Permit creation, status checking |
| PER-03 | Daniel Osei | Senior Manager / Stakeholder | Dashboard reviews, compliance tracing |

---

## Navigation Map

| Screen | Route | Reached From | Nav Element |
|--------|-------|--------------|-------------|
| Login | `/login` | Direct URL / any unauthenticated access | Unauthenticated redirect |
| Dashboard | `/dashboard` | Login success / Nav bar | Nav bar: "Dashboard" link; post-login redirect |
| Permit List | `/permits` | Dashboard / Nav bar / breadcrumb | Nav bar: "Permits" link; Dashboard "View all permits"; Stat card clicks |
| Permit List (filtered) | `/permits?status=X` | Dashboard stat cards | Stat card click (Pending/Approved/Rejected/Revoked) |
| Create Permit | `/permits/new` | Dashboard / Permit List / Nav CTA | Dashboard "Create New Permit" button; Permit List "Create New Permit" button |
| Permit Detail | `/permits/:id` | Permit List row click / Recent Activity row click / Action links | Table row click; "View" link in actions column; Activity feed row click |
| Permit Detail (action) | `/permits/:id?action=approve\|reject\|revoke` | Permit List action links | "Approve" / "Reject" / "Revoke" quick-action links in table |

**Invariant — no orphan screens:** All screens above are reachable from the persistent top navigation bar or a parent screen that itself traces to the nav bar. The Login screen is the unauthenticated entry point. All authenticated screens require a valid session.
---

## User Flows

### Flow 00: Authentication (Login / Logout)

**User Stories:** US-0.1, US-0.2, US-0.3, US-0.4
**Trigger:** User navigates to any URL (protected or `/login`)
**Personas:** Marcus Webb (PER-01), Daniel Osei (PER-03)

```
[User visits any URL]
        │
        ▼
[Route Guard checks session]
        │
        ├── Authenticated ──▶ [Render requested page]
        │
        └── Unauthenticated
                │
                ▼
        [Login Page /login]
        [Email + Password form]
                │
                ├── Empty fields ──▶ [Inline validation errors] ──▶ [Stay on form]
                │
                ├── Clicks Sign In
                │       │
                │       ▼
                │  [Loading state: button spinner, fields disabled]
                │       │
                │       ├── POST /auth/login — 401 ──▶ [Inline error: "Invalid email or password."]
                │       │                               [Password cleared, focus → password field]
                │       │
                │       └── POST /auth/login — 200
                │               │
                │               ▼
                │       [Session token stored (httpOnly cookie)]
                │               │
                │               └── Redirect to /dashboard (or ?redirect= URL)
                │
                └── Already authenticated visiting /login ──▶ [Redirect to /dashboard]

─────────────────────────────────────────────────────────────

[Authenticated user on any page]
        │
        ▼
[Nav bar "Logout" button clicked]
        │
        ▼
[POST /auth/logout → session cleared]
        │
        ▼
[Redirect to /login]
```

**Steps:**
1. User arrives at protected route unauthenticated → redirected to `/login?redirect=<original-url>`
2. Login page renders; focus auto-set to email field
3. User enters email and password
4. Client validates: non-empty, valid email format — shows inline errors without API call if invalid
5. "Sign In" button clicked → enters loading/disabled state → `POST /auth/login` called
6. **Success:** session token stored → navigate to `/dashboard` or `?redirect` URL
7. **Error:** inline error "Invalid email or password." displayed; password cleared; focus back to password field
8. On any authenticated page: "Logout" in nav bar → `POST /auth/logout` → redirect to `/login`

**Key Design Notes:**
- Login page must feel fast and polished — it is Daniel Osei's first impression during live stakeholder demos
- Generic error message (never reveal which field is wrong)
- Persistent session: user stays logged in across refreshes (httpOnly cookie, 24h sliding window)
---

### Flow 01: Morning Permit Triage (JRN-01.1)

**User Stories:** US-1.1, US-1.2, US-1.3, US-1.4, US-1.5
**Trigger:** Marcus logs in at the start of the day
**Persona:** Marcus Webb (PER-01)

```
[Login → /dashboard]
        │
        ▼
[Dashboard loads]
[Parallel: GET /permits/stats + GET /permits?limit=10&sort=updated_at:desc]
        │
        ├── Loading: Skeleton stat cards + skeleton chart + skeleton activity rows
        │
        └── Data loaded
                │
                ▼
        [5 stat cards rendered with live counts]
        [Donut chart: permits by status]
        [Recent Activity: 10 most recent permits]
                │
                ├── Clicks "Pending" stat card ──▶ [/permits?status=PENDING]
                │
                ├── Clicks Activity row ──▶ [/permits/:id — Permit Detail]
                │
                ├── Clicks "Create New Permit" ──▶ [/permits/new]
                │
                └── Clicks "View all permits" ──▶ [/permits]

─────────────────────────────────────────────────────────────

[/permits/:id — Permit Detail (PENDING permit)]
        │
        ▼
[Review permit details]
        │
        ├── Clicks "Approve" ──▶ [Confirmation Dialog] ──▶ [PATCH approve] ──▶ [In-place update]
        │                                                                         [Toast: "Permit approved successfully."]
        │
        ├── Clicks "Reject" ──▶ [Confirmation Dialog + optional reason] ──▶ [PATCH reject] ──▶ [In-place update]
        │                                                                                        [Toast: "Permit rejected."]
        │
        └── Clicks "← Back to Permits" ──▶ [/permits — preserving filters]
```

**Key Moments (from JRN-01.1):**
- **Orient stage:** Dashboard must load in <2 seconds; stale counts destroy trust
- **Act stage:** Confirmation dialog with permit title inside is the critical safety net against wrong clicks
- **Return to queue:** Updated status must be immediately visible when returning to dashboard
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
---

### Flow 03: Rapid Permit Lookup (JRN-01.2)

**User Stories:** US-3.1, US-3.2, US-3.3, US-3.4, US-4.1, US-4.2, US-4.3, US-4.4, US-4.5
**Trigger:** Marcus needs to find a specific permit quickly
**Persona:** Marcus Webb (PER-01), Daniel Osei (PER-03)

```
[Any page]
        │
        ▼
["Permits" nav link clicked]
        │
        ▼
[/permits — Permit List]
[Skeleton rows displayed while loading]
        │
        ▼
[Table renders with all permits (page 1)]
[Filter bar visible above table]
        │
        ├── Types in search bar ──▶ [300ms debounce] ──▶ [URL: ?search=ravi]
        │                                               ──▶ [Table re-renders with filtered results]
        │
        ├── Clicks status pill ──▶ [URL: ?status=PENDING]
        │                       ──▶ [Active chip appears: "Status: Pending ×"]
        │
        ├── Selects type dropdown ──▶ [URL: ?type=WORK]
        │                          ──▶ [Active chip: "Type: Work Permit ×"]
        │
        ├── Sets date range ──▶ [URL: ?start_date_from=...&start_date_to=...]
        │                    ──▶ [Active chips: "From: 01 Aug 2026 ×", "To: 31 Aug 2026 ×"]
        │
        ├── Clicks "×" on chip ──▶ [That filter removed, URL updated, list re-fetches]
        │
        ├── Clicks "Clear all filters" ──▶ [All filters reset, URL → /permits]
        │
        ├── Clicks column header ──▶ [Sort applied: ?sort=created_at&order=desc]
        │                         ──▶ [Sort arrow visible on column header]
        │
        ├── Clicks row ──▶ [/permits/:id — Permit Detail]
        │
        ├── Clicks "View" action link ──▶ [/permits/:id]
        ├── Clicks "Approve" action link ──▶ [/permits/:id?action=approve]
        ├── Clicks "Reject" action link ──▶ [/permits/:id?action=reject]
        ├── Clicks "Revoke" action link ──▶ [/permits/:id?action=revoke]
        │
        ├── 0 results ──▶ [Empty state: icon + "No permits found" + "Clear Filters" button]
        │
        └── Paginate ──▶ [Previous/Next buttons, "Showing 1-20 of 47 permits"]
```

**Key Moments (from JRN-01.2, JRN-03.2):**
- Search must match title + applicant name + description simultaneously — a search-only-by-title failure breaks trust
- Status badge must be readable at a glance from the list row (large enough, high contrast)
- Filter state must survive navigation to detail and back (URL-based state)
- Combined filters (type + date range) must compose correctly for Daniel's compliance tracing use case
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
---

## Screen Designs

### Screen 00: Login Page (`/login`)

**Purpose:** Secure entry point; establishes authenticated session. First impression for stakeholder demos.
**User Stories:** US-0.1, US-0.2, US-0.4
**Personas:** All

#### Layout

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│         ░░░░░░░░░░░░░░ BRAND GRADIENT BACKGROUND ░░░░░░░░░░  │
│         (Indigo-50 to Indigo-100, subtle radial glow)        │
│                                                               │
│                    ┌──────────────────────┐                  │
│                    │                      │                  │
│                    │   ◈  Permit2         │  ← logo/wordmark │
│                    │   (Indigo-600, bold) │                  │
│                    │                      │                  │
│                    │  Sign in to Permit2  │  ← H1: 30px bold │
│                    │  Manage your permits │  ← sub: 14px gray│
│                    │  in one place        │                  │
│                    │                      │                  │
│                    │  Email address *     │  ← label 14px    │
│                    │  ┌──────────────────┐│                  │
│                    │  │manager@company…  ││  ← input, focus  │
│                    │  └──────────────────┘│                  │
│                    │                      │                  │
│                    │  Password *          │                  │
│                    │  ┌──────────────────┐│                  │
│                    │  │ ••••••••         ││                  │
│                    │  └──────────────────┘│                  │
│                    │                      │                  │
│                    │  ┌──────────────────┐│                  │
│                    │  │    Sign In  →    ││  ← primary btn   │
│                    │  └──────────────────┘│  (Indigo-600 bg) │
│                    │                      │                  │
│                    │  [inline error zone] │  ← hidden default│
│                    │                      │                  │
│                    └──────────────────────┘                  │
│                    Permit2 POC — Restricted Access            │
│                    (caption, gray, centered)                  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

#### Information Hierarchy

| Priority | Content | Placement |
|----------|---------|-----------|
| Primary | "Sign in to Permit2" heading + form card | Center screen, ~40% width, vertically centered |
| Secondary | Email + password inputs + Sign In button | Inside card, stacked vertically with 16px gaps |
| Tertiary | Subheading, footer note | Below logo, below card |

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Default | Card on gradient background; email field focused | Cursor in email field |
| Field error (empty) | Red border on field; inline red text below: "Email is required." | Focus remains on errored field |
| Field error (bad email) | Red border; "Please enter a valid email address." | — |
| Loading | Button: spinner + "Signing in…" text; button disabled; both fields disabled | Visual spinner in button |
| Auth error | Inline error banner above button: "Invalid email or password." in red; password field cleared | Focus → password field |
| Server error | Inline error: "An unexpected error occurred. Please try again." | — |
| Authenticated redirect | — | Instantly navigates to /dashboard |

#### Interactive Elements

| Element | Type | Behavior |
|---------|------|----------|
| Email input | Text input (type=email) | Auto-focused on page load; validates on blur and submit |
| Password input | Password input | Validates non-empty on blur and submit |
| Sign In button | Primary CTA (full-width) | Disabled during loading; triggers validation then API call |
| Form | Form element | Enter key in any field submits the form |

#### Visual Design Notes
- Card: white bg, 12px radius, soft shadow (`0 4px 6px rgba(0,0,0,0.07)`), 40px padding
- Background: subtle indigo gradient or radial glow pattern — not flat gray
- Logo "Permit2" uses Inter 700, Indigo-600, with a small permit/shield icon to the left
- Sign In button: full-width, Indigo-600 bg, white text, 12px radius, hover → Indigo-700 + slight scale
- Error state: red-50 background inline error block with red-600 text and warning icon
---

### Screen 01: Dashboard (`/dashboard`)

**Purpose:** Primary landing page after login. At-a-glance permit health overview with real-time stats, visual chart, and recent activity. Entry point for Marcus's daily triage and Daniel's stakeholder reviews.
**User Stories:** US-1.1, US-1.2, US-1.3, US-1.4, US-1.5
**Personas:** Marcus Webb (PER-01), Daniel Osei (PER-03)

#### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ NAV BAR (sticky, 64px)                                           │
│ ◈ Permit2    [Dashboard] [Permits]           Marcus Webb [Logout]│
│              ───────────                                          │
│              (active underline: Indigo-600)                      │
├──────────────────────────────────────────────────────────────────┤
│ PAGE CONTENT (Gray-50 background, max-width 1280px, centered)    │
│                                                                  │
│  ┌─────────────────────────────┐  ┌──────────────────────────┐  │
│  │ Dashboard                   │  │  [+ Create New Permit]   │  │
│  │ Welcome back, Marcus Webb   │  │   (Indigo-600, primary)  │  │
│  └─────────────────────────────┘  └──────────────────────────┘  │
│                                                                  │
│  ── STAT CARDS ROW ─────────────────────────────────────────── │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐ │
│  │📄 Total  │ │⏱ Pending │ │✓ Approved│ │✗ Rejected│ │⊘ Rev. │ │
│  │          │ │          │ │          │ │          │ │       │ │
│  │    42    │ │    8     │ │    25    │ │    5     │ │   4   │ │
│  │ Permits  │ │ Pending  │ │ Approved │ │ Rejected │ │Revoked│ │
│  │(indigo)  │ │ (amber)  │ │ (green)  │ │ (red)   │ │(gray) │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └───────┘ │
│  [Each card is clickable → /permits?status=X]                   │
│                                                                  │
│  ── MIDDLE SECTION ─────────────────────────────────────────── │
│  ┌──────────────────────────────┐  ┌────────────────────────┐  │
│  │ Permits by Status            │  │ Recent Activity        │  │
│  │                              │  │                        │  │
│  │     ╭──────────╮             │  │ [APPROVED] Roof Acce…  │  │
│  │     │  ●  ●    │             │  │ Ravi Kumar  · 2h ago   │  │
│  │     │    42    │             │  │                        │  │
│  │     │  ●  ●    │             │  │ [PENDING]  Confined…   │  │
│  │     ╰──────────╯             │  │ Priya Nair · 5h ago    │  │
│  │                              │  │                        │  │
│  │  ● Approved  25  59%         │  │ [REJECTED] Safety P…   │  │
│  │  ● Pending    8  19%         │  │ James Okon · 1d ago    │  │
│  │  ● Rejected   5  12%         │  │                        │  │
│  │  ● Revoked    4  10%         │  │ [APPROVED] Electrica…  │  │
│  │                              │  │ Sarah Chen · 2d ago    │  │
│  │  (Donut chart, interactive   │  │                        │  │
│  │   hover tooltips)            │  │ [REVOKED]  Site Acce…  │  │
│  │                              │  │ Tom Baker  · 3d ago    │  │
│  │                              │  │                        │  │
│  │                              │  │ ── View all permits →  │  │
│  └──────────────────────────────┘  └────────────────────────┘  │
│       ~60% width                        ~40% width              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Information Hierarchy

| Priority | Content | Placement |
|----------|---------|-----------|
| Primary | Stat cards (counts with semantic colors) | Top row, immediately below page header |
| Primary | "Create New Permit" CTA | Page header, right-aligned, always visible |
| Secondary | Status breakdown donut chart | Middle section left (~60%) |
| Secondary | Recent activity feed | Middle section right (~40%) |
| Tertiary | Page heading, welcome message | Page header, left-aligned |

#### Stat Card Detailed Design

Each stat card is a clickable elevated card:
```
┌─────────────────────────┐
│ [icon]      [status dot]│  ← icon left, color dot right
│                         │
│      42                 │  ← large count (36px bold)
│   Total Permits         │  ← label (14px medium, gray-500)
│                         │
└─────────────────────────┘
```
- Hover: subtle scale(1.02) + shadow increase + cursor:pointer
- Click: navigate to `/permits?status=X`
- Colors: card left border accent in semantic color (4px thick border-left)
- Icon variants: FileText (Total), Clock (Pending), CheckCircle (Approved), XCircle (Rejected), Ban (Revoked)

#### Status Breakdown Chart

- Donut chart, ~240px diameter
- Each segment: semantic status color
- Center label: total count (24px bold) + "Permits" label (12px gray)
- Legend below chart: colored dot + status name + count + percentage
- Hover on segment: tooltip showing "Approved: 25 permits (59%)"
- Segment click: navigate to `/permits?status=X` (same as stat card)

#### Recent Activity Feed

Each row:
```
[StatusBadge]  Permit Title (truncated 40 chars)
               Applicant Name · relative time
```
- Full row is clickable → `/permits/:id`
- Status badge uses standard pill design (see design system)
- Relative time: "2 hours ago", "1 day ago", "3 days ago"
- Hover: row background highlights to Gray-50
- "View all permits →" link: Indigo-600, positioned at bottom of feed

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Loading (skeleton) | 5 skeleton stat cards, skeleton donut circle, 5 skeleton activity rows — all with shimmer | Shimmer animation, ~1.5s cycle |
| Default (data loaded) | Live counts, chart, activity rows | — |
| Error (stats API fail) | Stat cards show "–" with retry icon | Toast: "Could not load dashboard stats." |
| Error (activity API fail) | Recent activity panel shows error message + "Retry" button | — |
| Empty (0 permits) | Centered illustration + "No permits yet" + "Create New Permit" button | Replaces both chart and activity sections |
| Window refocus | Silently re-fetches data | Counts update if changed |

#### Interactive Elements

| Element | Type | Behavior |
|---------|------|----------|
| Total stat card | Clickable card | → `/permits` (no status filter) |
| Pending stat card | Clickable card | → `/permits?status=PENDING` |
| Approved stat card | Clickable card | → `/permits?status=APPROVED` |
| Rejected stat card | Clickable card | → `/permits?status=REJECTED` |
| Revoked stat card | Clickable card | → `/permits?status=REVOKED` |
| Create New Permit | Primary button | → `/permits/new` |
| Chart segment | Interactive SVG | Hover tooltip; click → filtered list |
| Activity row | Clickable row | → `/permits/:id` |
| View all permits | Text link | → `/permits` |
---

### Screen 02: Permit List (`/permits`)

**Purpose:** Primary navigation surface for the full permit inventory. Sortable, filterable, paginated table with color-coded status badges and contextual quick-action links.
**User Stories:** US-3.1, US-3.2, US-3.3, US-3.4, US-4.1, US-4.2, US-4.3, US-4.4, US-4.5
**Personas:** Marcus Webb (PER-01), Priya Nair (PER-02), Daniel Osei (PER-03)

#### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ NAV BAR (sticky)                                                 │
│ ◈ Permit2    [Dashboard] [Permits]           Marcus Webb [Logout]│
│                          ─────────                               │
├──────────────────────────────────────────────────────────────────┤
│ PAGE CONTENT                                                     │
│                                                                  │
│  ┌──────────────────────┐       ┌──────────────────────────┐    │
│  │ Permits              │       │  [+ Create New Permit]   │    │
│  └──────────────────────┘       └──────────────────────────┘    │
│                                                                  │
│  ── FILTER BAR ───────────────────────────────────────────────  │
│  ┌─────────────────────────┐ [All][Pend][Appr][Rej][Rev] [Type▼]│
│  │🔍 Search permits...     │                            [From][To]│
│  └─────────────────────────┘                                    │
│                                                                  │
│  Active filters: [Pending ×]  [Work Permit ×]    [Clear all]    │
│                                                                  │
│  ── PERMITS TABLE ────────────────────────────────────────────  │
│  ┌────┬────────────────┬──────────┬──────────┬─────────┬──────┐ │
│  │ #  │ Title        ↕ │ Type   ↕ │ Applicant│ Status ↕│ ...  │ │
│  ├────┼────────────────┼──────────┼──────────┼─────────┼──────┤ │
│  │ P- │ Electrical Wo… │Work Perm.│John Smith│[APPROVED│ View │ │
│  │ 001│                │          │          │  green] │Revoke│ │
│  ├────┼────────────────┼──────────┼──────────┼─────────┼──────┤ │
│  │ P- │ Rooftop Access │Access P. │Ravi Kumar│[PENDING │ View │ │
│  │ 002│                │          │          │  amber] │Approv│ │
│  │    │                │          │          │         │Reject│ │
│  ├────┼────────────────┼──────────┼──────────┼─────────┼──────┤ │
│  │ P- │ Safety Inspec… │Safety P. │Priya Nair│[REJECTED│ View │ │
│  │ 003│                │          │          │   red]  │      │ │
│  ├────┼────────────────┼──────────┼──────────┼─────────┼──────┤ │
│  │ P- │ Site Access —… │Access P. │Tom Baker │[REVOKED │ View │ │
│  │ 004│                │          │          │  gray]  │      │ │
│  └────┴────────────────┴──────────┴──────────┴─────────┴──────┘ │
│                                                                  │
│  Showing 1–20 of 47 permits          [← Previous]  [Next →]    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Full Column Definition

| Column | Width | Sortable | Content |
|--------|-------|----------|---------|
| # Reference | 80px | No | First 8 chars of UUID, monospace font, gray-400 |
| Title | flex | Yes | Clickable link → detail; truncated at 50 chars with tooltip for overflow |
| Type | 140px | Yes | Display label (not enum) — "Work Permit", "Access Permit", etc. |
| Applicant | 140px | Yes | Applicant full name |
| Status | 120px | Yes | `StatusBadge` component — pill with semantic color |
| Start Date | 100px | Yes | `DD MMM YYYY` format |
| End Date | 100px | Yes | `DD MMM YYYY` format |
| Created | 100px | Yes | `DD MMM YYYY` format |
| Actions | 140px | No | Context-sensitive links (see below) |

#### Sortable Column Header Design

```
Title ↑         ← ascending (up arrow icon, Indigo-600)
Title ↓         ← descending (down arrow icon, Indigo-600)
Title ⇕         ← unsorted (neutral icon, Gray-300, hover → Gray-500)
```
- Header row: Gray-50 background, 14px medium text, border-bottom
- Hover on sortable header: cursor:pointer, Gray-100 background highlight

#### Filter Bar Detailed Design

```
┌───────────────────────────────────────────────────────────────┐
│  🔍 [Search permits by title, applicant, or description…  [×]]│
│                                                               │
│  Status: [All] [Pending] [Approved] [Rejected] [Revoked]      │
│          (pill group — active pill gets status bg color)      │
│                                                               │
│  Type: [All Types ▼]    From: [📅 date]    To: [📅 date]     │
└───────────────────────────────────────────────────────────────┘
  Active filter chips (when any filter active):
  [Status: Pending ×]  [Type: Work Permit ×]   [Clear all filters →]
```

- Search: 300ms debounce; `×` clear button appears inside input when non-empty; updates URL live
- Status pills: clicking active pill returns to "All" (deselects); one pill active at a time
- Active status pill: background = status semantic color (amber-100 for Pending, etc.)
- Date range: inline warning if From > To; date filters not applied until valid pair
- Active filter chips row: only visible when ≥1 filter active; "Clear all filters" link right-aligned

#### Actions Column (Status-conditional)

| Status | Available Actions |
|--------|-------------------|
| PENDING | "View" (gray link) · "Approve" (green link) · "Reject" (red link) |
| APPROVED | "View" (gray link) · "Revoke" (amber link) |
| REJECTED | "View" (gray link) |
| REVOKED | "View" (gray link) |

- Action links are `body-sm` (14px) with semantic colors
- Clicking "Approve" / "Reject" / "Revoke": navigates to `/permits/:id?action={action}` → detail page auto-opens dialog
- Action links visually separated from row click area with a subtle left border or padding gap

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Loading | Table header visible; 5 skeleton rows with shimmer animation | Content area shimmers |
| Default | Full table with real data | — |
| Empty (no permits) | Icon (document-plus) + "No permits have been created yet." + "Create New Permit" button | Centered in table body area |
| Empty (filters active) | Icon (magnifying glass) + "No permits match your current filters." + "Clear Filters" button | Centered; no CTA to create |
| Error | "Could not load permits." + "Retry" button | Centered in table body |
| Sorting | Arrow indicator on column; new data loads (skeleton row flash) | URL updates: `?sort=X&order=Y` |
| Filter active | Colored active chips visible; filtered count in pagination | URL updates with filter params |

#### Pagination Controls

```
Showing 1–20 of 47 permits        [← Previous]  Page 1 of 3  [Next →]
```
- "Previous" disabled on page 1
- "Next" disabled on last page
- Pagination controls: Gray-200 border buttons, 36px height, 12px radius
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
---

### Screen 05: Confirmation Dialogs (Modal Overlays)

**Purpose:** Safety gate before any irreversible lifecycle action. Three variants: Approve, Reject, Revoke. All follow the same structural pattern with action-specific copy, colors, and optional reason fields.
**User Stories:** US-6.1, US-6.2, US-6.3, US-6.4
**Personas:** Marcus Webb (PER-01)

#### Layout — Shared Dialog Shell

```
┌──────────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░ BACKDROP OVERLAY (black, 50% opacity) ░░░░░░░░░░░ │
│ ░                                                              ░ │
│ ░              ┌──────────────────────────────┐               ░ │
│ ░              │                              │               ░ │
│ ░              │  [Dialog Title]           [×]│  ← dismiss    ░ │
│ ░              │                              │    (not during ░ │
│ ░              │  [Body copy with permit      │    loading)    ░ │
│ ░              │   title in bold]             │               ░ │
│ ░              │                              │               ░ │
│ ░              │  [Optional Reason Textarea]  │               ░ │
│ ░              │  (for Reject and Revoke)     │               ░ │
│ ░              │                              │               ░ │
│ ░              │  [Error message — inline]    │               ░ │
│ ░              │  (only on API failure)       │               ░ │
│ ░              │                              │               ░ │
│ ░              │  [Cancel]  [Confirm Button]  │               ░ │
│ ░              │                              │               ░ │
│ ░              └──────────────────────────────┘               ░ │
│ ░                                                              ░ │
└──────────────────────────────────────────────────────────────────┘
```

Dialog container: white bg, 12px radius, `0 20px 60px rgba(0,0,0,0.15)` shadow, max-width 480px, centered.
Animation: scale(0.95)→scale(1.0) + fade-in, 150ms ease-out on open; reverse 100ms on close.

---

#### Dialog Variant A: Approve

```
┌──────────────────────────────────────────┐
│  Approve Permit?                      [×]│
│  ──────────────────────────────────────  │
│                                          │
│  This will mark the permit              │
│  "Electrical Work — Building A"          │
│  as Approved and activate it.           │
│  This action cannot be undone.          │
│                                          │
│  Approval Notes (optional)              │
│  ┌──────────────────────────────────┐   │
│  │ Add any notes about this         │   │
│  │ approval…                        │   │
│  └──────────────────────────────────┘   │
│                                          │
│      [Cancel]   [✓ Approve Permit]       │
│                 (green primary)          │
└──────────────────────────────────────────┘
```

---

#### Dialog Variant B: Reject

```
┌──────────────────────────────────────────┐
│  Reject Permit?                       [×]│
│  ──────────────────────────────────────  │
│                                          │
│  This will mark the permit              │
│  "Electrical Work — Building A"          │
│  as Rejected. The applicant will not    │
│  be authorized.                         │
│                                          │
│  Rejection Reason (optional)            │
│  ┌──────────────────────────────────┐   │
│  │ Provide a reason for rejection… │   │
│  │ (max 500 characters)             │   │
│  └──────────────────────────────────┘   │
│                                          │
│      [Cancel]   [✗ Reject Permit]        │
│                 (red danger primary)     │
└──────────────────────────────────────────┘
```

---

#### Dialog Variant C: Revoke

```
┌──────────────────────────────────────────┐
│  Revoke Permit?                       [×]│
│  ──────────────────────────────────────  │
│                                          │
│  This will immediately deactivate        │
│  the permit                             │
│  "Electrical Work — Building A".        │
│  The permit will no longer be valid.    │
│                                          │
│  Revocation Reason (optional)           │
│  ┌──────────────────────────────────┐   │
│  │ Provide a reason for revocation…│   │
│  │ (max 500 characters)             │   │
│  └──────────────────────────────────┘   │
│                                          │
│      [Cancel]   [⊘ Revoke Permit]        │
│                 (amber danger primary)   │
└──────────────────────────────────────────┘
```

---

#### Loading State (all dialogs, during API call)

```
┌──────────────────────────────────────────┐
│  Approve Permit?                         │  ← [×] hidden during loading
│  ──────────────────────────────────────  │
│                                          │
│  [body copy — visible but uneditable]    │
│                                          │
│  [Reason textarea — disabled, grayed]    │
│                                          │
│      [Cancel — disabled]  [⟳ Processing…]│
│                            (disabled btn) │
└──────────────────────────────────────────┘
```

- Backdrop click: disabled during loading (prevents accidental close)
- Escape key: disabled during loading
- All form controls: disabled

#### Error State (API failure, dialog remains open)

```
│  ┌────────────────────────────────────┐  │
│  │ ⚠  Action failed. Please try again.│  │
│  └────────────────────────────────────┘  │
│  (red-50 bg, red-600 border, red text)   │
│  Appears below reason textarea           │
│                                          │
│      [Cancel]   [✗ Reject Permit]        │
│                 (button re-enabled)      │
```

#### States Summary

| State | Trigger | Appearance |
|-------|---------|------------|
| Closed | Default | Not rendered (not just hidden) |
| Opening | Button click | scale(0.95)→(1.0) + fade-in 150ms |
| Default open | After open animation | Normal dialog layout |
| Loading | Confirm button clicked | Spinner in button, all controls disabled, backdrop non-dismissible |
| Error | API returns non-200 | Inline error block visible, controls re-enabled |
| Closing (success) | After 200 response | Fade-out 100ms; toast appears |
| Closing (cancel) | Cancel or Escape | Fade-out 100ms; no state change |

#### Interactive Elements

| Element | Type | Behavior |
|---------|------|----------|
| [×] dismiss button | Ghost icon button | Closes dialog (only when not loading) |
| Backdrop click | Overlay | Closes dialog (only when not loading) |
| Escape key | Keyboard | Closes dialog (only when not loading) |
| Reason textarea | Optional textarea | max 500 chars; character counter optional |
| Cancel button | Secondary button | Closes dialog, no API call |
| Confirm button | Primary/Danger button | Triggers API call; enters loading state |
| Enter key | Keyboard | Triggers confirm (when not in textarea) |
---

## Interaction Patterns

### Pattern 01: Status Badge

**When to use:** Everywhere permit status appears — dashboard activity feed, permit list table, permit detail header, status history timeline, confirmation dialogs.
**Component name:** `StatusBadge`

```
[  Pending  ]   ← amber-100 bg, amber-600 text, 9999px radius, px-3 py-1, 14px w-500
[  Approved ]   ← emerald-100 bg, emerald-600 text
[  Rejected ]   ← red-100 bg, red-600 text
[  Revoked  ]   ← gray-100 bg, gray-500 text
```

- Accepts: `status` prop (`PENDING` | `APPROVED` | `REJECTED` | `REVOKED`)
- Text: display label (not raw enum) — "Pending", "Approved", "Rejected", "Revoked"
- No icons inside the badge
- Same component used on ALL screens — never duplicate with custom styles

---

### Pattern 02: Toast Notifications

**When to use:** After every lifecycle action (success or failure), dashboard API errors, permit creation success/failure.
**Position:** Bottom-right corner, 16px from each edge.
**Stacking:** Up to 3 toasts; newest at bottom, older push up.

```
                            ┌─────────────────────────────────┐
                            │▌ Permit approved successfully.  │
                            │  (green left border, 4px thick) │  [×]
                            └─────────────────────────────────┘
                            ┌─────────────────────────────────┐
                            │▌ Action failed. Please try...   │
                            │  (red left border)              │  [×]
                            └─────────────────────────────────┘
```

- **Success toast:** green-600 left border, green-50 background, green-700 text; auto-dismiss 5s
- **Error toast:** red-600 left border, red-50 background, red-700 text; auto-dismiss 8s
- **Info toast:** blue-600 left border, blue-50 background, blue-700 text; auto-dismiss 5s
- Manual dismiss: `[×]` button on every toast
- Enter animation: slide-in from right + fade, 300ms ease-out
- Exit animation: fade-out + slide-right, 200ms ease-in

**Toast copy reference:**
| Trigger | Message |
|---------|---------|
| Permit approved | "Permit approved successfully." |
| Permit rejected | "Permit rejected." |
| Permit revoked | "Permit revoked." |
| Action failed | "Action failed. Please try again." |
| Unexpected error | "An unexpected error occurred. Please try again." |
| Dashboard stats error | "Could not load dashboard stats." |
| Invalid action for status | "This action is not available for the current permit status." |

---

### Pattern 03: Skeleton Loading Screens

**When to use:** Any major data surface while API call is in flight. Never use spinners alone for page-level content.

**Shimmer animation:**
```css
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
/* background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%) */
/* background-size: 200% */
/* animation: shimmer 1.5s linear infinite */
```

**Skeleton shapes:**
| Component | Skeleton representation |
|-----------|------------------------|
| Stat card | Rectangle 120×80px, 12px radius |
| Donut chart | Circle ~220px diameter |
| Activity row | Rectangle 100%×40px, 6px radius |
| Table row | Rectangle 100%×52px, 4px radius |
| Page title | Rectangle 280×32px, 4px radius |
| Status badge | Pill 80×24px, 9999px radius |
| Detail field | Rectangle 60×16px (label) + 160×20px (value), 4px radius |
| Timeline event | Circle 10px + Rectangle 200×36px |

---

### Pattern 04: Active Filter Chips

**When to use:** Below the filter bar on the Permit List page whenever ≥1 filter is active.

```
Active filters:  [Pending ×]  [Work Permit ×]  [From: 01 Aug ×]     [Clear all filters]
```

- Chip: Gray-100 bg, Gray-700 text, 9999px radius, px-3 py-1, 12px font
- `×` icon: clickable, Gray-400 → Red-500 on hover
- "Clear all filters": Indigo-600 text link, no background, right-aligned
- Chips row: only rendered when ≥1 filter active; disappears when all cleared

---

### Pattern 05: Inline Form Validation

**When to use:** All form inputs on the Permit Creation form.

**Timing:**
- Error appears: on blur (leaving a field) OR on submit attempt
- Error clears: as soon as the field becomes valid (live)
- Success indicator: green checkmark appears on blur after valid entry

**Visual treatment:**
- Invalid: red-500 border (2px); error message below in red-600, 12px; warning icon `⚠` before message
- Valid: emerald-500 border; green `✓` icon at right edge of input
- Default (untouched): Gray-300 border; focus → Indigo-500 ring (2px, 2px offset)

---

### Pattern 06: Empty States

**When to use:** Any list/data surface with zero items (no permits ever, or filtered to zero).

**Structure:**
```
            [  SVG Icon ~80px  ]
               (contextual)

            No permits found           ← heading-md, Gray-900
            No permits match your      ← body-sm, Gray-500
            current filters.

            [  Clear Filters  ]        ← secondary button (when filters active)
            [  + Create New Permit ]   ← primary button (when no permits exist)
```

**Icon variants:**
- No permits (ever): `FileText` + `+` (document-plus)  
- Filtered to zero: `Search` with slash (no-results)
- Error state: `AlertTriangle`

---

### Pattern 07: Confirmation Dialog Flow

**When to use:** All three lifecycle actions (Approve, Reject, Revoke).

Key rules:
1. Dialog MUST display the permit title in the body copy — no ambiguity
2. Confirm button color matches action semantic color (green=Approve, red=Reject, amber=Revoke)
3. Dialog is non-dismissible during API call (loading state)
4. On error: dialog stays open, error shows inline (user can retry)
5. On success: dialog closes, toast appears, page updates in-place
6. `Enter` key triggers confirm (unless cursor is in textarea)
7. `Escape` key closes dialog (unless loading)
8. Focus is trapped inside dialog while open

---

### Pattern 08: Navigation — Back State Preservation

**When to use:** "← Back to Permits" link on Permit Detail page.

- When navigating from list → detail: store current URL (with all filter/search/sort/page params) in navigation state
- "← Back to Permits" restores that URL
- Browser back button also restores (URL-based state means this works automatically)
- Breadcrumb "Permits" segment: navigates to `/permits` (without stored params — resets to default)
- This distinction is intentional: Back link = contextual return; Breadcrumb = fresh start

---

### Pattern 09: Contextual Quick Actions (Permit List Table)

**When to use:** Actions column in the Permit List table.

Rules:
- Action links appear ONLY for valid lifecycle transitions
- Clicking a quick-action link navigates to detail page and auto-opens the corresponding dialog
- This is implemented via `?action=approve|reject|revoke` URL param on the detail page
- If the ?action param is invalid for the current status (race condition), a toast is shown and dialog does NOT open
- Action link colors: "View" = gray, "Approve" = green, "Reject" = red, "Revoke" = amber
- Action links must not compete with the row-click area (visually distinct, separated by spacing)
---

## Responsive Considerations

**Primary target:** 1024px–1440px (laptop/desktop)
**Secondary target:** 768px (tablet — graceful degradation)
**Out of scope:** Mobile (<768px) — not required for POC

**User Story:** US-7.5

---

### Desktop 1280px–1440px

**Nav Bar:**
- Full horizontal nav: Logo | Dashboard | Permits | [spacer] | User Name | Logout
- All nav items visible; no hamburger menu

**Dashboard:**
- Stat cards: single horizontal row of 5 cards (equal width, ~20% each)
- Middle section: 2-column layout — chart (~60%) + activity feed (~40%)
- Page max-width: 1280px, centered with 24px side padding

**Permit List:**
- Full table with all 9 columns visible
- Filter bar: all controls in one row (search + status pills + type dropdown + date pickers)
- Pagination controls below table

**Permit Detail:**
- Header card: permit title left + status badge + action buttons right
- Details grid: 2-column (left ~55%, right ~45%)
- Status history timeline: full-width below grid
- Breadcrumb on single line

**Permit Creation:**
- Form card: centered, max-width 720px
- Date fields: side-by-side in a 2-column grid row
- Action buttons: right-aligned at bottom of form card

**Dialogs:**
- Centered modal, max-width 480px
- Never full-screen

---

### Laptop 1024px–1280px

**Dashboard:**
- Stat cards: still single row of 5 but more compact padding (16px instead of 24px)
- Chart and activity feed: still 2-column but chart ~55%, activity ~45%
- Page padding: 16px sides

**Permit List:**
- All columns still visible; Start Date, End Date may use compact formatting (`08 Aug` → `08/08`)
- Filter bar: may wrap type dropdown and date pickers to second row if needed
- Actions column: may abbreviate to icon buttons with tooltips to save space

**Permit Creation:**
- Form card: still 720px max, centered
- No changes from desktop

**Permit Detail:**
- Details grid: still 2-column
- Breadcrumb may truncate permit title (ellipsis after 40 chars)

---

### Tablet 768px (Graceful Degradation)

**Nav Bar:**
- Logo + navigation links remain visible (abbreviated if needed: "Dashboard", "Permits")
- User name hidden; "Logout" text replaced by logout icon button
- Nav may use slightly smaller text (13px)

**Dashboard:**
```
┌─────────────────────────────────┐
│ Dashboard  [+ Create Permit]    │
├──────────────┬──────────────────┤
│  Total  42   │   Pending   8    │
├──────────────┼──────────────────┤
│  Approved 25 │   Rejected  5    │
├──────────────┴──────────────────┤
│       Revoked  4                │
├─────────────────────────────────┤
│  [Donut Chart — full width]     │
├─────────────────────────────────┤
│  [Recent Activity — stacked]    │
└─────────────────────────────────┘
```
- Stat cards: 2-column grid (2×2 + 1 full-width for Revoked, or 2×2 + 1 centered)
- Chart and activity: stacked vertically (chart above, activity below)

**Permit List:**
- Collapse less-critical columns: hide "End Date" and "Created" columns; keep Title, Applicant, Status, Actions
- Filter bar: 2-row layout
  - Row 1: Search input (full-width)
  - Row 2: Status pills (scrollable horizontal) + Type dropdown
  - Date range: collapsible "More filters" section or moved to a drawer
- Actions column: icon buttons only (no text labels)
- Table may scroll horizontally if needed (with frozen Title column)

**Permit Detail:**
- Header card: title and badge stack vertically (badge below title)
- Details grid: single column (left column fields above right column fields)
- Action buttons: full-width below status badge
- Timeline: unchanged

**Permit Creation:**
- Form card: full-width (minus 16px padding each side)
- Date fields: stacked vertically (Start Date above End Date)
- Action bar: Submit Permit full-width; Cancel as text link below

**Dialogs:**
- Dialogs: still centered, but width = 90vw (max 480px)
- No change to content layout

---

### Responsive Breakpoint Summary

| Breakpoint | Layout Changes |
|------------|----------------|
| ≥1280px | Full desktop layout; all features full-width |
| 1024px–1280px | Compact padding; filter bar may wrap; column header abbreviations |
| 768px–1024px | Stat cards 2-column; chart+activity stacked; table columns reduced; single-column detail |
| <768px | Out of scope for POC; no guaranteed support |
---

## Accessibility Notes

**Standard:** WCAG AA (minimum)
**User Story:** US-7.5 (NFR-4)

---

### Color Contrast

All text/background combinations must meet WCAG AA minimum ratios:
- **Normal text** (< 18px regular / < 14px bold): 4.5:1 minimum
- **Large text** (≥ 18px regular / ≥ 14px bold): 3:1 minimum

| Element | Foreground | Background | Target Ratio | Notes |
|---------|-----------|------------|--------------|-------|
| Body text | Gray-900 `#111827` | White `#FFFFFF` | 15.7:1 ✓ | Exceeds AA |
| Secondary text | Gray-500 `#6B7280` | White `#FFFFFF` | 4.6:1 ✓ | Passes AA |
| Pending badge text | Amber-600 `#D97706` | Amber-100 `#FEF3C7` | ~4.5:1 | Verify at implementation |
| Approved badge text | Emerald-600 `#059669` | Emerald-100 `#D1FAE5` | ~4.5:1 | Verify at implementation |
| Rejected badge text | Red-600 `#DC2626` | Red-100 `#FEE2E2` | ~4.5:1 | Verify at implementation |
| Primary button text | White | Indigo-600 `#4F46E5` | ~5.7:1 ✓ | Passes AA |
| Error text | Red-600 `#DC2626` | White `#FFFFFF` | ~4.5:1 | Verify at implementation |
| Toast text | Color-700 on Color-50 | — | Verify | Use darker text shades if needed |

**Important:** Color must NEVER be the sole differentiator. Status badges use both color AND text label ("Pending", "Approved", etc.). Chart segments have legend text labels. Error states use both red color AND warning icon AND text message.

---

### Keyboard Navigation

All interactive elements must be reachable and operable via keyboard:

| Element | Keyboard behavior |
|---------|-------------------|
| Nav links | Tab to focus; Enter to activate |
| Buttons | Tab to focus; Enter or Space to activate |
| Stat cards (clickable) | Tab to focus; Enter to navigate |
| Table rows (clickable) | Tab to focus; Enter to navigate to detail |
| Action links in table | Tab to focus; Enter to activate |
| Select dropdowns | Tab to focus; Arrow keys to navigate options; Enter to select |
| Date pickers | Tab to focus; Arrow keys within calendar; Enter to select |
| Textareas / inputs | Tab to focus; typing to enter text |
| Dialog (open) | Focus trapped inside dialog while open |
| Dialog confirm | Enter triggers confirm (when not in textarea) |
| Dialog cancel/close | Escape closes (when not loading) |
| Toast dismiss | Tab to `×` button; Enter to dismiss |
| Sort column headers | Tab to focus; Enter to sort; Enter again to toggle direction |
| Pagination buttons | Tab to focus; Enter to navigate |

**Focus Ring:** All focused elements display a visible 2px solid Indigo-600 ring with 2px offset. Never use `outline: none` without a custom replacement.

---

### Screen Reader Support

**Form inputs:** Every input and textarea MUST have an associated `<label>` element (not just `placeholder` text — placeholders disappear on focus and are not read reliably by all screen readers).

**Required fields:** Mark required fields with both the visual `*` and `aria-required="true"`.

**Error messages:** Inline validation errors must be announced to screen readers:
- Associate error message with input using `aria-describedby`
- Set `aria-invalid="true"` on invalid inputs
- Use `role="alert"` or `aria-live="polite"` for dynamically injected error messages

**Status badges:** The `StatusBadge` component must render visible text content (not just colored background), so screen readers read "Pending", "Approved", etc.

**Icons:** All icons that convey meaning (stat card icons, action link icons) must have `aria-label` or be accompanied by visible text. Decorative icons use `aria-hidden="true"`.

**Table:** The permit list table must use proper `<th scope="col">` for column headers. Sortable columns indicate sort state with `aria-sort="ascending|descending|none"`.

**Dialogs:** Use `role="dialog"` and `aria-modal="true"` on the dialog container. Focus is trapped within the dialog while open. `aria-labelledby` points to the dialog title.

**Toast notifications:** Use `role="status"` (for success) or `role="alert"` (for errors) so they are announced to screen readers without requiring focus.

**Loading states:** Skeleton screens are purely visual. During loading, the data container should have `aria-busy="true"` and a visible or accessible label like "Loading permits…" using `aria-label` or a visually hidden text element.

**Navigation:** The `<nav>` element wraps the nav bar. Active nav link uses `aria-current="page"`.

---

### ARIA Roles and Attributes Reference

| Component | Required ARIA |
|-----------|---------------|
| Nav bar | `<nav aria-label="Main navigation">` |
| Active nav link | `aria-current="page"` |
| Stat cards | `role="button"` or `<button>` element; `aria-label="View Pending permits: 8"` |
| Table | `<table>` with `<th scope="col">` for headers; `aria-sort` on sorted columns |
| Table row (clickable) | `role="button"` or `<tr tabindex="0" aria-label="...">` |
| Dialog | `role="dialog"` `aria-modal="true"` `aria-labelledby="dialog-title"` |
| Toast (success) | `role="status"` `aria-live="polite"` |
| Toast (error) | `role="alert"` `aria-live="assertive"` |
| Loading skeleton | `aria-busy="true"` on parent container |
| Form error | `aria-invalid="true"` on input; `aria-describedby="error-id"` pointing to error message |
| Required field | `aria-required="true"` |
| Status badge | Plain visible text ("Pending"); no special role needed |
| Dismiss button | `aria-label="Dismiss notification"` |

---

### Focus Management

**Modal dialog (open):** Move focus to the first focusable element inside the dialog (typically the title or first input).

**Modal dialog (close — success):** Return focus to the element that triggered the dialog (the Approve/Reject/Revoke button on the detail page).

**Modal dialog (close — cancel):** Return focus to the trigger button.

**Form validation (submit with errors):** Scroll to and focus the first invalid field.

**Toast notifications:** Do not steal focus; use `aria-live` regions for announcement only.

**Page transitions:** On navigation, focus should move to the top of the new page (main content or heading).
