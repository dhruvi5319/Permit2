# Permit2 — Express Implementation Plan

**Generated:** 2026-08-09  
**Stack:** Next.js 14 (App Router) · TypeScript · Prisma · PostgreSQL · shadcn/ui · TanStack Query · Tailwind CSS  
**Scope:** Full POC — F0 through F9 (all P0 features + F4 Search & Filter P1)

---

## Phases

| Phase | Name | Features | Goal |
|-------|------|----------|------|
| 1 | Project Scaffold & Database | F9 (Data Model) | Runnable Next.js app with Prisma schema, migrations, and seed data |
| 2 | Authentication | F0 | Login/logout with JWT; protected routes |
| 3 | Backend API | F8 | All REST endpoints (permits CRUD + lifecycle actions + stats) |
| 4 | Dashboard | F1 | Stat cards, donut chart, recent activity feed |
| 5 | Permit List & Filters | F3 + F4 | Sortable paginated table, search & filter, URL sync |
| 6 | Permit Creation | F2 | Creation form with full validation |
| 7 | Permit Detail & Lifecycle | F5 + F6 | Detail view, status timeline, Approve/Reject/Revoke dialogs |
| 8 | UI Polish | F7 | Design system, skeletons, toasts, animations, responsive layout |

---

## Phase 1 — Project Scaffold & Database (F9)

**Goal:** A running Next.js 14 project with the database schema migrated, seeded, and Prisma generating types.

### Tasks

#### P1-T1: Initialize Next.js project
- `npx create-next-app@latest permit2 --typescript --tailwind --eslint --app --src-dir=false`
- Delete boilerplate pages content; keep root layout shell
- Install core dependencies:
  ```
  npm install prisma @prisma/client bcryptjs jsonwebtoken zod 
  npm install @tanstack/react-query react-hook-form @hookform/resolvers
  npm install recharts framer-motion date-fns lucide-react
  npm install -D @types/bcryptjs @types/jsonwebtoken prettier
  ```

#### P1-T2: Initialize shadcn/ui
- `npx shadcn-ui@latest init` — choose: Style=Default, Base color=Slate, CSS variables=Yes
- Add components: `button card badge dialog select input textarea label toast separator skeleton breadcrumb`

#### P1-T3: Write Prisma schema (`prisma/schema.prisma`)
```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum PermitStatus { PENDING APPROVED REJECTED REVOKED }
enum PermitType   { WORK ACCESS ACTIVITY SAFETY OTHER }

model User {
  id            String                @id @default(uuid())
  email         String                @unique
  passwordHash  String                @map("password_hash")
  name          String
  createdAt     DateTime              @default(now()) @map("created_at")
  permits       Permit[]              @relation("CreatedBy")
  historyEvents PermitStatusHistory[]
  @@map("users")
}

model Permit {
  id               String                @id @default(uuid())
  title            String                @db.VarChar(255)
  type             PermitType
  applicantName    String                @map("applicant_name") @db.VarChar(255)
  description      String                @db.Text
  notes            String?               @db.Text
  status           PermitStatus          @default(PENDING)
  startDate        DateTime              @map("start_date") @db.Date
  endDate          DateTime              @map("end_date") @db.Date
  rejectionReason  String?               @map("rejection_reason") @db.Text
  revocationReason String?               @map("revocation_reason") @db.Text
  createdBy        String                @map("created_by")
  creator          User                  @relation("CreatedBy", fields: [createdBy], references: [id])
  createdAt        DateTime              @default(now()) @map("created_at")
  updatedAt        DateTime              @updatedAt @map("updated_at")
  statusHistory    PermitStatusHistory[]
  @@index([status]) @@index([type]) @@index([createdAt]) @@index([startDate]) @@index([status, type])
  @@map("permits")
}

model PermitStatusHistory {
  id        String       @id @default(uuid())
  permitId  String       @map("permit_id")
  permit    Permit       @relation(fields: [permitId], references: [id], onDelete: Cascade)
  status    PermitStatus
  event     String       @db.VarChar(50)
  actorId   String       @map("actor_id")
  actor     User         @relation(fields: [actorId], references: [id])
  actorName String       @map("actor_name") @db.VarChar(255)
  notes     String?      @db.Text
  createdAt DateTime     @default(now()) @map("created_at")
  @@index([permitId]) @@index([createdAt])
  @@map("permit_status_history")
}
```

