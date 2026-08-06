---

## F04: Search & Filter

**Priority:** P1 — High
**PRD Reference:** F4

---

### Description

Search & Filter provides managers with the ability to quickly locate specific permits within the permit list. Free-text search matches against key text fields; structured filters narrow by status, type, and date range. Filters are combinable, URL-persisted for shareability, and visually indicated so managers always know what is active. Search results update in real-time with debouncing to avoid excessive API calls.

---

### Terminology

- **Free-Text Search:** A text query matched against `title`, `applicant_name`, and `description` fields using case-insensitive substring matching.
- **Structured Filter:** A discrete filter applied to a specific field with predefined values (status, type, date range).
- **Active Filter Chip:** A small pill/tag element showing the name and value of an applied filter with an `×` to remove it.
- **Debounce:** A delay (300ms) applied to the search input so the API is only called after the user stops typing, not on every keystroke.
- **URL State:** Filter and search state is stored in the URL query string so pages can be shared or bookmarked.
- **Combined Filter (AND logic):** When multiple filters are active simultaneously, results must satisfy ALL active filters.

---

### Sub-features

- **F04.1 — Free-Text Search Bar:** A text input that filters permits by `title`, `applicant_name`, and `description`.
- **F04.2 — Status Filter:** A pill/tab group or dropdown for filtering by permit status (All, Pending, Approved, Rejected, Revoked).
- **F04.3 — Type Filter:** A dropdown for filtering by permit type (All Types, Work, Access, Activity, Safety, Other).
- **F04.4 — Date Range Filter:** Two date pickers for `start_date_from` and `start_date_to`.
- **F04.5 — Active Filter Chips:** Visual representation of each currently active filter with individual remove capability.
- **F04.6 — Clear All Filters:** A single control to reset all filters and search to their default state.
- **F04.7 — URL State Sync:** All filter and search state is reflected in the URL query string; changes update the URL; loading a URL with query params restores the filter state.
- **F04.8 — Debounced Search:** Search input calls the API after a 300ms debounce delay.
- **F04.9 — Real-Time Results:** The permit list (→ F03) updates automatically as filters change; no "Apply" button required.

---

### Screens & UI Flows

#### UI Component: Filter Bar (rendered above the permit table on `/permits`)

**Layout (left to right, responsive):**

```
[ 🔍 Search permits...          ] [Status ▼] [Type ▼] [📅 From] [📅 To]
Active filters: [Pending ×] [Work Permit ×]                    [Clear all filters]
```

**Search Input (`F04.1`):**
- Full-width on mobile; ~300px on desktop.
- Placeholder: "Search permits by title, applicant, or description…"
- Leading search icon (🔍).
- Clear button (`×`) appears inside the input when the field has a value; clicking it clears the search.
- Debounce: 300ms after last keystroke before API call fires.

**Status Filter (`F04.2`):**
- Displayed as a segmented pill group (preferred) or a dropdown.
- Options: All | Pending | Approved | Rejected | Revoked
- Default: "All" (no status filter applied).
- Active status tab is highlighted with the status color (amber for Pending, green for Approved, etc.).

**Type Filter (`F04.3`):**
- Dropdown selector.
- Options: All Types | Work Permit | Access Permit | Activity Authorization | Safety Permit | Other
- Default: "All Types" (no type filter applied).

**Date Range Filter (`F04.4`):**
- Two labeled date pickers: "From" and "To".
- "From" picker populates `start_date_from` (permits with `start_date ≥` this value).
- "To" picker populates `start_date_to` (permits with `start_date ≤` this value).
- If only "From" is set: shows all permits starting on or after that date.
- If only "To" is set: shows all permits starting on or before that date.

**Active Filter Chips (`F04.5`):**
- Appear in a row below the filter controls when any non-default filter is active.
- Each chip: filter name + value + `×` button.
  - Example: `Status: Pending ×`, `Type: Work Permit ×`, `From: 01 Aug 2026 ×`
- Clicking `×` on a chip removes that filter and re-fetches results.

