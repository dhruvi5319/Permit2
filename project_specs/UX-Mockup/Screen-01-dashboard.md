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
