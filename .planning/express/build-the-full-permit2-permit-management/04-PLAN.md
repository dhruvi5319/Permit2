---
phase: build-the-full-permit2-permit-management
plan: 04
type: execute
wave: 3
depends_on: [1, 2]
files_modified:
  - permit2/middleware.ts
  - permit2/app/(auth)/login/page.tsx
  - permit2/app/(auth)/layout.tsx
  - permit2/app/(protected)/layout.tsx
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
  - permit2/components/layout/Navbar.tsx
  - permit2/lib/hooks/use-permit.ts
  - permit2/lib/hooks/use-permit-mutations.ts
  - permit2/lib/api-client.ts
  - permit2/lib/hooks/use-auth.ts
autonomous: true

features:
  implements: ["F0", "F2", "F5", "F6"]
  depends_on: ["F9", "F8"]
  enables: []

must_haves:
  truths:
    - "Unauthenticated user visiting any protected route (/permits, /permits/new, /permits/:id) is redirected to /login?redirect=<original-url>"
    - "Already-authenticated user visiting /login is redirected to /dashboard"
    - "Login page: valid credentials (manager@permit2.dev / demo1234) redirect to /dashboard or ?redirect= URL"
    - "Login page: invalid credentials show inline error 'Invalid email or password.' (never reveals which field); password cleared"
    - "Login page: empty fields show inline validation without API call; Sign In button enters loading state during request"
    - "Permit creation form at /permits/new: all required fields (Title, Type, Applicant, Start Date, End Date, Description) with inline validation on blur and submit"
    - "Permit creation: End date before start date shows 'End date must be on or after the start date.' inline error"
    - "Permit creation: successful submit POSTs to /api/permits, navigates to /permits/:newId"
    - "Permit detail at /permits/:id shows full permit (title, type, applicant, description, notes, dates, status badge, rejection/revocation reason if applicable)"
    - "Permit detail: skeleton shown during load; 404 state if permit not found"
    - "Permit detail: breadcrumb 'Dashboard / Permits / [Title]' + '← Back to Permits' link"
    - "Permit detail: PENDING permit shows Approve (green) + Reject (red) buttons; APPROVED shows Revoke (amber); terminal states show muted label"
    - "Action dialogs: Approve dialog has optional notes; Reject/Revoke dialogs have optional reason (max 500 chars)"
    - "Action dialogs: permit title displayed in dialog body; non-dismissible during API call"
    - "Action success: TanStack Query cache invalidated; status badge and buttons update in-place; success toast shown"
    - "?action=approve|reject|revoke on detail page auto-opens relevant dialog; invalid action for current status shows toast instead"
    - "Toast: success=green border, 5s auto-dismiss; error=red border, 8s auto-dismiss; manual dismiss button"
  artifacts:
    - path: "permit2/middleware.ts"
      provides: "Next.js middleware: JWT cookie check, redirect unauthenticated to /login?redirect=, redirect authenticated /login to /dashboard"
      contains: "matcher"
    - path: "permit2/app/(auth)/login/page.tsx"
      provides: "Login page: branded card, RHF+Zod form, calls POST /api/auth/login, sets httpOnly cookie via API, redirects on success"
      contains: "Sign in to Permit2"
    - path: "permit2/app/(protected)/permits/new/page.tsx"
      provides: "Create permit page: breadcrumb, PermitForm, navigates to /permits/:id on success"
      contains: "Create New Permit"
    - path: "permit2/app/(protected)/permits/[id]/page.tsx"
      provides: "Permit detail page: loads permit via use-permit hook, PermitDetailHeader, PermitDetailFields, PermitStatusTimeline, ActionDialog, handles ?action param"
      contains: "PermitDetailHeader"
    - path: "permit2/components/permits/PermitForm.tsx"
      provides: "RHF+Zod form with all 7 fields, inline validation, submit loading state"
      exports: ["PermitForm"]
    - path: "permit2/components/permits/PermitDetailHeader.tsx"
      provides: "Title, large StatusBadge, action buttons (Approve/Reject/Revoke) conditional on status"
      exports: ["PermitDetailHeader"]
    - path: "permit2/components/permits/PermitDetailFields.tsx"
      provides: "Two-column details grid: left (applicant, type, description, notes), right (dates, rejection/revocation reason alert)"
      exports: ["PermitDetailFields"]
    - path: "permit2/components/permits/PermitStatusTimeline.tsx"
      provides: "Chronological timeline of status_history events with dots and vertical line"
      exports: ["PermitStatusTimeline"]
    - path: "permit2/components/permits/ActionDialog.tsx"
      provides: "Reusable dialog: approve (green), reject (red, optional reason), revoke (amber, optional reason); non-dismissible during load"
      exports: ["ActionDialog"]
    - path: "permit2/components/ui/StatusBadge.tsx"
      provides: "Pill badge: PENDING=amber, APPROVED=emerald, REJECTED=red, REVOKED=gray"
      exports: ["StatusBadge"]
    - path: "permit2/components/ui/Toast.tsx"
      provides: "Toast provider: bottom-right, green/red/info variants, 5s/8s auto-dismiss, manual dismiss"
      exports: ["ToastProvider", "useToast"]
    - path: "permit2/lib/hooks/use-permit.ts"
      provides: "TanStack Query hook: usePermit(id) — fetches GET /api/permits/:id"
      exports: ["usePermit"]
    - path: "permit2/lib/hooks/use-permit-mutations.ts"
      provides: "TanStack Query mutations: useApprovePermit, useRejectPermit, useRevokePermit — invalidate cache on success"
      exports: ["useApprovePermit", "useRejectPermit", "useRevokePermit"]
    - path: "permit2/lib/hooks/use-auth.ts"
      provides: "useAuth hook: fetches /api/auth/me, exposes user + logout function"
      exports: ["useAuth"]
    - path: "permit2/lib/api-client.ts"
      provides: "Typed fetch wrapper for all API endpoints — GET /api/permits/:id, PATCH /api/permits/:id/approve|reject|revoke, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me"
      exports: ["apiClient"]
  key_links:
    - from: "permit2/middleware.ts"
      to: "permit2/lib/auth.ts"
      via: "verifyToken on cookie 'token' for all (protected) routes"
      pattern: "verifyToken"
    - from: "permit2/app/(auth)/login/page.tsx"
      to: "POST /api/auth/login"
      via: "fetch via apiClient.auth.login"
      pattern: "api/auth/login"
    - from: "permit2/app/(protected)/permits/[id]/page.tsx"
      to: "permit2/lib/hooks/use-permit.ts"
      via: "usePermit(id) TanStack Query hook"
      pattern: "usePermit"
    - from: "permit2/components/permits/ActionDialog.tsx"
      to: "permit2/lib/hooks/use-permit-mutations.ts"
      via: "useApprovePermit | useRejectPermit | useRevokePermit mutation"
      pattern: "useApprovePermit|useRejectPermit|useRevokePermit"
    - from: "permit2/lib/hooks/use-permit-mutations.ts"
      to: "PATCH /api/permits/:id/approve|reject|revoke"
      via: "apiClient.permits.approve|reject|revoke"
      pattern: "api/permits.*approve|reject|revoke"