**Clear All Filters (`F04.6`):**
- Appears as a link/text button: "Clear all filters" aligned right below filter bar.
- Only visible when at least one filter is active (including search).
- Clicking it resets: `search = ""`, `status = all`, `type = all`, `start_date_from = null`, `start_date_to = null`, `page = 1`.
- URL is updated to `/permits` (no query params) after clearing.

---

### Process

1. Manager navigates to `/permits`; existing URL query params are read to restore filter state.
2. Filter bar renders with active state matching the query params (e.g., status pill "Pending" is active if `?status=PENDING` is in the URL).
3. Manager types in the search bar → 300ms debounce → `search` query param updated in URL → `GET /permits?search=...` called → permit list re-renders.
4. Manager clicks a status pill → `status` query param updated → URL updated → API re-fetched → permit list re-renders.
5. Manager selects a type from dropdown → `type` query param updated → URL updated → API re-fetched.
6. Manager selects date range values → date query params updated → URL updated → API re-fetched.
7. When any filter is active, active filter chips appear below the filter bar.
8. Manager clicks `×` on a chip → that filter is removed → URL updated → API re-fetched.
9. Manager clicks "Clear all filters" → all filters reset → URL becomes `/permits` → API re-fetched with no filters.
10. Manager copies URL and shares with a colleague → colleague opens URL → same filter state is restored.
11. Filter state is preserved when navigating to a permit detail and pressing "Back" (browser back button or breadcrumb) — URL retains query params.

---

### Inputs

**Search Input:**
- `search` (string, optional): Free-text query. Min 1 char to trigger search. Max 100 chars.

**Status Filter:**
- `status` (string, optional): `PENDING` | `APPROVED` | `REJECTED` | `REVOKED`. Absence = all statuses.

**Type Filter:**
- `type` (string, optional): `WORK` | `ACCESS` | `ACTIVITY` | `SAFETY` | `OTHER`. Absence = all types.

**Date Range:**
- `start_date_from` (ISO 8601 date, optional): `YYYY-MM-DD`. Inclusive lower bound on `start_date`.
- `start_date_to` (ISO 8601 date, optional): `YYYY-MM-DD`. Inclusive upper bound on `start_date`.

---

### Outputs

- Updated URL query string (client-side routing; no page reload).
- Updated permit list (→ F03) reflecting filtered results.
- Active filter chips matching the applied filters.

---

### Validation Rules

- `search` query with only whitespace is treated as empty (trimmed before querying).
- `start_date_from` and `start_date_to` must be valid dates. If `start_date_from` > `start_date_to`, show a validation warning: "Start of range must be before end of range." and do not apply the invalid filter pair.
- If a URL is loaded with an invalid `status` or `type` value, the filter is silently ignored (treated as "all").
- Debounce timing: 300ms. If the user clears the search field entirely, fire the API call immediately (no debounce needed for empty string).
- Maximum search query length enforced at 100 characters; characters beyond this are not entered.
- Filters are combined with AND logic on the server; there is no OR filter capability in the POC.

---

### Error States

| Scenario | UI Behaviour |
|---|---|
| Search/filter returns 0 results | Empty state with "No permits match your current filters. Try adjusting or clearing your filters." and "Clear Filters" button. Not an error — valid state. |
| `start_date_from` > `start_date_to` | Inline warning below date pickers: "Start date must be before end date." Date filters not applied until corrected. |
| API error during filtered search | Permit list shows error state with "Could not load permits. Retry" (same error handling as F03). |

---

### API Surface (this feature)

All filtering is handled by the same endpoint as permit listing:

| Method | Path | Description |
|---|---|---|
| `GET` | `/permits` | Accepts `search`, `status`, `type`, `start_date_from`, `start_date_to` query params |

Full request/response schemas → `Y1-api.md` §Permits.

---

### Schema Surface (this feature)

Queries table: `permits` with WHERE clauses:
- `ILIKE '%search%'` on `title`, `applicant_name`, `description`
- `status = $1` if status filter active
- `type = $2` if type filter active
- `start_date >= $3` if `start_date_from` set
- `start_date <= $4` if `start_date_to` set

Full DDL → `Y0-schema.md` §Permits.