#### P1-T4: Create migration and run it
- `npx prisma migrate dev --name init`

#### P1-T5: Write seed script (`prisma/seed.ts`)
- 1 manager user: `manager@permit2.dev` / `demo1234` (bcrypt hashed)
- 15 realistic permits across all statuses and types:
  - 4 PENDING, 5 APPROVED, 3 REJECTED, 3 REVOKED
  - Mix of WORK, ACCESS, ACTIVITY, SAFETY, OTHER types
  - Realistic titles: "Electrical Panel Maintenance", "Server Room Access", "Rooftop Safety Inspection", etc.
  - Include rejection/revocation reasons for REJECTED/REVOKED permits
  - Status history entries for each transition
- Add seed config to `package.json`: `"prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }`
- Run: `npx prisma db seed`

#### P1-T6: Prisma client singleton (`lib/db.ts`)
```typescript
import { PrismaClient } from '@prisma/client';
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query'] : [] });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

#### P1-T7: Environment files
- `.env.example`:
  ```
  DATABASE_URL="postgresql://user:pass@localhost:5432/permit2"
  JWT_SECRET="your-super-secret-key-at-least-32-characters-long"
  JWT_EXPIRES_IN="1h"
  NODE_ENV="development"
  ```
- `.env` (local, gitignored)
- Add `.env` to `.gitignore`

#### P1-T8: TypeScript shared types (`types/index.ts`)
- Define: `PermitStatus`, `PermitType`, `PermitSummary`, `Permit`, `PermitHistoryEvent`, `PermitStats`, `UserProfile`, `ApiResponse<T>`, `ApiError`, `PaginationMeta`
- Define all request body interfaces: `CreatePermitRequest`, `LoginRequest`, `ApprovePermitRequest`, `RejectPermitRequest`, `RevokePermitRequest`
- Define `PermitListQuery` interface

**Acceptance:** `npx prisma generate` succeeds; `npm run typecheck` passes; `npx prisma db seed` populates 15 permits + 1 user.

---

## Phase 2 — Authentication (F0)

**Goal:** Login/logout flow with JWT, persistent session via httpOnly cookie, and protected route enforcement.

### Tasks

#### P2-T1: Zod schemas (`lib/validations/auth.schema.ts`)
- `loginSchema`: email (valid email), password (non-empty string, min 1)

#### P2-T2: Auth utilities (`lib/auth.ts`)
- `signToken(payload: JwtPayload): string` — signs HS256 JWT with `JWT_SECRET`, expiry from `JWT_EXPIRES_IN`
- `verifyToken(token: string): JwtPayload` — verifies and decodes; throws `AUTH_TOKEN_EXPIRED` or `AUTH_UNAUTHORIZED`
- `getTokenFromRequest(req: NextRequest): string | null` — reads from `Authorization: Bearer ...` header OR `permit2_token` cookie
- `authenticateRequest(req: NextRequest): JwtPayload` — composes above; throws on failure
- `setAuthCookie(response: NextResponse, token: string)` — sets `permit2_token` as httpOnly, SameSite=Strict cookie
- `clearAuthCookie(response: NextResponse)` — clears the cookie

#### P2-T3: API response helpers (`lib/utils/api-response.ts`)
```typescript
export function ok<T>(data: T, meta = {}): NextResponse
export function created<T>(data: T): NextResponse
export function badRequest(code: string, message: string, details?: unknown): NextResponse
export function unauthorized(code: string, message: string): NextResponse
export function notFound(code: string, message: string): NextResponse
export function serverError(): NextResponse
```

#### P2-T4: Login endpoint (`app/api/auth/login/route.ts`)
- POST: validate body with `loginSchema`; find user by email; `bcrypt.compare()`; sign JWT; set cookie; return `{ data: { token, user }, error: null, meta: {} }`
- Errors: `400 VALIDATION_ERROR`, `401 AUTH_INVALID_CREDENTIALS`

#### P2-T5: Logout endpoint (`app/api/auth/logout/route.ts`)
- POST (auth required): clear cookie; return `{ data: { ok: true }, error: null, meta: {} }`

#### P2-T6: Me endpoint (`app/api/auth/me/route.ts`)
- GET (auth required): return current user profile from JWT payload

#### P2-T7: Middleware (`middleware.ts`)
- Check for `permit2_token` cookie or `Authorization` header on all `/dashboard`, `/permits` routes
- Redirect unauthenticated requests to `/login?redirect=<originalPath>`
- Redirect authenticated users from `/login` to `/dashboard`

#### P2-T8: Login page (`app/(auth)/login/page.tsx`)
- Centered card layout, branded header ("Permit2" logo mark)
- React Hook Form + Zod resolver for email/password
- Loading state on submit button
- Calls `POST /api/auth/login`; on success stores token in localStorage AND sets cookie via API; redirects to `?redirect` or `/dashboard`
- Inline error: "Invalid email or password." on 401
- Inline validation errors on blur

#### P2-T9: Auth context / hook (`lib/hooks/use-auth.ts`)
- `useAuth()` hook: returns `{ user, logout, isLoading }`
- `logout()` calls `POST /api/auth/logout` then redirects to `/login`
- Reads user from localStorage or fetches `/api/auth/me`

**Acceptance:** Navigate to `/dashboard` unauthenticated → redirected to `/login`. Login with `manager@permit2.dev` / `demo1234` → lands on `/dashboard`. Logout → back to `/login`. Refresh while logged in → stays on `/dashboard`.

---

## Phase 3 — Backend API (F8)

**Goal:** All REST endpoints operational with auth enforcement, validation, state machine, and consistent response envelope.

### Tasks

#### P3-T1: Permit Zod schemas (`lib/validations/permit.schema.ts`)
- `createPermitSchema`: all required fields + optional notes; `end_date >= start_date` refinement
- `lifecycleActionSchema`: `{ notes?: string }` for approve; `{ reason?: string }` for reject/revoke
- `permitListQuerySchema`: all query params with defaults (page=1, limit=20, order='desc')

#### P3-T2: Permit service (`lib/permit-service.ts`)
- `validateTransition(currentStatus, action)` — throws `InvalidTransitionError` if invalid
  - Valid: PENDING→APPROVED, PENDING→REJECTED, APPROVED→REVOKED
- `getPermits(query: PermitListQuery)` — Prisma query with dynamic `where` + `orderBy` + pagination
- `getPermitStats()` — `groupBy('status')` + sum into `PermitStats`
- `getPermitById(id)` — includes `statusHistory` ordered by `createdAt ASC`
- `createPermit(data, userId)` — creates permit + initial CREATED history entry in a transaction
- `approvePermit(id, userId, userName, notes?)` — validates transition; updates permit + history in transaction
- `rejectPermit(id, userId, userName, reason?)` — validates transition; updates permit + history in transaction
- `revokePermit(id, userId, userName, reason?)` — validates transition; updates permit + history in transaction

#### P3-T3: Custom error classes (`lib/utils/errors.ts`)
- `InvalidTransitionError extends Error`
- `PermitNotFoundError extends Error`
- `AuthError extends Error`

#### P3-T4: Permits list + create (`app/api/permits/route.ts`)
- GET: parse + validate query params; call `getPermits()`; return `{ data: { items }, meta: pagination }`
- POST: validate body; call `createPermit()`; return `201 { data: permit }`

#### P3-T5: Permits stats (`app/api/permits/stats/route.ts`)
- GET: call `getPermitStats()`; return `{ data: stats }`
- Must be at `permits/stats/route.ts` (static segment beats `[id]`)

#### P3-T6: Permit detail (`app/api/permits/[id]/route.ts`)
- GET: call `getPermitById()`; return full permit with `status_history`
- Handle `PermitNotFoundError` → 404

#### P3-T7: Lifecycle endpoints
- `app/api/permits/[id]/approve/route.ts` — PATCH: validate body; call `approvePermit()`
- `app/api/permits/[id]/reject/route.ts` — PATCH: validate body; call `rejectPermit()`
- `app/api/permits/[id]/revoke/route.ts` — PATCH: validate body; call `revokePermit()`
- All handle `InvalidTransitionError` → 400 INVALID_TRANSITION, `PermitNotFoundError` → 404

#### P3-T8: Security headers (`next.config.js`)
- Add X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy

**Acceptance:** Using curl/Postman: all endpoints respond with `{ data, error, meta }` envelope; invalid transitions return 400; unauthenticated requests return 401.

---

## Phase 4 — Dashboard (F1)

**Goal:** Post-login landing page with stat cards, donut chart, and recent activity feed — all wired to real API data.

### Tasks

#### P4-T1: TanStack Query setup
- Create `app/providers.tsx` — `QueryClientProvider` with `QueryClient({ defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: true } } })`
- Wrap root layout in `Providers`

#### P4-T2: API client hooks (`lib/hooks/`)
- `use-permit-stats.ts` — `useQuery({ queryKey: ['permits', 'stats'], queryFn: () => fetch('/api/permits/stats') })`
- `use-permits.ts` — `useQuery` with `PermitListQuery` params; URL param serialization
- `use-permit.ts` — `useQuery` by ID

#### P4-T3: `StatCard` component (`components/dashboard/StatCard.tsx`)
- Props: `label`, `count`, `color`, `icon` (Lucide), `href` (optional — navigates to filtered list)
- Card: white bg, rounded-xl, shadow-sm, colored left border or icon
- Skeleton variant for loading state

#### P4-T4: `StatsRow` component (`components/dashboard/StatsRow.tsx`)
- Renders 5 `StatCard`s: Total (blue), Pending (amber), Approved (green), Rejected (red), Revoked (gray)
- Each card links to `/permits?status=<STATUS>` (Total links to `/permits`)
- Loading: 5 `StatCard` skeletons; Error: cards show "–" with retry

#### P4-T5: `StatusDonutChart` component (`components/dashboard/StatusDonutChart.tsx`)
- Recharts `PieChart` with `Pie` in donut mode (`innerRadius=60`, `outerRadius=90`)
- Colors: amber, green, red, gray for Pending/Approved/Rejected/Revoked
- Center label: total count
- Custom legend below chart
- Tooltip: status name + count + percentage
- Loading: skeleton circle

#### P4-T6: `RecentActivityFeed` component (`components/dashboard/RecentActivityFeed.tsx`)
- Fetches `GET /api/permits?sort=updated_at&order=desc&limit=10`
- Each row: `StatusBadge` + truncated title + applicant name + relative time (`date-fns/formatDistanceToNow`)
- Row click → `/permits/:id`
- "View all permits" link → `/permits`
- Empty state: icon + "No permits yet. Create your first permit."
- Loading: 5 skeleton rows

#### P4-T7: `StatusBadge` component (`components/shared/StatusBadge.tsx`)
- Props: `status: PermitStatus`
- Pill shape, color-coded: `PENDING`=amber, `APPROVED`=green, `REJECTED`=red, `REVOKED`=gray
- Uses shadcn `Badge` as base

#### P4-T8: Dashboard page (`app/(protected)/dashboard/page.tsx`)
- Page header: "Dashboard" title + "Create New Permit" primary button → `/permits/new`
- `StatsRow` above `StatusDonutChart` + `RecentActivityFeed` (2-column grid on desktop, stacked on tablet)
- Page title: "Dashboard | Permit2"

**Acceptance:** Dashboard loads with real seeded data; stat counts match database; clicking a stat card navigates to filtered list; recent activity shows the 10 latest permits with correct relative timestamps.

---

## Phase 5 — Permit List & Filters (F3 + F4)

**Goal:** Paginated, sortable permit table with search, status/type/date filters synced to URL query params.

### Tasks

#### P5-T1: `StatusBadge` finalize
- Already built in P4-T7; verify it renders correctly in table context

#### P5-T2: `PermitFilterBar` component (`components/permits/PermitFilterBar.tsx`)
- Search input (debounced 300ms with `use-debounce` or `useEffect`)
- Status filter: pill group (All / Pending / Approved / Rejected / Revoked)
- Type filter: shadcn `Select` dropdown (All Types + 5 types)
- Date range: two shadcn `Input type="date"` pickers (From / To)
- "Clear all filters" link — shown only when any filter is active
- Active filter chips below the bar showing applied filters with ×
- On any change: update URL via `router.push` + `useSearchParams`

#### P5-T3: `PermitTable` component (`components/permits/PermitTable.tsx`)
- Columns: Reference (truncated ID), Title (link), Type, Applicant, Status (badge), Start Date, End Date, Created, Actions
- Sort: click header → toggle asc/desc; chevron icon indicator; sync to URL `?sort=&order=`
- Row click → `/permits/:id`
- Loading state: `SkeletonTable` (10 shimmer rows)
- Empty state: `EmptyState` component with icon

#### P5-T4: `PermitRow` component (`components/permits/PermitRow.tsx`)
- Renders single table row
- Actions column (contextual by status):
  - PENDING: "View" + "Approve" + "Reject" links
  - APPROVED: "View" + "Revoke" links
  - REJECTED/REVOKED: "View" link only
  - Approve/Reject/Revoke links navigate to `/permits/:id?action=approve` etc.

#### P5-T5: `Pagination` component (`components/shared/Pagination.tsx`)
- "Showing X–Y of Z permits" text
- Previous / Next buttons (disabled at boundaries)
- Page number display
- Syncs to URL `?page=`

#### P5-T6: `SkeletonTable` component (`components/shared/SkeletonTable.tsx`)
- 10 rows of skeleton cells matching column widths

#### P5-T7: `EmptyState` component (`components/shared/EmptyState.tsx`)
- Props: `icon`, `heading`, `body`, `actionLabel?`, `actionHref?`
- Centered layout; subtle icon above heading

#### P5-T8: Permits list page (`app/(protected)/permits/page.tsx`)
- Page header: "Permits" title + "Create New Permit" button
- `PermitFilterBar` (reads/writes URL params)
- `PermitTable` (reads URL params, fetches from `/api/permits`)
- `Pagination` (reads/writes URL `?page=`)
- Reads initial filter state from `useSearchParams`; passes to `usePermits` hook

**Acceptance:** Table shows all seeded permits; sorting by column works; search filters list in real time; status filter pills work; URL encodes all state; "Clear all" resets everything; pagination controls work.

---

## Phase 6 — Permit Creation (F2)

**Goal:** `POST /permits` form at `/permits/new` with full client-side + server-side validation.

### Tasks

#### P6-T1: Permit creation Zod schema (client-side mirror)
- Re-export or duplicate `createPermitSchema` for use with React Hook Form + `zodResolver`

#### P6-T2: `PermitForm` component (`components/permits/PermitForm.tsx`)
- React Hook Form + Zod resolver
- Fields: Title (text), Permit Type (shadcn Select), Applicant Name (text), Description (textarea), Start Date (date input), End Date (date input), Additional Notes (textarea, optional)
- Required fields marked with `*`
- Inline errors below each field on blur and on submit
- End date < start date → "End date must be on or after the start date."
- Valid field after blur → green checkmark (outline color change)
- Submit button: loading/disabled state while API call in flight
- Cancel button: `router.back()`
- On success: `router.push('/permits/' + newPermit.id)`
- On server error: toast with field-level details

#### P6-T3: Permit creation page (`app/(protected)/permits/new/page.tsx`)
- Page header: "Create New Permit" + breadcrumb "Dashboard / Permits / New Permit"
- Renders `PermitForm`
- Max content width: 720px, centered

**Acceptance:** Fill all fields + submit → permit created with PENDING status → redirected to detail page. Leave required field blank → inline error shown. End date before start date → inline error. Cancel → back to previous page.

---

## Phase 7 — Permit Detail & Lifecycle Actions (F5 + F6)

**Goal:** Detail page showing full permit info, status timeline, and Approve/Reject/Revoke dialogs.

### Tasks

#### P7-T1: `PermitDetailHeader` component (`components/permits/PermitDetailHeader.tsx`)
- Props: `permit: Permit`, `onApprove`, `onReject`, `onRevoke`
- Large title, `StatusBadge` prominently displayed
- Action buttons (conditional by status):
  - PENDING → "Approve" (green) + "Reject" (red)
  - APPROVED → "Revoke" (destructive)
  - REJECTED/REVOKED → muted label "This permit is in a terminal state and cannot be modified."
- Buttons trigger respective dialog open handlers

#### P7-T2: `PermitDetailFields` component (`components/permits/PermitDetailFields.tsx`)
- Two-column grid of labeled fields: Type, Applicant Name, Start Date, End Date, Description, Notes, Created, Last Updated
- Rejection Reason: shown only when `status === 'REJECTED'` and reason exists
- Revocation Reason: shown only when `status === 'REVOKED'` and reason exists

#### P7-T3: `PermitStatusTimeline` component (`components/permits/PermitStatusTimeline.tsx`)
- Props: `history: PermitHistoryEvent[]`
- Vertical timeline list, oldest first
- Each event: colored dot matching status color + event label + actor name + formatted timestamp (`DD MMM YYYY, HH:MM`)
- Connecting vertical line between events

#### P7-T4: `ActionDialog` component (`components/permits/ActionDialog.tsx`)
- Props: `action: 'approve' | 'reject' | 'revoke'`, `permitTitle`, `isOpen`, `onClose`, `onConfirm`, `isLoading`
- Dynamic content per action:
  - Approve: title "Approve Permit?", confirm button "Approve Permit" (green), optional notes textarea
  - Reject: title "Reject Permit?", confirm button "Reject Permit" (red), optional "Rejection Reason" textarea (max 500)
  - Revoke: title "Revoke Permit?", confirm button "Revoke Permit" (destructive), optional "Revocation Reason" textarea (max 500)
- Confirm button: loading state while API call in flight
- On API error: error message inside dialog "Action failed. Please try again."
- Built on shadcn `Dialog`

#### P7-T5: `Breadcrumb` component (`components/layout/Breadcrumb.tsx`)
- Props: `items: Array<{ label: string, href?: string }>`
- Renders "/" separated breadcrumb; last item is non-linked
- Used on detail page: "Dashboard / Permits / [Permit Title]"

#### P7-T6: Permit detail page (`app/(protected)/permits/[id]/page.tsx`)
- Fetches permit via `usePermit(id)`
- Skeleton layout while loading
- 404 state if `PERMIT_NOT_FOUND`
- Renders: Breadcrumb + `PermitDetailHeader` + `PermitDetailFields` + `PermitStatusTimeline`
- Manages dialog open state: `approveOpen`, `rejectOpen`, `revokeOpen`
- Dialog submit handlers: call respective API endpoints via mutations; on success: invalidate query (`queryClient.invalidateQueries(['permit', id])`); show toast
- Handles `?action=approve|reject|revoke` query param → auto-opens the relevant dialog on load (validates status first)
- "← Back to Permits" link: `router.back()` (preserves filter state)

#### P7-T7: TanStack Query mutations (`lib/hooks/use-permit-mutations.ts`)
- `useApprovePermit()`, `useRejectPermit()`, `useRevokePermit()`, `useCreatePermit()`
- Each returns `{ mutate, isLoading, error }`
- On success: `queryClient.invalidateQueries(['permits'])` + `queryClient.invalidateQueries(['permits', 'stats'])`

**Acceptance:** Detail page shows all fields; timeline shows correct sequence; Approve dialog → submit → status updates to APPROVED in-place; Reject with reason → reason shown in detail; Revoke → terminal state label shown; invalid states show error in dialog.

---

## Phase 8 — UI Polish & Design System (F7)

**Goal:** Apply consistent design system, animations, skeleton screens, toast notifications, and responsive layout across all screens.

### Tasks

#### P8-T1: Design tokens & global styles (`app/globals.css`)
- CSS variables for brand palette:
  - `--primary`: indigo-600 (`#4f46e5`)
  - `--pending`: amber-500 (`#f59e0b`)
  - `--approved`: green-600 (`#16a34a`)
  - `--rejected`: red-600 (`#dc2626`)
  - `--revoked`: gray-500 (`#6b7280`)
