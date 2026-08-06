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
