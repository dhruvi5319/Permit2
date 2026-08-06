# User Story Map
## Permit2 — Permit Management System

| Field | Value |
|-------|-------|
| **Product Name** | Permit2 |
| **Date** | 2026-08-06 |
| **Related Personas** | PERSONAS-Permit2.md |
| **Related Journeys** | JOURNEYS-Permit2.md |
| **Related JTBD** | JTBD-Permit2.md |
| **Related User Stories** | UserStories-Permit2.md |
| **Related PRD** | PRD-Permit2.md |

---

## Overview

This story map organizes all 39 user stories (US-0.1 through US-9.3) along the horizontal axis of user journey stages (from JOURNEYS-Permit2.md) and assigns each story a release (R1 = P0 MVP, R2 = P1 enhancements). The NaC (Natural Acceptance Criteria) column derives testable criteria directly from JTBD outcomes contextualized to the journey stage — bridging the "why" (jobs) to the "what is built" (stories) and ultimately to the "how we verify" (acceptance criteria).

**Map reading guide:**
- **X-axis (Journey Stages):** Login → Orient / Access → Act → Verify / Return — the stages from each persona's primary journey
- **Y-axis (Activity rows):** Individual stories grouped by epic within each stage
- **NaC column:** Derived as JTBD-ID outcome + journey stage context → testable criterion
- **Release column:** R1 = all P0 stories (complete end-to-end journey for all personas); R2 = all P1 stories (search & filter enhancements)

---

## Story Map Matrix

### PER-01: Marcus Webb (Operations Manager)
**Journeys:** JRN-01.1 (Morning Permit Triage) · JRN-01.2 (Rapid Permit Lookup)

| Journey Stage | Activity | Epic | Story | NaC | Release |
|---------------|----------|------|-------|-----|---------|
| Login | Authenticate to start the day | Epic 0 (F0) | US-0.1: Login to Permit2 | JTBD-01.1: Login page loads and authenticates within 2 s; redirect to dashboard on valid credentials | R1 |
| Login | Stay authenticated across tab refreshes | Epic 0 (F0) | US-0.2: Stay Logged In Across Page Refreshes | JTBD-01.1: Returning to `/dashboard` after browser refresh requires zero re-authentication steps | R1 |
| Login | Log out at end of session | Epic 0 (F0) | US-0.3: Log Out Securely | JTBD-01.1: Logout clears session and redirects to `/login`; subsequent protected-URL access is blocked | R1 |
| Login | Enforce access control on direct URL | Epic 0 (F0) | US-0.4: Be Redirected to Login When Accessing Protected Routes Unauthenticated | JTBD-01.1: Unauthenticated direct URL access redirects to `/login?redirect=<original>` without exposing any data | R1 |
| Orient | Scan permit status overview | Epic 1 (F1) | US-1.1: View Permit Status Overview at a Glance | JTBD-01.1: Dashboard stat cards show exact database counts (zero variance) for all 5 statuses within 2 s of load | R1 |
| Orient | Read visual status breakdown | Epic 1 (F1) | US-1.2: View a Visual Status Breakdown Chart | JTBD-03.1: Donut chart segment counts sum to Total stat card value; each segment color matches status badge palette | R1 |
| Orient | Spot new / changed permits | Epic 1 (F1) | US-1.3: Review Recent Permit Activity | JTBD-01.1: Recent Activity feed shows ≤10 permits ordered by `updated_at DESC` with status badge and relative timestamp visible without scrolling | R1 |
| Orient | Access permit creation quickly | Epic 1 (F1) | US-1.4: Navigate to Create a Permit from the Dashboard | JTBD-02.1: "Create New Permit" button is visible in dashboard header without scrolling and navigates to `/permits/new` in ≤1 s | R1 |
| Prioritize | Jump to a status group directly | Epic 1 (F1) | US-1.5: Click a Stat Card to Filter the Permit List | JTBD-01.1: Clicking the Pending stat card navigates to `/permits?status=PENDING` and permit list reflects that filter immediately | R1 |
| Act | Review permit details before acting | Epic 5 (F5) | US-5.1: View Full Permit Information on a Dedicated Page | JTBD-01.2: All permit fields, status badge, and conditional action buttons are visible on the detail page within 2 s of navigation | R1 |
| Act | Read audit trail on detail page | Epic 5 (F5) | US-5.2: View the Permit's Status History Timeline | JTBD-01.2: Status history timeline shows all transitions with actor name and `DD MMM YYYY, HH:MM` timestamps — approval event confirmed within 30 s | R1 |
| Act | Navigate back preserving context | Epic 5 (F5) | US-5.3: Navigate Using Breadcrumbs and Back Links | JTBD-01.2: "← Back to Permits" returns to list with previous filter/scroll state intact | R1 |
| Act | Approve a pending permit | Epic 6 (F6) | US-6.1: Approve a Pending Permit | JTBD-01.2: Full approval cycle (open detail → click Approve → confirm dialog → success toast) completes within 90 s; status badge updates to APPROVED in place | R1 |
| Act | Reject a permit with reason | Epic 6 (F6) | US-6.2: Reject a Pending Permit with an Optional Reason | JTBD-01.2: Rejection with optional reason completes within 90 s; REJECTED badge appears; reason stored and visible on detail page | R1 |
| Act | Revoke an approved permit | Epic 6 (F6) | US-6.3: Revoke an Approved Permit | JTBD-01.2: Revocation completes within 90 s; REVOKED badge appears in place; success toast confirms action | R1 |
| Act | Guard against invalid actions | Epic 6 (F6) | US-6.4: Be Prevented from Applying Invalid Lifecycle Actions | JTBD-01.2: No action buttons shown for terminal-state permits; API returns `400 INVALID_TRANSITION` if bypassed directly | R1 |
| Return to queue | Find a permit via free-text search | Epic 4 (F4) | US-4.1: Search Permits by Title, Applicant, or Description | JTBD-01.3: Typing an applicant name filters the 50-record list in real time (≤300 ms debounce); correct permit visible within 30 s | R2 |
| Return to queue | Filter by type and date range | Epic 4 (F4) | US-4.3: Filter Permits by Type and Date Range | JTBD-01.3: Combined type + date range filters narrow results correctly with AND logic; active filter chips confirm what is applied | R2 |
| Return to queue | Share filtered view with colleague | Epic 4 (F4) | US-4.5: Share a Filtered View via URL | JTBD-01.3: URL encodes all active filter state; loading that URL restores the exact filtered view without a full page reload | R2 |

