# User Stories
## Permit2 — Permit Management System (POC)

| Field | Value |
|-------|-------|
| **Product Name** | Permit2 |
| **Date** | 2026-08-06 |
| **Related PRD** | PRD-Permit2.md |
| **Related FRD** | FRD-Permit2.md |

---

## Story Format

Each story follows: **As a [persona], I want to [action], so that [outcome].**

Acceptance criteria are listed beneath each story. Stories are grouped by epic and prioritised.

### Personas
| ID | Name | Role |
|----|------|------|
| PER-01 | Marcus Webb | Operations Manager |
| PER-02 | Priya Nair | Department Team Lead |
| PER-03 | Daniel Osei | Senior Manager / Stakeholder |

---

## Epic 0: Manager Authentication (F0)

### US-0.1: Login to Permit2
**As a** Marcus Webb, **I want to** log in with my email and password, **so that** I can access the permit management system securely.

**Acceptance Criteria:**
- [ ] A styled login page is displayed at `/login` with email and password fields and a "Sign In" button
- [ ] Form focus is placed on the email field automatically on page load
- [ ] Submitting valid credentials redirects to the dashboard (`/dashboard`)
- [ ] Invalid credentials show a generic inline error "Invalid email or password." without revealing which field is wrong
- [ ] Empty email or password fields show an inline validation error before any API call is made
- [ ] The "Sign In" button enters a loading/disabled state while the API call is in flight

**Priority:** P0 | **Feature Ref:** F0

---

### US-0.2: Stay Logged In Across Page Refreshes
**As a** Marcus Webb, **I want to** remain logged in after refreshing the browser, **so that** I don't have to re-authenticate every time I open a new tab or reload the page.

**Acceptance Criteria:**
- [ ] Session persists across browser page refreshes without requiring re-login
- [ ] Navigating directly to a protected route (e.g., `/dashboard`) while authenticated loads the page immediately
- [ ] Session token is stored securely (httpOnly cookie or equivalent)

**Priority:** P0 | **Feature Ref:** F0

---

### US-0.3: Log Out Securely
**As a** Marcus Webb, **I want to** log out from the navigation header, **so that** my session is cleared and no one else can access the system from my browser.

**Acceptance Criteria:**
- [ ] A "Logout" control is visible in the persistent navigation header on all authenticated pages
- [ ] Clicking "Logout" calls `POST /auth/logout` and clears the session
- [ ] After logout, the user is redirected to `/login`
- [ ] Navigating to a protected route after logout redirects back to `/login`

**Priority:** P0 | **Feature Ref:** F0

---

### US-0.4: Be Redirected to Login When Accessing Protected Routes Unauthenticated
**As a** Daniel Osei, **I want to** be redirected to the login page when I access any URL directly without being logged in, **so that** the system enforces access control and I know where to authenticate.

**Acceptance Criteria:**
- [ ] Any direct URL access to a protected page (e.g., `/permits`, `/permits/123`) by an unauthenticated user redirects to `/login`
- [ ] The original URL is preserved as a `?redirect=` query param so the user lands on the intended page after login
- [ ] An already-authenticated user navigating to `/login` is redirected to `/dashboard`

**Priority:** P0 | **Feature Ref:** F0

---

## Epic 1: Manager Dashboard (F1)

### US-1.1: View Permit Status Overview at a Glance
**As a** Marcus Webb, **I want to** see a summary of all permit counts by status when I log in, **so that** I can immediately understand the current permit landscape without navigating to individual records.

**Acceptance Criteria:**
- [ ] Dashboard displays five stat cards: Total Permits, Pending, Approved, Rejected, Revoked
- [ ] Each stat card shows the correct count matching actual database records at time of fetch
- [ ] Stat cards use semantic colors: amber for Pending, green for Approved, red for Rejected, gray for Revoked
- [ ] Skeleton placeholders animate while data is loading
- [ ] If the stats API fails, cards show "–" with a retry option and an error toast

**Priority:** P0 | **Feature Ref:** F1

---

### US-1.2: View a Visual Status Breakdown Chart
**As a** Daniel Osei, **I want to** see a visual chart showing the distribution of permits by status, **so that** I can assess overall permit health in a single glance during a review.

**Acceptance Criteria:**
- [ ] A donut (or bar) chart is rendered showing permit distribution across all statuses
- [ ] Each chart segment is color-coded to match the status badge color system
- [ ] Hovering a segment shows a tooltip with status name, count, and percentage
- [ ] The chart center label displays the total permit count
- [ ] Chart is labeled "Permits by Status"

