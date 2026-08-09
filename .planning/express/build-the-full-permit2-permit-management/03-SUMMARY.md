---
phase: build-the-full-permit2-permit-management
plan: "03"
subsystem: frontend-ui
tags: [react, nextjs, tanstack-query, recharts, tailwindcss, design-system]
dependency_graph:
  requires:
    - plan: "01"
      artifacts: [prisma/schema.prisma, PermitStatus, PermitType enums]
    - plan: "02"
      artifacts: [GET /api/permits/stats, GET /api/permits, GET /api/auth/me, POST /api/auth/logout]
  provides:
    - artifact: components/shared/StatusBadge.tsx
      exports: [StatusBadge]
    - artifact: components/layout/NavBar.tsx
      exports: [NavBar, Navbar (alias)]
    - artifact: components/layout/Breadcrumb.tsx
      exports: [Breadcrumb]
    - artifact: components/dashboard/StatCard.tsx
      exports: [StatCard]
    - artifact: components/dashboard/StatsRow.tsx
      exports: [StatsRow]
    - artifact: components/dashboard/StatusDonutChart.tsx
      exports: [StatusDonutChart]
    - artifact: components/dashboard/RecentActivityFeed.tsx
      exports: [RecentActivityFeed]
    - artifact: components/permits/PermitFilterBar.tsx
      exports: [PermitFilterBar]
    - artifact: components/permits/PermitTable.tsx
      exports: [PermitTable]
    - artifact: components/permits/PermitRow.tsx
      exports: [PermitRow]
    - artifact: lib/types/permit.ts
      exports: [PermitStatus, PermitType, PERMIT_TYPE_LABELS, PERMIT_STATUS_LABELS, PermitSummary, PermitDetail, PermitStats, PaginationMeta, PermitListParams]
    - artifact: lib/hooks/use-permit-stats.ts
      exports: [usePermitStats]
    - artifact: lib/hooks/use-permits.ts
      exports: [usePermits]
    - artifact: app/(protected)/dashboard/page.tsx
      exports: [Dashboard route at /dashboard]
    - artifact: app/(protected)/permits/page.tsx
      exports: [Permits list route at /permits]
  affects:
    - plan: "04"
      note: Permit detail page and creation form consume StatusBadge, NavBar, Breadcrumb, shared types
tech_stack:
  added:
    - sonner@latest (Toaster for bottom-right notifications)
    - class-variance-authority (CVA for component variants)
    - tailwind-merge (tw class deduplication)
    - "@radix-ui/react-dialog, dropdown-menu, select, label, popover, separator"
  patterns:
    - TanStack Query v5 with placeholderData for smooth pagination transitions
    - URL-driven filter state via useSearchParams + router.push (no useState for filters)
    - Server-side auth guard in layout.tsx via cookies() + fetch(/api/auth/me)
    - Shimmer skeleton via CSS @keyframes + .skeleton utility class
key_files:
  created:
    - permit2/app/globals.css
    - permit2/app/layout.tsx
    - permit2/app/providers.tsx
    - permit2/app/(protected)/layout.tsx
    - permit2/app/(protected)/dashboard/page.tsx
    - permit2/app/(protected)/permits/page.tsx
    - permit2/lib/types/permit.ts
    - permit2/lib/hooks/use-permit-stats.ts
    - permit2/lib/hooks/use-permits.ts
    - permit2/components/shared/StatusBadge.tsx
    - permit2/components/shared/SkeletonCard.tsx
    - permit2/components/shared/SkeletonTable.tsx
    - permit2/components/shared/EmptyState.tsx
    - permit2/components/shared/ErrorState.tsx
    - permit2/components/shared/Pagination.tsx
    - permit2/components/layout/NavBar.tsx
    - permit2/components/layout/Breadcrumb.tsx
    - permit2/components/dashboard/StatCard.tsx
    - permit2/components/dashboard/StatsRow.tsx
    - permit2/components/dashboard/StatusDonutChart.tsx
    - permit2/components/dashboard/RecentActivityFeed.tsx
    - permit2/components/permits/PermitFilterBar.tsx
    - permit2/components/permits/PermitTable.tsx
    - permit2/components/permits/PermitRow.tsx
  modified:
    - permit2/package.json (added sonner, class-variance-authority, tailwind-merge, radix-ui packages)
  deleted:
    - permit2/components/layout/Navbar.tsx (replaced by NavBar.tsx with correct casing + userName prop)