integration_contracts:
  requires:
    - from_plan: "01"
      artifact: "permit2/prisma/schema.prisma"
      exports: ["User", "Permit", "PermitStatusHistory", "PermitStatus", "PermitType"]
      verify: "grep -n 'model User' permit2/prisma/schema.prisma && grep -n 'model Permit ' permit2/prisma/schema.prisma && echo CONTRACT_OK"
    - from_plan: "02"
      artifact: "permit2/app/api/auth/login/route.ts"
      exports: ["POST /api/auth/login"]
      verify: "grep -n 'export async function POST' permit2/app/api/auth/login/route.ts && echo CONTRACT_OK"
    - from_plan: "02"
      artifact: "permit2/app/api/permits/[id]/route.ts"
      exports: ["GET /api/permits/:id"]
      verify: "grep -n 'export async function GET' permit2/app/api/permits/\\[id\\]/route.ts && echo CONTRACT_OK"
    - from_plan: "02"
      artifact: "permit2/app/api/permits/[id]/approve/route.ts"
      exports: ["PATCH /api/permits/:id/approve"]
      verify: "grep -n 'export async function PATCH' permit2/app/api/permits/\\[id\\]/approve/route.ts && echo CONTRACT_OK"
    - from_plan: "02"
      artifact: "permit2/app/api/permits/[id]/reject/route.ts"
      exports: ["PATCH /api/permits/:id/reject"]
      verify: "grep -n 'export async function PATCH' permit2/app/api/permits/\\[id\\]/reject/route.ts && echo CONTRACT_OK"
    - from_plan: "02"
      artifact: "permit2/app/api/permits/[id]/revoke/route.ts"
      exports: ["PATCH /api/permits/:id/revoke"]
      verify: "grep -n 'export async function PATCH' permit2/app/api/permits/\\[id\\]/revoke/route.ts && echo CONTRACT_OK"
    - from_plan: "02"
      artifact: "permit2/app/api/permits/route.ts"
      exports: ["POST /api/permits"]
      verify: "grep -n 'export async function POST' permit2/app/api/permits/route.ts && echo CONTRACT_OK"
  provides:
    - artifact: "permit2/components/ui/StatusBadge.tsx"
      exports: ["StatusBadge"]
      shape: "export function StatusBadge({ status }: { status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED' }): JSX.Element"
      verify: "grep -n 'export function StatusBadge' permit2/components/ui/StatusBadge.tsx && echo CONTRACT_OK"
    - artifact: "permit2/components/ui/Toast.tsx"
      exports: ["ToastProvider", "useToast"]
      shape: |
        export function ToastProvider({ children }: { children: ReactNode }): JSX.Element
        export function useToast(): { success(msg: string): void; error(msg: string): void; info(msg: string): void }
      verify: "grep -n 'export function ToastProvider' permit2/components/ui/Toast.tsx && grep -n 'export function useToast' permit2/components/ui/Toast.tsx && echo CONTRACT_OK"
    - artifact: "permit2/components/layout/Navbar.tsx"
      exports: ["Navbar"]
      shape: "export function Navbar(): JSX.Element — shows logo, Dashboard link, Permits link, user name, Logout button"
      verify: "grep -n 'export function Navbar' permit2/components/layout/Navbar.tsx && echo CONTRACT_OK"
    - artifact: "permit2/lib/api-client.ts"
      exports: ["apiClient"]
      shape: |
        export const apiClient = {
          auth: { login, logout, me },
          permits: { list, getById, create, approve, reject, revoke, stats }
        }
      verify: "grep -n 'export const apiClient' permit2/lib/api-client.ts && echo CONTRACT_OK"
    - artifact: "permit2/lib/hooks/use-permit.ts"
      exports: ["usePermit"]
      shape: "export function usePermit(id: string): UseQueryResult<PermitDetail>"
      verify: "grep -n 'export function usePermit' permit2/lib/hooks/use-permit.ts && echo CONTRACT_OK"
    - artifact: "permit2/lib/hooks/use-permit-mutations.ts"
      exports: ["useApprovePermit", "useRejectPermit", "useRevokePermit", "useCreatePermit"]
      shape: |
        export function useApprovePermit(): UseMutationResult
        export function useRejectPermit(): UseMutationResult
        export function useRevokePermit(): UseMutationResult
        export function useCreatePermit(): UseMutationResult
      verify: "grep -n 'export function useApprovePermit' permit2/lib/hooks/use-permit-mutations.ts && grep -n 'export function useCreatePermit' permit2/lib/hooks/use-permit-mutations.ts && echo CONTRACT_OK"
---

<objective>
Build the authentication, permit creation, permit detail, and lifecycle action UI — the core workflow surfaces for the Permit2 POC.

Purpose: Wave 3b delivers the four most critical user-facing flows: login (F0), permit creation (F2), full permit detail view (F5), and approve/reject/revoke lifecycle actions (F6). Together with Wave 3a (dashboard + list), these cover the entire user journey.
Output: Next.js middleware route guard, login page, create-permit page, permit detail page, six shared components (PermitForm, PermitDetailHeader, PermitDetailFields, PermitStatusTimeline, ActionDialog, StatusBadge), toast system, TanStack Query hooks, and a typed API client.
</objective>

<feature_dependencies>
Implements: F0: Manager Authentication (login page UI, middleware route guard, redirect flows, logout in nav), F2: Permit Creation (RHF+Zod form, all 7 fields, inline validation, POST /api/permits), F5: Permit Detail View (full detail layout, skeleton, 404 state, breadcrumb, status history timeline), F6: Lifecycle Actions (Approve/Reject/Revoke dialogs, cache invalidation, in-place update, toast feedback)
Depends on: F9: Permit Data Model (Prisma schema from Wave 1), F8: Permit Data API (all REST endpoints from Wave 2)
Enables: None (Wave 4 integration finalizes env config, E2E wiring, README)
</feature_dependencies>

<execution_context>
@/root/.local/share/pivota/opencode-xdg/opencode/pivota_spec-framework/workflows/execute-plan.md
</execution_context>

<context>
@permit2/package.json
@permit2/app/layout.tsx
@.planning/express/build-the-full-permit2-permit-management/01-PLAN.md
@.planning/express/build-the-full-permit2-permit-management/02-PLAN.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Foundation — middleware, route groups, API client, auth hook, toast system, StatusBadge, Skeleton, Navbar</name>
  <files>
    permit2/middleware.ts
    permit2/app/(auth)/layout.tsx
    permit2/app/(protected)/layout.tsx
    permit2/components/ui/StatusBadge.tsx
    permit2/components/ui/Toast.tsx
    permit2/components/ui/Skeleton.tsx
    permit2/components/layout/Navbar.tsx
    permit2/lib/api-client.ts
    permit2/lib/hooks/use-auth.ts
  </files>
  <action>
Work inside `permit2/` (the Next.js 16 App Router root). All paths below are relative to it.

---

**Step 1 — Rewrite `middleware.ts`** (replaces the API-only middleware from Wave 2 with a full page-route guard):

The Wave 2 middleware only matched `/api/:path*`. This step extends it to protect page routes while also preserving the API protection. Do NOT add `X-Frame-Options: DENY` (Pivota preview iframe compatibility).

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// Routes that do NOT require authentication
const PUBLIC_PATHS = new Set(['/login', '/api/auth/login']);

// Routes that are always public even as prefixes
function isPublic(pathname: string): boolean {
  return (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/auth/login')
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (isPublic(pathname)) {
    // If already authenticated and visiting /login → redirect to /dashboard
    if (pathname === '/login') {
      const cookieToken = request.cookies.get('token')?.value;
      if (cookieToken) {
        try {
          verifyToken(cookieToken);
          return NextResponse.redirect(new URL('/dashboard', request.url));
        } catch {
          // Token invalid — let login page render
        }
      }
    }
    return NextResponse.next();
  }

  // Verify token for all other paths (page routes + /api/* except /api/auth/login)
  const cookieToken = request.cookies.get('token')?.value;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = bearerToken ?? cookieToken;

  if (!token) {
    // API routes → 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { data: null, error: { code: 'AUTH_UNAUTHORIZED', message: 'Authentication required.' }, meta: {} },
        { status: 401 }
      );
    }
    // Page routes → redirect to /login with ?redirect= param
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  try {
    verifyToken(token);
    return NextResponse.next();
  } catch (err: unknown) {
    const appErr = err as { code?: string; message?: string };
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          data: null,
          error: { code: appErr.code ?? 'AUTH_UNAUTHORIZED', message: appErr.message ?? 'Authentication required.' },
          meta: {},
        },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    // Match all routes EXCEPT Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

**Step 2 — Create `app/(auth)/layout.tsx`** (unauthenticated route group — plain layout, no navbar):

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
```

---

**Step 3 — Create `app/(protected)/layout.tsx`** (authenticated route group with navbar and TanStack Query + Toast providers):

First, create `components/providers/QueryProvider.tsx` — a client component that wraps TanStack Query:

```typescript
// components/providers/QueryProvider.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1 },
    },
  }));
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

Then create `app/(protected)/layout.tsx`:

```typescript
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { Navbar } from '@/components/layout/Navbar';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-[1280px] mx-auto px-6 py-8">
            {children}
          </main>
        </div>
      </ToastProvider>
    </QueryProvider>
  );
}
```

---

**Step 4 — Create `components/ui/StatusBadge.tsx`**

Per UX-Mockup Pattern 01 — pill badges, same component used everywhere:

