---
phase: build-the-full-permit2-permit-management
plan: 03
type: execute
wave: 3
depends_on: [1, 2]
files_modified:
  - permit2/app/layout.tsx
  - permit2/app/globals.css
  - permit2/app/providers.tsx
  - permit2/app/(protected)/layout.tsx
  - permit2/app/(protected)/dashboard/page.tsx
  - permit2/app/(protected)/permits/page.tsx
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
  - permit2/lib/hooks/use-permit-stats.ts
  - permit2/lib/hooks/use-permits.ts
  - permit2/lib/types/permit.ts
autonomous: true

features:
  implements: ["F7", "F1", "F3", "F4"]
  depends_on: ["F9", "F0", "F8"]
  enables: ["F2", "F5", "F6"]

must_haves:
  truths:
    - "Dashboard loads at /dashboard showing 5 stat cards with live counts from GET /api/permits/stats"
    - "Clicking a stat card navigates to /permits?status=STATUS (or /permits for Total)"
    - "Donut chart renders permit distribution with semantic colors and hover tooltips"
    - "Recent Activity feed shows 10 most-recent permits; each row links to /permits/:id"
    - "Permit list at /permits shows paginated, sortable table with StatusBadge on every row"
    - "Filter bar: search (300ms debounce), status pills, type dropdown, date pickers — all synced to URL query params"
    - "Active filter chips appear; 'Clear all filters' resets URL to /permits"
    - "Skeleton screens (not spinners) show on dashboard and permit list while data loads"
    - "StatusBadge is pill-shaped with semantic colors: amber/Pending, green/Approved, red/Rejected, gray/Revoked"
    - "NavBar is sticky, shows Permit2 logo, Dashboard + Permits nav links, logout button"
    - "Auth guard in (protected)/layout.tsx redirects unauthenticated users to /login"
    - "Inter font applied globally; indigo-600 brand primary; gray-50 page background"
  artifacts:
    - path: "permit2/components/shared/StatusBadge.tsx"
      provides: "Reusable pill badge with semantic status color"
      exports: ["StatusBadge"]
    - path: "permit2/components/layout/NavBar.tsx"
      provides: "Sticky top nav with logo, links, logout"
      exports: ["NavBar"]
    - path: "permit2/components/dashboard/StatCard.tsx"
      provides: "Clickable stat card with icon, count, label, color accent"
      exports: ["StatCard"]
    - path: "permit2/components/dashboard/StatusDonutChart.tsx"
      provides: "Recharts donut chart of permits by status"
      exports: ["StatusDonutChart"]
    - path: "permit2/components/dashboard/RecentActivityFeed.tsx"
      provides: "Feed of 10 recent permits with clickable rows"
      exports: ["RecentActivityFeed"]
    - path: "permit2/components/permits/PermitFilterBar.tsx"
      provides: "Search + status pills + type dropdown + date pickers, URL-synced"
      exports: ["PermitFilterBar"]
    - path: "permit2/components/permits/PermitTable.tsx"
      provides: "Sortable, paginated permit table with PermitRow"
      exports: ["PermitTable"]
    - path: "permit2/lib/hooks/use-permit-stats.ts"
      provides: "TanStack Query hook for GET /api/permits/stats"
      exports: ["usePermitStats"]
    - path: "permit2/lib/hooks/use-permits.ts"
      provides: "TanStack Query hook for GET /api/permits with filter params"
      exports: ["usePermits"]
    - path: "permit2/app/(protected)/dashboard/page.tsx"
      provides: "Dashboard page — stats + chart + activity"
      exports: ["default"]
    - path: "permit2/app/(protected)/permits/page.tsx"
      provides: "Permit list page — filter bar + table + pagination"
      exports: ["default"]
  key_links:
    - from: "permit2/app/(protected)/dashboard/page.tsx"
      to: "permit2/lib/hooks/use-permit-stats.ts"
      via: "usePermitStats() hook consuming GET /api/permits/stats"
      pattern: "usePermitStats"
    - from: "permit2/app/(protected)/permits/page.tsx"
      to: "permit2/lib/hooks/use-permits.ts"
      via: "usePermits(params) hook consuming GET /api/permits"
      pattern: "usePermits"
    - from: "permit2/components/permits/PermitFilterBar.tsx"
      to: "permit2/app/(protected)/permits/page.tsx"
      via: "useSearchParams + router.push to sync filter state to URL"
      pattern: "useSearchParams|router\\.push"
    - from: "permit2/components/dashboard/StatCard.tsx"
      to: "permit2/app/(protected)/permits/page.tsx"
      via: "Link href /permits?status=X click navigation"
      pattern: "href.*permits.*status"

