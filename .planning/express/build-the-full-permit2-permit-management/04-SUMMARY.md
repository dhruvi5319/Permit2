---
phase: build-the-full-permit2-permit-management
plan: "04"
subsystem: frontend
tags: [auth, permit-creation, permit-detail, lifecycle-actions, tanstack-query, react-hook-form, zod]
dependency_graph:
  requires: ["01", "02"]
  provides: ["middleware.ts", "login-page", "permit-form", "permit-detail", "action-dialogs", "api-client", "toast-system"]
  affects: ["03"]
tech_stack:
  added: ["custom-toast-system", "LayoutShell-server-client-bridge"]
  patterns: ["RHF+Zod form pattern", "TanStack Query mutations with cache invalidation", "server-layout + client-shell pattern"]
key_files:
  created:
    - permit2/middleware.ts (rewritten)
    - permit2/app/(auth)/layout.tsx
    - permit2/app/(auth)/login/page.tsx
    - permit2/app/(protected)/permits/new/page.tsx
    - permit2/app/(protected)/permits/[id]/page.tsx
    - permit2/components/permits/PermitForm.tsx
    - permit2/components/permits/PermitDetailHeader.tsx
    - permit2/components/permits/PermitDetailFields.tsx
    - permit2/components/permits/PermitStatusTimeline.tsx
    - permit2/components/permits/ActionDialog.tsx
    - permit2/components/ui/StatusBadge.tsx
    - permit2/components/ui/Toast.tsx
    - permit2/components/ui/Skeleton.tsx
    - permit2/components/providers/QueryProvider.tsx
    - permit2/components/providers/LayoutShell.tsx
    - permit2/lib/api-client.ts
    - permit2/lib/hooks/use-permit.ts
    - permit2/lib/hooks/use-permit-mutations.ts
    - permit2/lib/hooks/use-auth.ts
    - permit2/lib/utils.ts
  modified:
    - permit2/app/(protected)/layout.tsx
decisions:
  - "Custom Toast system over sonner: sonner not installed; built custom bottom-right toast with green/red/blue border variants, 5s/8s auto-dismiss, max-3 stacked, React Context + createPortal"
  - "HTML date input (type=date) over calendar popover: simpler, browser-native, avoids shadcn dependency conflict"
  - "Zod v4 API: project uses Zod 4.4.3 — replaced required_error/invalid_type_error with error field and .min(1) for required strings"
  - "Server layout + LayoutShell client bridge: Wave 3a established server-side auth check in (protected)/layout.tsx; adapted to preserve server auth while adding QueryProvider + ToastProvider via client LayoutShell component"
  - "NavBar.tsx retained (Wave 3a); Navbar.tsx used as re-export shim initially, then deleted to avoid TypeScript casing conflict; NavBar.tsx exports both NavBar and Navbar symbols"
  - "useAuth hook retained for client-side use but not used by Navbar (which now receives userName via server-side prop from layout)"
metrics:
  duration: "~25 minutes"
  completed_date: "2026-08-09T20:28:10Z"
  tasks_completed: 3
  files_created: 20
  files_modified: 1
---

# Phase build-the-full-permit2-permit-management Plan 04: Frontend — Auth, Create, Detail, Lifecycle Actions Summary

## One-Liner

Full permit management frontend: JWT middleware route guard, login page with RHF+Zod, permit creation form, detail view with skeleton/404 states, approve/reject/revoke action dialogs with TanStack Query cache invalidation, custom toast system, and typed API client.

## What Was Built

### Task 1: Foundation
- **middleware.ts** — Rewrote from API-only guard to full page route guard. Redirects unauthenticated users to `/login?redirect=<path>`, redirects authenticated users visiting `/login` to `/dashboard`, returns 401 JSON for unauthenticated API requests. No `X-Frame-Options: DENY` (Pivota preview compatibility).
- **app/(auth)/layout.tsx** — Indigo gradient background for login page, no navbar.
- **app/(protected)/layout.tsx** — Updated to use `LayoutShell` client component that wraps `QueryProvider` + `ToastProvider` + `NavBar`, while preserving Wave 3a's server-side auth check that fetches `/api/auth/me` and redirects unauthenticated users.
- **components/providers/QueryProvider.tsx** — TanStack Query client provider (staleTime: 30s, retry: 1).
- **components/providers/LayoutShell.tsx** — Client-side wrapper for QueryProvider + ToastProvider + NavBar; receives `userName` from server layout.
- **components/ui/StatusBadge.tsx** — Pill badge with PENDING=amber, APPROVED=emerald, REJECTED=red, REVOKED=gray variants; `sm` and `lg` sizes.
- **components/ui/Toast.tsx** — Custom toast system: bottom-right, success=green border 5s, error=red border 8s, info=blue border 5s, max 3 stacked, manual dismiss, React Context + createPortal.
- **components/ui/Skeleton.tsx** — Shimmer skeleton using `animate-pulse` + gradient.
- **lib/api-client.ts** — Typed fetch wrapper for all API endpoints: `auth.{login,logout,me}` and `permits.{list,getById,create,approve,reject,revoke,stats}`.
- **lib/hooks/use-auth.ts** — `useAuth` hook: queries `/api/auth/me` via TanStack Query, exposes `user` + `isLoading` + `logout`.
- **lib/utils.ts** — `cn()` utility with `clsx` + `tailwind-merge`.