```typescript
'use client';

type PermitStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';

const STATUS_STYLES: Record<PermitStatus, { bg: string; text: string; label: string }> = {
  PENDING:  { bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Pending'  },
  APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Approved' },
  REJECTED: { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Rejected' },
  REVOKED:  { bg: 'bg-gray-100',    text: 'text-gray-600',    label: 'Revoked'  },
};

interface StatusBadgeProps {
  status: PermitStatus;
  size?: 'sm' | 'lg';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const { bg, text, label } = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
  const padding = size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${bg} ${text} ${padding}`}>
      {label}
    </span>
  );
}
```

---

**Step 5 — Create `components/ui/Skeleton.tsx`**

Shimmer skeleton per UX-Mockup Pattern 03:

```typescript
import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
        className
      )}
      style={{ animation: 'shimmer 1.5s linear infinite' }}
    />
  );
}
```

Also add the shimmer keyframe to `app/globals.css` (append, do not remove existing styles):

```css
@keyframes shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}
```

Create `lib/utils.ts` if it doesn't exist:
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Install `clsx` and `tailwind-merge` if not present:
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2 && npm list clsx 2>/dev/null | grep clsx || npm install clsx tailwind-merge
```

---

**Step 6 — Create `components/ui/Toast.tsx`**

Custom toast system per UX-Mockup Pattern 02 — bottom-right, green/red borders, 5s/8s dismiss, manual dismiss, up to 3 stacked. Uses React Context + `createPortal`.

```typescript
'use client';
import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION: Record<ToastType, number> = {
  success: 5000,
  error: 8000,
  info: 5000,
};

const TOAST_STYLES: Record<ToastType, { border: string; bg: string; text: string }> = {
  success: { border: 'border-l-4 border-green-600', bg: 'bg-green-50', text: 'text-green-800' },
  error:   { border: 'border-l-4 border-red-600',   bg: 'bg-red-50',   text: 'text-red-800'   },
  info:    { border: 'border-l-4 border-blue-600',  bg: 'bg-blue-50',  text: 'text-blue-800'  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { border, bg, text } = TOAST_STYLES[toast.type];
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timer.current = setTimeout(() => onDismiss(toast.id), TOAST_DURATION[toast.type]);
    return () => clearTimeout(timer.current);
  }, [toast.id, toast.type, onDismiss]);

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={`flex items-start gap-3 min-w-[280px] max-w-[380px] rounded-lg shadow-lg p-4 ${border} ${bg} animate-in slide-in-from-right-4 fade-in duration-300`}
    >
      <p className={`flex-1 text-sm font-medium ${text}`}>{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className={`flex-shrink-0 ${text} hover:opacity-70 transition-opacity`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => {
      const next = [...prev, { id, type, message }];
      // Keep max 3 toasts — remove oldest if over limit
      return next.length > 3 ? next.slice(next.length - 3) : next;
    });
  }, []);

  const ctx: ToastContextValue = {
    success: (msg) => addToast('success', msg),
    error:   (msg) => addToast('error', msg),
    info:    (msg) => addToast('info', msg),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {typeof window !== 'undefined' &&
        createPortal(
          <div
            aria-live="polite"
            className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
          >
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
```

Note: `animate-in`, `slide-in-from-right-4`, `fade-in` are Tailwind CSS v4 animation utilities. If they are not available, replace with a simpler transition by adding an `opacity-0 translate-x-4 → opacity-100 translate-x-0` pattern using `useEffect`.

---

**Step 7 — Create `components/layout/Navbar.tsx`**

Sticky top nav per UX-Mockup Screen 01/02 layout — logo, Dashboard, Permits links, user name, Logout:

```typescript
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/components/ui/Toast';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/permits',   label: 'Permits'   },
  ];

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore — clear cookie client-side regardless
    }
    router.push('/login');
  }

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-40 bg-white border-b border-gray-200 h-16"
    >
      <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center gap-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 text-indigo-600 font-bold text-lg flex-shrink-0">
          <Shield className="w-5 h-5" aria-hidden="true" />
          Permit2
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-1">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
```

---

**Step 8 — Create `lib/api-client.ts`**

Typed fetch wrapper for all API calls. Returns typed responses — UI components import only from here, never raw fetch.