integration_contracts:
  requires:
    - from_plan: "02"
      artifact: "permit2/app/api/permits/stats/route.ts"
      exports: ["GET /api/permits/stats"]
      verify: "grep -n 'export async function GET' permit2/app/api/permits/stats/route.ts && echo CONTRACT_OK"
    - from_plan: "02"
      artifact: "permit2/app/api/permits/route.ts"
      exports: ["GET /api/permits", "POST /api/permits"]
      verify: "grep -n 'export async function GET' permit2/app/api/permits/route.ts && echo CONTRACT_OK"
    - from_plan: "02"
      artifact: "permit2/app/api/auth/me/route.ts"
      exports: ["GET /api/auth/me"]
      verify: "grep -n 'export async function GET' permit2/app/api/auth/me/route.ts && echo CONTRACT_OK"
    - from_plan: "02"
      artifact: "permit2/app/api/auth/logout/route.ts"
      exports: ["POST /api/auth/logout"]
      verify: "grep -n 'export async function POST' permit2/app/api/auth/logout/route.ts && echo CONTRACT_OK"
    - from_plan: "01"
      artifact: "permit2/prisma/schema.prisma"
      exports: ["PermitStatus", "PermitType"]
      verify: "grep -n 'enum PermitStatus' permit2/prisma/schema.prisma && echo CONTRACT_OK"
  provides:
    - artifact: "permit2/components/shared/StatusBadge.tsx"
      exports: ["StatusBadge"]
      shape: |
        export function StatusBadge({ status }: { status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED' }): JSX.Element
      verify: "grep -n 'export function StatusBadge' permit2/components/shared/StatusBadge.tsx && echo CONTRACT_OK"
    - artifact: "permit2/lib/types/permit.ts"
      exports: ["PermitSummary", "PermitStats", "PermitStatus", "PermitType"]
      shape: |
        export type PermitStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED'
        export type PermitType = 'WORK' | 'ACCESS' | 'ACTIVITY' | 'SAFETY' | 'OTHER'
        export interface PermitSummary { id, title, type, applicant_name, status, start_date, end_date, created_at, updated_at }
        export interface PermitStats { total, pending, approved, rejected, revoked }
      verify: "grep -n 'export type PermitStatus' permit2/lib/types/permit.ts && grep -n 'PermitStats' permit2/lib/types/permit.ts && echo CONTRACT_OK"
    - artifact: "permit2/lib/hooks/use-permit-stats.ts"
      exports: ["usePermitStats"]
      shape: "export function usePermitStats(): UseQueryResult<PermitStats>"
      verify: "grep -n 'export function usePermitStats' permit2/lib/hooks/use-permit-stats.ts && echo CONTRACT_OK"
    - artifact: "permit2/lib/hooks/use-permits.ts"
      exports: ["usePermits"]
      shape: "export function usePermits(params: PermitListParams): UseQueryResult<{ items: PermitSummary[]; meta: PaginationMeta }>"
      verify: "grep -n 'export function usePermits' permit2/lib/hooks/use-permits.ts && echo CONTRACT_OK"
    - artifact: "permit2/app/(protected)/dashboard/page.tsx"
      exports: ["default (Dashboard page)"]
      shape: "Route: /dashboard — renders StatsRow + StatusDonutChart + RecentActivityFeed"
      verify: "test -f permit2/app/\\(protected\\)/dashboard/page.tsx && echo CONTRACT_OK"
    - artifact: "permit2/app/(protected)/permits/page.tsx"
      exports: ["default (Permits list page)"]
      shape: "Route: /permits — renders PermitFilterBar + PermitTable + Pagination"
      verify: "test -f permit2/app/\\(protected\\)/permits/page.tsx && echo CONTRACT_OK"
---

<objective>
Build the Permit2 frontend: design system foundation, shared components, dashboard (F1), permit list with search/filter (F3, F4), and the complete component library (F7).

Purpose: Wave 3A delivers all UI screens that consume the Wave 2 API. The dashboard (F1) gives Marcus his daily at-a-glance permit health view; the permit list (F3) with filter bar (F4) enables rapid permit lookup; the design system (F7) ensures visual polish throughout.
Output: 20+ component/page files, 2 TanStack Query hooks, Inter font + indigo design tokens, fully navigable dashboard and permit list wired to the live API.
</objective>

<feature_dependencies>
Implements: F7: UI Design System & Visual Polish (Inter font, semantic colors, StatusBadge, skeletons, spacing system), F1: Manager Dashboard (stat cards, donut chart, recent activity feed), F3: Permit List / Table View (sortable paginated table, skeleton rows, quick-action links), F4: Search & Filter (debounced search, status pills, type dropdown, date range pickers, URL-synced filter state, active chips, clear-all)
Depends on: F9 (Prisma schema + seed — data exists in DB), F0 (auth API — /me + /logout for NavBar), F8 (permit API — /stats + /permits endpoints for hooks)
Enables: F2 (permit creation form — shares layout, StatusBadge, NavBar), F5 (permit detail page — shares layout, StatusBadge, Breadcrumb), F6 (lifecycle actions — shares layout, dialog pattern from NavBar)
</feature_dependencies>

<execution_context>
@/root/.local/share/pivota/opencode-xdg/opencode/pivota_spec-framework/workflows/execute-plan.md
</execution_context>

<context>
@permit2/package.json
@permit2/tsconfig.json
@permit2/next.config.ts
@permit2/app/layout.tsx
@permit2/app/globals.css
</context>

<tasks>

<task type="auto">
  <name>Task 1: Design system foundation — globals, providers, types, shared components, layout shell</name>
  <files>
    permit2/app/globals.css
    permit2/app/layout.tsx
    permit2/app/providers.tsx
    permit2/lib/types/permit.ts
    permit2/lib/hooks/use-permit-stats.ts
    permit2/lib/hooks/use-permits.ts
    permit2/components/shared/StatusBadge.tsx
    permit2/components/shared/SkeletonCard.tsx
    permit2/components/shared/SkeletonTable.tsx
    permit2/components/shared/EmptyState.tsx
    permit2/components/shared/ErrorState.tsx
    permit2/components/shared/Pagination.tsx
    permit2/components/layout/NavBar.tsx
    permit2/components/layout/Breadcrumb.tsx
    permit2/app/(protected)/layout.tsx
  </files>
  <action>
Work inside `permit2/` (the Next.js 16 app root). Create the design system foundation, shared components, data hooks, and protected route layout.

**Step 0 — Install required packages**

shadcn/ui is not yet initialized. Install core utilities:
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2
npm install class-variance-authority tailwind-merge sonner
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-separator
```

**Step 1 — Update `app/globals.css`**

Replace the existing globals.css entirely with the Permit2 design system:

```css
@import "tailwindcss";

/* ─── Design Tokens ──────────────────────────────────────────── */
:root {
  --background: #F9FAFB;     /* gray-50 */
  --foreground: #111827;     /* gray-900 */
  --surface: #FFFFFF;
  --border: #E5E7EB;         /* gray-200 */
  --text-secondary: #6B7280; /* gray-500 */

  /* Brand */
  --brand: #4F46E5;          /* indigo-600 */
  --brand-hover: #4338CA;    /* indigo-700 */

  /* Status */
  --status-pending-bg: #FEF3C7;    /* amber-100 */
  --status-pending-text: #D97706;  /* amber-600 */
  --status-approved-bg: #D1FAE5;   /* emerald-100 */
  --status-approved-text: #059669; /* emerald-600 */
  --status-rejected-bg: #FEE2E2;   /* red-100 */
  --status-rejected-text: #DC2626; /* red-600 */
  --status-revoked-bg: #F3F4F6;    /* gray-100 */
  --status-revoked-text: #6B7280;  /* gray-500 */

  /* Card */
  --card-radius: 12px;
  --card-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05);
}

/* ─── Base ────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }

html { height: 100%; }

body {
  min-height: 100%;
  background-color: var(--background);
  color: var(--foreground);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* ─── Shimmer skeleton animation ─────────────────────────────── */
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skeleton {
  background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
  background-size: 800px 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 6px;
}
```

**Step 2 — Update `app/layout.tsx`**

Replace with Inter font + QueryClientProvider wrapper (IMPORTANT: do NOT add X-Frame-Options DENY header):

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Permit2 — Permit Management',
  description: 'Manage permits end-to-end with Permit2',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Step 3 — Create `app/providers.tsx`** (TanStack Query client provider)

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,       // 30 seconds
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          duration: 5000,
          classNames: {
            error: 'bg-white border-red-200',
            success: 'bg-white border-green-200',
          },
        }}
      />
    </QueryClientProvider>
  );
}
```

**Step 4 — Create `lib/types/permit.ts`** (shared TypeScript types for Wave 3+4)

```typescript
export type PermitStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';
export type PermitType   = 'WORK' | 'ACCESS' | 'ACTIVITY' | 'SAFETY' | 'OTHER';

export const PERMIT_TYPE_LABELS: Record<PermitType, string> = {
  WORK:     'Work Permit',
  ACCESS:   'Access Permit',
  ACTIVITY: 'Activity Authorization',
  SAFETY:   'Safety Permit',
  OTHER:    'Other',
};

export const PERMIT_STATUS_LABELS: Record<PermitStatus, string> = {
  PENDING:  'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REVOKED:  'Revoked',
};

export interface PermitSummary {
  id: string;
  title: string;
  type: PermitType;
  applicant_name: string;
  status: PermitStatus;
  start_date: string;   // YYYY-MM-DD
  end_date: string;     // YYYY-MM-DD
  created_at: string;   // ISO
  updated_at: string;   // ISO
}

export interface StatusHistoryEntry {
  id: string;
  status: PermitStatus;
  event: string;
  actor_name: string;
  notes: string | null;
  created_at: string;
}

export interface PermitDetail extends PermitSummary {
  description: string;
  notes: string | null;
  rejection_reason: string | null;
  revocation_reason: string | null;
  created_by: string;
  status_history: StatusHistoryEntry[];
}

export interface PermitStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  revoked: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PermitListResponse {
  items: PermitSummary[];
  meta: PaginationMeta;
}

export interface PermitListParams {
  search?: string;
  status?: PermitStatus | '';
  type?: PermitType | '';
  start_date_from?: string;
  start_date_to?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
```

**Step 5 — Create `lib/hooks/use-permit-stats.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import type { PermitStats } from '@/lib/types/permit';

async function fetchPermitStats(): Promise<PermitStats> {
  const res = await fetch('/api/permits/stats', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch permit stats');
  const json = await res.json();
  return json.data as PermitStats;
}

export function usePermitStats() {
  return useQuery<PermitStats, Error>({
    queryKey: ['permit-stats'],
    queryFn: fetchPermitStats,
    refetchOnWindowFocus: true,
  });
}
```

**Step 6 — Create `lib/hooks/use-permits.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import type { PermitListParams, PermitSummary, PaginationMeta } from '@/lib/types/permit';

interface PermitListResult {
  items: PermitSummary[];
  meta: PaginationMeta;
}

async function fetchPermits(params: PermitListParams): Promise<PermitListResult> {
  const searchParams = new URLSearchParams();
  if (params.search)          searchParams.set('search', params.search);
  if (params.status)          searchParams.set('status', params.status);
  if (params.type)            searchParams.set('type', params.type);
  if (params.start_date_from) searchParams.set('start_date_from', params.start_date_from);
  if (params.start_date_to)   searchParams.set('start_date_to', params.start_date_to);
  if (params.sort)            searchParams.set('sort', params.sort);
  if (params.order)           searchParams.set('order', params.order);
  if (params.page)            searchParams.set('page', String(params.page));
  if (params.limit)           searchParams.set('limit', String(params.limit));

  const res = await fetch(`/api/permits?${searchParams.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch permits');
  const json = await res.json();
  return { items: json.data.items as PermitSummary[], meta: json.meta as PaginationMeta };
}

export function usePermits(params: PermitListParams = {}) {
  return useQuery<PermitListResult, Error>({
    queryKey: ['permits', params],
    queryFn: () => fetchPermits(params),
    placeholderData: (prev) => prev,  // keepPreviousData behavior in v5
  });
}
```

**Step 7 — Create `components/shared/StatusBadge.tsx`**

Per UX-Mockup: pill-shaped (border-radius: 9999px), horizontal padding 12px, vertical padding 4px, 14px weight-500, text-only. Matches semantic colors from design system.

```tsx
import type { PermitStatus } from '@/lib/types/permit';
import { PERMIT_STATUS_LABELS } from '@/lib/types/permit';

const STATUS_STYLES: Record<PermitStatus, string> = {
  PENDING:  'bg-amber-100 text-amber-700 border border-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  REJECTED: 'bg-red-100 text-red-700 border border-red-200',
  REVOKED:  'bg-gray-100 text-gray-500 border border-gray-200',
};

interface StatusBadgeProps {
  status: PermitStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium leading-none ${STATUS_STYLES[status]} ${className}`}
    >
      {PERMIT_STATUS_LABELS[status]}
    </span>
  );
}
```

**Step 8 — Create `components/shared/SkeletonCard.tsx`**

```tsx
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="skeleton h-8 w-8 rounded-lg" />
        <div className="skeleton h-3 w-3 rounded-full" />
      </div>
      <div className="skeleton h-9 w-16 rounded mb-2" />
      <div className="skeleton h-4 w-24 rounded" />
    </div>
  );
}
```

**Step 9 — Create `components/shared/SkeletonTable.tsx`**

```tsx
interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

export function SkeletonTable({ rows = 5, cols = 8 }: SkeletonTableProps) {
  return (
    <div className="w-full">
      {/* Header row */}
      <div className="flex gap-4 px-4 py-3 border-b border-gray-200 bg-gray-50">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton h-4 flex-1 rounded" />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 px-4 py-4 border-b border-gray-100">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div key={colIdx} className="skeleton h-4 flex-1 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}
```

**Step 10 — Create `components/shared/EmptyState.tsx`**

```tsx
import { FileX, SearchX } from 'lucide-react';

interface EmptyStateProps {
  type?: 'no-permits' | 'no-results';
  onClearFilters?: () => void;
  onCreatePermit?: () => void;
}

export function EmptyState({ type = 'no-results', onClearFilters, onCreatePermit }: EmptyStateProps) {
  const isNoPermits = type === 'no-permits';
  const Icon = isNoPermits ? FileX : SearchX;
  const title = isNoPermits ? 'No permits yet' : 'No permits match your filters';
  const description = isNoPermits
    ? 'Get started by creating your first permit request.'
    : 'Try adjusting your search or filters to find what you\'re looking for.';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>
      <div className="flex gap-3">
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Clear Filters
          </button>
        )}
        {onCreatePermit && (
          <a
            href="/permits/new"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create New Permit
          </a>
        )}
      </div>
    </div>
  );
}
```

**Step 11 — Create `components/shared/ErrorState.tsx`**

```tsx
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Could not load data. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Something went wrong</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
}
```

**Step 12 — Create `components/shared/Pagination.tsx`**

Per UX-Mockup: "Showing X–Y of Z permits", Previous/Next buttons, disabled on first/last page, Gray-200 border buttons, 36px height, 12px radius.

```tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-900">{start}–{end}</span> of{' '}
        <span className="font-medium text-gray-900">{total}</span> permits
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1.5 px-3 h-9 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="text-sm text-gray-500 px-2">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1.5 px-3 h-9 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

**Step 13 — Create `components/layout/NavBar.tsx`**

Per UX-Mockup: sticky 64px nav, Permit2 logo (indigo-600, bold, shield icon), Dashboard + Permits nav links with active underline, user name + Logout button. Calls POST /api/auth/logout on click then redirects to /login.

```tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useState } from 'react';

interface NavBarProps {
  userName?: string;
}

export function NavBar({ userName = 'Manager' }: NavBarProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/permits',   label: 'Permits'   },
  ];

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      router.push('/login');
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 h-16">
      <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-between h-full">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
          <Shield className="w-5 h-5" />
          Permit2
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">{userName}</span>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {loggingOut ? 'Logging out…' : 'Logout'}
          </button>
        </div>
      </div>
    </nav>
  );
}
```

**Step 14 — Create `components/layout/Breadcrumb.tsx`**

Per UX-Mockup Screen 03: breadcrumb trail "Dashboard / Permits / [Title]", each segment a clickable link.

```tsx
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-gray-900 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-gray-900 font-medium' : ''}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
```

**Step 15 — Create `app/(protected)/layout.tsx`** (auth guard + NavBar)

Auth guard: fetches /api/auth/me on server side. If 401, redirects to /login. Renders NavBar with user name.

```tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { NavBar } from '@/components/layout/NavBar';