**Priority:** P0 | **Feature Ref:** F1

---

### US-1.3: Review Recent Permit Activity
**As a** Marcus Webb, **I want to** see the most recently created or updated permits in a feed on the dashboard, **so that** I can quickly spot new or recently changed permits without visiting the full list.

**Acceptance Criteria:**
- [ ] Recent Activity panel displays up to 10 permits ordered by `updated_at DESC`
- [ ] Each row shows a status badge, permit title (truncated at ~40 chars), applicant name, and relative time (e.g., "2 hours ago")
- [ ] Clicking a row navigates to the permit's detail page (`/permits/:id`)
- [ ] A "View all permits" link at the bottom navigates to `/permits`
- [ ] An empty state is shown when no permits exist yet

**Priority:** P0 | **Feature Ref:** F1

---

### US-1.4: Navigate to Create a Permit from the Dashboard
**As a** Marcus Webb, **I want to** see a prominent "Create New Permit" button on the dashboard, **so that** I can start a new permit request without hunting through menus.

**Acceptance Criteria:**
- [ ] A "Create New Permit" primary button is visible in the dashboard page header
- [ ] Clicking the button navigates to `/permits/new`
- [ ] The button is styled using the brand primary color and is visually prominent

**Priority:** P0 | **Feature Ref:** F1

---

### US-1.5: Click a Stat Card to Filter the Permit List
**As a** Marcus Webb, **I want to** click a status stat card on the dashboard and be taken directly to the filtered permit list, **so that** I can immediately act on the permits in that status without manually applying filters.

**Acceptance Criteria:**
- [ ] Clicking the "Pending" stat card navigates to `/permits?status=PENDING`
- [ ] Clicking the "Approved" stat card navigates to `/permits?status=APPROVED`
- [ ] Clicking the "Rejected" stat card navigates to `/permits?status=REJECTED`
- [ ] Clicking the "Revoked" stat card navigates to `/permits?status=REVOKED`
- [ ] The permit list correctly reflects the filtered results on arrival

**Priority:** P0 | **Feature Ref:** F1

---

## Epic 2: Permit Creation (F2)

### US-2.1: Create a New Permit Request
**As a** Priya Nair, **I want to** fill in a structured form to submit a new permit request, **so that** the permit is formally recorded in the system and routed for approval without requiring any emails.

**Acceptance Criteria:**
- [ ] The creation form at `/permits/new` contains fields for: Title, Permit Type, Applicant Name, Start Date, End Date, Description, and Additional Notes (optional)
- [ ] All required fields are marked with an asterisk (`*`)
- [ ] On successful submission, the permit is saved with status `PENDING` and the manager is navigated to the new permit's detail view
- [ ] The "Submit Permit" button enters a loading/disabled state while the API call is in flight
- [ ] A "Cancel" button returns the manager to the previous page without saving any data

**Priority:** P0 | **Feature Ref:** F2

---

### US-2.2: Receive Inline Validation Feedback on the Creation Form
**As a** Priya Nair, **I want to** see clear inline error messages when I fill in the permit form incorrectly, **so that** I can correct mistakes before submitting and avoid rejected permits caused by bad data.

**Acceptance Criteria:**
- [ ] Each required field shows an inline error message below it if left empty on blur or on submit attempt
- [ ] End date before start date shows the error "End date must be on or after the start date."
- [ ] Selecting an invalid or blank permit type shows a validation error
- [ ] Field with an error has a red border; a valid field shows a green checkmark after blur
- [ ] On submit with errors, the page scrolls to the first invalid field and focuses it
- [ ] Server-side validation errors are surfaced as a toast with field-level details

**Priority:** P0 | **Feature Ref:** F2

---

### US-2.3: Select a Permit Type from a Predefined List
**As a** Priya Nair, **I want to** select a permit type from a clear dropdown, **so that** I categorize the permit correctly without typing free text that could be inconsistent.

**Acceptance Criteria:**
- [ ] Permit Type field is a dropdown with options: Work Permit, Access Permit, Activity Authorization, Safety Permit, Other
- [ ] The dropdown shows a placeholder "Select a permit type…" by default
- [ ] Selecting a type updates the field without submitting the form
- [ ] An unknown or blank type value submitted to the API returns a validation error

**Priority:** P0 | **Feature Ref:** F2

---

## Epic 3: Permit List / Table View (F3)

### US-3.1: View All Permits in a Paginated Table
**As a** Marcus Webb, **I want to** see all permits in a sortable, paginated table, **so that** I can survey the full permit inventory and quickly identify which ones need attention.