```typescript
const BASE = '';  // Same origin — Next.js handles routing

type ApiEnvelope<T> = { data: T; error: null; meta: Record<string, unknown> } | { data: null; error: { code: string; message: string; details?: Array<{ field: string; message: string }> }; meta: Record<string, unknown> };

async function request<T>(path: string, options?: RequestInit): Promise<ApiEnvelope<T>> {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  });
  return res.json() as Promise<ApiEnvelope<T>>;
}

export interface UserProfile { id: string; email: string; name: string }

export interface PermitSummary {
  id: string; title: string; type: string; applicant_name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';
  start_date: string; end_date: string; created_at: string; updated_at: string;
}

export interface HistoryEntry {
  id: string; status: string; event: string; actor_name: string; notes: string | null; created_at: string;
}

export interface PermitDetail extends PermitSummary {
  description: string; notes: string | null;
  rejection_reason: string | null; revocation_reason: string | null;
  created_by: string;
  status_history: HistoryEntry[];
}

export interface PermitStats { total: number; pending: number; approved: number; rejected: number; revoked: number }

export interface CreatePermitInput {
  title: string; type: string; applicant_name: string;
  description: string; notes?: string | null;
  start_date: string; end_date: string;
}

export interface ListMeta { total: number; page: number; limit: number; totalPages: number }

export const apiClient = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: UserProfile }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    logout: () => request<{ message: string }>('/api/auth/logout', { method: 'POST' }),
    me: () => request<UserProfile>('/api/auth/me'),
  },
  permits: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ items: PermitSummary[] }>(`/api/permits${qs}`);
    },
    getById: (id: string) => request<PermitDetail>(`/api/permits/${id}`),
    create: (data: CreatePermitInput) =>
      request<PermitDetail>('/api/permits', { method: 'POST', body: JSON.stringify(data) }),
    approve: (id: string, notes?: string | null) =>
      request<PermitDetail>(`/api/permits/${id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ notes: notes ?? null }),
      }),
    reject: (id: string, reason?: string | null) =>
      request<PermitDetail>(`/api/permits/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: reason ?? null }),
      }),
    revoke: (id: string, reason?: string | null) =>
      request<PermitDetail>(`/api/permits/${id}/revoke`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: reason ?? null }),
      }),
    stats: () => request<PermitStats>('/api/permits/stats'),
  },
};
```

---

**Step 9 — Create `lib/hooks/use-auth.ts`**

```typescript
'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, type UserProfile } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user, isLoading } = useQuery<UserProfile | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await apiClient.auth.me();
      if (res.error) return null;
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  async function logout() {
    try { await apiClient.auth.logout(); } catch { /* ignore */ }
    queryClient.clear();
    router.push('/login');
  }

  return { user: user ?? null, isLoading, logout };
}
```
  </action>
  <verify>
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2

grep -n 'loginUrl.searchParams.set' middleware.ts && echo "MIDDLEWARE_REDIRECT_OK"
grep -n 'export function StatusBadge' components/ui/StatusBadge.tsx && echo "BADGE_OK"
grep -n 'export function ToastProvider' components/ui/Toast.tsx && echo "TOAST_PROVIDER_OK"
grep -n 'export function useToast' components/ui/Toast.tsx && echo "TOAST_HOOK_OK"
grep -n 'export function Navbar' components/layout/Navbar.tsx && echo "NAVBAR_OK"
grep -n 'export const apiClient' lib/api-client.ts && echo "API_CLIENT_OK"
grep -n 'export function useAuth' lib/hooks/use-auth.ts && echo "USE_AUTH_OK"
grep -n 'matcher' middleware.ts && echo "MIDDLEWARE_MATCHER_OK"
npx tsc --noEmit --skipLibCheck 2>&1 | head -30 || true
```
  </verify>
  <done>
- `middleware.ts` redirects unauthenticated page requests to `/login?redirect=<original-url>`; redirects authenticated `/login` visits to `/dashboard`; returns 401 JSON for unauthenticated API requests; does NOT set X-Frame-Options DENY
- `app/(auth)/layout.tsx` exists with indigo gradient background
- `app/(protected)/layout.tsx` exists with Navbar + ToastProvider + QueryProvider wrappers
- `components/ui/StatusBadge.tsx` exports StatusBadge with amber/emerald/red/gray variants
- `components/ui/Toast.tsx` exports ToastProvider and useToast; success=5s, error=8s auto-dismiss; manual dismiss button; max 3 stacked
- `components/layout/Navbar.tsx` exports Navbar with logo, Dashboard + Permits nav links (aria-current), user name, Logout button
- `lib/api-client.ts` exports apiClient with auth.{login,logout,me} and permits.{list,getById,create,approve,reject,revoke,stats}
- `lib/hooks/use-auth.ts` exports useAuth with user, isLoading, logout
  </done>
</task>

<task type="auto">
  <name>Task 2: Login page (F0) + Permit creation form (F2) — pages and PermitForm component</name>
  <files>
    permit2/app/(auth)/login/page.tsx
    permit2/components/permits/PermitForm.tsx
    permit2/app/(protected)/permits/new/page.tsx
  </files>
  <action>
Work inside `permit2/`. All these files are new — create them from scratch.

---

**Step 1 — Create `app/(auth)/login/page.tsx`**

Per UX-Mockup Screen 00: branded card, email + password RHF+Zod, loading state, inline errors, auth error banner, redirect param support.

```typescript
'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';

const loginSchema = z.object({
  email:    z.string({ required_error: 'Email is required.' }).email('Please enter a valid email address.'),
  password: z.string({ required_error: 'Password is required.' }).min(1, 'Password is required.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  // Auto-focus email on mount
  useEffect(() => { setFocus('email'); }, [setFocus]);

  async function onSubmit(data: LoginFormData) {
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await apiClient.auth.login(data.email, data.password);
      if (res.error) {
        // Generic error — never reveal which field is wrong
        setAuthError('Invalid email or password.');
        setValue('password', '');
        setFocus('password');
        return;
      }
      // Redirect to ?redirect param or /dashboard
      const redirect = searchParams.get('redirect') ?? '/dashboard';
      // Validate redirect is a relative path (security: prevent open redirect)
      const safe = redirect.startsWith('/') ? redirect : '/dashboard';
      router.push(safe);
    } catch {
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white rounded-xl shadow-md p-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-6 h-6 text-indigo-600" aria-hidden="true" />
          <span className="text-indigo-600 font-bold text-xl">Permit2</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in to Permit2</h1>
        <p className="text-sm text-gray-500 mb-8">Manage your permits in one place</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isLoading}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              placeholder="manager@company.com"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              {...register('password')}
            />
            {errors.password && (
              <p id="password-error" role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Auth error banner */}
          {authError && (
            <div
              role="alert"
              className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {authError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-indigo-700 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in…
              </>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>
      </div>

      {/* Caption */}
      <p className="text-center text-xs text-gray-400 mt-4">Permit2 POC — Restricted Access</p>
    </div>
  );
}
```

---

**Step 2 — Create `components/permits/PermitForm.tsx`**

RHF+Zod form with all 7 fields per UX-Mockup Screen 03. Validates inline on blur, scrolls to first error on submit, disabled during loading.

```typescript
'use client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const PERMIT_TYPES = [
  { value: 'WORK',     label: 'Work Permit' },
  { value: 'ACCESS',   label: 'Access Permit' },
  { value: 'ACTIVITY', label: 'Activity Authorization' },
  { value: 'SAFETY',   label: 'Safety Permit' },
  { value: 'OTHER',    label: 'Other' },
] as const;

const permitFormSchema = z.object({
  title: z.string().min(1, 'Permit title is required.').max(255, 'Title must not exceed 255 characters.'),
  type:  z.enum(['WORK', 'ACCESS', 'ACTIVITY', 'SAFETY', 'OTHER'], {
    required_error: 'Please select a permit type.',
    invalid_type_error: 'Please select a permit type.',
  }),
  applicant_name: z.string().min(1, 'Applicant name is required.').max(255, 'Name must not exceed 255 characters.'),
  start_date:     z.string().min(1, 'Start date is required.').regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format.'),
  end_date:       z.string().min(1, 'End date is required.').regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format.'),
  description:    z.string().min(1, 'Description is required.').max(2000, 'Description must not exceed 2000 characters.'),
  notes:          z.string().max(1000, 'Notes must not exceed 1000 characters.').optional(),
}).refine(
  (d) => !d.start_date || !d.end_date || new Date(d.end_date) >= new Date(d.start_date),
  { message: 'End date must be on or after the start date.', path: ['end_date'] }
);

export type PermitFormData = z.infer<typeof permitFormSchema>;

interface PermitFormProps {
  onSubmit: (data: PermitFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

// Helper: field wrapper with label, error, and success indicator
function Field({
  label, required, htmlFor, error, touched, children,
}: {
  label: string; required?: boolean; htmlFor: string;
  error?: string; touched?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        {children}
        {touched && !error && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" aria-hidden="true" />
        )}
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputBase = (error?: string, hasSuccess?: boolean) =>
  `w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed ${
    error ? 'border-red-500 bg-red-50' : hasSuccess ? 'border-emerald-500 pr-9' : 'border-gray-300'
  }`;

export function PermitForm({ onSubmit, onCancel, isSubmitting = false, submitError }: PermitFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    setFocus,
  } = useForm<PermitFormData>({
    resolver: zodResolver(permitFormSchema),
    mode: 'onBlur',
  });

  async function handleFormSubmit(data: PermitFormData) {
    await onSubmit(data);
  }

  function handleInvalidSubmit() {
    // Scroll to and focus first error field
    const fieldOrder: (keyof PermitFormData)[] = ['title', 'type', 'applicant_name', 'start_date', 'end_date', 'description', 'notes'];
    for (const field of fieldOrder) {
      if (errors[field]) {
        setFocus(field);
        break;
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, handleInvalidSubmit)} noValidate>
      {/* ── Basic Information ─────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 pb-2 border-b border-gray-100">
          Basic Information
        </h2>
        <div className="space-y-5">
          <Field label="Permit Title" required htmlFor="title" error={errors.title?.message} touched={touchedFields.title && !errors.title}>
            <input
              id="title"
              type="text"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.title}
              placeholder="e.g., Electrical Work — Building A"
              className={inputBase(errors.title?.message, touchedFields.title && !errors.title)}
              {...register('title')}
            />
          </Field>

          <Field label="Permit Type" required htmlFor="type" error={errors.type?.message} touched={touchedFields.type && !errors.type}>
            <select
              id="type"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.type}
              className={inputBase(errors.type?.message, touchedFields.type && !errors.type) + ' appearance-none'}
              {...register('type')}
            >
              <option value="">Select a permit type…</option>
              {PERMIT_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>

          <Field label="Applicant / Requester Name" required htmlFor="applicant_name" error={errors.applicant_name?.message} touched={touchedFields.applicant_name && !errors.applicant_name}>
            <input
              id="applicant_name"
              type="text"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.applicant_name}
              placeholder="Full name of the permit requester"
              className={inputBase(errors.applicant_name?.message, touchedFields.applicant_name && !errors.applicant_name)}
              {...register('applicant_name')}
            />
          </Field>
        </div>
      </div>

      {/* ── Dates ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 pb-2 border-b border-gray-100">
          Dates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Start Date" required htmlFor="start_date" error={errors.start_date?.message} touched={touchedFields.start_date && !errors.start_date}>
            <input
              id="start_date"
              type="date"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.start_date}
              className={inputBase(errors.start_date?.message, touchedFields.start_date && !errors.start_date)}
              {...register('start_date')}
            />
          </Field>

          <Field label="End Date" required htmlFor="end_date" error={errors.end_date?.message} touched={touchedFields.end_date && !errors.end_date}>
            <input
              id="end_date"
              type="date"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.end_date}
              className={inputBase(errors.end_date?.message, touchedFields.end_date && !errors.end_date)}
              {...register('end_date')}
            />
          </Field>
        </div>
      </div>

      {/* ── Details ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 pb-2 border-b border-gray-100">
          Details
        </h2>
        <div className="space-y-5">
          <Field label="Description / Purpose" required htmlFor="description" error={errors.description?.message} touched={touchedFields.description && !errors.description}>
            <textarea
              id="description"
              rows={4}
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.description}
              placeholder="Describe the purpose of this permit…"
              className={inputBase(errors.description?.message, touchedFields.description && !errors.description) + ' resize-none'}
              {...register('description')}
            />
          </Field>

          <Field label="Additional Notes (optional)" htmlFor="notes" error={errors.notes?.message} touched={touchedFields.notes && !errors.notes}>
            <textarea
              id="notes"
              rows={3}
              disabled={isSubmitting}
              aria-invalid={!!errors.notes}
              placeholder="Any additional information…"
              className={inputBase(errors.notes?.message, touchedFields.notes && !errors.notes) + ' resize-none'}
              {...register('notes')}
            />
          </Field>
        </div>
      </div>

      {/* API error */}
      {submitError && (
        <div role="alert" className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting…
            </>
          ) : (
            'Submit Permit'
          )}
        </button>
      </div>
    </form>
  );
}
```

---

**Step 3 — Create `app/(protected)/permits/new/page.tsx`**

Create permit page: breadcrumb, heading, PermitForm, handles submit + cancel, navigates to detail on success.

```typescript
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { PermitForm, type PermitFormData } from '@/components/permits/PermitForm';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/api-client';

export default function NewPermitPage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(data: PermitFormData) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await apiClient.permits.create({
        title:          data.title,
        type:           data.type,
        applicant_name: data.applicant_name,
        description:    data.description,
        notes:          data.notes || null,
        start_date:     data.start_date,
        end_date:       data.end_date,
      });
      if (res.error) {
        const fieldErrors = res.error.details?.map((d) => d.message).join(', ');
        setSubmitError(fieldErrors ? `Permit could not be created: ${fieldErrors}` : (res.error.message ?? 'An unexpected error occurred.'));
        return;
      }
      // Navigate to new permit's detail page
      router.push(`/permits/${res.data.id}`);
    } catch {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    router.back();
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-700 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <Link href="/permits" className="hover:text-gray-700 transition-colors">Permits</Link>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <span className="text-gray-400" aria-current="page">New Permit</span>
      </nav>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Permit</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details below to submit a new permit request.</p>
      </div>

      {/* Form card */}
      <div className="max-w-[720px] bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <PermitForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      </div>
    </div>
  );
}
```
  </action>
  <verify>
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2

grep -n "Sign in to Permit2" app/\(auth\)/login/page.tsx && echo "LOGIN_HEADING_OK"
grep -n "Invalid email or password" app/\(auth\)/login/page.tsx && echo "LOGIN_ERROR_MSG_OK"
grep -n "apiClient.auth.login" app/\(auth\)/login/page.tsx && echo "LOGIN_API_CALL_OK"
grep -n "searchParams.get.*redirect" app/\(auth\)/login/page.tsx && echo "LOGIN_REDIRECT_OK"
grep -n "export function PermitForm" components/permits/PermitForm.tsx && echo "PERMIT_FORM_OK"
grep -n "End date must be on or after" components/permits/PermitForm.tsx && echo "DATE_VALIDATION_OK"
grep -n "applicant_name" components/permits/PermitForm.tsx && echo "APPLICANT_FIELD_OK"
grep -n "Submit Permit" components/permits/PermitForm.tsx && echo "SUBMIT_BUTTON_OK"
grep -n "apiClient.permits.create" app/\(protected\)/permits/new/page.tsx && echo "CREATE_API_OK"
grep -n "router.push.*permits.*res.data.id" app/\(protected\)/permits/new/page.tsx && echo "CREATE_NAVIGATE_OK"
grep -n "Dashboard.*Permits.*New Permit" app/\(protected\)/permits/new/page.tsx || grep -n "breadcrumb\|Breadcrumb" app/\(protected\)/permits/new/page.tsx && echo "BREADCRUMB_OK"
npx tsc --noEmit --skipLibCheck 2>&1 | head -30 || true
```
  </verify>
  <done>
- `app/(auth)/login/page.tsx`: card with "Sign in to Permit2" heading, email + password inputs, RHF+Zod inline validation on blur, loading spinner + "Signing in…", inline auth error "Invalid email or password.", reads ?redirect param, redirects to /dashboard on success
- Login: empty fields show validation errors WITHOUT API call; API 401 shows generic error; password cleared + focus to password on auth error
- `components/permits/PermitForm.tsx`: all 7 fields (title, type select, applicant_name, start_date, end_date, description, notes), Zod validation, end-date cross-field check, green ✓ on valid blur, scroll-to-first-error on submit, disabled during isSubmitting
- `app/(protected)/permits/new/page.tsx`: breadcrumb "Dashboard / Permits / New Permit", Create New Permit heading, PermitForm mounted, navigates to /permits/:id on success, back() on cancel
  </done>
</task>

<task type="auto">
  <name>Task 3: Permit detail page (F5) + lifecycle action dialogs (F6) — components and page</name>
  <files>
    permit2/lib/hooks/use-permit.ts
    permit2/lib/hooks/use-permit-mutations.ts
    permit2/components/permits/PermitDetailHeader.tsx
    permit2/components/permits/PermitDetailFields.tsx
    permit2/components/permits/PermitStatusTimeline.tsx
    permit2/components/permits/ActionDialog.tsx
    permit2/app/(protected)/permits/[id]/page.tsx
  </files>
  <action>
Work inside `permit2/`. Create data hooks first, then components, then the page.

---

**Step 1 — Create `lib/hooks/use-permit.ts`**

```typescript
'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient, type PermitDetail } from '@/lib/api-client';

export function usePermit(id: string) {
  return useQuery<PermitDetail | null, Error>({
    queryKey: ['permit', id],
    queryFn: async () => {
      const res = await apiClient.permits.getById(id);
      if (res.error?.code === 'PERMIT_NOT_FOUND') return null; // triggers 404 state
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}
```

---

**Step 2 — Create `lib/hooks/use-permit-mutations.ts`**

TanStack Query mutations for lifecycle actions + permit creation. On success, invalidates the `['permit', id]` cache query so the detail page re-fetches updated data in-place.

```typescript
'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useApprovePermit(permitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ notes }: { notes?: string | null }) => apiClient.permits.approve(permitId, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permit', permitId] });
      qc.invalidateQueries({ queryKey: ['permits'] });
    },
  });
}

export function useRejectPermit(permitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reason }: { reason?: string | null }) => apiClient.permits.reject(permitId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permit', permitId] });
      qc.invalidateQueries({ queryKey: ['permits'] });
    },
  });
}

export function useRevokePermit(permitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reason }: { reason?: string | null }) => apiClient.permits.revoke(permitId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permit', permitId] });
      qc.invalidateQueries({ queryKey: ['permits'] });
    },
  });
}

export function useCreatePermit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof apiClient.permits.create>[0]) => apiClient.permits.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permits'] });
    },
  });
}
```

---

**Step 3 — Create `components/permits/PermitDetailHeader.tsx`**

Title, large StatusBadge, action buttons conditional on status. Per UX-Mockup Screen 04 header card.

```typescript
'use client';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CheckCircle2, XCircle, Ban } from 'lucide-react';
import type { PermitDetail } from '@/lib/api-client';

interface PermitDetailHeaderProps {
  permit: PermitDetail;
  onApprove: () => void;
  onReject: () => void;
  onRevoke: () => void;
}

export function PermitDetailHeader({ permit, onApprove, onReject, onRevoke }: PermitDetailHeaderProps) {
  const { status, title, type, id } = permit;
  const isTerminal = status === 'REJECTED' || status === 'REVOKED';

  const TYPE_LABELS: Record<string, string> = {
    WORK: 'Work Permit', ACCESS: 'Access Permit', ACTIVITY: 'Activity Authorization',
    SAFETY: 'Safety Permit', OTHER: 'Other',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight flex-1">{title}</h1>
        <StatusBadge status={status} size="lg" />
      </div>

      {/* Subtitle */}
      <p className="text-sm text-gray-500 mb-5">
        {TYPE_LABELS[type] ?? type}
        <span className="mx-2 text-gray-300">·</span>
        Ref: {id.slice(0, 8).toUpperCase()}
      </p>

      {/* Action buttons */}
      {status === 'PENDING' && (
        <div className="flex items-center gap-3">
          <button
            onClick={onApprove}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            Approve
          </button>
          <button
            onClick={onReject}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <XCircle className="w-4 h-4" aria-hidden="true" />
            Reject
          </button>
        </div>
      )}

      {status === 'APPROVED' && (
        <div>
          <button
            onClick={onRevoke}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
          >
            <Ban className="w-4 h-4" aria-hidden="true" />
            Revoke
          </button>
        </div>
      )}

      {isTerminal && (
        <p className="text-sm text-gray-400 italic">
          This permit is in a terminal state and cannot be modified.
        </p>
      )}
    </div>
  );
}
```

---

**Step 4 — Create `components/permits/PermitDetailFields.tsx`**

Two-column details grid per UX-Mockup Screen 04. Rejection/revocation reason as highlighted alert blocks.

```typescript
'use client';
import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import type { PermitDetail } from '@/lib/api-client';

const TYPE_LABELS: Record<string, string> = {
  WORK: 'Work Permit', ACCESS: 'Access Permit', ACTIVITY: 'Activity Authorization',
  SAFETY: 'Safety Permit', OTHER: 'Other',
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</dt>
      <dd className="text-sm text-gray-800">{value || <span className="text-gray-400 italic">—</span>}</dd>
    </div>
  );
}

function formatDate(iso: string) {
  try { return format(new Date(iso), 'dd MMM yyyy'); } catch { return iso; }
}

function formatDateTime(iso: string) {
  try { return format(new Date(iso), 'dd MMM yyyy, HH:mm'); } catch { return iso; }
}

interface PermitDetailFieldsProps { permit: PermitDetail }

export function PermitDetailFields({ permit }: PermitDetailFieldsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Left column — Permit Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">Permit Information</h2>
        <dl className="space-y-5">
          <Field label="Applicant Name" value={permit.applicant_name} />
          <Field label="Permit Type" value={TYPE_LABELS[permit.type] ?? permit.type} />
          <Field
            label="Description / Purpose"
            value={<p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{permit.description}</p>}
          />
          {permit.notes && (
            <Field
              label="Additional Notes"
              value={<p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{permit.notes}</p>}
            />
          )}
        </dl>
      </div>

      {/* Right column — Dates & Status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">Dates &amp; Status</h2>
        <dl className="space-y-5">
          <Field label="Start Date" value={formatDate(permit.start_date)} />
          <Field label="End Date" value={formatDate(permit.end_date)} />
          <Field label="Created" value={formatDateTime(permit.created_at)} />
          <Field label="Last Updated" value={formatDateTime(permit.updated_at)} />
        </dl>

        {/* Rejection Reason — red alert */}
        {permit.status === 'REJECTED' && permit.rejection_reason && (
          <div className="mt-5 rounded-lg border-l-4 border-red-400 bg-red-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              Rejection Reason
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{permit.rejection_reason}</p>
          </div>
        )}

        {/* Revocation Reason — amber alert */}
        {permit.status === 'REVOKED' && permit.revocation_reason && (
          <div className="mt-5 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              Revocation Reason
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{permit.revocation_reason}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

**Step 5 — Create `components/permits/PermitStatusTimeline.tsx`**

Chronological timeline per UX-Mockup Screen 04 and Pattern 01. Dots with vertical connector line.

```typescript
'use client';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { HistoryEntry } from '@/lib/api-client';

const EVENT_LABELS: Record<string, string> = {
  CREATED: 'Created', APPROVED: 'Approved', REJECTED: 'Rejected', REVOKED: 'Revoked',
};

const DOT_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-400', APPROVED: 'bg-emerald-500', REJECTED: 'bg-red-500', REVOKED: 'bg-gray-400',
};

interface PermitStatusTimelineProps { history: HistoryEntry[] }

export function PermitStatusTimeline({ history }: PermitStatusTimelineProps) {
  const sorted = [...history].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-6">Status History</h2>

      {sorted.length === 0 && (
        <p className="text-sm text-gray-400 italic">No history available.</p>
      )}

      <ol className="relative">
        {sorted.map((event, idx) => {
          const isLast = idx === sorted.length - 1;
          const dotColor = DOT_COLORS[event.status] ?? 'bg-gray-300';
          let timestamp = event.created_at;
          try { timestamp = format(new Date(event.created_at), 'dd MMM yyyy, HH:mm'); } catch {}

          return (
            <li key={event.id} className="relative pl-7 pb-6 last:pb-0">
              {/* Vertical connector line */}
              {!isLast && (
                <span className="absolute left-[7px] top-5 bottom-0 w-0.5 bg-gray-200" aria-hidden="true" />
              )}
              {/* Dot */}
              <span
                className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full ${dotColor} ring-2 ring-white`}
                aria-hidden="true"
              />

              <div className="flex flex-wrap items-center gap-2 mb-1">
                <StatusBadge status={event.status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED'} />
                <span className="text-sm font-medium text-gray-700">
                  {EVENT_LABELS[event.event] ?? event.event}
                </span>
              </div>
              <p className="text-xs text-gray-500">by {event.actor_name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{timestamp}</p>
              {event.notes && (
                <p className="text-xs text-gray-500 mt-1.5 italic">"{event.notes}"</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
```

---

**Step 6 — Create `components/permits/ActionDialog.tsx`**

Reusable confirm dialog for approve (green), reject (red, optional reason), revoke (amber, optional reason). Non-dismissible during loading. Per UX-Mockup Screen 05 and Patterns 07.

```typescript
'use client';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { X, AlertCircle } from 'lucide-react';

type DialogAction = 'approve' | 'reject' | 'revoke';

interface ActionDialogProps {
  action: DialogAction;
  permitTitle: string;
  isOpen: boolean;
  isLoading: boolean;
  error?: string | null;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}

const DIALOG_CONFIG: Record<DialogAction, {
  title: string;
  body: (title: string) => string;
  confirmLabel: string;
  confirmClass: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
}> = {
  approve: {
    title: 'Approve Permit?',
    body: (t) => `This will mark the permit "${t}" as Approved and activate it. This action cannot be undone.`,
    confirmLabel: '✓ Approve Permit',
    confirmClass: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
    reasonLabel: 'Approval Notes (optional)',
    reasonPlaceholder: 'Add any notes about this approval…',
  },
  reject: {
    title: 'Reject Permit?',
    body: (t) => `This will mark the permit "${t}" as Rejected. The applicant will not be authorized.`,
    confirmLabel: '✗ Reject Permit',
    confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    reasonLabel: 'Rejection Reason (optional)',
    reasonPlaceholder: 'Provide a reason for rejection… (max 500 characters)',
  },
  revoke: {
    title: 'Revoke Permit?',
    body: (t) => `This will immediately deactivate the permit "${t}". The permit will no longer be valid.`,
    confirmLabel: '⊘ Revoke Permit',
    confirmClass: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400',
    reasonLabel: 'Revocation Reason (optional)',
    reasonPlaceholder: 'Provide a reason for revocation… (max 500 characters)',
  },
};

export function ActionDialog({
  action, permitTitle, isOpen, isLoading, error, onConfirm, onClose,
}: ActionDialogProps) {
  const [reason, setReason] = useState('');
  const config = DIALOG_CONFIG[action];
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // Reset reason on open
  useEffect(() => {
    if (isOpen) setReason('');
  }, [isOpen]);

  // Focus trap + Escape key
  useEffect(() => {
    if (!isOpen) return;
    firstFocusRef.current?.focus();

    function onKeyDown(e: Event) {
      const ke = e as unknown as KeyboardEvent;
      if (ke.key === 'Escape' && !isLoading) onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  function handleBackdropClick() {
    if (!isLoading) onClose();
  }

  function handleConfirm() {
    onConfirm(reason || undefined);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-[480px] p-6"
        style={{ animation: 'dialog-open 150ms ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="dialog-title" className="text-lg font-semibold text-gray-900">
            {config.title}
          </h2>
          {!isLoading && (
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">{config.body(permitTitle)}</p>

        {/* Optional reason textarea */}
        {config.reasonLabel && (
          <div className="mb-5">
            <label htmlFor="action-reason" className="block text-sm font-medium text-gray-700 mb-1.5">
              {config.reasonLabel}
            </label>
            <textarea
              id="action-reason"
              rows={3}
              disabled={isLoading}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={config.reasonPlaceholder}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 text-right mt-0.5">{reason.length}/500</p>
          </div>
        )}

        {/* Inline error */}
        {error && (
          <div role="alert" className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            ref={firstFocusRef}
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 ${config.confirmClass}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing…
              </>
            ) : (
              config.confirmLabel
            )}
          </button>
        </div>
      </div>

      {/* Dialog open animation */}
      <style>{`
        @keyframes dialog-open {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
```

---

**Step 7 — Create `app/(protected)/permits/[id]/page.tsx`**

Full permit detail page: loads permit via `usePermit`, skeleton while loading, 404 state, breadcrumb, back link, PermitDetailHeader, PermitDetailFields, PermitStatusTimeline, ActionDialog for each lifecycle action, handles `?action` query param to auto-open dialog.

```typescript
'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import { usePermit } from '@/lib/hooks/use-permit';
import { useApprovePermit, useRejectPermit, useRevokePermit } from '@/lib/hooks/use-permit-mutations';
import { useToast } from '@/components/ui/Toast';
import { PermitDetailHeader } from '@/components/permits/PermitDetailHeader';
import { PermitDetailFields } from '@/components/permits/PermitDetailFields';
import { PermitStatusTimeline } from '@/components/permits/PermitStatusTimeline';
import { ActionDialog } from '@/components/permits/ActionDialog';
import { Skeleton } from '@/components/ui/Skeleton';

type DialogAction = 'approve' | 'reject' | 'revoke' | null;

// Valid transitions per status
const VALID_ACTIONS: Record<string, DialogAction[]> = {
  PENDING:  ['approve', 'reject'],
  APPROVED: ['revoke'],
  REJECTED: [],
  REVOKED:  [],
};

export default function PermitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const { data: permit, isLoading, error, refetch } = usePermit(id);
  const approveMutation  = useApprovePermit(id);
  const rejectMutation   = useRejectPermit(id);
  const revokeMutation   = useRevokePermit(id);

  const [openDialog, setOpenDialog] = useState<DialogAction>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  // Auto-open dialog from ?action= param
  useEffect(() => {
    if (!permit) return;
    const action = searchParams.get('action') as DialogAction;
    if (!action) return;
    const valid = VALID_ACTIONS[permit.status] ?? [];
    if (valid.includes(action)) {
      setOpenDialog(action);
    } else {
      toast.info('This action is not available for the current permit status.');
    }
    // Remove action param from URL without re-navigation
    const url = new URL(window.location.href);
    url.searchParams.delete('action');
    window.history.replaceState({}, '', url.toString());
  }, [permit, searchParams]); // toast excluded intentionally (stable ref)

  function handleOpenDialog(action: DialogAction) {
    setDialogError(null);
    setOpenDialog(action);
  }

  function handleCloseDialog() {
    if (
      (openDialog === 'approve' && approveMutation.isPending) ||
      (openDialog === 'reject'  && rejectMutation.isPending)  ||
      (openDialog === 'revoke'  && revokeMutation.isPending)
    ) {
      return; // Non-dismissible during loading
    }
    setOpenDialog(null);
    setDialogError(null);
  }

  async function handleConfirm(reason?: string) {
    if (!openDialog || !permit) return;
    setDialogError(null);

    try {
      let res;
      if (openDialog === 'approve') {
        res = await approveMutation.mutateAsync({ notes: reason ?? null });
      } else if (openDialog === 'reject') {
        res = await rejectMutation.mutateAsync({ reason: reason ?? null });
      } else if (openDialog === 'revoke') {
        res = await revokeMutation.mutateAsync({ reason: reason ?? null });
      } else {
        return;
      }

      if (res?.error) {
        setDialogError(res.error.message ?? 'Action failed. Please try again.');
        return;
      }

      setOpenDialog(null);
      setDialogError(null);

      // Toast messages per UX-Mockup Pattern 02 copy reference
      const toastMessages: Record<string, string> = {
        approve: 'Permit approved successfully.',
        reject:  'Permit rejected.',
        revoke:  'Permit revoked.',
      };
      toast.success(toastMessages[openDialog] ?? 'Action completed.');
    } catch {
      setDialogError('Action failed. Please try again.');
    }
  }

  const isDialogLoading =
    approveMutation.isPending || rejectMutation.isPending || revokeMutation.isPending;

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Loading permit details…">
        {/* Breadcrumb skeleton */}
        <Skeleton className="h-4 w-64 mb-6 rounded" />
        {/* Header card skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <Skeleton className="h-8 w-3/4 mb-3 rounded" />
          <Skeleton className="h-4 w-48 mb-5 rounded" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>
        {/* Details grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j}>
                  <Skeleton className="h-3 w-24 mb-1.5 rounded" />
                  <Skeleton className="h-5 w-48 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* Timeline skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-3.5 w-3.5 rounded-full flex-shrink-0 mt-1" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-3 w-40 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── 404 state ────────────────────────────────────────────────────────────
  if (permit === null) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="w-12 h-12 text-gray-300 mb-4" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-gray-700 mb-2">Permit Not Found</h1>
        <p className="text-sm text-gray-500 mb-6">The permit you're looking for doesn't exist or may have been removed.</p>
        <Link
          href="/permits"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Permits
        </Link>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error && !permit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="w-12 h-12 text-red-300 mb-4" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-gray-700 mb-2">Could not load permit details.</h1>
        <button
          onClick={() => refetch()}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!permit) return null;

  const titleTruncated = permit.title.length > 40 ? permit.title.slice(0, 40) + '…' : permit.title;

  return (
    <div>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500 mb-2">
        <Link href="/dashboard" className="hover:text-gray-700 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <Link href="/permits" className="hover:text-gray-700 transition-colors">Permits</Link>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <span className="text-gray-400 truncate" aria-current="page" title={permit.title}>{titleTruncated}</span>
      </nav>

      {/* Back link */}
      <Link
        href="/permits"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Permits
      </Link>

      {/* Permit header */}
      <PermitDetailHeader
        permit={permit}
        onApprove={() => handleOpenDialog('approve')}
        onReject={() => handleOpenDialog('reject')}
        onRevoke={() => handleOpenDialog('revoke')}
      />

      {/* Details grid */}
      <PermitDetailFields permit={permit} />

      {/* Status history timeline */}
      <PermitStatusTimeline history={permit.status_history} />

      {/* Action dialogs */}
      {openDialog && (
        <ActionDialog
          action={openDialog}
          permitTitle={permit.title}
          isOpen={true}
          isLoading={isDialogLoading}
          error={dialogError}
          onConfirm={handleConfirm}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}
```
  </action>
  <verify>
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2

grep -n 'export function usePermit' lib/hooks/use-permit.ts && echo "USE_PERMIT_OK"
grep -n 'export function useApprovePermit' lib/hooks/use-permit-mutations.ts && echo "APPROVE_MUTATION_OK"
grep -n 'export function useCreatePermit' lib/hooks/use-permit-mutations.ts && echo "CREATE_MUTATION_OK"
grep -n 'export function PermitDetailHeader' components/permits/PermitDetailHeader.tsx && echo "HEADER_OK"
grep -n 'export function PermitDetailFields' components/permits/PermitDetailFields.tsx && echo "FIELDS_OK"
grep -n 'export function PermitStatusTimeline' components/permits/PermitStatusTimeline.tsx && echo "TIMELINE_OK"
grep -n 'export function ActionDialog' components/permits/ActionDialog.tsx && echo "DIALOG_OK"
grep -n 'terminal state' components/permits/PermitDetailHeader.tsx && echo "TERMINAL_STATE_OK"
grep -n 'Permit Not Found' app/\(protected\)/permits/\[id\]/page.tsx && echo "404_STATE_OK"
grep -n 'aria-busy' app/\(protected\)/permits/\[id\]/page.tsx && echo "SKELETON_ARIA_OK"
grep -n 'searchParams.get.*action' app/\(protected\)/permits/\[id\]/page.tsx && echo "ACTION_PARAM_OK"
grep -n 'Permit approved successfully' app/\(protected\)/permits/\[id\]/page.tsx && echo "TOAST_COPY_OK"
grep -n 'invalidateQueries' lib/hooks/use-permit-mutations.ts && echo "CACHE_INVALIDATE_OK"
npx tsc --noEmit --skipLibCheck 2>&1 | head -30 || true
```
  </verify>
  <done>
- `lib/hooks/use-permit.ts` exports usePermit(id) — returns null for 404, throws for other errors
- `lib/hooks/use-permit-mutations.ts` exports useApprovePermit, useRejectPermit, useRevokePermit, useCreatePermit — all invalidate ['permit', id] and ['permits'] on success
- `PermitDetailHeader`: title + large StatusBadge + Approve+Reject buttons for PENDING; Revoke button for APPROVED; "terminal state" message for REJECTED/REVOKED
- `PermitDetailFields`: two-column grid, rejection reason as red alert block, revocation reason as amber alert block
- `PermitStatusTimeline`: chronological oldest-first, dot + StatusBadge + event label + actor name + DD MMM YYYY HH:mm timestamp
- `ActionDialog`: approve (green, optional notes), reject (red, optional reason max 500), revoke (amber, optional reason max 500); non-dismissible during loading; error shown inline; permit title in body copy
- `app/(protected)/permits/[id]/page.tsx`: skeleton while loading; 404 state when permit === null; breadcrumb "Dashboard / Permits / [Title]"; "← Back to Permits" link; auto-opens dialog from ?action= param; invalid ?action for status shows toast instead; on action success: cache invalidated + toast shown + status updates in-place via re-fetch
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client→API | Login form credentials (email, password) crossing into POST /api/auth/login handler |
| cookie→middleware | JWT cookie value from browser request crossing into Next.js middleware verifyToken |
| URL→page | User-controlled ?action= and ?redirect= query params crossing into page routing logic |
| API→render | Permit data from API (rejection_reason, notes, title) crossing into DOM rendering |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-01 | Elevation of privilege | `middleware.ts` — protected route guard | mitigate | `verifyToken(cookieToken)` in `middleware.ts` on every non-public route. Unauthenticated requests to page routes → redirect to `/login`; to `/api/*` → 401 JSON. Public paths whitelist in `isPublic()` is explicit (`/login`, `/api/auth/login` only). |
| T-04-02 | Information disclosure | `app/(auth)/login/page.tsx` — auth error message | mitigate | Unified error message "Invalid email or password." in `login/page.tsx` onSubmit handler — never reveals which field (email vs password) is wrong, preventing account enumeration. |
| T-04-03 | Elevation of privilege | `app/(auth)/login/page.tsx` — open redirect via ?redirect= | mitigate | `redirect` param validated in `onSubmit`: `const safe = redirect.startsWith('/') ? redirect : '/dashboard'` — enforces relative-path-only redirects, preventing open redirect to external domains. |
| T-04-04 | Tampering | `app/(protected)/permits/[id]/page.tsx` — ?action= param auto-dialog | mitigate | `VALID_ACTIONS[permit.status].includes(action)` check in `useEffect` in `permits/[id]/page.tsx` — invalid action for current status shows toast instead of opening dialog. Server-side state machine in `permit-service.ts` (Wave 2) is the enforcement layer; the UI check is defence-in-depth. |
| T-04-05 | Information disclosure | `PermitDetailFields.tsx`, `PermitStatusTimeline.tsx` — XSS via stored API data | mitigate | All user-supplied content (title, notes, rejection_reason, actor_name) is rendered via React JSX text nodes (`{value}`, `{event.notes}`) — React escapes all HTML by default. No `dangerouslySetInnerHTML` used. |
| T-04-06 | Denial of service | `ActionDialog.tsx` — double-submit | mitigate | Confirm button `disabled={isLoading}` in `ActionDialog.tsx`; backdrop click and Escape key are no-ops while `isLoading` — prevents double API call on fast repeated clicks. |
| T-04-07 | Spoofing | `middleware.ts` — cookie vs Authorization header precedence | mitigate | In `middleware.ts`, Bearer token takes priority over cookie: `const token = bearerToken ?? cookieToken`. Cookie is `httpOnly` (set by login API in Wave 2) so cannot be read by JS. The middleware never leaks the token back to the client. |
</threat_model>

<verification>
Run these checks after all tasks complete to confirm Wave 3b (plan 04) is green:

```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2

# 1. Middleware route guard
grep -n 'loginUrl.searchParams.set' middleware.ts && echo "MIDDLEWARE_REDIRECT_OK"
grep -n 'isPublic' middleware.ts && echo "MIDDLEWARE_PUBLIC_PATHS_OK"

# 2. Login page
grep -n "Sign in to Permit2" app/\(auth\)/login/page.tsx && echo "LOGIN_PAGE_OK"
grep -n "Invalid email or password" app/\(auth\)/login/page.tsx && echo "LOGIN_ERROR_OK"
grep -n "startsWith.*redirect" app/\(auth\)/login/page.tsx && echo "OPEN_REDIRECT_GUARD_OK"

# 3. Route group layouts
ls app/\(auth\)/layout.tsx && echo "AUTH_LAYOUT_OK"
ls app/\(protected\)/layout.tsx && echo "PROTECTED_LAYOUT_OK"

# 4. Design system components
grep -n 'export function StatusBadge' components/ui/StatusBadge.tsx && echo "STATUS_BADGE_OK"
grep -n 'export function ToastProvider' components/ui/Toast.tsx && echo "TOAST_PROVIDER_OK"
grep -n 'export function useToast' components/ui/Toast.tsx && echo "USE_TOAST_OK"
grep -n 'export function Navbar' components/layout/Navbar.tsx && echo "NAVBAR_OK"

# 5. API client and hooks
grep -n 'export const apiClient' lib/api-client.ts && echo "API_CLIENT_OK"
grep -n 'export function usePermit' lib/hooks/use-permit.ts && echo "USE_PERMIT_OK"
grep -n 'export function useApprovePermit' lib/hooks/use-permit-mutations.ts && echo "MUTATIONS_OK"
grep -n 'export function useAuth' lib/hooks/use-auth.ts && echo "USE_AUTH_OK"

# 6. Permit creation form
grep -n 'export function PermitForm' components/permits/PermitForm.tsx && echo "PERMIT_FORM_OK"
grep -n 'End date must be on or after' components/permits/PermitForm.tsx && echo "DATE_VALIDATION_OK"

# 7. Permit detail components
grep -n 'export function PermitDetailHeader' components/permits/PermitDetailHeader.tsx && echo "HEADER_OK"
grep -n 'export function PermitDetailFields' components/permits/PermitDetailFields.tsx && echo "FIELDS_OK"
grep -n 'export function PermitStatusTimeline' components/permits/PermitStatusTimeline.tsx && echo "TIMELINE_OK"
grep -n 'export function ActionDialog' components/permits/ActionDialog.tsx && echo "DIALOG_OK"

# 8. Permit detail page
grep -n 'Permit Not Found' app/\(protected\)/permits/\[id\]/page.tsx && echo "404_OK"
grep -n 'aria-busy' app/\(protected\)/permits/\[id\]/page.tsx && echo "SKELETON_OK"
grep -n 'terminal state' components/permits/PermitDetailHeader.tsx && echo "TERMINAL_OK"
grep -n 'invalidateQueries' lib/hooks/use-permit-mutations.ts && echo "CACHE_INVALIDATE_OK"
grep -n 'Permit approved successfully' app/\(protected\)/permits/\[id\]/page.tsx && echo "TOAST_COPY_OK"

# 9. TypeScript check
npx tsc --noEmit --skipLibCheck 2>&1 | head -20 || true
```
</verification>

<success_criteria>
- [ ] middleware.ts redirects unauthenticated page requests to /login?redirect= and authenticated /login to /dashboard; returns 401 JSON for unauthenticated API requests; does NOT set X-Frame-Options DENY
- [ ] app/(auth)/login/page.tsx: "Sign in to Permit2" branded card, RHF+Zod form, inline validation without API call on empty submit, loading spinner on submit, "Invalid email or password." generic error (never reveals which field), password cleared + focus to password on auth error, reads ?redirect= param, safe open-redirect guard, redirects to /dashboard or redirect param on success
- [ ] app/(protected)/permits/new/page.tsx: breadcrumb "Dashboard / Permits / New Permit", Create New Permit heading, PermitForm with all 7 fields, navigates to /permits/:id on success, router.back() on cancel
- [ ] PermitForm.tsx: all required fields, Zod validation, end-date cross-field check, green ✓ on valid blur, red border + error message on invalid, disabled during submit, scroll-to-first-error on submit attempt
- [ ] app/(protected)/permits/[id]/page.tsx: skeleton (aria-busy) during load, 404 state with "Permit Not Found" when permit not found, breadcrumb + back link, PermitDetailHeader + PermitDetailFields + PermitStatusTimeline rendered, auto-opens dialog from ?action= param (validates against permit status first)
- [ ] PermitDetailHeader: shows Approve+Reject for PENDING, Revoke for APPROVED, terminal state message for REJECTED/REVOKED
- [ ] ActionDialog: three variants (approve=green, reject=red, revoke=amber), permit title in body, optional reason textarea (max 500), non-dismissible during loading, inline error on failure, Enter triggers confirm (not in textarea), Escape closes (not during loading)
- [ ] On lifecycle action success: TanStack Query invalidates ['permit', id] + ['permits'] → status badge updates in-place; correct toast shown (green 5s for approve, red 8s for reject, amber/green 5s for revoke)
- [ ] StatusBadge: amber/emerald/red/gray variants, pill shape, text-only (no icons)
- [ ] Toast system: bottom-right, green border (success 5s), red border (error 8s), manual dismiss ×, max 3 stacked
- [ ] Navbar: logo (Shield icon + "Permit2"), Dashboard + Permits links (aria-current="page" on active), user name, Logout button
- [ ] TypeScript compiles with no errors (npx tsc --noEmit --skipLibCheck)
</success_criteria>

<output>
After completion, create `.planning/express/build-the-full-permit2-permit-management/04-SUMMARY.md` documenting:
- All files created (by task)
- Key design decisions (e.g., custom Toast vs sonner, date input type=date vs calendar popover)
- Integration points: which components consume which hooks, which hooks call which API client methods
- Any deviations from the UX-Mockup spec and rationale
- TypeScript compile status
</output>