---

### PER-02: Priya Nair (Department Team Lead)
**Journeys:** JRN-02.1 (New Permit Submission) · JRN-02.2 (Self-Serve Status Check)

| Journey Stage | Activity | Epic | Story | NaC | Release |
|---------------|----------|------|-------|-----|---------|
| Login | Authenticate (shared with PER-01) | Epic 0 (F0) | US-0.1: Login to Permit2 | JTBD-02.1: Login page renders in ≤2 s; Priya can reach the permit form within 3 clicks of opening the URL | R1 |
| Access form | Open permit creation form from dashboard | Epic 1 (F1) | US-1.4: Navigate to Create a Permit from the Dashboard | JTBD-02.1: "Create New Permit" CTA is visible without scrolling from the dashboard; form opens in ≤1 s | R1 |
| Fill required fields | Fill structured permit form | Epic 2 (F2) | US-2.1: Create a New Permit Request | JTBD-02.1: All required fields (Title, Type, Applicant, Start Date, End Date, Description) are completable in ≤3 min on first use; permit saved as PENDING | R1 |
| Fill required fields | Get inline validation feedback | Epic 2 (F2) | US-2.2: Receive Inline Validation Feedback on the Creation Form | JTBD-02.1: Inline errors appear on blur (not only on submit); end-before-start date error fires inline before any API call is made | R1 |
| Fill required fields | Select permit type unambiguously | Epic 2 (F2) | US-2.3: Select a Permit Type from a Predefined List | JTBD-02.1: Type dropdown shows 5 defined options; selecting "Safety Permit" sets type without submitting the form; blank type blocked before API call | R1 |
| Submit | Submit permit without ambiguity | Epic 2 (F2) | US-2.1: Create a New Permit Request | JTBD-02.1: Submit button enters loading state during API call; on success navigates immediately to new permit's detail page at PENDING status | R1 |
| Verify submission | Confirm permit is PENDING | Epic 5 (F5) | US-5.1: View Full Permit Information on a Dedicated Page | JTBD-02.1: Auto-navigation to detail page shows PENDING badge and all submitted fields, confirming the request reached the system | R1 |
| Filter to her permits | Filter list to own applicant name | Epic 4 (F4) | US-4.2: Filter Permits by Status | JTBD-02.2: Status filter narrows the list immediately with no "Apply" button; filter value encoded in URL for bookmark | R2 |
| Filter to her permits | Clear all filters to reset view | Epic 4 (F4) | US-4.4: Clear All Active Filters | JTBD-02.2: "Clear all filters" link resets search, status, type, and date in one click; URL returns to `/permits` | R2 |
| Check pending status | Read status badge for own permit | Epic 3 (F3) | US-3.1: View All Permits in a Paginated Table | JTBD-02.2: Status badge (amber Pending / green Approved) is readable at a glance in the list row; any permit's status determinable within 10 s of loading the filtered list | R1 |
| Check pending status | Sort list by submission date | Epic 3 (F3) | US-3.2: Sort the Permit Table by Column | JTBD-02.2: Clicking "Created" column header sorts descending so Priya's most recent submissions appear at top without further filtering | R1 |
| Check pending status | Navigate to a permit detail | Epic 3 (F3) | US-3.3: Navigate to a Permit's Detail View from the List | JTBD-02.2: Row click or title link navigates to `/permits/:id`; Back navigation returns to list with filter/scroll state preserved | R1 |
| Spot the rejection | See contextual actions on list row | Epic 3 (F3) | US-3.4: Use Contextual Quick-Action Links on Permit Rows | JTBD-02.3: REJECTED permit row shows only "View" link — no invalid actions offered; visual cue distinguishes it from PENDING rows | R1 |
| Read rejection reason | Open rejected permit detail | Epic 5 (F5) | US-5.1: View Full Permit Information on a Dedicated Page | JTBD-02.3: Rejection reason is displayed as a prominently placed field on the detail page when status is REJECTED and reason was provided | R1 |
| Read rejection reason | Read status history for context | Epic 5 (F5) | US-5.2: View the Permit's Status History Timeline | JTBD-02.3: Status history timeline shows REJECTED transition with exact timestamp; Priya identifies required correction within 30 s of opening the page | R1 |

