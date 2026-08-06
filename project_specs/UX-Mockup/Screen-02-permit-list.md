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