**Acceptance Criteria:**
- [ ] The permit list at `/permits` displays a table with columns: Reference, Title, Type, Applicant, Status, Start Date, End Date, Created, Actions
- [ ] Status is displayed as a color-coded badge (amber=Pending, green=Approved, red=Rejected, gray=Revoked)
- [ ] The table is paginated with a default of 20 rows per page
- [ ] Pagination controls show "Showing X–Y of Z permits" and Previous/Next buttons
- [ ] Skeleton rows with shimmer animation are displayed while data is loading
- [ ] An empty state is shown when no permits exist or no permits match active filters

**Priority:** P0 | **Feature Ref:** F3

---

### US-3.2: Sort the Permit Table by Column
**As a** Marcus Webb, **I want to** sort the permit list by clicking a column header, **so that** I can quickly reorder permits by date, status, or applicant to find what I need.

**Acceptance Criteria:**
- [ ] Clicking a sortable column header sorts the list ascending by that column
- [ ] Clicking the same header again toggles the sort to descending
- [ ] The active sort column and direction are visually indicated (e.g., arrow icon)
- [ ] Sort state is reflected in the URL (`?sort=created_at&order=desc`) and preserved on page reload
- [ ] Sortable columns include: Title, Type, Applicant, Status, Start Date, End Date, Created

**Priority:** P0 | **Feature Ref:** F3

---

### US-3.3: Navigate to a Permit's Detail View from the List
**As a** Marcus Webb, **I want to** click a permit row to open its detail page, **so that** I can review the full permit information and take action without losing my place in the list.

**Acceptance Criteria:**
- [ ] Clicking anywhere on a permit row (except action links) navigates to `/permits/:id`
- [ ] The Title column also provides a dedicated clickable link to the detail view
- [ ] Back navigation from the detail page returns to the list with filter and scroll position preserved

**Priority:** P0 | **Feature Ref:** F3

---

### US-3.4: Use Contextual Quick-Action Links on Permit Rows
**As a** Marcus Webb, **I want to** see contextual action links in each permit row based on the permit's status, **so that** I can approve, reject, or revoke permits directly from the list without opening each detail page first.

**Acceptance Criteria:**
- [ ] `PENDING` permits show "View", "Approve", and "Reject" action links
- [ ] `APPROVED` permits show "View" and "Revoke" action links
- [ ] `REJECTED` and `REVOKED` permits show only a "View" link
- [ ] Clicking "Approve", "Reject", or "Revoke" navigates to the detail page and auto-opens the relevant confirmation dialog
- [ ] Action links are visually distinct from the row click area

**Priority:** P0 | **Feature Ref:** F3

---

## Epic 4: Search & Filter (F4)

### US-4.1: Search Permits by Title, Applicant, or Description
**As a** Marcus Webb, **I want to** type a search query in a search bar above the permit list, **so that** I can instantly locate a specific permit by name or applicant without scrolling through hundreds of rows.

**Acceptance Criteria:**
- [ ] A search input is displayed above the permit table with placeholder "Search permits by title, applicant, or description…"
- [ ] Search matches against permit title, applicant name, and description (case-insensitive)
- [ ] Results update after a 300ms debounce following the last keystroke
- [ ] Clearing the search field immediately resets results to the unfiltered list
- [ ] Search term is reflected in the URL (`?search=...`) for shareability
- [ ] Maximum search query length is 100 characters

**Priority:** P1 | **Feature Ref:** F4

---

### US-4.2: Filter Permits by Status
**As a** Priya Nair, **I want to** filter the permit list to show only permits of a specific status (e.g., Pending), **so that** I can focus on what's relevant without noise from permits in other states.

**Acceptance Criteria:**
- [ ] A status filter (pill group or dropdown) offers options: All, Pending, Approved, Rejected, Revoked
- [ ] Selecting a status immediately filters the list; no "Apply" button required
- [ ] The active status filter is visually highlighted with the status color
- [ ] Status filter value is reflected in the URL (`?status=PENDING`)
- [ ] Selecting "All" removes the status filter and shows all permits

**Priority:** P1 | **Feature Ref:** F4

---

### US-4.3: Filter Permits by Type and Date Range
**As a** Marcus Webb, **I want to** filter permits by type and date range simultaneously, **so that** I can narrow results to a specific category of work within a relevant time window.