---

### PER-03: Daniel Osei (Senior Manager / Stakeholder)
**Journeys:** JRN-03.1 (Weekly Operations Review) · JRN-03.2 (Incident Permit Trace)

| Journey Stage | Activity | Epic | Story | NaC | Release |
|---------------|----------|------|-------|-----|---------|
| Login | Authenticate before ops review | Epic 0 (F0) | US-0.1: Login to Permit2 | JTBD-03.3: Login page renders in ≤2 s with polished, consistent visual design — no layout shift; professional first impression before stakeholder call | R1 |
| Login | Enforce access control | Epic 0 (F0) | US-0.4: Be Redirected to Login When Accessing Protected Routes Unauthenticated | JTBD-03.3: System never exposes a blank or broken page to an unauthenticated user — always redirects cleanly to `/login` | R1 |
| Scan dashboard | Assess real-time permit counts | Epic 1 (F1) | US-1.1: View Permit Status Overview at a Glance | JTBD-03.1: Stat cards (Total, Pending, Approved, Rejected, Revoked) match exact database counts with zero variance; cards load within 2 s | R1 |
| Scan dashboard | Confirm stat counts via API accuracy | Epic 8 (F8) | US-8.3: Have the Dashboard Stats Endpoint Return Accurate Counts | JTBD-03.1: `GET /permits/stats` returns counts matching actual DB records; `total` equals sum of all status counts; no cached values | R1 |
| Validate recent activity | Read activity feed inline | Epic 1 (F1) | US-1.3: Review Recent Permit Activity | JTBD-03.1: Recent Activity feed shows last ≤10 permits with type, status badge, and relative timestamp readable without drilling into any record | R1 |
| Prepare to present | Visual design meets professional bar | Epic 7 (F7) | US-7.1: Experience a Consistent, Professional Visual Design Across All Screens | JTBD-03.3: Consistent typography, spacing, and brand color applied uniformly; dashboard is presentable on a shared screen with no unstyled elements | R1 |
| Prepare to present | Status badges are legible at a glance | Epic 7 (F7) | US-7.2: See Color-Coded Status Badges Everywhere Permit Status Appears | JTBD-03.3: Pill-shaped status badges with semantic colors (amber/green/red/gray) are used identically on dashboard, list, and detail pages — visually professional | R1 |
| Prepare to present | No blank/broken loading states | Epic 7 (F7) | US-7.3: See Skeleton Loading Screens Instead of Blank Pages | JTBD-03.3: Skeleton screens with shimmer animation replace all major data surfaces during load — no blank areas or spinner-only states visible to stakeholders | R1 |
| Prepare to present | View visual chart during presentation | Epic 1 (F1) | US-1.2: View a Visual Status Breakdown Chart | JTBD-03.1: Donut chart answers "what is the permit status distribution?" without any additional clicks — answerable from dashboard alone | R1 |
| Navigate to permit list | Navigate to list for incident trace | Epic 3 (F3) | US-3.1: View All Permits in a Paginated Table | JTBD-03.2: Permit list at `/permits` is reachable in one click from navigation; table with Reference, Title, Type, Applicant, Status, Dates columns loads within 2 s | R1 |
| Search and filter | Find permit by type + date range | Epic 4 (F4) | US-4.3: Filter Permits by Type and Date Range | JTBD-03.2: Combined type + date range filters are composable; active filter chips confirm what is applied; target permit locatable within 30 s | R2 |
| Search and filter | Search by permit title or applicant | Epic 4 (F4) | US-4.1: Search Permits by Title, Applicant, or Description | JTBD-03.2: Free-text search across title + applicant + description returns matching permit in real time (≤300 ms debounce); usable during live incident review | R2 |
| Search and filter | Share filtered view for compliance | Epic 4 (F4) | US-4.5: Share a Filtered View via URL | JTBD-03.2: URL encodes filter state; Daniel can paste the URL into an incident report to reference the exact filtered view | R2 |
| Identify and open permit | Navigate to permit detail | Epic 3 (F3) | US-3.3: Navigate to a Permit's Detail View from the List | JTBD-03.2: Row click navigates to `/permits/:id` in one click; detail page loads with full permit information | R1 |
| Read status history | Confirm approval timeline | Epic 5 (F5) | US-5.2: View the Permit's Status History Timeline | JTBD-03.2: Status history timeline displays every transition (Created → Pending → Approved) with exact `DD MMM YYYY, HH:MM` timestamps; Daniel verifies approval predates incident within 60 s of login | R1 |