- Set `Inter` as default font (via `next/font/google`)
- Apply 4px spacing system via Tailwind's default scale
- Override shadcn CSS variables to match brand palette

#### P8-T2: `NavBar` component (`components/layout/NavBar.tsx`)
- Persistent top nav: Permit2 logo mark (left) + nav links (Dashboard, Permits) + user name + Logout (right)
- Active link: indigo underline / bold weight
- Logout: calls `useAuth().logout()`
- Sticky top, white bg, subtle bottom border

#### P8-T3: Root layout + protected layout
- `app/layout.tsx`: Inter font, Providers (QueryClient + Toast), html/body
- `app/(protected)/layout.tsx`: auth guard (middleware handles redirect); renders `NavBar` above children

#### P8-T4: Toast system
- Use shadcn `Toaster` in root layout
- `lib/hooks/use-toast.ts`: expose `toast.success(msg)`, `toast.error(msg)` wrappers
- Success: green left border; auto-dismiss 5s
- Error: red left border; auto-dismiss 8s
- Max 3 stacked; manual × dismiss

#### P8-T5: Skeleton components
- `SkeletonCard` (`components/shared/SkeletonCard.tsx`): shimmer placeholder for stat cards
- `SkeletonTable` (`components/shared/SkeletonTable.tsx`): 10 shimmer rows for permit table
- `SkeletonDetail` (`components/shared/SkeletonDetail.tsx`): shimmer for detail page fields + timeline
- Use `animate-pulse` Tailwind class with `bg-gray-200` shapes