**Acceptance Criteria:**
- [ ] A permit type dropdown allows filtering by: All Types, Work Permit, Access Permit, Activity Authorization, Safety Permit, Other
- [ ] Two date pickers ("From" and "To") filter permits where `start_date` falls within the selected range
- [ ] Multiple filters are combined with AND logic (status + type + date range all apply simultaneously)
- [ ] If `start_date_from` is after `start_date_to`, an inline warning is shown and the date filters are not applied
- [ ] Each active filter is visible as a removable chip below the filter bar

**Priority:** P1 | **Feature Ref:** F4

---

### US-4.4: Clear All Active Filters
**As a** Priya Nair, **I want to** clear all active filters and search with a single click, **so that** I can return to the full unfiltered list without manually resetting each control.

**Acceptance Criteria:**
- [ ] A "Clear all filters" link appears below the filter bar when any filter or search is active
- [ ] Clicking it resets search, status, type, and date range to their defaults
- [ ] The URL is updated to `/permits` (no query params) after clearing
- [ ] The "Clear all filters" link is hidden when no filters are active

**Priority:** P1 | **Feature Ref:** F4

---

### US-4.5: Share a Filtered View via URL
**As a** Daniel Osei, **I want to** copy a URL that encodes my current filter state, **so that** I can share a specific filtered permit view with a colleague or bookmark it for later use.

**Acceptance Criteria:**
- [ ] All filter and search state is reflected in the URL query string in real time
- [ ] Loading a URL with query params (e.g., `/permits?status=PENDING&type=WORK`) restores the correct filter state
- [ ] Filter state is preserved when navigating to a permit detail and pressing Back
- [ ] No full page reload is required when filters change — URL updates via client-side routing

**Priority:** P1 | **Feature Ref:** F4

---

## Epic 5: Permit Detail View (F5)

### US-5.1: View Full Permit Information on a Dedicated Page
**As a** Priya Nair, **I want to** open a permit's detail page to see all of its fields and current status, **so that** I have a complete, authoritative view of the permit without having to refer to emails or spreadsheets.

**Acceptance Criteria:**
- [ ] Detail page at `/permits/:id` displays: Title, Type, Applicant Name, Description, Notes, Start Date, End Date, Status, Created date, Last Updated date
- [ ] The current status is shown as a prominently placed color-coded badge near the top of the page
- [ ] Rejection Reason is displayed when status is `REJECTED` and a reason was provided
- [ ] Revocation Reason is displayed when status is `REVOKED` and a reason was provided
- [ ] Skeleton layout is shown while permit data is loading
- [ ] A 404 state ("Permit Not Found") is shown if the permit ID does not exist

**Priority:** P0 | **Feature Ref:** F5

---

### US-5.2: View the Permit's Status History Timeline
**As a** Marcus Webb, **I want to** see a chronological timeline of all status changes on the permit detail page, **so that** I can reconstruct what happened to a permit — who acted on it and when — without digging through emails.

**Acceptance Criteria:**
- [ ] A "Status History" timeline panel is displayed below the permit details
- [ ] Timeline is ordered chronologically, oldest event at top
- [ ] Each event shows: status badge, event label (Created / Approved / Rejected / Revoked), actor name, and timestamp formatted as `DD MMM YYYY, HH:MM`
- [ ] The initial "Created — PENDING" event is always present
- [ ] Additional state transitions appear as subsequent timeline entries

**Priority:** P0 | **Feature Ref:** F5

---

### US-5.3: Navigate Using Breadcrumbs and Back Links
**As a** Priya Nair, **I want to** see a breadcrumb trail and a "Back to Permits" link on the detail page, **so that** I can navigate back to the list without losing my filter state or starting over.

**Acceptance Criteria:**
- [ ] A breadcrumb trail "Dashboard / Permits / [Permit Title]" is shown at the top of the page
- [ ] Each breadcrumb segment is a clickable link to the respective page
- [ ] A "← Back to Permits" link returns to `/permits` preserving the previous filter/search state
- [ ] Clicking the "Permits" breadcrumb segment also returns to the list

**Priority:** P0 | **Feature Ref:** F5

---

## Epic 6: Permit Lifecycle Actions — Approve / Reject / Revoke (F6)

### US-6.1: Approve a Pending Permit
**As a** Marcus Webb, **I want to** approve a pending permit with a single click followed by a confirmation step, **so that** the permit is formally activated and the applicant is authorized to proceed.