---

### Infrastructure Stories (All Personas — System-Level)

> These stories support all journeys via backend reliability, data integrity, and demo-readiness. They are mapped to the foundational "system layer" rather than a single journey stage.

| Journey Stage | Activity | Epic | Story | NaC | Release |
|---------------|----------|------|-------|-----|---------|
| All stages | Actions backed by reliable API | Epic 8 (F8) | US-8.1: Have All Permit Actions Backed by a Reliable REST API | JTBD-01.2: All permit lifecycle PATCH endpoints respond within 2 s; status change is reflected immediately in UI after API success | R1 |
| All stages | Understand API errors clearly | Epic 8 (F8) | US-8.2: Receive Consistent and Meaningful API Error Responses | JTBD-01.2: All error responses use `{ data, error, meta }` envelope; `400 INVALID_TRANSITION` returned for invalid lifecycle actions | R1 |
| All stages | Data persisted reliably | Epic 9 (F9) | US-9.1: Have All Permit Data Persisted Reliably in a Database | JTBD-01.1: All permit fields and status history records persist across sessions; lifecycle transitions atomic — no partial state writes | R1 |
| All stages | Credentials stored securely | Epic 9 (F9) | US-9.2: Have Manager Accounts Stored Securely | JTBD-01.1: Passwords stored as bcrypt hashes (cost ≥10); plaintext never stored or logged; login API accepts only hashed comparison | R1 |
| All stages | Demo-ready with realistic seed data | Epic 9 (F9) | US-9.3: Explore the System with Realistic Sample Data Pre-Loaded | JTBD-03.1: Seed script populates ≥10–15 permits across all statuses and types with realistic titles/names; dashboard stat cards show meaningful non-zero counts for Daniel's first walkthrough | R1 |
| All stages | Actions confirmed via toast | Epic 7 (F7) | US-7.4: Receive Transient Toast Notifications for Actions | JTBD-01.2: Success/error toasts appear within 2 s of action completion; auto-dismiss at 5 s (success) / 8 s (error); Marcus always knows if approve/reject/revoke succeeded | R1 |
| All stages | Usable on laptop / desktop widths | Epic 7 (F7) | US-7.5: Use the Application on Laptop and Desktop Viewport Widths | JTBD-03.3: All screens fully functional at 1024 px–1440 px; stat cards display in horizontal row on desktop; table does not overflow at 1024 px | R1 |

---

## NaC Derivation Table

