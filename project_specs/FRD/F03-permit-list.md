---

## F03: Permit List / Table View

**Priority:** P0 — Critical
**PRD Reference:** F3

---

### Description

The Permit List is the primary navigation surface for the entire permit inventory. It displays all permits in a paginated, sortable table with color-coded status badges, contextual action links, and a loading skeleton. Managers use this screen to survey all permits, identify those needing attention, and navigate to individual permit details. Visual clarity is paramount: status must be immediately scannable.

---

### Terminology

- **Permit Row:** A single table row representing one permit record.
- **Status Badge:** A color-coded pill showing the permit's current status (→ F07 for color spec).
- **Actions Column:** The rightmost table column containing contextual quick-action links for each row.
- **Pagination Controls:** Next/Previous page buttons with page indicator.
- **Loading Skeleton:** Placeholder rows displayed during data fetch (animated shimmer).
- **Empty State:** The UI shown when no permits match the current filters or no permits exist at all.
- **Sort Direction:** `ASC` (ascending) or `DESC` (descending) applied to the sorted column.

---

### Sub-features

- **F03.1 — Permit Table:** A full-width table with the defined column set.
- **F03.2 — Status Badges:** Color-coded pill badges per row.
- **F03.3 — Column Sorting:** Click column header to sort; toggle direction on second click.
- **F03.4 — Pagination:** Server-side pagination; default 20 rows per page.
- **F03.5 — Row Click Navigation:** Clicking anywhere on a row (except action links) navigates to `/permits/:id`.
- **F03.6 — Contextual Actions Column:** Quick-action links rendered based on permit status.
- **F03.7 — Loading Skeleton:** 5 skeleton rows with shimmer animation while fetching.
- **F03.8 — Empty State:** Illustrated/icon-based empty state when no permits match.
- **F03.9 — Search & Filter Integration:** Permit List is the display surface for F04 filters; filter controls render above the table.
- **F03.10 — "Create New Permit" Button:** Displayed in the page header for direct access to F02.

---

### Screens & UI Flows

#### Screen: Permit List (`/permits`)

**Page Structure:**

1. **Page Header**
   - Heading: "Permits"
   - Right side: "Create New Permit" primary button (→ `/permits/new`)

2. **Filter & Search Bar** (→ F04 for full spec)
   - Search input, status filter, type filter, date range pickers, active filter chips, "Clear All" link
   - Positioned above the table, below the page header

3. **Permits Table**

   | Column | Data Source | Sortable | Notes |
   |---|---|---|---|
   | **#** / Reference | `id` (shortened: first 8 chars of UUID) | No | Monospace font |
   | **Title** | `title` | Yes | Clickable → detail; truncated at 50 chars with tooltip |
   | **Type** | `type` | Yes | Display label (e.g., "Work Permit") not raw enum |
   | **Applicant** | `applicant_name` | Yes | — |
   | **Status** | `status` | Yes | Color-coded badge (see status badge spec below) |
   | **Start Date** | `start_date` | Yes | Formatted: `DD MMM YYYY` |
   | **End Date** | `end_date` | Yes | Formatted: `DD MMM YYYY` |
   | **Created** | `created_at` | Yes | Formatted: `DD MMM YYYY` |
   | **Actions** | — | No | Contextual links (see Actions spec below) |

   **Status Badge Colors:**
   - `PENDING` → amber background, dark amber text
   - `APPROVED` → green background, dark green text
   - `REJECTED` → red background, dark red text
   - `REVOKED` → gray background, dark gray text

   **Actions Column (conditional):**
   - `PENDING` permits: "View" link + "Approve" link + "Reject" link
   - `APPROVED` permits: "View" link + "Revoke" link
   - `REJECTED` permits: "View" link only
   - `REVOKED` permits: "View" link only
   - Clicking "Approve", "Reject", or "Revoke" in the list navigates to the permit detail page and opens the relevant confirmation dialog.

4. **Pagination Controls** (below table)
   - Format: `Showing 1–20 of 47 permits`
   - Previous / Next buttons (disabled when at first/last page)
   - Page size selector: 10 / 20 / 50 (optional for POC; default 20 is acceptable)

5. **Loading State**
   - Table header remains visible
   - 5 skeleton rows with shimmer animation replace data rows
   - Filter controls remain interactive