async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/auth/me`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as { id: string; email: string; name: string } | null;
  } catch {
    return null;
  }
}

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar userName={user.name} />
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}
```
  </action>
  <verify>
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2

# Packages installed
node -e "require('sonner'); console.log('SONNER_OK')" 2>/dev/null || echo "sonner missing"
node -e "require('class-variance-authority'); console.log('CVA_OK')" 2>/dev/null || echo "cva missing"
node -e "require('tailwind-merge'); console.log('TW_MERGE_OK')" 2>/dev/null || echo "tw-merge missing"

# Key files exist
test -f app/providers.tsx && echo "PROVIDERS_OK"
test -f lib/types/permit.ts && echo "TYPES_OK"
test -f lib/hooks/use-permit-stats.ts && echo "STATS_HOOK_OK"
test -f lib/hooks/use-permits.ts && echo "PERMITS_HOOK_OK"
test -f components/shared/StatusBadge.tsx && echo "STATUS_BADGE_OK"
test -f components/shared/SkeletonCard.tsx && echo "SKELETON_CARD_OK"
test -f components/shared/SkeletonTable.tsx && echo "SKELETON_TABLE_OK"
test -f components/shared/EmptyState.tsx && echo "EMPTY_STATE_OK"
test -f components/shared/ErrorState.tsx && echo "ERROR_STATE_OK"
test -f components/shared/Pagination.tsx && echo "PAGINATION_OK"
test -f components/layout/NavBar.tsx && echo "NAVBAR_OK"
test -f components/layout/Breadcrumb.tsx && echo "BREADCRUMB_OK"
test -f app/\(protected\)/layout.tsx && echo "PROTECTED_LAYOUT_OK"

# Key exports
grep -n 'export function StatusBadge' components/shared/StatusBadge.tsx && echo "BADGE_EXPORT_OK"
grep -n 'export function usePermitStats' lib/hooks/use-permit-stats.ts && echo "STATS_HOOK_EXPORT_OK"
grep -n 'export function usePermits' lib/hooks/use-permits.ts && echo "PERMITS_HOOK_EXPORT_OK"
grep -n 'export type PermitStatus' lib/types/permit.ts && echo "TYPE_EXPORT_OK"