| JTBD ID | Outcome | Journey Stage | NaC | Story |
|---------|---------|---------------|-----|-------|
| JTBD-01.1 | Dashboard shows real-time permit counts at workday start | JRN-01.1: Orient (Scan dashboard) | Dashboard stat cards display exact database counts for all 5 statuses within 2 s; zero variance between displayed and actual counts | US-1.1 |
| JTBD-01.1 | Pending permits visually distinguished without manual filtering | JRN-01.1: Orient (Scan dashboard) | Pending stat card uses amber color; clicking it navigates to pre-filtered permit list at `/permits?status=PENDING` | US-1.5 |
| JTBD-01.1 | Recent activity feed surfaces last 5–10 updated permits | JRN-01.1: Prioritize (Spot new permits) | Recent Activity panel shows ≤10 permits ordered by `updated_at DESC` with status badge and relative timestamp visible without scrolling | US-1.3 |
| JTBD-01.1 | Login adds zero friction to morning routine | JRN-01.1: Login | Session persists across browser refreshes; navigating to `/dashboard` while authenticated loads page immediately without re-auth | US-0.2 |
| JTBD-01.1 | Permit status accurate — no stale pending counts | JRN-01.1: Return to queue | Status change reflected immediately after approve/reject/revoke; returning to dashboard shows updated counts with zero variance | US-9.1 |
| JTBD-01.2 | Approve/reject completes within 90 s from detail page | JRN-01.1: Act (Approve/Reject) | Clicking Approve + confirming dialog updates status badge to APPROVED in place and shows success toast — full cycle within 90 s | US-6.1 |
| JTBD-01.2 | Reject permit and record reason | JRN-01.1: Act (Reject) | Rejection with optional reason completes within 90 s; REJECTED badge appears in place; reason text stored and immediately visible on detail page | US-6.2 |
| JTBD-01.2 | Revoke approved permit when conditions change | JRN-01.1: Act (Revoke) | Revoke action available only when status is APPROVED; confirmation dialog + success toast; REVOKED badge appears in place | US-6.3 |
| JTBD-01.2 | Terminal-state permits cannot be re-acted on | JRN-01.1: Act (Guard invalid actions) | No action buttons shown for REJECTED/REVOKED permits; API returns `400 INVALID_TRANSITION` if attempted via direct call | US-6.4 |
| JTBD-01.3 | Any permit locatable within 30 s in a 50-record dataset | JRN-01.2: Search (Free-text) | Typing applicant name in search bar filters list in real time (≤300 ms debounce); correct permit visible in filtered results before opening any record | US-4.1 |
| JTBD-01.3 | Combined filters narrow results to specific intersection | JRN-01.2: Search (Type + date range) | Type filter + date range filter composable with AND logic; active filter chips displayed; any permit in 50-record set locatable within 30 s | US-4.3 |
| JTBD-01.3 | Active filters visually indicated | JRN-01.2: Search (Filter state) | Each active filter shown as a removable chip below the filter bar; filter state reflected in URL for shareability | US-4.5 |
| JTBD-02.1 | Permit creation form completable in ≤3 min on first use | JRN-02.1: Fill required fields | All required fields have clear labels and placeholder hints; form completable with zero ambiguity-related validation failures; permit saved as PENDING on success | US-2.1 |
| JTBD-02.1 | Inline validation prevents submission errors | JRN-02.1: Set dates (Date validation) | End date before start date shows inline error immediately on blur — before any API call; form scrolls to first invalid field on submit attempt | US-2.2 |
| JTBD-02.1 | Permit type selected unambiguously from dropdown | JRN-02.1: Fill required fields (Type) | Permit Type dropdown shows 5 defined options with placeholder; blank type blocked at form level; invalid type returns `400 VALIDATION_ERROR` from API | US-2.3 |
| JTBD-02.1 | Auto-navigate to PENDING detail after submission | JRN-02.1: Verify submission | On successful creation, Priya is navigated to new permit's detail page showing PENDING badge — immediate proof the request was received | US-2.1 |
| JTBD-02.2 | Status of any submitted permit visible within 10 s | JRN-02.2: Check pending status | Status badge (amber Pending / green Approved / red Rejected) readable at a glance in the list row; any permit's status determinable within 10 s of loading the filtered list | US-3.1 |
| JTBD-02.2 | Filter to own permits without instruction | JRN-02.2: Filter to her permits | Status filter applies immediately with no "Apply" button; filter state encoded in URL; "Clear all filters" resets all in one click | US-4.2, US-4.4 |
| JTBD-02.3 | Rejection reason visible within 30 s on detail page | JRN-02.2: Read rejection reason | Rejection reason field displayed prominently on permit detail page when status is REJECTED and reason was provided by Marcus | US-5.1 |
| JTBD-02.3 | Status history shows REJECTED transition with timestamp | JRN-02.2: Read rejection reason (Timeline) | Status history timeline shows REJECTED event with actor name and exact timestamp; Priya identifies required correction within 30 s | US-5.2 |
| JTBD-03.1 | Overall permit health assessable within 30 s of login | JRN-03.1: Scan dashboard | Stat cards (Total, Pending, Approved, Rejected, Revoked) + donut chart display accurate counts within 2 s; Daniel can answer operational questions from dashboard alone | US-1.1, US-1.2 |
| JTBD-03.1 | Recent activity feed readable inline without drilling in | JRN-03.1: Validate recent activity | Activity feed shows last ≤10 permits with type, status, and timestamp — no click-through required to understand what changed | US-1.3 |
| JTBD-03.1 | Stats API returns accurate counts | JRN-03.1: Scan dashboard (API accuracy) | `GET /permits/stats` returns `{ total, pending, approved, rejected, revoked }` matching exact DB state; `total` = sum of all status counts; no cached values | US-8.3 |
| JTBD-03.2 | Specific permit locatable within 60 s during live review | JRN-03.2: Search and filter | Combined type + date range + text search narrows to target permit in ≤30 s; detail page reachable in one additional click | US-4.1, US-4.3 |
| JTBD-03.2 | Status history timeline shows all transitions with timestamps | JRN-03.2: Read status history | Status history panel shows every transition (Created → Pending → Approved/Rejected) with exact `DD MMM YYYY, HH:MM` timestamps; Daniel independently verifies approval predates incident | US-5.2 |
| JTBD-03.3 | Application renders with production-grade visual quality | JRN-03.1: Prepare to present | Consistent typography, spacing, brand color, and semantic status badges applied uniformly; skeleton screens during load; no unstyled elements or blank states | US-7.1, US-7.2, US-7.3 |
| JTBD-03.3 | Login page loads in ≤2 s with polished design | JRN-03.1: Login (First impression) | Login page renders without layout shift in ≤2 s; visual design matches production SaaS bar — indistinguishable from polished product on first impression | US-0.1 |
| JTBD-03.3 | Actions confirmed via toasts — no silent failures | JRN-03.1: All screens | Success/error toasts appear within 2 s of every action; auto-dismiss correctly; no blank confirmations or silent failures during any stakeholder walkthrough | US-7.4 |