### Task 2: Login Page + Permit Form
- **app/(auth)/login/page.tsx** — Branded card with Shield icon, "Sign in to Permit2" heading, email + password fields with RHF+Zod (Zod v4 compatible using `.min(1)` instead of `required_error`), loading spinner during API call, generic "Invalid email or password." auth error (never field-specific), password cleared + focus to password on auth error, `?redirect=` param support with open-redirect guard (`redirect.startsWith('/')`), auto-focus email on mount.
- **components/permits/PermitForm.tsx** — 7-field form: title (text), type (native `<select>`), applicant_name (text), start_date (date), end_date (date with cross-field validation `end >= start`), description (textarea), notes (optional textarea). Field-level `Field` component with green checkmark on valid blur, red border + error message on invalid. `handleInvalidSubmit` focuses first error field on submit attempt. Disabled during `isSubmitting`.
- **app/(protected)/permits/new/page.tsx** — Breadcrumb "Dashboard / Permits / New Permit", "Create New Permit" H1, `PermitForm` wired to `POST /api/permits` via `apiClient.permits.create`, navigates to `/permits/:id` on success, `router.back()` on Cancel, API error shown inline in form.

### Task 3: Permit Detail + Lifecycle Actions
- **lib/hooks/use-permit.ts** — `usePermit(id)`: queries `GET /api/permits/:id`, returns `null` for `PERMIT_NOT_FOUND` (triggers 404 state), throws Error for other failures.
- **lib/hooks/use-permit-mutations.ts** — `useApprovePermit`, `useRejectPermit`, `useRevokePermit`, `useCreatePermit`: each invalidates `['permit', permitId]` + `['permits']` + `['permits', 'stats']` on success.
- **components/permits/PermitDetailHeader.tsx** — Title + StatusBadge(lg) + action buttons: PENDING → Approve(emerald) + Reject(red); APPROVED → Revoke(amber); REJECTED/REVOKED → "This permit is in a terminal state and cannot be modified." italic label.
- **components/permits/PermitDetailFields.tsx** — Two-column grid: left = Permit Information (applicant, type, description, notes); right = Dates & Status (start/end/created/updated). Rejection reason shown as red border-l-4 alert block; revocation reason as amber.
- **components/permits/PermitStatusTimeline.tsx** — Chronological oldest-first list; colored dot + vertical connector line; StatusBadge + event label + "by {actor_name}" + `dd MMM yyyy, HH:mm` timestamp.
- **components/permits/ActionDialog.tsx** — Three variants: approve (green, optional notes textarea), reject (red, optional reason max-500), revoke (amber, optional reason max-500). Non-dismissible backdrop + Escape during `isLoading`. Inline error block on API failure. `dialog-open` keyframe animation (scale 0.95→1 + fade).
- **app/(protected)/permits/[id]/page.tsx** — Full detail page: `usePermit(id)` via TanStack Query; skeleton with `aria-busy="true"` during load; 404 state ("Permit Not Found" + back link) when `permit === null`; breadcrumb "Dashboard / Permits / [Title]" + "← Back to Permits" link; `?action=` param auto-opens correct dialog with status validation (invalid action shows toast instead); cache invalidation + success toast on action completion.

## Integration Points

| Consumer | Hook/Component | API Endpoint |
|----------|---------------|-------------|
| `app/(auth)/login/page.tsx` | `apiClient.auth.login` | `POST /api/auth/login` |
| `app/(protected)/permits/new/page.tsx` | `apiClient.permits.create` | `POST /api/permits` |
| `app/(protected)/permits/[id]/page.tsx` | `usePermit(id)` | `GET /api/permits/:id` |
| `ActionDialog` (approve) | `useApprovePermit(id).mutateAsync` | `PATCH /api/permits/:id/approve` |
| `ActionDialog` (reject) | `useRejectPermit(id).mutateAsync` | `PATCH /api/permits/:id/reject` |
| `ActionDialog` (revoke) | `useRevokePermit(id).mutateAsync` | `PATCH /api/permits/:id/revoke` |
| `Navbar` (logout) | `fetch /api/auth/logout` | `POST /api/auth/logout` |
| `(protected)/layout.tsx` (auth check) | server-side fetch | `GET /api/auth/me` |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Zod v4 API incompatibility**
- **Found during:** Task 2
- **Issue:** Plan specified `z.string({ required_error: '...' })` and `z.enum(['WORK', ...], { required_error: '...' })` which are Zod v3 API. Project uses Zod 4.4.3.
- **Fix:** Changed to `z.string().min(1, 'message')` for required strings; `z.enum(['WORK', ...], { error: 'message' })` for enum.
- **Files modified:** `app/(auth)/login/page.tsx`, `components/permits/PermitForm.tsx`