# Design tokens in globals.css
grep -n 'shimmer' app/globals.css && echo "SKELETON_ANIM_OK"
grep -n 'inter' app/layout.tsx && echo "INTER_FONT_OK"
grep -n 'Inter' app/layout.tsx && echo "INTER_IMPORT_OK"
```
  </verify>
  <done>
- `app/globals.css` defines shimmer animation, CSS custom properties for brand/status/surface tokens, Inter font stack
- `app/layout.tsx` imports Inter from next/font/google and wraps with Providers
- `app/providers.tsx` renders QueryClientProvider + Sonner Toaster (richColors, bottom-right, 5s dismiss)
- `lib/types/permit.ts` exports PermitStatus, PermitType, PERMIT_TYPE_LABELS, PERMIT_STATUS_LABELS, PermitSummary, PermitDetail, PermitStats, PaginationMeta, PermitListParams
- `lib/hooks/use-permit-stats.ts` exports usePermitStats() using useQuery against GET /api/permits/stats
- `lib/hooks/use-permits.ts` exports usePermits(params) using useQuery against GET /api/permits with URL-encoded params
- `components/shared/StatusBadge.tsx` exports StatusBadge — pill-shaped (rounded-full), semantic colors per status
- `components/shared/SkeletonCard.tsx` exports SkeletonCard — shimmer placeholder matching stat card dimensions
- `components/shared/SkeletonTable.tsx` exports SkeletonTable — configurable rows/cols with shimmer rows
- `components/shared/EmptyState.tsx` exports EmptyState — two types (no-permits, no-results) with optional CTA buttons
- `components/shared/ErrorState.tsx` exports ErrorState — centered error with optional retry button
- `components/shared/Pagination.tsx` exports Pagination — "Showing X–Y of Z permits" + Previous/Next with disable states
- `components/layout/NavBar.tsx` exports NavBar — sticky, logo + nav links with active state, logout button
- `components/layout/Breadcrumb.tsx` exports Breadcrumb — chevron-separated clickable segments
- `app/(protected)/layout.tsx` fetches /api/auth/me server-side, redirects to /login if unauthenticated, renders NavBar with user name
  </done>
</task>

<task type="auto">
  <name>Task 2: Dashboard page (F1) + Permit list page with filter bar and table (F3, F4)</name>
  <files>
    permit2/components/dashboard/StatCard.tsx
    permit2/components/dashboard/StatsRow.tsx
    permit2/components/dashboard/StatusDonutChart.tsx
    permit2/components/dashboard/RecentActivityFeed.tsx
    permit2/app/(protected)/dashboard/page.tsx
    permit2/components/permits/PermitFilterBar.tsx
    permit2/components/permits/PermitTable.tsx
    permit2/components/permits/PermitRow.tsx
    permit2/app/(protected)/permits/page.tsx
  </files>
  <action>
Build the dashboard components, permit table components, and both page routes. All data fetching via TanStack Query hooks from Task 1.

---

**[A] Dashboard Components**

**Create `components/dashboard/StatCard.tsx`**

Per UX-Mockup Screen 01: clickable elevated card, icon left + status dot right, large count (36px bold), label (14px medium gray-500), 4px thick left border accent in semantic color. Hover: scale(1.02) + shadow increase.

```tsx
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  count: number | undefined;
  icon: LucideIcon;
  href: string;
  accentColor: string;   // Tailwind border-left color class
  bgColor: string;       // Tailwind icon bg color class
  textColor: string;     // Tailwind icon text color class
  isLoading?: boolean;
  isError?: boolean;
}