---

## Release Planning

### Release R1: "End-to-End Core Workflow" (MVP)

**Theme:** Every persona can complete their primary journey end-to-end. Marcus can log in, triage permits, approve/reject/revoke. Priya can submit a permit and check its status. Daniel can review the dashboard and trace a permit's history.

**Stories (34 P0):**
US-0.1, US-0.2, US-0.3, US-0.4,
US-1.1, US-1.2, US-1.3, US-1.4, US-1.5,
US-2.1, US-2.2, US-2.3,
US-3.1, US-3.2, US-3.3, US-3.4,
US-5.1, US-5.2, US-5.3,
US-6.1, US-6.2, US-6.3, US-6.4,
US-7.1, US-7.2, US-7.3, US-7.4, US-7.5,
US-8.1, US-8.2, US-8.3,
US-9.1, US-9.2, US-9.3

**Personas Served:** PER-01 (Marcus), PER-02 (Priya), PER-03 (Daniel)

**JTBD Addressed:** JTBD-01.1, JTBD-01.2, JTBD-02.1, JTBD-02.2, JTBD-02.3, JTBD-03.1, JTBD-03.3

**Journey Completeness:**

| Persona | Journey | Stages Covered | Complete? |
|---------|---------|---------------|-----------|
| PER-01 (Marcus) | JRN-01.1: Morning Triage | Login → Orient → Prioritize → Act → Return to queue | ✅ Yes |
| PER-02 (Priya) | JRN-02.1: Permit Submission | Login → Access form → Fill → Submit → Verify | ✅ Yes |
| PER-02 (Priya) | JRN-02.2: Status Check | Login → Permit list → Check status → Read rejection reason | ✅ Yes (manual scroll in lieu of applicant filter) |
| PER-03 (Daniel) | JRN-03.1: Weekly Ops Review | Login → Scan dashboard → Validate activity → Present | ✅ Yes |
| PER-03 (Daniel) | JRN-03.2: Incident Trace | Login → Navigate to list → Identify → Open detail → Read history | ✅ Yes (manual list scan in lieu of combined filter) |

**Acceptance Gate:**
- [ ] All 34 P0 story acceptance criteria pass in the POC environment
- [ ] All personas can complete their primary journey end-to-end without guidance
- [ ] Dashboard stat cards show zero-variance counts with seeded data
- [ ] Full lifecycle (create → approve → revoke) completable in under 5 minutes
- [ ] Application renders with production-grade visual quality on a shared screen

---

### Release R2: "Precision Navigation" (P1 Enhancements)

**Theme:** Search and filter capabilities unlock rapid permit lookup for all personas — completing JRN-01.2 (Marcus's rapid lookup) and JRN-03.2 (Daniel's incident trace) at full fidelity, and enabling Priya's self-serve filter workflow.

**Stories (5 P1):**
US-4.1, US-4.2, US-4.3, US-4.4, US-4.5

**Personas Served:** PER-01 (Marcus), PER-02 (Priya), PER-03 (Daniel)

**JTBD Addressed:** JTBD-01.3, JTBD-02.2 (enhanced), JTBD-03.2 (enhanced)

**Journey Completeness:**

| Persona | Journey | New Stages Unlocked | Complete? |
|---------|---------|-------------------|-----------|
| PER-01 (Marcus) | JRN-01.2: Rapid Lookup | Search → Identify → Confirm (full multi-field search) | ✅ Yes |
| PER-02 (Priya) | JRN-02.2: Self-Serve Status Check | Filter to her permits → Check status → Spot rejection | ✅ Yes (applicant-name filter fully functional) |
| PER-03 (Daniel) | JRN-03.2: Incident Trace | Search and filter (type + date range composable) | ✅ Yes |

**Acceptance Gate:**
- [ ] All 5 P1 story acceptance criteria pass
- [ ] Any permit in a 50-record dataset locatable within 30 s using search or combined filters
- [ ] Active filter state reflected in URL; shareable filtered views load correctly
- [ ] "Clear all filters" resets all controls in one click
- [ ] R1 journeys remain unbroken — filter layer does not regress existing functionality

---

## Coverage Analysis

### Persona Coverage