decisions:
  - "Used NavBar.tsx (with backward-compat Navbar alias) to fix casing mismatch with pre-existing Navbar.tsx from Wave 4"
  - "StatusDonutChart onClick cast entry to unknown first to satisfy TypeScript for custom data property"
  - "Protected layout reads token cookie server-side, fetches /api/auth/me with no-store cache, redirects on null user"
  - "PermitFilterBar search uses 300ms debounce via setTimeout ref; all filters reset page to 1 on change"
  - "DB_URL not set at build time — Next.js build fails at static page data collection for API routes (pre-existing, not caused by this plan)"
metrics:
  duration: "~25 minutes"
  completed: "2026-08-09"
  tasks: 2
  files_created: 22
  files_modified: 2
---

# Phase build-the-full-permit2-permit-management Plan 03: Design System, Dashboard, and Permit List Summary

## One-liner

Inter font + indigo design system, TanStack Query hooks, Recharts donut chart dashboard with stat cards, URL-synced filter bar with 300ms debounce, sortable paginated permit table — all wired to Wave 2 API.

## What Was Built

### Task 1: Design System Foundation

**`app/globals.css`** — Complete design token system:
- CSS custom properties: `--brand: #4F46E5`, `--status-pending-bg`, etc.
- Shimmer skeleton animation (`@keyframes shimmer`) via `.skeleton` CSS class
- Inter font stack, gray-50 page background, antialiased rendering

**`app/layout.tsx`** — Inter from `next/font/google`, `--font-inter` variable, wraps in `Providers`

**`app/providers.tsx`** — `QueryClientProvider` (staleTime 30s, retry 1, refetchOnWindowFocus) + Sonner `Toaster` (bottom-right, richColors, 5s dismiss, close button)

**`lib/types/permit.ts`** — Shared TypeScript types:
- `PermitStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED'`
- `PermitType = 'WORK' | 'ACCESS' | 'ACTIVITY' | 'SAFETY' | 'OTHER'`
- `PERMIT_TYPE_LABELS`, `PERMIT_STATUS_LABELS` display maps
- `PermitSummary`, `PermitDetail`, `PermitStats`, `PaginationMeta`, `PermitListParams`

**`lib/hooks/use-permit-stats.ts`** — `usePermitStats()`: `useQuery` against `GET /api/permits/stats`, queryKey `['permit-stats']`

**`lib/hooks/use-permits.ts`** — `usePermits(params)`: `useQuery` against `GET /api/permits`, `placeholderData` for smooth pagination, queryKey `['permits', params]`

**Shared Components:**
| Component | Export | Description |
|-----------|--------|-------------|
| `StatusBadge` | `StatusBadge` | Pill (rounded-full), 14px font-medium, amber/emerald/red/gray semantic colors |
| `SkeletonCard` | `SkeletonCard` | Shimmer card matching stat card dimensions |
| `SkeletonTable` | `SkeletonTable` | Configurable rows/cols shimmer table |
| `EmptyState` | `EmptyState` | Two types: `no-permits` (FileX + Create CTA) and `no-results` (SearchX + Clear Filters) |
| `ErrorState` | `ErrorState` | AlertCircle + message + optional Retry button |
| `Pagination` | `Pagination` | "Showing X–Y of Z permits" + Previous/Next with disabled states |

**Layout Components:**
| Component | Export | Description |
|-----------|--------|-------------|
| `NavBar.tsx` | `NavBar`, `Navbar` | Sticky 64px, Shield + "Permit2" logo, Dashboard/Permits links with active underline, userName + Logout |
| `Breadcrumb.tsx` | `Breadcrumb` | ChevronRight-separated items, last item non-linked |