**Acceptance Criteria:**
- [ ] An "Approve" button is visible on the detail page only when the permit status is `PENDING`
- [ ] Clicking "Approve" opens a confirmation dialog titled "Approve Permit?" with the permit title and an optional notes field
- [ ] Clicking "Cancel" closes the dialog without making any changes
- [ ] Clicking "Approve Permit" calls `PATCH /permits/:id/approve`; the button enters a loading/disabled state
- [ ] On success: dialog closes, a success toast "Permit approved successfully." appears, the page status badge updates to `APPROVED`, and action buttons update to show "Revoke" only
- [ ] On API error: the dialog remains open with an error message "Action failed. Please try again."

**Priority:** P0 | **Feature Ref:** F6

---

### US-6.2: Reject a Pending Permit with an Optional Reason
**As a** Marcus Webb, **I want to** reject a pending permit and optionally provide a reason, **so that** the applicant understands why the permit was not approved and can make corrections.

**Acceptance Criteria:**
- [ ] A "Reject" button is visible on the detail page only when the permit status is `PENDING`
- [ ] Clicking "Reject" opens a confirmation dialog with an optional "Rejection Reason" text field (max 500 chars)
- [ ] Clicking "Reject Permit" calls `PATCH /permits/:id/reject` with the optional reason
- [ ] On success: dialog closes, toast "Permit rejected." appears, page status updates to `REJECTED`, and no action buttons are shown
- [ ] If a rejection reason was entered, it is displayed in the permit details under "Rejection Reason"
- [ ] The permit status transitions to `REJECTED` and cannot be further modified (terminal state)

**Priority:** P0 | **Feature Ref:** F6

---

### US-6.3: Revoke an Approved Permit
**As a** Marcus Webb, **I want to** revoke an approved permit when site conditions change, **so that** the authorization is immediately deactivated and the field team knows the permit is no longer valid.

**Acceptance Criteria:**
- [ ] A "Revoke" button is visible on the detail page only when the permit status is `APPROVED`
- [ ] Clicking "Revoke" opens a confirmation dialog with an optional "Revocation Reason" text field (max 500 chars)
- [ ] Clicking "Revoke Permit" calls `PATCH /permits/:id/revoke` with the optional reason
- [ ] On success: dialog closes, toast "Permit revoked." appears, page status updates to `REVOKED`, and no action buttons are shown
- [ ] If a revocation reason was entered, it is displayed in the permit details under "Revocation Reason"
- [ ] The permit status transitions to `REVOKED` and cannot be further modified (terminal state)

**Priority:** P0 | **Feature Ref:** F6

---

### US-6.4: Be Prevented from Applying Invalid Lifecycle Actions
**As a** Marcus Webb, **I want to** see action buttons only when they are valid for the current permit status, **so that** I cannot accidentally perform an impossible action like approving an already-approved permit.

**Acceptance Criteria:**
- [ ] No action buttons are shown for permits in terminal states (`REJECTED`, `REVOKED`)
- [ ] A muted label "This permit is in a terminal state and cannot be modified." is displayed for terminal-state permits
- [ ] The server returns `400 INVALID_TRANSITION` if an invalid action is attempted via the API directly
- [ ] If a `?action=approve` query param is present but the permit is already approved, the dialog does not open and a toast "This action is not available for the current permit status." is shown

**Priority:** P0 | **Feature Ref:** F6

---

## Epic 7: UI Design System & Visual Polish (F7)

### US-7.1: Experience a Consistent, Professional Visual Design Across All Screens
**As a** Daniel Osei, **I want to** see a visually polished and consistent interface throughout the application, **so that** the tool reflects operational maturity and I can present it confidently to stakeholders and regulators.

**Acceptance Criteria:**
- [ ] A consistent typography scale (Inter font, defined heading/body sizes) is applied across all pages
- [ ] A brand primary color (indigo/blue) is used consistently for buttons, active nav states, and links
- [ ] Semantic status colors (amber=Pending, green=Approved, red=Rejected, gray=Revoked) are applied uniformly across badges, charts, and filter controls
- [ ] All cards use the standard card style: white background, subtle border, 12px border radius, soft drop shadow
- [ ] A consistent spacing system based on a 4px unit is applied throughout

**Priority:** P0 | **Feature Ref:** F7

---

### US-7.2: See Color-Coded Status Badges Everywhere Permit Status Appears
**As a** Marcus Webb, **I want to** see pill-shaped, color-coded status badges on every screen that shows permit status, **so that** I can instantly identify a permit's state at a glance without reading carefully.

