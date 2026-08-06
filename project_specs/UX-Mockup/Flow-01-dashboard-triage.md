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