#### P8-T6: Framer Motion animations
- Login page: card fade+slide-up on mount (`initial={{ opacity:0, y:20 }}`, `animate={{ opacity:1, y:0 }}`)
- Dashboard: stat cards stagger-fade in (`variants` + `staggerChildren`)
- Dialog open/close: `AnimatePresence` with scale + fade
- Page transitions: minimal (avoid layout shifts); use `layout` prop on lists

#### P8-T7: Responsive layout
- Dashboard stat cards: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` (5 cards in a row on desktop)
- Dashboard bottom section: `grid grid-cols-1 lg:grid-cols-3` (chart takes 1 col, feed takes 2 cols)
- Permit table: horizontal scroll wrapper at tablet width; all columns visible at 1024px+
- Form: max-w-2xl centered; full-width on mobile

#### P8-T8: Error state component (`components/shared/ErrorState.tsx`)
- Props: `message`, `onRetry?`
- Centered icon (AlertCircle from Lucide) + message + retry button

#### P8-T9: Page metadata
- Each page: `export const metadata = { title: 'X | Permit2' }` for SEO / browser tab titles

#### P8-T10: README.md
- Project overview
- Setup instructions (install → configure .env → migrate → seed → dev)
- Demo credentials
- Available npm scripts

**Acceptance:** App looks polished and professional across all screens. No default/unstyled elements visible. Skeleton screens appear during loading. Toasts appear for all actions. All screens functional at 1024px, 1280px, and 1440px. Color contrast passes WCAG AA.

---

## Implementation Sequence

```
Phase 1 (scaffold + DB)
    └── Phase 2 (auth)
            └── Phase 3 (API)
                    ├── Phase 4 (dashboard)
                    ├── Phase 5 (list + filters)
                    ├── Phase 6 (creation)
                    └── Phase 7 (detail + lifecycle)
                                └── Phase 8 (UI polish — applied retroactively across all)