**`app/(protected)/layout.tsx`** — Server component: reads `token` cookie via `cookies()`, fetches `/api/auth/me` with `no-store`, redirects to `/login` if null user, renders `NavBar` with `user.name`

---

### Task 2: Dashboard and Permit List Pages

**Dashboard Components:**
| Component | Description |
|-----------|-------------|
| `StatCard` | Clickable (Link), 4px left border accent, icon + count (4xl bold) + label (sm gray-500), hover scale(1.02) + shadow |
| `StatsRow` | 5 StatCards: Total→/permits, Pending/Approved/Rejected/Revoked→/permits?status=X |
| `StatusDonutChart` | Recharts PieChart, innerRadius 70 / outerRadius 110, semantic colors, center total label, legend with count+%, click segment→filter |
| `RecentActivityFeed` | 10 permits: StatusBadge + truncated title (40ch) + applicant + formatDistanceToNow, each row → /permits/:id, "View all permits" link |

**`app/(protected)/dashboard/page.tsx`** (`'use client'`):
- Page header: "Dashboard" + welcome subtext + "Create New Permit" CTA (indigo, → /permits/new)
- StatsRow (live counts from usePermitStats)
- `lg:grid-cols-5` grid: StatusDonutChart (col-span-3) + RecentActivityFeed (col-span-2)
- Skeleton while loading; sonner toast on stats error

**Permit List Components:**
| Component | Description |
|-----------|-------------|
| `PermitFilterBar` | Search (300ms debounce, × clear), 5 status pills (active = semantic color), type dropdown, date range (From/To) with invalid-range warning, active filter chips with × remove, "Clear all filters" link; all state → URL via `router.push` |
| `PermitTable` | 9 columns, sortable headers (ArrowUp/ArrowDown/ArrowUpDown, active = indigo-600), sort synced to `?sort=X&order=Y`, skeleton rows, EmptyState, ErrorState, Pagination |
| `PermitRow` | Reference (8-char UUID, monospace), Title (link, truncate 50ch), Type label, Applicant, StatusBadge, Start/End/Created (dd MMM yyyy), status-conditional actions |

**Action Links (PermitRow):**
| Status | Actions |
|--------|---------|
| PENDING | View · Approve (emerald) · Reject (red) |
| APPROVED | View · Revoke (amber) |
| REJECTED / REVOKED | View only |

**`app/(protected)/permits/page.tsx`** (`'use client'`):
- Suspense boundary wrapping `PermitsContent`
- Reads all filter params from `useSearchParams()`
- Invalid date range (from > to) silently cleared before passing to `usePermits`
- Renders: Page header + "Create New Permit" CTA + PermitFilterBar + PermitTable

---

## Design System Tokens Applied

| Token | Value | Usage |
|-------|-------|-------|
| Brand Primary | `#4F46E5` (indigo-600) | Buttons, active nav links, StatCard accents, filter chips |
| Brand Hover | `#4338CA` (indigo-700) | Hover on indigo elements |
| Pending | amber-100 bg / amber-700 text | StatusBadge, StatCard accent, status pill active |
| Approved | emerald-100 bg / emerald-700 text | StatusBadge, StatCard accent, status pill active |
| Rejected | red-100 bg / red-700 text | StatusBadge, StatCard accent, status pill active |
| Revoked | gray-100 bg / gray-500 text | StatusBadge, StatCard accent, status pill active |
| Surface | white | All cards, NavBar, filter bar, table |
| Background | gray-50 | Page, protected layout |
| Card Radius | 12px (rounded-xl) | All cards, table container, buttons |
| Shimmer | @keyframes shimmer (1.5s linear) | SkeletonCard, SkeletonTable, activity rows |

---

## Navigation Wiring