**2. [Rule 2 - Integration] Toast.tsx clearTimeout TypeScript error**
- **Found during:** Task 1
- **Issue:** `useRef<ReturnType<typeof setTimeout>>()` requires an argument in strict mode.
- **Fix:** Changed to `useRef<ReturnType<typeof setTimeout> | undefined>(undefined)` + guarded `clearTimeout`.
- **Files modified:** `components/ui/Toast.tsx`

**3. [Rule 3 - Blocking] NavBar.tsx/Navbar.tsx casing conflict**
- **Found during:** Task 1 and Task 3
- **Issue:** Wave 3a created `NavBar.tsx` (already in use) and deleted our `Navbar.tsx`. TypeScript strict casing prevented both from coexisting.
- **Fix:** Deleted conflicting `Navbar.tsx`. Used `NavBar.tsx` (already exports `NavBar as Navbar` alias). Updated `LayoutShell.tsx` to import from `NavBar`.
- **Files modified:** `components/providers/LayoutShell.tsx`

**4. [Rule 3 - Blocking] Server layout + client providers conflict with Wave 3a**
- **Found during:** Task 3 layout integration
- **Issue:** Wave 3a's commit replaced our `(protected)/layout.tsx` (which had QueryProvider + ToastProvider) with a server component that fetches user server-side and passes `userName` to `NavBar`.
- **Fix:** Created `components/providers/LayoutShell.tsx` as a client component wrapping QueryProvider + ToastProvider + NavBar. Updated layout to use server-side auth check (Wave 3a's approach) + LayoutShell for client providers. This preserves both server-side redirect-on-401 AND client provider availability.
- **Files modified:** `app/(protected)/layout.tsx`, `components/providers/LayoutShell.tsx` (new)

**5. [Rule 1 - Bug] ToastProvider createPortal SSR safety**
- **Found during:** Task 1
- **Issue:** Original plan used `typeof window !== 'undefined'` check for portal, but this causes hydration mismatch.
- **Fix:** Used `useState(false)` + `useEffect(() => setMounted(true))` pattern to safely enable portal only after client hydration.
- **Files modified:** `components/ui/Toast.tsx`

## Known Stubs

None found. All implementations are complete.

- `apiClient` — real fetch calls to all endpoints, typed responses
- `usePermit` — real TanStack Query with proper error/404 handling
- `useApprovePermit/useRejectPermit/useRevokePermit` — real mutations with cache invalidation
- `ActionDialog` — real dialog with form state, loading, error handling
- `middleware.ts` — real JWT verification using `verifyToken` from `lib/auth.ts`

## Build Status

- **TypeScript:** ✅ `npx tsc --noEmit --skipLibCheck` exits 0, no errors
- **Next.js Build:** ⚠️ `npm run build` fails due to missing `DATABASE_URL` environment variable during static page generation of `/api/auth/me`. This is a pre-existing environment issue affecting all API routes — not caused by plan 04 changes. The compiled JavaScript is correct.

## Self-Check: PASSED

### Files verified to exist:
- ✅ `permit2/middleware.ts`
- ✅ `permit2/app/(auth)/layout.tsx`
- ✅ `permit2/app/(auth)/login/page.tsx`
- ✅ `permit2/app/(protected)/layout.tsx`
- ✅ `permit2/app/(protected)/permits/new/page.tsx`
- ✅ `permit2/app/(protected)/permits/[id]/page.tsx`
- ✅ `permit2/components/permits/PermitForm.tsx`
- ✅ `permit2/components/permits/PermitDetailHeader.tsx`
- ✅ `permit2/components/permits/PermitDetailFields.tsx`
- ✅ `permit2/components/permits/PermitStatusTimeline.tsx`
- ✅ `permit2/components/permits/ActionDialog.tsx`
- ✅ `permit2/components/ui/StatusBadge.tsx`
- ✅ `permit2/components/ui/Toast.tsx`
- ✅ `permit2/components/ui/Skeleton.tsx`
- ✅ `permit2/components/providers/QueryProvider.tsx`
- ✅ `permit2/components/providers/LayoutShell.tsx`
- ✅ `permit2/lib/api-client.ts`
- ✅ `permit2/lib/hooks/use-permit.ts`
- ✅ `permit2/lib/hooks/use-permit-mutations.ts`
- ✅ `permit2/lib/hooks/use-auth.ts`
- ✅ `permit2/lib/utils.ts`

### Commits verified:
- ✅ `60f9c81` — Task 1: Foundation
- ✅ `7d60ab9` — Task 2: Login page + PermitForm
- ✅ `6c8e118` — Task 3: Detail page + mutations (auto-committed by orchestrator)
- ✅ `c496906` — Task 3: LayoutShell + layout update

### Build check:
`npx tsc --noEmit --skipLibCheck` → exit 0 ✅
`npm run build` → fails on DATABASE_URL (pre-existing environment constraint, not a code error) ⚠️