```

Phases 4–7 can begin once Phase 3 is complete. Phase 8 polish is applied as a final pass.

---

## File Structure (Final)

```
permit2/
├── app/
│   ├── layout.tsx                        ← Root layout (font, providers, toaster)
│   ├── globals.css                       ← Design tokens, Tailwind base
│   ├── (auth)/
│   │   └── login/page.tsx
│   └── (protected)/
│       ├── layout.tsx                    ← NavBar wrapper
│       ├── dashboard/page.tsx
│       └── permits/
│           ├── page.tsx                  ← List + filters
│           ├── new/page.tsx              ← Create form
│           └── [id]/page.tsx             ← Detail + actions
│
├── app/api/
│   ├── auth/login/route.ts
│   ├── auth/logout/route.ts
│   ├── auth/me/route.ts
│   └── permits/
│       ├── route.ts                      ← GET list + POST create
│       ├── stats/route.ts
│       └── [id]/
│           ├── route.ts                  ← GET detail
│           ├── approve/route.ts
│           ├── reject/route.ts
│           └── revoke/route.ts
│
├── components/
│   ├── ui/                               ← shadcn/ui generated components
│   ├── layout/
│   │   ├── NavBar.tsx
│   │   └── Breadcrumb.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── StatsRow.tsx
│   │   ├── StatusDonutChart.tsx
│   │   └── RecentActivityFeed.tsx
│   ├── permits/
│   │   ├── PermitTable.tsx
│   │   ├── PermitRow.tsx
│   │   ├── PermitFilterBar.tsx
│   │   ├── PermitForm.tsx
│   │   ├── PermitDetailHeader.tsx
│   │   ├── PermitDetailFields.tsx
│   │   ├── PermitStatusTimeline.tsx
│   │   └── ActionDialog.tsx
│   └── shared/
│       ├── StatusBadge.tsx
│       ├── SkeletonCard.tsx
│       ├── SkeletonTable.tsx
│       ├── SkeletonDetail.tsx
│       ├── EmptyState.tsx
│       ├── ErrorState.tsx
│       └── Pagination.tsx
│
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── permit-service.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-permit-stats.ts
│   │   ├── use-permits.ts
│   │   ├── use-permit.ts
│   │   └── use-permit-mutations.ts
│   ├── utils/
│   │   ├── api-response.ts
│   │   └── errors.ts
│   └── validations/
│       ├── auth.schema.ts
│       └── permit.schema.ts
│
├── types/
│   └── index.ts                          ← Shared TypeScript interfaces
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── middleware.ts                         ← Route protection + auth redirect
├── next.config.js                        ← Security headers
├── .env.example
├── .gitignore
└── README.md
```

---

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| `/api/permits/stats` matched as `[id]` | `stats/route.ts` file is at same level as `[id]/` — Next.js App Router resolves static segments first |
| Prisma hot-reload connection exhaustion | Singleton pattern in `lib/db.ts` with `globalForPrisma` prevents multiple instances |
| JWT stored insecurely | Use httpOnly cookie via `setAuthCookie()`; also support `Authorization` header for API testing |
| `bcrypt` slow on seeding | Use `bcryptjs` (pure JS); cost factor 10 is fast enough for 1 seed user |
| TanStack Query stale dashboard data | `refetchOnWindowFocus: true` + `staleTime: 60_000`; lifecycle action mutations invalidate stats query |

---

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| `manager@permit2.dev` | `demo1234` | Manager |

---

*Plan generated: 2026-08-09 | Project: Permit2 | Ready for execution*
