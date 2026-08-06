---

## F01: Manager Dashboard

**Priority:** P0 — Critical
**PRD Reference:** F1

---

### Description

The Manager Dashboard is the primary landing page after login. It provides an at-a-glance overview of the entire permit landscape through summary stat cards, a visual status chart, a recent activity feed, and a prominent "Create New Permit" call-to-action. The dashboard must reflect real-time database state — no stale caching that would mislead a manager acting on permit data.

---

### Terminology

- **Stat Card:** A card-shaped UI element displaying a single aggregate metric (e.g., "Total Permits: 42").
- **Status Breakdown Chart:** A donut or bar chart visualizing the distribution of permits across all status values.
- **Recent Activity Feed:** A chronological list of the most recently created or updated permits.
- **CTA (Call-to-Action):** A prominent button that drives the primary user action; here, "Create New Permit."
- **Real-Time State:** Dashboard data is fetched fresh on every page load and on focus return; no persistent client-side cache that could show stale counts.

---

### Sub-features

- **F01.1 — Stat Cards:** Five summary count cards showing Total, Pending, Approved, Rejected, Revoked permit counts.
- **F01.2 — Status Breakdown Chart:** Visual chart (donut preferred) showing permit distribution by status.
- **F01.3 — Recent Activity Feed:** A list of the 5–10 most recently created or updated permits with status badge and link to detail.
- **F01.4 — Create New Permit CTA:** A prominent button linking to the permit creation flow (→ F02).
- **F01.5 — Navigation Integration:** Dashboard is accessible via the persistent nav bar (item: "Dashboard").
- **F01.6 — Loading Skeletons:** Skeleton placeholders displayed while dashboard data is being fetched.
- **F01.7 — Empty State:** Graceful empty state when no permits exist yet (first use, or all permits deleted — POC scenario).

---

### Screens & UI Flows

#### Screen: Dashboard (`/dashboard`)

**Page Structure (top to bottom):**

1. **Page Header**
   - Heading: "Dashboard"
   - Subheading: "Welcome back, [Manager Name]"
   - Right side: "Create New Permit" primary button (links to `/permits/new`)

2. **Stat Cards Row** (horizontal row of 5 cards on desktop, 2-column grid on tablet)
   - Each card: icon + metric label + large count number + optional subtle trend indicator
   - Card variants by status:
     - **Total Permits** — neutral/brand color, icon: document stack
     - **Pending** — amber/yellow, icon: clock/hourglass
     - **Approved** — green, icon: checkmark circle
     - **Rejected** — red, icon: X circle
     - **Revoked** — gray/slate, icon: ban/slash circle
   - Card click: navigates to Permit List (`/permits`) filtered to that status (e.g., `/permits?status=PENDING`)

3. **Middle Section** (two-column layout on desktop, stacked on tablet)
   - **Left column (~60%):** Status Breakdown Chart
     - Donut chart with status color legend
     - Center label: total permit count
     - Hover tooltip on each segment: status name + count + percentage
     - Title: "Permits by Status"
   - **Right column (~40%):** Recent Activity Feed
     - Title: "Recent Activity"
     - List of 5–10 most recent permits (ordered by `updated_at DESC`)
     - Each row: status badge + permit title (truncated at ~40 chars) + applicant name + relative time (e.g., "2 hours ago")
     - Each row is clickable → navigates to `/permits/:id`
     - "View all permits" link at bottom → `/permits`

4. **Empty State** (shown when 0 permits exist):
   - Centered illustration or icon
   - Heading: "No permits yet"
   - Body: "Create your first permit to get started."
   - "Create New Permit" button

**Loading State:**
- Stat cards show skeleton rectangles (5 cards, same layout)
- Chart area shows a skeleton circle
- Recent activity shows 5 skeleton rows
- Skeletons animate with a shimmer effect

---

### Process

1. Authenticated manager navigates to `/dashboard` (or is redirected here after login).
2. Dashboard component mounts; triggers parallel API calls:
   - `GET /permits/stats` → returns aggregate counts per status (Total, Pending, Approved, Rejected, Revoked)
   - `GET /permits?limit=10&sort=updated_at:desc` → returns recent 10 permits
3. While API calls are in-flight, skeleton screens are displayed (F01.6).
4. On data receipt, skeletons are replaced with:
   - Populated stat cards (F01.1)
   - Rendered donut chart (F01.2)
   - Populated recent activity list (F01.3)
5. If both API calls resolve with empty data (0 permits), render empty state (F01.7).
6. Manager clicks a stat card → navigates to `/permits?status={STATUS}` (→ F03, F04).
7. Manager clicks a row in recent activity → navigates to `/permits/:id` (→ F05).
8. Manager clicks "Create New Permit" → navigates to `/permits/new` (→ F02).
9. On window focus return (tab switch back), data is re-fetched to reflect any updates made in other tabs (React Query `refetchOnWindowFocus: true`).

---

### Inputs

- No direct user inputs on the dashboard (read-only view).
- Implicit inputs via navigation: status filter (from stat card click) passed as query params to Permit List.

---

### Outputs

**Dashboard Data (from `GET /permits/stats`):**
```json
{
  "data": {
    "total": 42,
    "pending": 8,
    "approved": 25,
    "rejected": 5,
    "revoked": 4
  },
  "error": null,
  "meta": {}
}
```

**Recent Activity (from `GET /permits?limit=10&sort=updated_at:desc`):**
- Array of permit summary objects; full shape defined in `Y1-api.md` §Permits.

---

### Validation Rules

- Stat counts must exactly match the actual database counts at time of fetch — no approximations, no cached totals.
- `total` must equal `pending + approved + rejected + revoked`.
- If the stats endpoint returns data inconsistent with this invariant, log a warning but render whatever the server returns (data integrity is enforced server-side → see F09).
- Recent activity list must be ordered by `updated_at DESC`, not `created_at DESC`, so the most recently actioned permits appear first.

---

### Error States

| Scenario | HTTP Status | Error Code | UI Behaviour |
|---|---|---|---|
| Stats API call fails | 500 | `SERVER_ERROR` | Stat cards show error state with "–" count and a retry icon; toast: "Could not load dashboard stats." |
| Recent activity API call fails | 500 | `SERVER_ERROR` | Recent activity panel shows an error message with a "Retry" button. |
| Both calls fail | 500 | `SERVER_ERROR` | Full-page error message with a "Refresh" button. |
| No permits exist | — | — | Empty state UI (F01.7); no error — this is a valid state. |

---

### API Surface (this feature)

| Method | Path | Description |
|---|---|---|
| `GET` | `/permits/stats` | Returns aggregate counts per status |
| `GET` | `/permits` | Returns paginated permit list (used here with `limit=10&sort=updated_at:desc`) |

Full request/response schemas → `Y1-api.md` §Permits.

---

### Schema Surface (this feature)

Uses table: `permits` (aggregated via `COUNT` + `GROUP BY status`).

Full DDL → `Y0-schema.md` §Permits.