```
NavBar → /dashboard        (Dashboard link)
NavBar → /permits          (Permits link)
Dashboard → /permits       (Total stat card)
Dashboard → /permits?status=PENDING    (Pending stat card)
Dashboard → /permits?status=APPROVED   (Approved stat card)
Dashboard → /permits?status=REJECTED   (Rejected stat card)
Dashboard → /permits?status=REVOKED    (Revoked stat card)
Dashboard → /permits/new   (Create New Permit CTA)
Dashboard → /permits       (View all permits link)
Dashboard → /permits/:id   (Recent Activity rows)
Donut chart segments → /permits?status=X
Permits list → /permits/:id  (table row title click)
Permits list → /permits/:id  (View action link)
Permits list → /permits/:id?action=approve  (PENDING Approve link)
Permits list → /permits/:id?action=reject   (PENDING Reject link)
Permits list → /permits/:id?action=revoke   (APPROVED Revoke link)
```

---

## Component Export Contracts (for Wave 4 / 04-PLAN consumption)

```typescript
// StatusBadge
export function StatusBadge({ status, className? }: { status: PermitStatus; className?: string }): JSX.Element

// NavBar
export function NavBar({ userName? }: { userName?: string }): JSX.Element

// Breadcrumb
export function Breadcrumb({ items }: { items: Array<{ label: string; href?: string }> }): JSX.Element

// usePermitStats
export function usePermitStats(): UseQueryResult<PermitStats, Error>

// usePermits
export function usePermits(params: PermitListParams): UseQueryResult<{ items: PermitSummary[]; meta: PaginationMeta }, Error>

// lib/types/permit.ts — all types available via @/lib/types/permit
```

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] NavBar file casing mismatch**
- **Found during:** Task 2 (TypeScript check)
- **Issue:** Pre-existing `Navbar.tsx` (lowercase 'b') from Wave 4's earlier execution; plan specifies `NavBar.tsx` (capital B). Import in `(protected)/layout.tsx` referenced `NavBar` (capital B) which caused TS2724 error.
- **Fix:** Created `NavBar.tsx` with correct casing, exported as `NavBar` + backward-compat `Navbar` alias. Deleted old `Navbar.tsx`.
- **Files modified:** `permit2/components/layout/NavBar.tsx` (created), `permit2/components/layout/Navbar.tsx` (deleted)
- **Commit:** 56e15b9

**2. [Rule 1 - Bug] StatusDonutChart onClick TypeScript type error**
- **Found during:** Task 2 (TypeScript check)
- **Issue:** Recharts `PieSectorDataItem` doesn't have `status` in its type definition. `entry.status` caused TS2339.
- **Fix:** Cast `entry as unknown as { status: string }` in onClick handler.
- **Files modified:** `permit2/components/dashboard/StatusDonutChart.tsx`
- **Commit:** 56e15b9

---

## Known Stubs

None found. All components implement real behavior. Filter bar hits real API, chart uses real data from usePermitStats, table uses real data from usePermits.

---

## Known Limitations / TODOs for Wave 4

1. **DB_URL at build time**: `npm run build` fails when `DATABASE_URL` is not set (pre-existing from Wave 2 API routes, not caused by Wave 3). Runtime works fine with the env var.
2. **Dev server binding**: The `next dev` command uses default localhost binding. To expose to preview iframe, run with `--hostname 0.0.0.0` flag: `next dev --hostname 0.0.0.0 -p 3000`.
3. **shadcn/ui**: The plan mentioned shadcn init but the existing project already had a partial component setup from Wave 4. We used raw Tailwind for all new components instead, which is consistent and complete.
4. **Pagination visibility**: Pagination only shows when `meta.totalPages > 1`. With <20 permits (the seeded data), pagination is hidden — correct behavior per UX spec ("Showing X–Y of Z permits").

## Self-Check: PASSED

Files created: All 22 files verified to exist on disk.

Key exports verified:
- `export function StatusBadge` ✓
- `export function NavBar` ✓  
- `export function Breadcrumb` ✓
- `export function usePermitStats` ✓
- `export function usePermits` ✓
- `export type PermitStatus` ✓
- `export interface PermitStats` ✓

Build check: TypeScript compilation `✓ Compiled successfully` — build fails only at database page data collection (DATABASE_URL missing at build time — pre-existing constraint, not caused by this plan).

Commits verified:
- d35143e: Task 1 (design system foundation)
- 56e15b9: Task 2 (dashboard and permit list pages)