**Acceptance Criteria:**
- [ ] Status badges are pill-shaped (`border-radius: 9999px`) with horizontal padding 12px and vertical padding 4px
- [ ] Badge colors match the defined palette: amber for Pending, green for Approved, red for Rejected, gray for Revoked
- [ ] Badges are text-only (no icons inside), using the `body-sm` 14px weight-500 font
- [ ] The same `StatusBadge` component is used consistently on the dashboard, permit list, and detail page

**Priority:** P0 | **Feature Ref:** F7

---

### US-7.3: See Skeleton Loading Screens Instead of Blank Pages
**As a** Priya Nair, **I want to** see animated skeleton placeholders while data is loading, **so that** the page feels responsive and I understand that content is on its way rather than encountering a blank screen.

**Acceptance Criteria:**
- [ ] Skeleton screens with shimmer animation replace content on the dashboard, permit list, and detail page while data is fetching
- [ ] Skeleton shapes approximate the dimensions of the real content (cards, table rows, field labels)
- [ ] Spinner-only loading is not used as the sole loading indicator on any major data surface
- [ ] Skeletons disappear and are replaced by real content as soon as the API response arrives

**Priority:** P0 | **Feature Ref:** F7

---

### US-7.4: Receive Transient Toast Notifications for Actions
**As a** Marcus Webb, **I want to** see a brief toast notification after performing an action (approve, reject, revoke, create), **so that** I have clear confirmation that my action succeeded or failed without a full-page redirect.

**Acceptance Criteria:**
- [ ] Success toasts appear in the bottom-right corner with a green left border and auto-dismiss after 5 seconds
- [ ] Error toasts appear with a red left border and auto-dismiss after 8 seconds
- [ ] Each toast has a manual dismiss (`×`) button
- [ ] Up to 3 toasts can stack simultaneously; older ones push up
- [ ] Toast messages match the defined copy: "Permit approved successfully.", "Permit rejected.", "Permit revoked.", "An unexpected error occurred. Please try again."

**Priority:** P0 | **Feature Ref:** F7

---

### US-7.5: Use the Application on Laptop and Desktop Viewport Widths
**As a** Marcus Webb, **I want to** use Permit2 on my laptop and desktop browser at standard viewport widths, **so that** all content is legible, correctly laid out, and fully functional without horizontal scrolling.

**Acceptance Criteria:**
- [ ] All screens are fully functional and visually correct at viewport widths 1024px to 1440px
- [ ] Dashboard stat cards display in a horizontal row on desktop and a 2-column grid at tablet width (768px)
- [ ] The permit table does not overflow horizontally at 1024px
- [ ] The application degrades gracefully (no broken layouts) at 768px tablet width
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large text)

**Priority:** P0 | **Feature Ref:** F7

---

## Epic 8: Permit Data API (F8)

### US-8.1: Have All Permit Actions Backed by a Reliable REST API
**As a** Marcus Webb, **I want to** perform all permit actions (create, view, approve, reject, revoke) through a fast and reliable API, **so that** changes are persisted accurately and reflected immediately in the UI.

**Acceptance Criteria:**
- [ ] `POST /auth/login` authenticates with email and password and returns a JWT
- [ ] `GET /permits` returns a paginated, filterable list of permits with correct pagination metadata (`total`, `page`, `limit`, `totalPages`)
- [ ] `POST /permits` creates a new permit with status `PENDING` and returns the created record
- [ ] `GET /permits/:id` returns the full permit detail including the `status_history` array
- [ ] `PATCH /permits/:id/approve`, `reject`, and `revoke` transition the permit status and return the updated permit object
- [ ] All endpoints require authentication; unauthenticated requests return `401 AUTH_UNAUTHORIZED`

**Priority:** P0 | **Feature Ref:** F8

---

### US-8.2: Receive Consistent and Meaningful API Error Responses
**As a** Marcus Webb, **I want to** see clear error messages in the UI when an API call fails, **so that** I understand what went wrong and know whether to retry or contact support.

**Acceptance Criteria:**
- [ ] All API responses use the envelope format `{ data, error, meta }`
- [ ] Validation errors return `400` with `VALIDATION_ERROR` code and a `details` array listing each field-level issue
- [ ] Invalid lifecycle transitions return `400` with `INVALID_TRANSITION` code and a descriptive message
- [ ] Permit not found returns `404` with `PERMIT_NOT_FOUND` code
- [ ] Unhandled server errors return `500` with `SERVER_ERROR` without exposing stack traces
- [ ] Auth middleware returns `401 AUTH_UNAUTHORIZED` for missing tokens and `401 AUTH_TOKEN_EXPIRED` for expired tokens

**Priority:** P0 | **Feature Ref:** F8

---