6. **Empty State**
   - Displayed when: (a) no permits exist, or (b) no permits match the active filters
   - Icon: document with magnifying glass (or similar)
   - Heading: "No permits found"
   - Body (when filters are active): "No permits match your current filters. Try adjusting or clearing your filters."
   - Body (when no permits exist): "No permits have been created yet."
   - CTA button: "Create New Permit" (shown only when no permits exist case)
   - "Clear Filters" button (shown only when filters are active case)

---

### Process

1. Manager navigates to `/permits` (from nav bar, breadcrumb, or dashboard).
2. Component mounts; reads query params from URL to determine active filters, sort column, sort direction, and page number (→ F04).
3. Skeleton rows displayed.
4. `GET /permits` called with current query params (search, status, type, date range, sort, page, limit).
5. On response:
   - If `data.items.length > 0`: render table rows with status badges and action links.
   - If `data.items.length === 0`: render empty state (F03.8).
6. Pagination controls rendered using `meta.total`, `meta.page`, `meta.limit` from response.
7. Manager clicks a column header: `sort` and `order` query params updated → URL updated → API re-fetched.
8. Manager clicks "Next" / "Previous": `page` query param incremented/decremented → URL updated → API re-fetched.
9. Manager clicks a row (not an action link): navigate to `/permits/:id`.
10. Manager clicks an action link in a row:
    - "View" → `/permits/:id`
    - "Approve" → `/permits/:id?action=approve` (detail page opens with confirm dialog pre-triggered)
    - "Reject" → `/permits/:id?action=reject`
    - "Revoke" → `/permits/:id?action=revoke`
11. Filter controls change → URL query params update → API re-fetched (→ F04).

---

### Inputs

**Query Parameters (from URL):**
- `search` (string, optional): Free-text search term.
- `status` (string, optional): One of `PENDING`, `APPROVED`, `REJECTED`, `REVOKED`.
- `type` (string, optional): One of `WORK`, `ACCESS`, `ACTIVITY`, `SAFETY`, `OTHER`.
- `start_date_from` (ISO date, optional): Filter permits where `start_date ≥` this value.
- `start_date_to` (ISO date, optional): Filter permits where `start_date ≤` this value.
- `sort` (string, optional): Column to sort by. Valid values: `title`, `type`, `applicant_name`, `status`, `start_date`, `end_date`, `created_at`. Default: `created_at`.
- `order` (string, optional): `asc` or `desc`. Default: `desc`.
- `page` (integer, optional): Page number, 1-indexed. Default: `1`.
- `limit` (integer, optional): Results per page. Default: `20`. Max: `100`.

---

### Outputs

**API Response Structure (`200 OK`):**
```json
{
  "data": {
    "items": [ /* array of permit summary objects */ ],
    "meta": {
      "total": 47,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  },
  "error": null,
  "meta": {}
}
```

Each permit summary object shape → `Y1-api.md` §Permits.

---

### Validation Rules

- `sort` value must be in the allowed list; unknown values default to `created_at`.
- `order` must be `asc` or `desc`; unknown values default to `desc`.
- `page` must be ≥1; values <1 treated as 1.
- `limit` must be 1–100; values outside this range clamped.
- `status` must match enum; unknown values ignored (all statuses returned).
- `type` must match enum; unknown values ignored.
- Date filters: `start_date_from` and `start_date_to` must be valid ISO dates; malformed values are ignored.
- The combination of all filter params is additive (AND logic) — each additional filter narrows the result set.

---

### Error States

| Scenario | HTTP Status | Error Code | UI Behaviour |
|---|---|---|---|
| API call fails | 500 | `SERVER_ERROR` | Error message in table area: "Could not load permits." with "Retry" button |
| Unauthenticated request | 401 | `AUTH_UNAUTHORIZED` | Redirect to `/login?redirect=/permits` |
| No results for active filters | — | — | Empty state with "Clear Filters" option (not an error) |
| Invalid sort/page params | 400 | `VALIDATION_ERROR` | Silently fall back to defaults; no user-visible error |

---

### API Surface (this feature)

| Method | Path | Description |
|---|---|---|
| `GET` | `/permits` | List permits with filtering, sorting, pagination |

Full request/response schemas → `Y1-api.md` §Permits.

---

### Schema Surface (this feature)

Queries table: `permits` (SELECT with WHERE clauses for filters, ORDER BY, LIMIT, OFFSET).

Full DDL → `Y0-schema.md` §Permits.