| Persona | R1 Stories | R2 Stories | End-to-End Journey (R1) | End-to-End Journey (Full) |
|---------|-----------|-----------|------------------------|--------------------------|
| PER-01 Marcus (Ops Manager) | US-0.1–0.4, US-1.1–1.5, US-3.1–3.4, US-5.1–5.3, US-6.1–6.4, US-7.x, US-8.x, US-9.x | US-4.1, US-4.3, US-4.5 | ✅ JRN-01.1 complete | ✅ JRN-01.1 + JRN-01.2 |
| PER-02 Priya (Team Lead) | US-0.1, US-1.4, US-2.1–2.3, US-3.1–3.4, US-5.1–5.3, US-7.3 | US-4.2, US-4.4 | ✅ JRN-02.1 + JRN-02.2 (partial filter) | ✅ JRN-02.1 + JRN-02.2 (full) |
| PER-03 Daniel (Sr. Manager) | US-0.1, US-0.4, US-1.1–1.3, US-3.1, US-3.3, US-5.2, US-7.1–7.5, US-8.3, US-9.3 | US-4.1, US-4.3, US-4.5 | ✅ JRN-03.1 complete | ✅ JRN-03.1 + JRN-03.2 |

### JTBD Coverage

| JTBD ID | Priority | Release | Key Stories | NaC Count |
|---------|----------|---------|-------------|-----------|
| JTBD-01.1 | P0 | R1 | US-0.2, US-1.1, US-1.3, US-1.5, US-9.1 | 5 |
| JTBD-01.2 | P0 | R1 | US-5.1, US-5.2, US-6.1, US-6.2, US-6.3, US-6.4, US-7.4, US-8.1 | 8 |
| JTBD-01.3 | P1 | R2 | US-4.1, US-4.3, US-4.5 | 3 |
| JTBD-02.1 | P0 | R1 | US-1.4, US-2.1, US-2.2, US-2.3 | 4 |
| JTBD-02.2 | P0 | R1+R2 | US-3.1, US-3.2, US-3.3, US-4.2, US-4.4 | 3 |
| JTBD-02.3 | P1 | R1 | US-5.1, US-5.2 | 2 |
| JTBD-03.1 | P0 | R1 | US-1.1, US-1.2, US-1.3, US-8.3, US-9.3 | 3 |
| JTBD-03.2 | P1 | R1+R2 | US-3.3, US-5.2, US-4.1, US-4.3 | 2 |
| JTBD-03.3 | P0 | R1 | US-0.1, US-7.1, US-7.2, US-7.3, US-7.4, US-7.5 | 3 |

### Gap Analysis

**JTBD outcomes without dedicated stories:**
- None — all 9 JTBD outcomes are covered by at least one story in R1 or R2.

**Journey stages without feature coverage:**
- None — all 6 journeys (JRN-01.1, JRN-01.2, JRN-02.1, JRN-02.2, JRN-03.1, JRN-03.2) have stories mapped to every stage. JRN-01.2 and JRN-03.2 "Search and filter" stages reach full fidelity only in R2; R1 provides partial coverage via manual list scroll.

**Orphan stories (not mapped to any journey stage):**
- None — all 39 stories (US-0.1 through US-9.3) appear in the map. US-8.x and US-9.x are mapped to the Infrastructure layer (system-level, all journeys) rather than a single stage, which is by design for backend stories.

**Notes on R1 partial coverage:**
- **JRN-02.2 "Filter to her permits":** R1 provides the permit list (US-3.1) and sort (US-3.2) for Priya to find her permits by scrolling, but the applicant-name filter (US-4.2) is R2. Priya can still complete her journey in R1 — just with slightly more scrolling.
- **JRN-03.2 "Search and filter":** R1 provides the permit list and manual navigation. Combined type + date filter (US-4.3) arrives in R2, giving Daniel precision search during incident traces.

---

## NaC-to-Acceptance Criteria Mapping