### US-8.3: Have the Dashboard Stats Endpoint Return Accurate Counts
**As a** Daniel Osei, **I want to** see accurate permit counts on the dashboard that match the actual database state, **so that** I can trust the numbers during stakeholder reviews without verifying them manually.

**Acceptance Criteria:**
- [ ] `GET /permits/stats` returns `{ total, pending, approved, rejected, revoked }` counts
- [ ] `total` equals the sum of all status counts
- [ ] Counts reflect the real-time database state at time of fetch — no cached or stale values
- [ ] The `/permits/stats` route is registered before `/permits/:id` in the router so "stats" is not misinterpreted as a permit ID

**Priority:** P0 | **Feature Ref:** F8

---

## Epic 9: Permit Data Model & Persistence (F9)

### US-9.1: Have All Permit Data Persisted Reliably in a Database
**As a** Marcus Webb, **I want to** know that all permit records and their history are stored persistently in a database, **so that** data is not lost between sessions and I can always retrieve the full history of any permit.

**Acceptance Criteria:**
- [ ] All permit fields are persisted in a `permits` table: `id`, `title`, `type`, `applicant_name`, `description`, `notes`, `status`, `start_date`, `end_date`, `rejection_reason`, `revocation_reason`, `created_at`, `updated_at`
- [ ] `status` is an enum constrained to `PENDING`, `APPROVED`, `REJECTED`, `REVOKED`
- [ ] `type` is an enum constrained to `WORK`, `ACCESS`, `ACTIVITY`, `SAFETY`, `OTHER`
- [ ] Status transitions are validated at the application layer — invalid transitions return `400` before any database write
- [ ] Each lifecycle action (approve/reject/revoke) is recorded atomically: the status update and the history record insert either both succeed or both roll back

**Priority:** P0 | **Feature Ref:** F9

---

### US-9.2: Have Manager Accounts Stored Securely
**As a** Marcus Webb, **I want to** know that my login credentials are stored securely, **so that** my password is protected even if the database is ever exposed.

**Acceptance Criteria:**
- [ ] Manager accounts are stored in a `users` table with fields: `id`, `email`, `password_hash`, `name`, `created_at`
- [ ] Passwords are hashed using bcrypt with a minimum cost factor of 10 before storage
- [ ] Plaintext passwords are never stored in the database or logged
- [ ] At least one manager account is pre-seeded in the database for POC demo use

**Priority:** P0 | **Feature Ref:** F9

---

### US-9.3: Explore the System with Realistic Sample Data Pre-Loaded
**As a** Daniel Osei, **I want to** see the application pre-populated with realistic sample permit data when I first access it for a demo, **so that** I can evaluate the system's capabilities without manually creating test records first.

**Acceptance Criteria:**
- [ ] A seed script populates a minimum of 10–15 permit records across all statuses (Pending, Approved, Rejected, Revoked)
- [ ] Seed data includes a mix of permit types (Work, Access, Activity, Safety, Other)
- [ ] Seed data includes realistic titles, applicant names, dates, and descriptions — not placeholder "Test Permit 1" entries
- [ ] The seed script is idempotent and documented in `README.md`
- [ ] Running the setup command (`npm install && npm run dev`) after seeding results in a demo-ready application

**Priority:** P0 | **Feature Ref:** F9

---

## Summary Table

| Epic | Story Count | P0 | P1 | P2 |
|------|-------------|----|----|-----|
| Epic 0: Manager Authentication | 4 | 4 | 0 | 0 |
| Epic 1: Manager Dashboard | 5 | 5 | 0 | 0 |
| Epic 2: Permit Creation | 3 | 3 | 0 | 0 |
| Epic 3: Permit List / Table View | 4 | 4 | 0 | 0 |
| Epic 4: Search & Filter | 5 | 0 | 5 | 0 |
| Epic 5: Permit Detail View | 3 | 3 | 0 | 0 |
| Epic 6: Permit Lifecycle Actions | 4 | 4 | 0 | 0 |
| Epic 7: UI Design System & Visual Polish | 5 | 5 | 0 | 0 |
| Epic 8: Permit Data API | 3 | 3 | 0 | 0 |
| Epic 9: Permit Data Model & Persistence | 3 | 3 | 0 | 0 |
| **Total** | **39** | **34** | **5** | **0** |

---

## Story Index