export function StatCard({
  label, count, icon: Icon, href, accentColor, bgColor, textColor, isLoading, isError,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex-1">
        <div className="skeleton h-8 w-8 rounded-lg mb-4" />
        <div className="skeleton h-9 w-16 rounded mb-2" />
        <div className="skeleton h-4 w-24 rounded" />
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`group bg-white rounded-xl border border-gray-200 p-5 flex-1 flex flex-col gap-3 border-l-4 ${accentColor} hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
        <div className={`w-2.5 h-2.5 rounded-full mt-1 ${textColor.replace('text-', 'bg-')}`} />
      </div>
      <div>
        <p className="text-4xl font-bold text-gray-900 leading-none">
          {isError ? '–' : (count ?? '–')}
        </p>
        <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
      </div>
    </Link>
  );
}
```

**Create `components/dashboard/StatsRow.tsx`**

```tsx
'use client';

import { FileText, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';
import { StatCard } from './StatCard';
import type { PermitStats } from '@/lib/types/permit';

interface StatsRowProps {
  stats?: PermitStats;
  isLoading?: boolean;
  isError?: boolean;
}

export function StatsRow({ stats, isLoading, isError }: StatsRowProps) {
  const cards = [
    {
      label:       'Total Permits',
      count:       stats?.total,
      icon:        FileText,
      href:        '/permits',
      accentColor: 'border-l-indigo-500',
      bgColor:     'bg-indigo-50',
      textColor:   'text-indigo-600',
    },
    {
      label:       'Pending',
      count:       stats?.pending,
      icon:        Clock,
      href:        '/permits?status=PENDING',
      accentColor: 'border-l-amber-500',
      bgColor:     'bg-amber-50',
      textColor:   'text-amber-600',
    },
    {
      label:       'Approved',
      count:       stats?.approved,
      icon:        CheckCircle,
      href:        '/permits?status=APPROVED',
      accentColor: 'border-l-emerald-500',
      bgColor:     'bg-emerald-50',
      textColor:   'text-emerald-600',
    },
    {
      label:       'Rejected',
      count:       stats?.rejected,
      icon:        XCircle,
      href:        '/permits?status=REJECTED',
      accentColor: 'border-l-red-500',
      bgColor:     'bg-red-50',
      textColor:   'text-red-600',
    },
    {
      label:       'Revoked',
      count:       stats?.revoked,
      icon:        Ban,
      href:        '/permits?status=REVOKED',
      accentColor: 'border-l-gray-400',
      bgColor:     'bg-gray-50',
      textColor:   'text-gray-500',
    },
  ];

  return (
    <div className="flex gap-4 flex-wrap lg:flex-nowrap">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} isLoading={isLoading} isError={isError} />
      ))}
    </div>
  );
}
```

**Create `components/dashboard/StatusDonutChart.tsx`**

Per UX-Mockup Screen 01: Recharts donut chart ~240px diameter, semantic status colors, center label (total count 24px bold + "Permits" 12px gray), legend with colored dot + name + count + percentage, hover tooltips showing "Approved: 25 permits (59%)", segment click → /permits?status=X.

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { PermitStats } from '@/lib/types/permit';

const STATUS_CONFIG = [
  { key: 'approved', label: 'Approved', color: '#059669', status: 'APPROVED' },
  { key: 'pending',  label: 'Pending',  color: '#D97706', status: 'PENDING'  },
  { key: 'rejected', label: 'Rejected', color: '#DC2626', status: 'REJECTED' },
  { key: 'revoked',  label: 'Revoked',  color: '#6B7280', status: 'REVOKED'  },
] as const;

interface StatusDonutChartProps {
  stats?: PermitStats;
}

interface TooltipPayload {
  name: string;
  value: number;
  payload: { total: number };
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const pct = item.payload.total > 0 ? Math.round((item.value / item.payload.total) * 100) : 0;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-gray-900">{item.name}</p>
      <p className="text-gray-500">{item.value} permits ({pct}%)</p>
    </div>
  );
};

export function StatusDonutChart({ stats }: StatusDonutChartProps) {
  const router = useRouter();
  const total  = stats?.total ?? 0;

  const data = STATUS_CONFIG.map((cfg) => ({
    name:   cfg.label,
    value:  stats?.[cfg.key] ?? 0,
    color:  cfg.color,
    status: cfg.status,
    total,
  })).filter((d) => d.value > 0);

  if (!stats || total === 0) {
    return (
      <div className="flex items-center justify-center h-60 text-sm text-gray-400">
        No permit data available
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-60 h-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              dataKey="value"
              onClick={(entry) => router.push(`/permits?status=${entry.status}`)}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-gray-900">{total}</span>
          <span className="text-xs text-gray-500 mt-0.5">Permits</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full">
        {STATUS_CONFIG.map((cfg) => {
          const count = stats?.[cfg.key] ?? 0;
          const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <button
              key={cfg.key}
              onClick={() => router.push(`/permits?status=${cfg.status}`)}
              className="flex items-center gap-2 text-left hover:bg-gray-50 rounded px-1 py-0.5 transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
              <span className="text-sm text-gray-700 flex-1">{cfg.label}</span>
              <span className="text-sm font-medium text-gray-900">{count}</span>
              <span className="text-xs text-gray-400 w-9 text-right">{pct}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

**Create `components/dashboard/RecentActivityFeed.tsx`**

Per UX-Mockup Screen 01: each row = StatusBadge + title (truncated 40 chars) + applicant + relative time. Full row clickable → /permits/:id. "View all permits →" link at bottom.

```tsx
'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { PermitSummary } from '@/lib/types/permit';

interface RecentActivityFeedProps {
  permits?: PermitSummary[];
  isLoading?: boolean;
  isError?: boolean;
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50">
      <div className="skeleton h-6 w-20 rounded-full flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="skeleton h-4 w-48 rounded mb-1.5" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>
    </div>
  );
}

export function RecentActivityFeed({ permits, isLoading, isError }: RecentActivityFeedProps) {
  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-gray-500 py-4">Could not load recent activity.</p>
    );
  }

  if (!permits?.length) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">No permits yet.</p>
    );
  }

  return (
    <div>
      <div className="divide-y divide-gray-50">
        {permits.map((permit) => (
          <Link
            key={permit.id}
            href={`/permits/${permit.id}`}
            className="flex items-start gap-3 py-3 hover:bg-gray-50 -mx-1 px-1 rounded-lg transition-colors group"
          >
            <StatusBadge status={permit.status} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                {permit.title.length > 40 ? `${permit.title.slice(0, 40)}…` : permit.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {permit.applicant_name} · {formatDistanceToNow(new Date(permit.updated_at), { addSuffix: true })}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="pt-3 mt-1 border-t border-gray-100">
        <Link
          href="/permits"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View all permits
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
```

**Create `app/(protected)/dashboard/page.tsx`**

Per UX-Mockup Screen 01: page header (title + welcome + "Create New Permit" CTA), StatsRow, then 60/40 grid (donut chart left, recent activity right).

```tsx
'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { StatusDonutChart } from '@/components/dashboard/StatusDonutChart';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { usePermitStats } from '@/lib/hooks/use-permit-stats';
import { usePermits } from '@/lib/hooks/use-permits';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = usePermitStats();
  const { data: recentData, isLoading: recentLoading, isError: recentError } = usePermits({
    sort: 'created_at',
    order: 'desc',
    limit: 10,
    page: 1,
  });

  useEffect(() => {
    if (statsError) toast.error('Could not load dashboard stats.');
  }, [statsError]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back. Here&apos;s your permit overview.</p>
        </div>
        <Link
          href="/permits/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Permit
        </Link>
      </div>

      {/* Stat Cards Row */}
      <StatsRow stats={stats} isLoading={statsLoading} isError={statsError} />

      {/* Middle Section: Chart (60%) + Activity (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Status Breakdown Chart */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Permits by Status</h2>
          {statsLoading ? (
            <div className="flex items-center justify-center h-60">
              <div className="skeleton w-48 h-48 rounded-full" />
            </div>
          ) : (
            <StatusDonutChart stats={stats} />
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <RecentActivityFeed
            permits={recentData?.items}
            isLoading={recentLoading}
            isError={recentError}
          />
        </div>
      </div>
    </div>
  );
}
```

---

**[B] Permit List Components**

**Create `components/permits/PermitFilterBar.tsx`**

Per UX-Mockup Screen 02: search input (300ms debounce, ×  clear button inside), status pill group (All/Pending/Approved/Rejected/Revoked; active pill = status bg color), Type dropdown (All Types + 5 types), date From/To pickers. Active filter chips row (only when ≥1 active filter). All state synced to URL query params via useSearchParams + router.push.

```tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, X, ChevronDown, Calendar } from 'lucide-react';
import type { PermitStatus, PermitType } from '@/lib/types/permit';
import { PERMIT_STATUS_LABELS, PERMIT_TYPE_LABELS } from '@/lib/types/permit';

const STATUS_PILL_STYLES: Record<PermitStatus, string> = {
  PENDING:  'bg-amber-100 text-amber-700 border-amber-300',
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  REJECTED: 'bg-red-100 text-red-700 border-red-300',
  REVOKED:  'bg-gray-100 text-gray-600 border-gray-300',
};

export function PermitFilterBar() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const debounceRef  = useRef<ReturnType<typeof setTimeout>>(null);

  const currentSearch = searchParams.get('search') ?? '';
  const currentStatus = (searchParams.get('status') ?? '') as PermitStatus | '';
  const currentType   = (searchParams.get('type')   ?? '') as PermitType   | '';
  const currentFrom   = searchParams.get('start_date_from') ?? '';
  const currentTo     = searchParams.get('start_date_to')   ?? '';

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Sync input if URL changes externally
  useEffect(() => { setSearchInput(currentSearch); }, [currentSearch]);

  const updateURL = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    // Reset to page 1 on any filter change
    params.delete('page');
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    const qs = params.toString();
    router.push(qs ? `/permits?${qs}` : '/permits', { scroll: false });
  }, [searchParams, router]);

  // Debounced search
  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateURL({ search: value || undefined });
    }, 300);
  }

  function clearSearch() {
    setSearchInput('');
    updateURL({ search: undefined });
  }

  function handleStatusClick(status: PermitStatus | '') {
    updateURL({ status: status === currentStatus ? undefined : (status || undefined) });
  }

  function handleTypeChange(type: PermitType | '') {
    updateURL({ type: type || undefined });
  }

  function handleDateChange(field: 'start_date_from' | 'start_date_to', value: string) {
    updateURL({ [field]: value || undefined });
  }

  const dateRangeInvalid = currentFrom && currentTo && currentFrom > currentTo;

  const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
  if (currentStatus) activeFilters.push({ label: `Status: ${PERMIT_STATUS_LABELS[currentStatus]}`, onRemove: () => updateURL({ status: undefined }) });
  if (currentType)   activeFilters.push({ label: `Type: ${PERMIT_TYPE_LABELS[currentType]}`,       onRemove: () => updateURL({ type: undefined }) });
  if (currentFrom)   activeFilters.push({ label: `From: ${currentFrom}`,                           onRemove: () => updateURL({ start_date_from: undefined }) });
  if (currentTo)     activeFilters.push({ label: `To: ${currentTo}`,                               onRemove: () => updateURL({ start_date_to: undefined }) });

  const hasFilters = activeFilters.length > 0 || !!searchInput;

  const statuses: Array<{ value: PermitStatus | ''; label: string }> = [
    { value: '',          label: 'All'      },
    { value: 'PENDING',   label: 'Pending'  },
    { value: 'APPROVED',  label: 'Approved' },
    { value: 'REJECTED',  label: 'Rejected' },
    { value: 'REVOKED',   label: 'Revoked'  },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      {/* Row 1: Search + Status pills + Type + Dates */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search permits by title, applicant, or description…"
            maxLength={100}
            className="w-full pl-9 pr-8 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1">
          {statuses.map(({ value, label }) => {
            const isActive = value === currentStatus;
            const pillStyle = value && isActive ? STATUS_PILL_STYLES[value as PermitStatus] : '';
            return (
              <button
                key={value}
                onClick={() => handleStatusClick(value as PermitStatus | '')}
                className={`px-3 h-9 text-sm font-medium rounded-lg border transition-colors ${
                  isActive && value
                    ? `${pillStyle} border`
                    : isActive && !value
                    ? 'bg-gray-100 text-gray-900 border-gray-300'
                    : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Type Dropdown */}
        <div className="relative">
          <select
            value={currentType}
            onChange={(e) => handleTypeChange(e.target.value as PermitType | '')}
            className="appearance-none pl-3 pr-7 h-9 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Types</option>
            {(Object.entries(PERMIT_TYPE_LABELS) as [PermitType, string][]).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="date"
              value={currentFrom}
              onChange={(e) => handleDateChange('start_date_from', e.target.value)}
              className="pl-8 pr-2 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-gray-400">to</span>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="date"
              value={currentTo}
              onChange={(e) => handleDateChange('start_date_to', e.target.value)}
              className={`pl-8 pr-2 h-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${dateRangeInvalid ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
          </div>
        </div>
      </div>

      {/* Date range warning */}
      {dateRangeInvalid && (
        <p className="text-xs text-red-600">End date must be on or after the start date. Date filters not applied.</p>
      )}

      {/* Row 2: Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex items-center flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter.label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full"
            >
              {filter.label}
              <button
                onClick={filter.onRemove}
                className="text-indigo-400 hover:text-indigo-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {hasFilters && (
            <button
              onClick={() => router.push('/permits', { scroll: false })}
              className="text-xs font-medium text-gray-500 hover:text-gray-900 underline transition-colors ml-auto"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

**Create `components/permits/PermitRow.tsx`**

Per UX-Mockup Screen 02 column definition: Reference (8 chars UUID, monospace, gray-400), Title (link, truncated 50 chars), Type (display label), Applicant, Status (StatusBadge), Start/End/Created dates (DD MMM YYYY), Actions (status-conditional links).

```tsx
import Link from 'next/link';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { PermitSummary } from '@/lib/types/permit';
import { PERMIT_TYPE_LABELS } from '@/lib/types/permit';

interface PermitRowProps {
  permit: PermitSummary;
}

function ActionLinks({ permit }: { permit: PermitSummary }) {
  return (
    <div className="flex items-center gap-2 text-sm border-l border-gray-100 pl-2">
      <Link href={`/permits/${permit.id}`} className="text-gray-500 hover:text-gray-900 font-medium transition-colors">
        View
      </Link>
      {permit.status === 'PENDING' && (
        <>
          <span className="text-gray-200">·</span>
          <Link href={`/permits/${permit.id}?action=approve`} className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
            Approve
          </Link>
          <span className="text-gray-200">·</span>
          <Link href={`/permits/${permit.id}?action=reject`} className="text-red-600 hover:text-red-700 font-medium transition-colors">
            Reject
          </Link>
        </>
      )}
      {permit.status === 'APPROVED' && (
        <>
          <span className="text-gray-200">·</span>
          <Link href={`/permits/${permit.id}?action=revoke`} className="text-amber-600 hover:text-amber-700 font-medium transition-colors">
            Revoke
          </Link>
        </>
      )}
    </div>
  );
}

export function PermitRow({ permit }: PermitRowProps) {
  const formatDate = (dateStr: string) => {
    try { return format(new Date(dateStr), 'dd MMM yyyy'); }
    catch { return '—'; }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer group">
      {/* Reference */}
      <td className="px-4 py-3 w-20">
        <span className="text-xs font-mono text-gray-400">{permit.id.slice(0, 8)}</span>
      </td>

      {/* Title */}
      <td className="px-4 py-3">
        <Link
          href={`/permits/${permit.id}`}
          className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors truncate block max-w-xs"
          title={permit.title}
          onClick={(e) => e.stopPropagation()}
        >
          {permit.title.length > 50 ? `${permit.title.slice(0, 50)}…` : permit.title}
        </Link>
      </td>

      {/* Type */}
      <td className="px-4 py-3 w-36">
        <span className="text-sm text-gray-600">{PERMIT_TYPE_LABELS[permit.type]}</span>
      </td>

      {/* Applicant */}
      <td className="px-4 py-3 w-36">
        <span className="text-sm text-gray-700">{permit.applicant_name}</span>
      </td>

      {/* Status */}
      <td className="px-4 py-3 w-32">
        <StatusBadge status={permit.status} />
      </td>

      {/* Start Date */}
      <td className="px-4 py-3 w-28">
        <span className="text-sm text-gray-500">{formatDate(permit.start_date)}</span>
      </td>

      {/* End Date */}
      <td className="px-4 py-3 w-28">
        <span className="text-sm text-gray-500">{formatDate(permit.end_date)}</span>
      </td>

      {/* Created */}
      <td className="px-4 py-3 w-28">
        <span className="text-sm text-gray-500">{formatDate(permit.created_at)}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 w-44" onClick={(e) => e.stopPropagation()}>
        <ActionLinks permit={permit} />
      </td>
    </tr>
  );
}
```

**Create `components/permits/PermitTable.tsx`**

Per UX-Mockup Screen 02: sortable column headers with arrow icons (↑ / ↓ / ⇕), Gray-50 header background, skeleton rows while loading. Sort synced to URL (?sort=X&order=Y).

```tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { PermitRow } from './PermitRow';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Pagination } from '@/components/shared/Pagination';
import type { PermitSummary, PaginationMeta } from '@/lib/types/permit';

interface PermitTableProps {
  permits?: PermitSummary[];
  meta?: PaginationMeta;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

type SortColumn = 'title' | 'type' | 'applicant_name' | 'status' | 'start_date' | 'end_date' | 'created_at';

const COLUMNS: Array<{ key: SortColumn | null; label: string; width?: string }> = [
  { key: null,            label: '#',        width: 'w-20'  },
  { key: 'title',         label: 'Title'                     },
  { key: 'type',          label: 'Type',     width: 'w-36'  },
  { key: 'applicant_name',label: 'Applicant',width: 'w-36'  },
  { key: 'status',        label: 'Status',   width: 'w-32'  },
  { key: 'start_date',    label: 'Start',    width: 'w-28'  },
  { key: 'end_date',      label: 'End',      width: 'w-28'  },
  { key: 'created_at',    label: 'Created',  width: 'w-28'  },
  { key: null,            label: 'Actions',  width: 'w-44'  },
];

export function PermitTable({ permits, meta, isLoading, isError, onRetry }: PermitTableProps) {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const currentSort  = searchParams.get('sort')  ?? 'created_at';
  const currentOrder = (searchParams.get('order') ?? 'desc') as 'asc' | 'desc';
  const currentPage  = Number(searchParams.get('page') ?? 1);

  const updateURL = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    router.push(`/permits?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  function handleSort(col: SortColumn) {
    if (col === currentSort) {
      updateURL({ sort: col, order: currentOrder === 'asc' ? 'desc' : 'asc', page: undefined });
    } else {
      updateURL({ sort: col, order: 'asc', page: undefined });
    }
  }

  function handlePageChange(page: number) {
    updateURL({ page: String(page) });
  }

  function hasActiveFilters() {
    return ['search','status','type','start_date_from','start_date_to'].some(k => searchParams.has(k));
  }

  function clearFilters() {
    router.push('/permits', { scroll: false });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {COLUMNS.map((col, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide ${col.width ?? ''} ${col.key ? 'cursor-pointer hover:bg-gray-100 select-none transition-colors' : ''}`}
                  onClick={() => col.key && handleSort(col.key)}
                >
                  {col.key ? (
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.key === currentSort ? (
                        currentOrder === 'asc'
                          ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                          : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />
                      )}
                    </div>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={COLUMNS.length} className="p-0">
                  <SkeletonTable rows={5} cols={COLUMNS.length} />
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={COLUMNS.length}>
                  <ErrorState message="Could not load permits." onRetry={onRetry} />
                </td>
              </tr>
            ) : !permits?.length ? (
              <tr>
                <td colSpan={COLUMNS.length}>
                  <EmptyState
                    type={hasActiveFilters() ? 'no-results' : 'no-permits'}
                    onClearFilters={hasActiveFilters() ? clearFilters : undefined}
                    onCreatePermit={hasActiveFilters() ? undefined : () => router.push('/permits/new')}
                  />
                </td>
              </tr>
            ) : (
              permits.map((permit) => <PermitRow key={permit.id} permit={permit} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination
          page={currentPage}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
```

**Create `app/(protected)/permits/page.tsx`**

Per Navigation Map: reached from Dashboard / NavBar. Page header with "Permits" title + "Create New Permit" CTA. PermitFilterBar above table. URL-driven filter state.

```tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PermitFilterBar } from '@/components/permits/PermitFilterBar';
import { PermitTable } from '@/components/permits/PermitTable';
import { usePermits } from '@/lib/hooks/use-permits';
import type { PermitStatus, PermitType, PermitListParams } from '@/lib/types/permit';

function PermitsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Build params from URL
  const params: PermitListParams = {
    search:          searchParams.get('search')          ?? undefined,
    status:          (searchParams.get('status')         ?? '') as PermitStatus | '',
    type:            (searchParams.get('type')           ?? '') as PermitType   | '',
    start_date_from: searchParams.get('start_date_from') ?? undefined,
    start_date_to:   searchParams.get('start_date_to')   ?? undefined,
    sort:            searchParams.get('sort')            ?? 'created_at',
    order:           (searchParams.get('order')          ?? 'desc') as 'asc' | 'desc',
    page:            Number(searchParams.get('page')     ?? 1),
    limit:           20,
  };

  // Skip invalid date range (per UX-Mockup: "not applied until valid pair")
  if (params.start_date_from && params.start_date_to && params.start_date_from > params.start_date_to) {
    params.start_date_from = undefined;
    params.start_date_to   = undefined;
  }

  const { data, isLoading, isError, refetch } = usePermits(params);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Permits</h1>
        <Link
          href="/permits/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Permit
        </Link>
      </div>

      {/* Filter Bar */}
      <PermitFilterBar />

      {/* Table */}
      <PermitTable
        permits={data?.items}
        meta={data?.meta}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />
    </div>
  );
}

export default function PermitsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-8 w-32 skeleton rounded" />
        <div className="h-24 bg-white rounded-xl border border-gray-200 skeleton" />
        <div className="h-96 bg-white rounded-xl border border-gray-200 skeleton" />
      </div>
    }>
      <PermitsContent />
    </Suspense>
  );
}
```
  </action>
  <verify>
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2

# Dashboard components
test -f components/dashboard/StatCard.tsx && echo "STAT_CARD_OK"
test -f components/dashboard/StatsRow.tsx && echo "STATS_ROW_OK"
test -f components/dashboard/StatusDonutChart.tsx && echo "DONUT_CHART_OK"
test -f components/dashboard/RecentActivityFeed.tsx && echo "ACTIVITY_FEED_OK"
test -f app/\(protected\)/dashboard/page.tsx && echo "DASHBOARD_PAGE_OK"

# Permit list components
test -f components/permits/PermitFilterBar.tsx && echo "FILTER_BAR_OK"
test -f components/permits/PermitTable.tsx && echo "PERMIT_TABLE_OK"
test -f components/permits/PermitRow.tsx && echo "PERMIT_ROW_OK"
test -f app/\(protected\)/permits/page.tsx && echo "PERMITS_PAGE_OK"

# Key nav wiring (Navigation Map compliance)
grep -n "href.*permits.*status" components/dashboard/StatCard.tsx && echo "STAT_CARD_LINK_OK"
grep -n "href.*permits/new" app/\(protected\)/dashboard/page.tsx && echo "CREATE_CTA_OK"
grep -n "href.*permits" components/layout/NavBar.tsx && echo "NAVBAR_PERMITS_LINK_OK"
grep -n "href.*dashboard" components/layout/NavBar.tsx && echo "NAVBAR_DASHBOARD_LINK_OK"

# Filter state synced to URL
grep -n "useSearchParams" components/permits/PermitFilterBar.tsx && echo "SEARCH_PARAMS_OK"
grep -n "router.push" components/permits/PermitFilterBar.tsx && echo "ROUTER_PUSH_OK"
grep -n "300" components/permits/PermitFilterBar.tsx && echo "DEBOUNCE_OK"

# Sort synced to URL
grep -n "sort.*order" components/permits/PermitTable.tsx && echo "SORT_URL_OK"

# Recharts import
grep -n "PieChart\|recharts" components/dashboard/StatusDonutChart.tsx && echo "RECHARTS_OK"

# sonner toast
grep -n "sonner\|toast" app/\(protected\)/dashboard/page.tsx && echo "TOAST_OK"

# TypeScript check (non-blocking)
npx tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "TS_CLEAN"
```
  </verify>
  <done>
- `components/dashboard/StatCard.tsx` — clickable card with icon, count (36px bold), label, 4px left border accent in semantic color, hover scale(1.02), links to /permits?status=X (Total → /permits)
- `components/dashboard/StatsRow.tsx` — renders 5 StatCards in a horizontal flex row with correct indigo/amber/emerald/red/gray accents
- `components/dashboard/StatusDonutChart.tsx` — Recharts PieChart donut (innerRadius 70, outerRadius 110), semantic colors, center total label, legend with count + %, segment click → /permits?status=X, custom tooltip
- `components/dashboard/RecentActivityFeed.tsx` — 10 rows with StatusBadge + truncated title + applicant + relative time (date-fns formatDistanceToNow), each row → /permits/:id, "View all permits" link at bottom
- `app/(protected)/dashboard/page.tsx` — page header + StatsRow + 60/40 grid (donut chart + activity feed), skeleton states during loading, sonner error toast on stats failure
- `components/permits/PermitFilterBar.tsx` — search input (300ms debounce, X clear button), status pills (5 options, active = semantic color), type dropdown, date range pickers with invalid-range warning, active filter chips with X remove, "Clear all filters" link, all state synced to URL via useSearchParams + router.push
- `components/permits/PermitRow.tsx` — all 9 columns per UX-Mockup (Reference 8-char UUID monospace, Title link truncated 50ch, Type label, Applicant, StatusBadge, Start/End/Created DD MMM YYYY, status-conditional action links)
- `components/permits/PermitTable.tsx` — sortable headers (ArrowUp/ArrowDown/ArrowUpDown icons, indigo for active), sort synced to URL (?sort=X&order=Y), skeleton rows during load, EmptyState for no results, ErrorState with retry, Pagination component
- `app/(protected)/permits/page.tsx` — Suspense boundary wrapping PermitsContent, reads all filter params from URL, builds PermitListParams (skips invalid date range), renders PermitFilterBar + PermitTable
- All pages reachable per Navigation Map: Dashboard from NavBar "Dashboard" + post-login; Permits from NavBar "Permits" + stat card clicks + "View all permits" link
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client→API | URL query params (search, status, type, dates, sort, order, page) from browser crossing into fetch calls → GET /api/permits and GET /api/permits/stats |
| cookie→layout | httpOnly `token` cookie read server-side in (protected)/layout.tsx and forwarded to /api/auth/me |
| API-response→render | JSON data returned from /api/permits and /api/permits/stats rendered into DOM (StatusBadge text, permit titles, applicant names) |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-01 | Information disclosure | `app/(protected)/layout.tsx` — cookie forwarding | mitigate | Token is read from the httpOnly cookie store via `cookies()` server API (not accessible to client JS); forwarded only to the internal `/api/auth/me` call over localhost. Cookie is never logged or exposed in response bodies. The `token` value is stripped from all client-rendered output. |
| T-03-02 | Elevation of privilege | `app/(protected)/layout.tsx` — auth guard | mitigate | Server component calls `getUser()` which fetches `/api/auth/me` with the token; a non-200 response returns `null` and triggers `redirect('/login')`. This guard fires on every render of the protected layout, preventing cookie-less direct URL access. |
| T-03-03 | Tampering | `components/permits/PermitFilterBar.tsx` — URL query params | mitigate | All filter params from `useSearchParams()` are passed directly to `usePermits(params)` which uses `URLSearchParams` to construct the fetch URL. The API layer (Wave 2, `listQuerySchema`) performs Zod validation and sanitization on all received query params before they reach the database. The frontend does NOT construct SQL — it only builds URL query strings. |
| T-03-04 | Information disclosure | `API-response→render` — XSS via permit titles/applicant names | mitigate | React's JSX escapes all string interpolation into DOM text nodes by default (no `dangerouslySetInnerHTML` used anywhere in this plan). Permit title, applicant name, and description are all rendered via `{variable}` in JSX — XSS injection via stored data is blocked by the framework. |
| T-03-05 | Denial of service | `components/permits/PermitFilterBar.tsx` — unbounded search typing | mitigate | Search input has `maxLength={100}` and a 300ms debounce before URL update; this limits both query string length and API call frequency. The API (Wave 2) enforces `z.string().max(100)` on the search param server-side. |
| T-03-06 | Information disclosure | `app/providers.tsx` — QueryClient staleTime | accept | TanStack Query caches API responses for 30 seconds (`staleTime: 30000`). If another user (same browser session) loads the page within 30s, they see the prior user's permit counts. Accepted: this is a single-user POC with a single manager role — no multi-user session sharing risk in scope. Residual risk owned by the POC context; Wave 4 can reduce staleTime if needed. |
</threat_model>

<verification>
Run these checks after all tasks complete to confirm Wave 3A is green:

```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2

echo "=== Foundation ==="
test -f app/globals.css && grep -q 'shimmer' app/globals.css && echo "GLOBALS_CSS_OK"
test -f app/providers.tsx && grep -q 'QueryClientProvider' app/providers.tsx && echo "PROVIDERS_OK"
test -f lib/types/permit.ts && grep -q 'PermitStats' lib/types/permit.ts && echo "TYPES_OK"
test -f lib/hooks/use-permit-stats.ts && grep -q 'usePermitStats' lib/hooks/use-permit-stats.ts && echo "STATS_HOOK_OK"
test -f lib/hooks/use-permits.ts && grep -q 'usePermits' lib/hooks/use-permits.ts && echo "PERMITS_HOOK_OK"

echo "=== Shared Components ==="
grep -n 'export function StatusBadge' components/shared/StatusBadge.tsx && echo "STATUS_BADGE_OK"
grep -n 'export function Pagination' components/shared/Pagination.tsx && echo "PAGINATION_OK"
grep -n 'export function EmptyState' components/shared/EmptyState.tsx && echo "EMPTY_STATE_OK"
grep -n 'export function ErrorState' components/shared/ErrorState.tsx && echo "ERROR_STATE_OK"

echo "=== Layout ==="
grep -n 'export function NavBar' components/layout/NavBar.tsx && echo "NAVBAR_OK"
grep -n 'export function Breadcrumb' components/layout/Breadcrumb.tsx && echo "BREADCRUMB_OK"
test -f app/\(protected\)/layout.tsx && grep -q 'redirect' app/\(protected\)/layout.tsx && echo "AUTH_GUARD_OK"

echo "=== Dashboard ==="
test -f app/\(protected\)/dashboard/page.tsx && echo "DASHBOARD_PAGE_OK"
grep -n 'href.*permits.*status' components/dashboard/StatCard.tsx && echo "STAT_CARD_LINKS_OK"
grep -n 'recharts\|PieChart' components/dashboard/StatusDonutChart.tsx && echo "RECHARTS_OK"
grep -n 'formatDistanceToNow' components/dashboard/RecentActivityFeed.tsx && echo "DATE_FNS_OK"

echo "=== Permits ==="
test -f app/\(protected\)/permits/page.tsx && echo "PERMITS_PAGE_OK"
grep -n 'useSearchParams' components/permits/PermitFilterBar.tsx && echo "URL_SYNC_OK"
grep -n '300' components/permits/PermitFilterBar.tsx && echo "DEBOUNCE_OK"
grep -n 'ArrowUp\|ArrowDown' components/permits/PermitTable.tsx && echo "SORT_ICONS_OK"

echo "=== Navigation Map Compliance ==="
# Dashboard → /permits (stat cards)
grep -q 'href.*permits.*status' components/dashboard/StatCard.tsx && echo "STAT_CARD_NAV_OK"
# Dashboard → /permits/new (CTA)
grep -q 'permits/new' app/\(protected\)/dashboard/page.tsx && echo "DASHBOARD_CREATE_CTA_OK"
# NavBar → /dashboard and /permits
grep -q 'dashboard' components/layout/NavBar.tsx && grep -q 'permits' components/layout/NavBar.tsx && echo "NAVBAR_LINKS_OK"
# Activity rows → /permits/:id
grep -q 'permits/\${' components/dashboard/RecentActivityFeed.tsx && echo "ACTIVITY_ROW_NAV_OK"

echo "=== TypeScript ==="
npx tsc --noEmit --skipLibCheck 2>&1 | tail -5 && echo "TSC_DONE"
```
</verification>

<success_criteria>
- [ ] `app/globals.css` defines shimmer animation + CSS vars for brand, status, and surface tokens; no X-Frame-Options DENY
- [ ] `app/layout.tsx` uses Inter from next/font/google; wraps children in Providers
- [ ] `app/providers.tsx` renders QueryClientProvider (staleTime 30s, refetchOnWindowFocus) + Sonner Toaster (bottom-right, richColors)
- [ ] `lib/types/permit.ts` exports PermitStatus, PermitType, PERMIT_TYPE_LABELS, PERMIT_STATUS_LABELS, PermitSummary, PermitDetail, PermitStats, PaginationMeta, PermitListParams
- [ ] `lib/hooks/use-permit-stats.ts` exports usePermitStats() — TanStack Query against GET /api/permits/stats
- [ ] `lib/hooks/use-permits.ts` exports usePermits(params) — TanStack Query against GET /api/permits with all filter params URL-encoded
- [ ] `StatusBadge` is pill-shaped (rounded-full), 14px weight-500, semantic colors: amber/Pending, emerald/Approved, red/Rejected, gray/Revoked
- [ ] `SkeletonCard` and `SkeletonTable` use `.skeleton` CSS class (shimmer animation) — no spinners
- [ ] `EmptyState` supports two types (no-permits with create CTA, no-results with clear filters CTA)
- [ ] `NavBar` is sticky, shows Permit2 logo (Shield icon + indigo text), Dashboard + Permits nav links with active underline, user name + Logout button
- [ ] `app/(protected)/layout.tsx` is a server component that fetches /api/auth/me with the token cookie; redirects to /login if not authenticated; renders NavBar with user.name
- [ ] Dashboard page: 5 clickable stat cards (Total → /permits, Pending → /permits?status=PENDING, etc.), Recharts donut chart with semantic colors + hover tooltips + center total label + legend, Recent Activity feed (10 rows, StatusBadge + title + applicant + relative time, each row → /permits/:id, "View all permits" link)
- [ ] Permit list page: PermitFilterBar + PermitTable + Pagination, all wrapped in Suspense
- [ ] `PermitFilterBar`: search (300ms debounce, × clear button), status pills (active = semantic color), type dropdown, date pickers (invalid range warning), active filter chips with × remove, "Clear all filters" link, all synced to URL via router.push
- [ ] `PermitTable`: 9 columns per UX-Mockup, sortable headers with ArrowUp/ArrowDown/ArrowUpDown icons (active sort = indigo), sort state in URL (?sort=X&order=Y), skeleton rows during load, EmptyState (with type-sensitive messaging), ErrorState with retry
- [ ] `PermitRow`: status-conditional action links (PENDING: View/Approve/Reject; APPROVED: View/Revoke; REJECTED/REVOKED: View only)
- [ ] All screens reachable per Navigation Map: Dashboard ↔ NavBar; Permits ↔ NavBar + Dashboard stat cards + "View all permits"; no orphan pages
</success_criteria>

<output>
After completion, create `.planning/express/build-the-full-permit2-permit-management/03-SUMMARY.md` documenting:
- What was created (all files)
- Component export contracts (for Wave 4 and 04-PLAN consumption)
- Design system tokens applied
- Navigation wiring (which links connect which screens)
- Any deviations from UX-Mockup spec
- Known limitations or TODOs for Wave 4 (e.g., dev server bind address)
</output>