| NaC | Story | Acceptance Criteria (from UserStories-Permit2.md) | Aligned? |
|-----|-------|--------------------------------------------------|----------|
| JTBD-01.1: Dashboard stat cards match database with zero variance within 2 s | US-1.1 | "Each stat card shows the correct count matching actual database records at time of fetch" + "Skeleton placeholders animate while data is loading" | ✅ Yes |
| JTBD-01.1: Clicking Pending stat card navigates to pre-filtered list | US-1.5 | "Clicking the 'Pending' stat card navigates to `/permits?status=PENDING`" + "The permit list correctly reflects the filtered results on arrival" | ✅ Yes |
| JTBD-01.1: Session persists across browser refreshes with zero re-auth | US-0.2 | "Session persists across browser page refreshes without requiring re-login" + "Navigating directly to a protected route while authenticated loads the page immediately" | ✅ Yes |
| JTBD-01.2: Full approval cycle completes within 90 s; status updates in place | US-6.1 | "Clicking 'Approve Permit' calls `PATCH /permits/:id/approve`; on success: dialog closes, success toast appears, page status badge updates to APPROVED" | ✅ Yes |
| JTBD-01.2: Rejection with optional reason; REJECTED badge appears in place | US-6.2 | "On success: dialog closes, toast 'Permit rejected.' appears, page status updates to REJECTED" + "If a rejection reason was entered, it is displayed in the permit details" | ✅ Yes |
| JTBD-01.2: Revoke available only when APPROVED; success toast confirms | US-6.3 | "A 'Revoke' button is visible on the detail page only when the permit status is APPROVED" + "On success: dialog closes, toast 'Permit revoked.' appears, page status updates to REVOKED" | ✅ Yes |
| JTBD-01.2: No action buttons for terminal-state permits; API blocks invalid transitions | US-6.4 | "No action buttons are shown for permits in terminal states (REJECTED, REVOKED)" + "The server returns 400 INVALID_TRANSITION if an invalid action is attempted via the API directly" | ✅ Yes |
| JTBD-01.3: Free-text search matches title + applicant + description in real time (≤300 ms) | US-4.1 | "Search matches against permit title, applicant name, and description (case-insensitive)" + "Results update after a 300ms debounce following the last keystroke" | ✅ Yes |
| JTBD-01.3: Combined type + date range filters narrow with AND logic; chips show state | US-4.3 | "Multiple filters are combined with AND logic (status + type + date range all apply simultaneously)" + "Each active filter is visible as a removable chip below the filter bar" | ✅ Yes |
| JTBD-02.1: Creation form completable in ≤3 min; auto-navigate to PENDING detail | US-2.1 | "On successful submission, the permit is saved with status PENDING and the manager is navigated to the new permit's detail view" | ✅ Yes |
| JTBD-02.1: Inline date error fires before API call | US-2.2 | "End date before start date shows the error 'End date must be on or after the start date.'" + "Each required field shows an inline error message below it if left empty on blur or on submit attempt" | ✅ Yes |
| JTBD-02.2: Any permit's status readable within 10 s in the list | US-3.1 | "Status is displayed as a color-coded badge (amber=Pending, green=Approved, red=Rejected, gray=Revoked)" + "Skeleton rows displayed while data is loading" | ✅ Yes |
| JTBD-02.2: Status filter applies immediately; encoded in URL | US-4.2 | "Selecting a status immediately filters the list; no 'Apply' button required" + "Status filter value is reflected in the URL (`?status=PENDING`)" | ✅ Yes |
| JTBD-02.3: Rejection reason displayed prominently on detail page | US-5.1 | "Rejection Reason is displayed when status is REJECTED and a reason was provided" + "The current status is shown as a prominently placed color-coded badge near the top of the page" | ✅ Yes |
| JTBD-02.3: Status history shows REJECTED transition with exact timestamp | US-5.2 | "Each event shows: status badge, event label, actor name, and timestamp formatted as DD MMM YYYY, HH:MM" | ✅ Yes |
| JTBD-03.1: `GET /permits/stats` returns accurate counts; no cached values | US-8.3 | "`GET /permits/stats` returns `{ total, pending, approved, rejected, revoked }` counts" + "Counts reflect the real-time database state at time of fetch — no cached or stale values" | ✅ Yes |
| JTBD-03.1: Activity feed shows type, status, timestamp without drilling in | US-1.3 | "Each row shows a status badge, permit title (truncated at ~40 chars), applicant name, and relative time" | ✅ Yes |
| JTBD-03.2: Status history shows all transitions with timestamps for incident trace | US-5.2 | "Timeline is ordered chronologically, oldest event at top" + "Each event shows: status badge, event label, actor name, and timestamp" | ✅ Yes |
| JTBD-03.3: Consistent design language across all screens; skeleton screens during load | US-7.1 | "A consistent typography scale (Inter font, defined heading/body sizes) is applied across all pages" + "Semantic status colors applied uniformly across badges, charts, and filter controls" | ✅ Yes |
| JTBD-03.3: Pill-shaped color-coded status badges used identically everywhere | US-7.2 | "Status badges are pill-shaped (border-radius: 9999px) with horizontal padding 12px" + "The same StatusBadge component is used consistently on the dashboard, permit list, and detail page" | ✅ Yes |
| JTBD-03.3: Skeleton screens replace all major data surfaces during load | US-7.3 | "Skeleton screens with shimmer animation replace content on the dashboard, permit list, and detail page while data is fetching" + "Spinner-only loading is not used as the sole loading indicator on any major data surface" | ✅ Yes |

**NaC Alignment Summary:** 21 of 21 NaC entries verified as fully aligned with UserStories acceptance criteria. No misalignments detected.

---

*Document generated by Pivota Spec Framework*
*Last updated: 2026-08-06 | Project: Permit2 | Version: 1.0*