| Story ID | Title | Priority | Feature Ref | Primary Persona |
|----------|-------|----------|-------------|-----------------|
| US-0.1 | Login to Permit2 | P0 | F0 | Marcus Webb |
| US-0.2 | Stay Logged In Across Page Refreshes | P0 | F0 | Marcus Webb |
| US-0.3 | Log Out Securely | P0 | F0 | Marcus Webb |
| US-0.4 | Be Redirected to Login When Accessing Protected Routes Unauthenticated | P0 | F0 | Daniel Osei |
| US-1.1 | View Permit Status Overview at a Glance | P0 | F1 | Marcus Webb |
| US-1.2 | View a Visual Status Breakdown Chart | P0 | F1 | Daniel Osei |
| US-1.3 | Review Recent Permit Activity | P0 | F1 | Marcus Webb |
| US-1.4 | Navigate to Create a Permit from the Dashboard | P0 | F1 | Marcus Webb |
| US-1.5 | Click a Stat Card to Filter the Permit List | P0 | F1 | Marcus Webb |
| US-2.1 | Create a New Permit Request | P0 | F2 | Priya Nair |
| US-2.2 | Receive Inline Validation Feedback on the Creation Form | P0 | F2 | Priya Nair |
| US-2.3 | Select a Permit Type from a Predefined List | P0 | F2 | Priya Nair |
| US-3.1 | View All Permits in a Paginated Table | P0 | F3 | Marcus Webb |
| US-3.2 | Sort the Permit Table by Column | P0 | F3 | Marcus Webb |
| US-3.3 | Navigate to a Permit's Detail View from the List | P0 | F3 | Marcus Webb |
| US-3.4 | Use Contextual Quick-Action Links on Permit Rows | P0 | F3 | Marcus Webb |
| US-4.1 | Search Permits by Title, Applicant, or Description | P1 | F4 | Marcus Webb |
| US-4.2 | Filter Permits by Status | P1 | F4 | Priya Nair |
| US-4.3 | Filter Permits by Type and Date Range | P1 | F4 | Marcus Webb |
| US-4.4 | Clear All Active Filters | P1 | F4 | Priya Nair |
| US-4.5 | Share a Filtered View via URL | P1 | F4 | Daniel Osei |
| US-5.1 | View Full Permit Information on a Dedicated Page | P0 | F5 | Priya Nair |
| US-5.2 | View the Permit's Status History Timeline | P0 | F5 | Marcus Webb |
| US-5.3 | Navigate Using Breadcrumbs and Back Links | P0 | F5 | Priya Nair |
| US-6.1 | Approve a Pending Permit | P0 | F6 | Marcus Webb |
| US-6.2 | Reject a Pending Permit with an Optional Reason | P0 | F6 | Marcus Webb |
| US-6.3 | Revoke an Approved Permit | P0 | F6 | Marcus Webb |
| US-6.4 | Be Prevented from Applying Invalid Lifecycle Actions | P0 | F6 | Marcus Webb |
| US-7.1 | Experience a Consistent, Professional Visual Design Across All Screens | P0 | F7 | Daniel Osei |
| US-7.2 | See Color-Coded Status Badges Everywhere Permit Status Appears | P0 | F7 | Marcus Webb |
| US-7.3 | See Skeleton Loading Screens Instead of Blank Pages | P0 | F7 | Priya Nair |
| US-7.4 | Receive Transient Toast Notifications for Actions | P0 | F7 | Marcus Webb |
| US-7.5 | Use the Application on Laptop and Desktop Viewport Widths | P0 | F7 | Marcus Webb |
| US-8.1 | Have All Permit Actions Backed by a Reliable REST API | P0 | F8 | Marcus Webb |
| US-8.2 | Receive Consistent and Meaningful API Error Responses | P0 | F8 | Marcus Webb |
| US-8.3 | Have the Dashboard Stats Endpoint Return Accurate Counts | P0 | F8 | Daniel Osei |
| US-9.1 | Have All Permit Data Persisted Reliably in a Database | P0 | F9 | Marcus Webb |
| US-9.2 | Have Manager Accounts Stored Securely | P0 | F9 | Marcus Webb |
| US-9.3 | Explore the System with Realistic Sample Data Pre-Loaded | P0 | F9 | Daniel Osei |

---

## Priority Definitions

| Priority | Definition |
|----------|------------|
| **P0** | Critical — Must have for MVP; all P0 features must be complete for the POC to be demonstrable |
| **P1** | High — Significantly improves usability and demo credibility; required for first release |
| **P2** | Medium — Nice to have; deferred to post-POC |
| **P3** | Low — Future consideration only |

---

*Document generated by Pivota Spec Framework*
*Last updated: 2026-08-06 | Project: Permit2 | Version: 1.0*
