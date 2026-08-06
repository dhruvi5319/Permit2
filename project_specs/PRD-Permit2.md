# Product Requirements Document
## Permit2 — Permit Management System (POC)

**Document Version:** 1.0
**Date:** 2026-08-06
**Status:** Active
**Acronym:** Permit2

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Product Vision](#product-vision)
4. [Technical Architecture](#technical-architecture)
5. [Feature Requirements](#feature-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [Success Metrics](#success-metrics)
8. [Risks & Mitigations](#risks--mitigations)
9. [Out of Scope](#out-of-scope)
10. [Feature Index](#feature-index)

---

## 1. Executive Summary

Permit2 is a proof-of-concept permit management system designed for small teams and departmental use. It enables managers to create, track, approve, reject, and revoke permits through a beautifully designed, modern web interface. The POC prioritizes visual polish and ease of use over complex backend logic, demonstrating a complete end-to-end permit lifecycle in a single-organization context.

---

## 2. Problem Statement

Teams and departments that manage permits — work permits, access permits, activity authorizations — frequently rely on spreadsheets, email chains, or paper-based processes. These approaches create friction at every stage:

- **Visibility gaps:** Managers have no single place to see the current status of all permits at a glance. Pending, approved, and expired permits are scattered across inboxes and shared drives.
- **Slow action cycles:** Approving or rejecting a permit requires tracking down the right person, forwarding documents, and waiting for a response — all without a structured workflow.
- **No audit trail per request:** Without a dedicated system, the full history of a permit (who created it, when it was approved, what was changed) is difficult to reconstruct.
- **Poor user experience:** Existing tools are either overly complex enterprise systems or informal workarounds. Neither provides a clean, intuitive interface that managers actually want to use.

Permit2 addresses these pain points by offering a focused, beautifully designed web application where managers can manage the entire permit lifecycle — from creation to closure — in minutes, not hours.

---

## 3. Product Vision

> *"A single, beautiful interface where any manager can issue, track, and act on permits without friction — from the moment a request is created to its final resolution."*

### Strategic Goals

- Deliver a visually polished, modern web UI that managers enjoy using daily.
- Provide instant visibility into permit status across the organization through a real-time dashboard.
- Enable the full permit lifecycle (create → review → approve/reject → revoke) within a single coherent interface.
- Prove the concept in a lean, demonstrable POC that can serve as the foundation for a production-grade system.
- Establish a clean data model and UI pattern that scales to future enhancements without rework.

### Target Users

**Primary Persona — The Permit Manager**
A team lead or department manager responsible for issuing and tracking permits for their team. They need to quickly understand the current state of all permits, act on pending requests, and refer back to specific permit details when questions arise. They value clarity, speed, and a professional-looking tool.

---

## 4. Technical Architecture

| Layer | Technology (Recommended) | Notes |
|---|---|---|
| **Frontend** | React + TypeScript | Modern component model; strong ecosystem for polished UIs |
| **UI Framework** | Tailwind CSS + shadcn/ui or Radix UI | Utility-first styling; accessible, composable components |
| **State Management** | React Query / Zustand | Server state + lightweight client state |
| **Backend** | Node.js + Express or Next.js API Routes | Lean REST API; Next.js enables full-stack single repo |
| **Database** | PostgreSQL or SQLite (POC) | Relational model suits permit lifecycle; SQLite acceptable for POC |
| **ORM** | Prisma | Type-safe queries; easy schema migrations |
| **Authentication** | NextAuth.js / JWT + bcrypt | Session-based or token-based; credentials provider for POC |
| **Hosting** | Vercel / Railway / Render | Zero-config deployment for POC demos |

> **Note:** Final stack selection is at implementer discretion. The above represents the recommended modern stack aligned with the project's emphasis on UI quality and developer velocity.

---

## 5. Feature Requirements

### F0: Manager Authentication

**Description:** Managers must be able to securely log in and log out of the Permit2 application. Authentication gates all application functionality — unauthenticated users are redirected to the login page. For POC scope, credential-based login (username/password) is sufficient with a session persisted across browser refreshes.

**Capabilities:**
- Login page with email/username and password fields, styled to match the overall UI design language.
- Form validation with clear, inline error messages (invalid credentials, empty fields).
- Persistent session management — users remain logged in across page refreshes until they explicitly log out.
- Logout action accessible from the navigation header, clearing the session immediately.
- Protected route enforcement — any direct URL access by unauthenticated users redirects to login.
- Secure password storage using hashing (bcrypt or equivalent); no plain-text credentials.

**Priority:** P0 (Critical — MVP requirement; all other features depend on authenticated access)

---

### F1: Manager Dashboard

**Description:** The dashboard is the primary landing page after login. It provides managers with an at-a-glance overview of the current permit landscape — aggregate statistics, status breakdowns, and a visual summary that enables quick situational awareness without navigating to individual records.

**Capabilities:**
- Summary stat cards displaying key permit counts:
  - Total permits
  - Pending (awaiting action)
  - Approved (active)
  - Rejected
  - Revoked
- Visual status breakdown (e.g., donut chart or bar chart showing permits by status).
- Recent activity feed — the most recently created or updated permits (last 5–10), with status badge and quick-link to detail.
- Quick-action shortcuts: "Create New Permit" CTA prominently visible.
- Dashboard data reflects real-time state of the permit database (no stale caches that mislead the manager).
- Responsive layout that reads cleanly on laptop and desktop viewport widths.

**Priority:** P0 (Critical — primary entry point and core UX showcase for the POC)

---

### F2: Permit Creation

**Description:** Managers can create new permit requests directly from the application. The creation flow captures all required permit information through a clean, well-structured form and submits it to the system, where it enters a "Pending" status awaiting action.

**Capabilities:**
- Permit creation form accessible via "Create New Permit" button (from dashboard and permit list).
- Form fields (minimum required set):
  - Permit title / name
  - Permit type (selectable from a predefined list, e.g., Work, Access, Activity, Safety)
  - Applicant / requester name
  - Description / purpose (multiline text)
  - Start date and end date
  - Additional notes (optional)
- Client-side validation with clear error states before submission.
- On successful submission, permit is saved with status `PENDING` and the manager is navigated to the new permit's detail view (or the permit list).
- Cancel action returns the manager to the previous page without saving.
- Form layout is clean and spacious — fields are grouped logically, not crammed.

**Priority:** P0 (Critical — core permit lifecycle begins here)

---

### F3: Permit List / Table View

**Description:** The permit list provides a paginated, filterable, and searchable table of all permits in the system. It is the primary navigation surface for managers who need to find a specific permit or survey the full permit inventory. Visual status indicators make it immediately clear which permits require attention.

**Capabilities:**
- Tabular list of all permits with columns:
  - Permit ID / reference number
  - Title
  - Type
  - Applicant name
  - Status (color-coded badge: Pending, Approved, Rejected, Revoked)
  - Start date / End date
  - Created date
  - Actions column (quick links: View, Approve, Reject — contextual to status)
- Pagination or infinite scroll for handling larger datasets.
- Column sorting (click column header to sort ascending/descending).
- Row click navigates to the permit detail view.
- Empty state displayed when no permits match the current filter or search.
- Loading skeleton displayed while data is being fetched.

**Priority:** P0 (Critical — primary permit navigation surface)

---

### F4: Search & Filter

**Description:** Managers must be able to quickly locate specific permits using free-text search and structured filters. This prevents the permit list from becoming unwieldy as the number of records grows, even within a POC dataset.

**Capabilities:**
- Free-text search bar that matches against permit title, applicant name, and description.
- Filter by **status**: All, Pending, Approved, Rejected, Revoked (pill/tab or dropdown selector).
- Filter by **permit type**: selectable from the same predefined type list used in creation.
- Filter by **date range**: start-date-from / start-date-to pickers.
- Filters are combinable — applying status + type + date range simultaneously narrows results correctly.
- Active filters are visually indicated (e.g., highlighted filter chips showing what is applied).
- "Clear all filters" control resets to the full unfiltered list.
- Filter state is reflected in the URL query string, enabling shareable/bookmarkable filtered views.
- Search and filter results update the permit list in real-time (debounced search input).

**Priority:** P1 (High — significantly improves usability once permit volume grows; important for POC demo credibility)

---

### F5: Permit Detail View

**Description:** The permit detail view presents the complete information for a single permit on a dedicated page. It serves as the single source of truth for a given permit and is the primary surface where managers take action (approve, reject, revoke). The design should make it easy to absorb all permit information at a glance and take action with a single click.

**Capabilities:**
- Full display of all permit fields: title, type, applicant, description, dates, notes, status, created date, last updated date.
- Status badge prominently displayed at the top of the page.
- Timeline / status history panel showing state transitions (e.g., "Created → Pending → Approved") with timestamps.
- Action buttons rendered conditionally based on current status:
  - `PENDING` → **Approve** and **Reject** buttons visible.
  - `APPROVED` → **Revoke** button visible.
  - `REJECTED` or `REVOKED` → no action buttons (terminal states).
- Action buttons trigger a confirmation dialog before executing the state change.
- After an action is taken, the page updates in place to reflect the new status without requiring a full navigation.
- Back navigation returns the manager to the permit list, preserving filter/scroll position.
- Breadcrumb trail: Dashboard → Permits → [Permit Title].

**Priority:** P0 (Critical — the primary action surface for the permit lifecycle)

---

### F6: Permit Lifecycle Actions (Approve / Reject / Revoke)

**Description:** The core workflow operations that a manager performs on permits. These actions mutate the permit's status and represent the business logic heart of Permit2. Each action follows a consistent interaction pattern: button click → confirmation dialog → action executed → UI updated.

**Capabilities:**

**Approve:**
- Available when permit status is `PENDING`.
- Transitions permit to `APPROVED` status.
- Confirmation dialog: "Approve this permit? This will mark it as active." with Confirm / Cancel.
- Optional: reason/notes field in the dialog (future-proofing; can be omitted for POC).
- Success toast notification: "Permit approved successfully."

**Reject:**
- Available when permit status is `PENDING`.
- Transitions permit to `REJECTED` status.
- Confirmation dialog with an optional rejection reason text field.
- Success toast notification: "Permit rejected."

**Revoke:**
- Available when permit status is `APPROVED`.
- Transitions permit to `REVOKED` status.
- Confirmation dialog: "Revoke this permit? This will deactivate it immediately." with Confirm / Cancel.
- Optional reason/notes field.
- Success toast notification: "Permit revoked."

**General:**
- All actions are atomic — they either fully succeed or return a clear error.
- API errors surface as error toast notifications (e.g., "Action failed. Please try again.").
- Action buttons are disabled / hidden appropriately based on the current status to prevent invalid state transitions.

**Priority:** P0 (Critical — without lifecycle actions, the system has no workflow value)

---

### F7: UI Design System & Visual Polish

**Description:** The overall visual design quality of Permit2 is an explicit, first-class requirement. The application must look and feel beautiful, modern, and professional — not like a default-styled CRUD app. This feature captures the design system and UX polish requirements that apply across all screens.

**Capabilities:**
- Consistent design language: typography scale, spacing system, color palette applied uniformly across all screens.
- Color palette: rich but professional — a primary brand color (e.g., deep blue, indigo, or teal) with semantic status colors (green = approved, yellow/amber = pending, red = rejected/revoked, gray = neutral).
- Status badges: color-coded, pill-shaped, visually distinct for each state.
- Smooth transitions and micro-animations: page transitions, button hover states, modal open/close animations — subtle but present.
- Card-based layouts for dashboard stat blocks, giving them visual weight and separation.
- Consistent navigation: persistent top navigation bar or sidebar with active state indicators.
- Empty states are illustrated or iconographically designed — not bare text placeholders.
- Loading states use skeleton screens (not spinners alone) for perceived performance.
- Responsive layout: all screens functional and visually sound at 1024px–1440px (primary target); graceful degradation to tablet widths.
- Accessible color contrast ratios meeting WCAG AA as a baseline.
- Icon system: consistent icon library (e.g., Lucide, Heroicons) used throughout.

**Priority:** P0 (Critical — visual polish is an explicit project requirement, not an enhancement)

---

### F8: Permit Data API (Backend REST Endpoints)

**Description:** The backend exposes a RESTful API that powers all frontend features. All permit CRUD operations and lifecycle transitions are performed through this API. For the POC, the API is internal (consumed only by the Permit2 frontend) and does not need to be a public API with versioning or extensive documentation.

**Capabilities:**
- `POST /auth/login` — Authenticate a manager, return session token/cookie.
- `POST /auth/logout` — Invalidate session.
- `GET /permits` — List permits with query params for search, status filter, type filter, date range, pagination.
- `POST /permits` — Create a new permit (status defaults to `PENDING`).
- `GET /permits/:id` — Retrieve full detail of a single permit.
- `PATCH /permits/:id/approve` — Transition permit to `APPROVED`.
- `PATCH /permits/:id/reject` — Transition permit to `REJECTED` with optional reason.
- `PATCH /permits/:id/revoke` — Transition permit to `REVOKED` with optional reason.
- All endpoints require authentication; unauthenticated requests return `401 Unauthorized`.
- Consistent JSON response envelope: `{ data, error, meta }`.
- Input validation with meaningful error messages returned as structured JSON.

**Priority:** P0 (Critical — foundational; all frontend features depend on these endpoints)

---

### F9: Permit Data Model & Persistence

**Description:** The permit data must be persisted in a relational database with a schema that supports the full lifecycle, search, and filtering requirements. The data model is designed to be clean and extensible — suitable as a POC foundation without over-engineering.

**Capabilities:**
- **Permit record schema (minimum fields):**
  - `id` (UUID or auto-increment)
  - `title` (string, required)
  - `type` (enum: WORK, ACCESS, ACTIVITY, SAFETY, OTHER)
  - `applicant_name` (string, required)
  - `description` (text)
  - `notes` (text, optional)
  - `status` (enum: PENDING, APPROVED, REJECTED, REVOKED)
  - `start_date` (date)
  - `end_date` (date)
  - `rejection_reason` (text, nullable)
  - `revocation_reason` (text, nullable)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Manager / User record schema:**
  - `id`, `email`, `password_hash`, `name`, `created_at`
- Status transitions enforced at the application layer (not just UI).
- Database seeded with sample permit data for POC demo purposes (minimum 10–15 records across all statuses).
- Schema managed via migration files (Prisma or equivalent) for reproducible setup.

**Priority:** P0 (Critical — data layer underpins all features)

---

## 6. Non-Functional Requirements

| # | Category | Requirement |
|---|---|---|
| NFR-1 | Performance | Dashboard and permit list pages load within 2 seconds on a standard broadband connection with up to 200 permit records. |
| NFR-2 | UI Responsiveness | All pages render correctly and are fully functional at viewport widths from 1024px to 1440px. Graceful degradation at 768px (tablet). |
| NFR-3 | Security | Passwords stored as bcrypt hashes (min cost factor 10). All API routes enforce authentication. No sensitive data exposed in client-side JS bundles. |
| NFR-4 | Accessibility | Color contrast meets WCAG AA (4.5:1 for normal text). Interactive elements have keyboard focus indicators. Form inputs have associated labels. |
| NFR-5 | Code Quality | TypeScript strict mode enabled. No `any` types in core business logic. Components are modular and reusable. |
| NFR-6 | Deployability | Project includes a `README.md` with setup instructions. Application is deployable with `npm install && npm run dev` locally, and deployable to Vercel/Railway/Render with one command. |
| NFR-7 | Data Integrity | Status transitions are validated server-side. Invalid transitions (e.g., approving an already-approved permit) return a `400 Bad Request` with a descriptive error. |
| NFR-8 | Demo Readiness | Database seed script populates realistic sample data (mix of permit types and statuses) so the POC is demo-ready without manual data entry. |

---

## 7. Success Metrics

The following metrics define what "done and successful" looks like for Permit2 as a POC:

- **UI Quality:** A stakeholder walkthrough of the application results in feedback of "this looks polished and professional" — not "it looks like a prototype." The design is indistinguishable from a production SaaS product on first impression.
- **Full Lifecycle Completable:** A manager can create a permit, find it in the list, view its details, approve it, and revoke it — all within 5 minutes with no guidance.
- **Dashboard Accuracy:** All stat cards on the dashboard reflect the accurate count of permits in each status, with zero variance from the actual database counts.
- **Search & Filter Effectiveness:** A manager can locate any specific permit in a 50-record dataset within 30 seconds using search or filter.
- **Zero Critical Bugs at Demo:** No broken pages, no unhandled errors, no blank screens during a standard manager demo walkthrough covering all P0 features.
- **Deployment Success:** Application deploys to a hosted URL with a single deploy command and is accessible without local setup.
- **Coverage of Core Actions:** All three lifecycle actions (Approve, Reject, Revoke) work correctly in all valid states and surface appropriate errors for invalid transitions.

---

## 8. Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Visual design falls short of "beautiful" threshold, undermining the core POC proposition | Medium | High | Use a high-quality component library (shadcn/ui, Radix) as the baseline; invest design time in spacing, typography, and color before feature completeness. |
| R2 | Scope creep adds features beyond POC boundaries, delaying delivery | Medium | Medium | Strictly enforce the Out of Scope list; any new request requires explicit re-scoping. |
| R3 | Authentication implementation introduces security vulnerabilities | Low | High | Use established libraries (NextAuth, bcrypt); avoid custom crypto; review auth implementation against OWASP top 10 basics. |
| R4 | Database schema is too rigid to extend in a later production phase | Low | Medium | Use an ORM with migrations (Prisma); keep the schema normalized; avoid denormalization for POC convenience. |
| R5 | POC demo fails due to missing seed data | Low | High | Include a seed script in the repo; run seed as part of the setup documentation; verify seed data before any demo. |
| R6 | Performance degrades visibly with sample data during demo | Low | Medium | Test with minimum 50 seeded records; add database indexes on `status`, `type`, and `created_at`; use pagination server-side. |

---

## 9. Out of Scope

The following capabilities are explicitly excluded from Permit2 POC. They are listed here to prevent scope creep and to provide a clear basis for future roadmap planning:

| # | Excluded Capability | Reason for Exclusion |
|---|---|---|
| OOS-1 | Multi-tenant / multi-organization support | POC scope is single organization; multi-tenancy adds significant complexity to the data model and auth layer. |
| OOS-2 | Mobile native application (iOS / Android) | Web-first for POC; native apps require separate build pipelines and platforms. |
| OOS-3 | Email and SMS notifications | External service integrations (SendGrid, Twilio) are out of POC scope; adds operational overhead. |
| OOS-4 | Complex role hierarchy (Admin, Approver, Viewer, etc.) | Single manager role keeps the POC focused; RBAC adds significant auth complexity. |
| OOS-5 | Audit logging / change history log | Full audit trail requires additional schema tables and event sourcing; not required to demonstrate the POC concept. |
| OOS-6 | External system integrations (ERP, HRMS, etc.) | No external integrations required per project constraints. |
| OOS-7 | Public / third-party API (versioned, documented) | The API is internal to the Permit2 frontend only; no external consumers in scope. |
| OOS-8 | File attachment / document upload on permits | Adds storage infrastructure complexity; not required for POC demonstration. |
| OOS-9 | Permit templates or recurring permits | Scheduling and templating are post-POC features. |
| OOS-10 | Advanced analytics or reporting exports (PDF, CSV) | Out of POC scope; dashboard stats are sufficient for demonstration. |

---

## 10. Feature Index

| Feature ID | Feature Name | Category | Priority | Status |
|---|---|---|---|---|
| F0 | Manager Authentication | Security / Auth | P0 | Required |
| F1 | Manager Dashboard | UI — Primary Screen | P0 | Required |
| F2 | Permit Creation | UI — Form / Workflow | P0 | Required |
| F3 | Permit List / Table View | UI — Primary Screen | P0 | Required |
| F4 | Search & Filter | UI — Navigation Aid | P1 | Required |
| F5 | Permit Detail View | UI — Primary Screen | P0 | Required |
| F6 | Permit Lifecycle Actions (Approve / Reject / Revoke) | UI — Workflow / Business Logic | P0 | Required |
| F7 | UI Design System & Visual Polish | Design / UX | P0 | Required |
| F8 | Permit Data API (Backend REST Endpoints) | Backend — API | P0 | Required |
| F9 | Permit Data Model & Persistence | Backend — Data | P0 | Required |

### Priority Summary

| Priority | Count | Features |
|---|---|---|
| P0 — Critical (MVP) | 9 | F0, F1, F2, F3, F5, F6, F7, F8, F9 |
| P1 — High | 1 | F4 |
| P2 — Medium | 0 | — |
| P3 — Nice to Have | 0 | — |

---

## Appendix: Related Documents

| Document | Path | Description |
|---|---|---|
| PROJECT.md | `.planning/PROJECT.md` | Project description, goals, and constraints |
| FRD | `project_specs/FRD-Permit2.md` | Functional Requirements Document (derived from this PRD) |
| TechArch | `project_specs/TechArch-Permit2.md` | Technical Architecture Document |
| UserStories | `project_specs/UserStories-Permit2.md` | User Stories derived from this PRD |

---

*PRD generated: 2026-08-06 | Project: Permit2 | Version: 1.0*
