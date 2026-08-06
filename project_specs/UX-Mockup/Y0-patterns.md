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
