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
