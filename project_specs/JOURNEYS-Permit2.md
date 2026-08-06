# User Journeys
## Permit2 — Permit Management System

| Field | Value |
|-------|-------|
| **Product Name** | Permit2 |
| **Date** | 2026-08-06 |
| **Related Personas** | PERSONAS-Permit2.md |
| **Related JTBD** | JTBD-Permit2.md |
| **Related PRD** | PRD-Permit2.md |

---

## Journey Index

| ID | Persona | Scenario | Key JTBD | Stages |
|----|---------|----------|----------|--------|
| JRN-01.1 | PER-01 Marcus Webb (Ops Manager) | Morning permit triage — reviewing the dashboard and actioning pending permits at the start of the workday | JTBD-01.1, JTBD-01.2 | 5 |
| JRN-01.2 | PER-01 Marcus Webb (Ops Manager) | Rapid permit lookup — locating a specific permit in seconds to answer a colleague's live question | JTBD-01.3 | 4 |
| JRN-02.1 | PER-02 Priya Nair (Team Lead) | Permit submission — creating and submitting a new permit request before a scheduled field job | JTBD-02.1 | 5 |
| JRN-02.2 | PER-02 Priya Nair (Team Lead) | Self-serve status check — scanning the permit list after submission to see whether a permit has been approved | JTBD-02.2, JTBD-02.3 | 4 |
| JRN-03.1 | PER-03 Daniel Osei (Senior Manager) | Weekly ops review — logging in to assess overall permit health from the dashboard | JTBD-03.1, JTBD-03.3 | 4 |
| JRN-03.2 | PER-03 Daniel Osei (Senior Manager) | Incident permit trace — locating a specific permit and verifying its approval timeline during a live compliance review | JTBD-03.2, JTBD-03.3 | 5 |

---

## PER-01: Marcus Webb

### JRN-01.1: Morning Permit Triage

**Persona:** PER-01 (Marcus Webb)
**Scenario:** Marcus arrives at the office, opens his laptop, and logs into Permit2 as his first action of the day. He needs to quickly understand what changed overnight — any new permit requests, anything that went sideways — and act on whichever pending permits he can close out before the morning meeting. The entire triage sequence needs to take under two minutes or it won't displace his existing habit of opening three spreadsheets.
**Related Jobs:** JTBD-01.1, JTBD-01.2

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| Login | Navigates to Permit2 URL, enters credentials, clicks Sign In | Login page (F0) | "Let's see what came in overnight." | Neutral, routine | Remembers that yesterday he missed a permit buried in email | Persistent session keeps him logged in across browser restarts — one less click |
| Orient | Scans dashboard stat cards and recent activity feed | Dashboard (F1) | "How many are pending right now? Any spike in rejections?" | Focused, slightly scanning-anxious | If counts look off or the page is slow, confidence drops immediately | Real-time counts with zero variance; pending badge visually pops against approved/rejected |
| Prioritize | Identifies pending permits in the recent activity feed; clicks directly into the most urgent one | Dashboard activity feed (F1) → Permit detail (F5) | "This one was submitted yesterday — I need to move on it." | Determined | No urgency ranking in the feed means he has to manually judge which is most time-sensitive | Sort recent activity by submission date; optionally surface overdue-or-near-expiry permits |
| Act | Reviews permit details, clicks Approve or Reject, confirms the dialog | Permit detail (F5), Lifecycle actions (F6) | "Everything looks right. Confirm." | Confident, then relieved after success toast | Accidental click on the wrong action without a confirmation step would be costly | Confirmation dialog with permit title repeated inside it removes ambiguity |
| Return to queue | Clicks Back navigation to return to dashboard; repeats for next pending permit | Dashboard (F1) | "Two down, three to go. Good pace." | Satisfied, building momentum | No "next pending permit" shortcut — must navigate back to dashboard each time | "Next pending permit →" shortcut at the bottom of the detail page |

#### Key Moments
- **Decision Point:** Act stage — Marcus decides to approve or reject; a wrong action is hard to undo and affects field work. Confirmation dialog is the critical safety net.
- **Delight Opportunity:** Return to queue stage — showing "2 of 5 pending resolved" progress reinforces his sense of accomplishment and keeps him in the system.
- **Risk of Abandonment:** Orient stage — if the dashboard loads slowly or shows stale/inaccurate counts, Marcus loses trust and falls back to scanning email instead.

#### Success Outcome
Marcus identifies all permits requiring action within 60 seconds of logging in and completes a full approval or rejection within 90 seconds of arriving at any pending permit's detail page — with zero cases where a resolved permit still appears as pending on his return to the dashboard (JTBD-01.1 and JTBD-01.2 success measures).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| Login | F0 (Manager Authentication) |
| Orient | F1 (Manager Dashboard), F9 (Data Persistence — real-time counts) |
| Prioritize | F1 (Dashboard activity feed), F5 (Permit Detail View) |
| Act | F5 (Permit Detail View), F6 (Lifecycle Actions — Approve/Reject) |
| Return to queue | F1 (Manager Dashboard) |

---

### JRN-01.2: Rapid Permit Lookup

**Persona:** PER-01 (Marcus Webb)
**Scenario:** A colleague stops Marcus in the corridor and asks whether the access permit for Technician Ravi Kumar's job on Thursday has been approved yet. Marcus is at his desk with Permit2 already open. He needs to find and confirm the permit status in under 30 seconds — while the colleague is standing there — to answer confidently without saying "let me check the spreadsheet."
**Related Jobs:** JTBD-01.3

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| Navigate to list | Clicks "Permits" in the top navigation | Permit list (F3) | "I need the list. Fast." | Slightly pressured | If he was on a different app tab, he has to remember the URL or find the nav | Persistent top nav makes the list always one click away |
| Search | Types "Ravi Kumar" into the search bar | Search & Filter (F4) | "Is it name or title I should type? Let me try the name." | Focused, a little uncertain | If search only matches title, not applicant name, he'll get zero results and panic | Real-time debounced search across title + applicant + description fields simultaneously |
| Identify | Scans the filtered result set; spots the matching permit row with its status badge | Permit list (F3) | "There it is — APPROVED. I can answer immediately." | Relieved, confident | Status badge must be visually distinct enough to read at a glance across a crowded row | Color-coded pill badges for each status — green Approved is unmistakable |
| Confirm (optional) | Clicks into permit detail to verify approval date if the colleague needs specifics | Permit detail (F5) | "Let me check when it was approved, just to be thorough." | Confident | None at this stage — flow is smooth | Status history timeline shows approval timestamp on first glance |

#### Key Moments
- **Decision Point:** Search stage — if the search bar doesn't return the expected result, Marcus may switch to a filter-by-status or scroll the full list instead; a multi-field search prevents this fallback.
- **Delight Opportunity:** Identify stage — the moment the correct permit row appears with a clear green "Approved" badge while a colleague is watching is a high-visibility demonstration of the system's value.
- **Risk of Abandonment:** Search stage — a zero-results page when applicant name isn't matched (because search only covers title) would break Marcus's confidence in the search feature entirely.

#### Success Outcome
Marcus locates any specific permit in a 50-record dataset within 30 seconds using free-text search, with the correct permit visible in the filtered list before he needs to open any individual record (JTBD-01.3 success measure).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| Navigate to list | F3 (Permit List / Table View), F7 (Navigation UI) |
| Search | F4 (Search & Filter) |
| Identify | F3 (Permit List — status badges), F7 (Visual Design) |
| Confirm | F5 (Permit Detail View) |

---

## PER-02: Priya Nair

### JRN-02.1: New Permit Submission

**Persona:** PER-02 (Priya Nair)
**Scenario:** Priya has just confirmed with her team that a confined-space work job is scheduled for next Tuesday. She needs to get a Work permit created and into the approval queue today so that Marcus has time to review it before the field crew departs. She opens Permit2, hits "Create New Permit," and needs to complete the form accurately and quickly — she's also got a scheduling call in 15 minutes. Getting the form right the first time is critical because a rejection from Marcus means at least a one-day delay.
**Related Jobs:** JTBD-02.1

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| Access form | Clicks "Create New Permit" button from the dashboard | Dashboard CTA (F1) → Permit creation form (F2) | "I need to fill this out fast and get it right." | Slightly rushed, focused | If the CTA is not prominently visible on the dashboard she wastes seconds hunting for it | Prominent "Create New Permit" button on dashboard and in top nav for one-click access |
| Fill required fields | Enters permit title, selects permit type from dropdown, enters applicant name, writes description | Permit creation form (F2) | "Work type — yes. Applicant is Ravi Kumar. What exactly counts as 'description'?" | Focused, mildly uncertain about field labels | Ambiguous field labels cause hesitation; free-text date fields have caused wrong entries before | Clear placeholder text and inline hints for each field; date pickers eliminate manual date entry errors |
| Set dates | Uses start date and end date date-pickers to select the job window | Date pickers in permit form (F2) | "Tuesday to Thursday. That's the 11th to the 13th — let me double-check the calendar." | Careful, deliberate | Date validation errors only surfaced on submit (rather than inline) cause wasted time | Inline date validation: immediately flag if end date is before start date |
| Submit | Reviews the form, clicks Submit | Permit creation form (F2) | "Looks complete. Submitting." | Cautiously optimistic | No visual progress indicator during submission creates a moment of uncertainty ("did it go through?") | Loading state on the Submit button + immediate navigation to the new permit's detail page on success |
| Verify submission | Lands on new permit detail page with PENDING status badge | Permit detail (F5) | "It's in. Status is Pending. I can see exactly what I submitted." | Relieved, confident | Without this confirmation page, Priya has no certainty the request reached Marcus | Auto-navigate to permit detail on successful creation gives instant proof of submission |

#### Key Moments
- **Decision Point:** Fill required fields stage — Priya decides how to interpret ambiguous fields; unclear labels risk wrong values that will trigger rejection.
- **Delight Opportunity:** Verify submission stage — landing on the new permit's detail page with a PENDING badge is the single clearest signal that "it worked." This replaces the anxiety of wondering if the email was received.
- **Risk of Abandonment:** Set dates stage — if the date pickers are awkward or fail to validate correctly, Priya may submit with wrong dates and face the exact delay she was trying to avoid.

#### Success Outcome
Priya completes and submits a new permit request with all required fields in under 3 minutes on first use, with no validation-related rejection caused by form ambiguity, and immediately sees the new permit at PENDING status on its detail page (JTBD-02.1 success measure).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| Access form | F1 (Dashboard CTA), F2 (Permit Creation Form) |
| Fill required fields | F2 (Permit Creation — fields, labels, hints), F7 (Visual Polish — form design) |
| Set dates | F2 (Permit Creation — date pickers, validation) |
| Submit | F2 (Permit Creation — submit action), F8 (API: POST /permits) |
| Verify submission | F5 (Permit Detail View), F9 (Data Persistence — PENDING record) |

---

### JRN-02.2: Self-Serve Status Check and Rejection Review

**Persona:** PER-02 (Priya Nair)
**Scenario:** It's the following morning. Priya submitted the Work permit for Ravi Kumar yesterday and her team is asking whether it's been approved. She opens Permit2 to check. As she scans the list, she discovers that a different permit she submitted last week — a Safety permit for another crew — has been rejected. She needs to understand why it was rejected and what correction to make, without having to interrupt Marcus with a follow-up email.
**Related Jobs:** JTBD-02.2, JTBD-02.3

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| Filter to her permits | Opens the permit list and applies a filter by her applicant name or status to narrow to her submissions | Permit list (F3), Search & Filter (F4) | "Let me just show mine — I don't need to see the whole organization's list." | Efficient, matter-of-fact | If filter controls are not easy to find, she either scrolls the whole list or adds a column sort that partially helps | Filter by applicant name or a "my permits" quick-filter; filter state persists in URL for daily bookmark |
| Check pending permit status | Scans the filtered list and reads the status badge for the Ravi Kumar Work permit | Permit list (F3) | "Still pending… or approved? — yes, green. Approved. I can tell the team." | Relieved for that one | Status badges that are small or low-contrast require squinting to distinguish Pending from Approved | Large, high-contrast, color-coded status pills; Pending in amber, Approved in green |
| Spot the rejection | Notices the Safety permit row shows a red REJECTED badge | Permit list (F3) | "That one got rejected? When did that happen? What did I do wrong?" | Surprised, anxious, slightly frustrated | No inline rejection reason in the list view — she has to click into the permit to find out | Show a truncated rejection reason in a tooltip or secondary row beneath the rejected permit |
| Read rejection reason | Clicks into the rejected Safety permit detail; finds the rejection reason and status history timeline | Permit detail (F5), Status history | "Dates were wrong — I set end date before the site prep was complete. I can fix that." | Embarrassed briefly, then determined | If the rejection reason is not prominently displayed (e.g., buried below the fold), she wastes time scrolling | Rejection reason displayed in a highlighted alert block at the top of the detail page, not buried |

#### Key Moments
- **Decision Point:** Read rejection reason stage — if the rejection reason is present and clear, Priya creates a corrected permit immediately; if it's absent or buried, she sends Marcus an email, erasing the self-serve value entirely.
- **Delight Opportunity:** Check pending permit status stage — instantly seeing "APPROVED" in green without any manager contact is the moment the product proves its core value to Priya.
- **Risk of Abandonment:** Filter to her permits stage — if filtering is confusing or doesn't support applicant-name filtering, Priya falls back to scrolling the full list or emailing Marcus directly.

#### Success Outcome
Priya determines the status of any submitted permit within 10 seconds of loading the filtered permit list, and reads a rejection reason within 30 seconds of opening a rejected permit's detail page — requiring zero communication with Marcus at any point (JTBD-02.2 and JTBD-02.3 success measures).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| Filter to her permits | F3 (Permit List), F4 (Search & Filter — applicant filter) |
| Check pending permit status | F3 (Permit List — status badges), F7 (Visual Design — color-coded pills) |
| Spot the rejection | F3 (Permit List — rejected badge), F7 (Visual Design) |
| Read rejection reason | F5 (Permit Detail View — rejection reason field, status history timeline), F6 (Reject action outcome) |

---

## PER-03: Daniel Osei

### JRN-03.1: Weekly Operations Review Dashboard Check

**Persona:** PER-03 (Daniel Osei)
**Scenario:** It's Monday morning and Daniel is 10 minutes from his weekly operations review call with two department heads and a VP. He needs to pull up the permit health snapshot quickly, confirm nothing is abnormal — no spike in pending requests, no unusual rejection rate — and be ready to answer basic questions live on the call. He opens Permit2 for the first time this week; the dashboard needs to give him everything he needs within 30 seconds, without clicking into any individual permit.
**Related Jobs:** JTBD-03.1, JTBD-03.3

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| Login | Opens Permit2, enters credentials | Login page (F0) | "Let me pull this up before the call." | Slightly pressed for time | A slow login page in front of stakeholders on a shared screen creates an awkward pause | Fast-loading login with persistent session for frequent users; page renders in under 2 seconds |
| Scan dashboard | Reads stat cards: Total, Pending, Approved, Rejected, Revoked | Dashboard (F1) | "Five pending — is that normal? Fifteen approved looks right. No spike in rejections." | Focused, calm if numbers look normal | If the stat cards show stale data (different from what Marcus reported last week), trust erodes immediately | Zero-variance real-time counts; stat cards display last-updated timestamp for added confidence |
| Validate recent activity | Glances at the recent activity feed for any notable entries | Dashboard activity feed (F1) | "Any rejections in the last 48 hours? What types of permits are active?" | Analytical, slightly scrutinizing | A feed that shows permits without context (type, who acted) forces Daniel to click through to understand | Activity feed shows permit type, acting manager name, and timestamp inline — readable without drilling in |
| Prepare to present | Leaves the dashboard visible on screen during the call; answers questions verbally from what he sees | Dashboard (F1) | "I can answer questions from this view alone — I don't need to navigate away." | Confident, credible | If a colleague asks a question the dashboard can't answer, Daniel must navigate live — which can be disruptive | Dashboard should answer 80% of operational questions without any clicks |

#### Key Moments
- **Decision Point:** Scan dashboard stage — Daniel decides in the first 15 seconds whether the permit health is "normal" or warrants a deeper investigation. Misread stat cards could trigger an unnecessary escalation.
- **Delight Opportunity:** Validate recent activity stage — a clean, professional-looking dashboard that Daniel can share on a screen share during a live call is the product's highest-stakes impression moment.
- **Risk of Abandonment:** Login stage — if the page is slow or looks unpolished on a shared screen, Daniel's confidence in the tool drops visibly and he may default to reading from Marcus's email summary instead.

#### Success Outcome
Daniel confirms overall permit health within 30 seconds of logging in, with dashboard stat card counts matching actual database state with zero variance, and at least one observer in the operations review independently describes the application as polished and professional (JTBD-03.1 and JTBD-03.3 success measures).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| Login | F0 (Manager Authentication), F7 (Visual Polish — first impression) |
| Scan dashboard | F1 (Manager Dashboard — stat cards), F9 (Data Persistence — real-time counts) |
| Validate recent activity | F1 (Manager Dashboard — activity feed) |
| Prepare to present | F1 (Manager Dashboard), F7 (UI Design System — professional appearance) |

---

### JRN-03.2: Incident Permit Trace

**Persona:** PER-03 (Daniel Osei)
**Scenario:** A minor safety incident occurred at a job site on Friday afternoon. Before Monday's incident review meeting, Daniel needs to independently verify that the right permits were in place at the time — specifically, confirm that a Safety permit for that site was approved before the crew arrived, and see exactly when it was approved. He cannot wait for Marcus to look it up; he needs to do this himself, directly in Permit2, in under 60 seconds from login.
**Related Jobs:** JTBD-03.2, JTBD-03.3

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| Login | Opens Permit2 and authenticates | Login page (F0) | "I need to find the permit for Friday's site job before this meeting starts." | Focused, slightly anxious — high stakes | If login fails or the session has expired, he loses precious minutes before the meeting | Persistent session if recently logged in; fast login with clear error feedback if credentials are wrong |
| Navigate to permit list | Clicks Permits in the navigation bar | Permit list (F3) | "I need to search for this specific permit — let me use the search bar." | Methodical | If the permit list loads slowly or is unpaginated with no scroll anchor, he wastes time | Fast list load with skeleton loading state; search bar prominently placed above the table |
| Search and filter | Types the site name or permit type "Safety" into the search bar; optionally filters by date range to last week | Search & Filter (F4), Permit list (F3) | "Safety permit, week of the 3rd. There it should be." | Focused, intent | Combined search + date filter must work simultaneously — if filters don't compose, he has to scroll a large list | Combinable filters (type + date range) with active filter chips showing what's applied |
| Identify and open permit | Spots the correct Safety permit row and clicks it | Permit list (F3) → Permit detail (F5) | "That's the one. Let me see the timeline." | Alert, concentrated | If multiple permits match (e.g., multiple Safety permits in that week), the list must be sortable by date to narrow further | Sort by start date or created date; permit row shows date range in the table for quick visual matching |
| Read status history | Reviews the status history timeline on the permit detail page; confirms approved timestamp vs. incident timestamp | Permit detail (F5) — status history panel | "Approved Wednesday at 2:14pm. Crew arrived Friday morning. That's clean — permit was in place." | Relieved, confident | A timeline that only shows current status (not historical transitions with timestamps) is useless for this scenario | Status history timeline displays each transition: Created → Pending → Approved with exact timestamps |

#### Key Moments
- **Decision Point:** Search and filter stage — Daniel's ability to compose type + date range filters determines whether he can isolate the right permit without scrolling. This is the core functional test for the search feature.
- **Delight Opportunity:** Read status history stage — the moment Daniel confirms the approval timestamp predates the incident, the system has delivered its highest-value compliance function. A clean, readable timeline is the key design element.
- **Risk of Abandonment:** Navigate to permit list stage — if the list is slow to load or search doesn't return results quickly, Daniel may text Marcus instead, undermining the system's independence value.

#### Success Outcome
Daniel locates the specific Safety permit and reads its complete approval timeline within 60 seconds of logging in, with no assistance from Marcus — confirming the approved timestamp relative to the field event independently (JTBD-03.2 success measure). The full experience, including the visual quality of the status history timeline, reinforces the system's production-grade credibility (JTBD-03.3).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| Login | F0 (Manager Authentication) |
| Navigate to permit list | F3 (Permit List / Table View), F7 (Loading skeleton) |
| Search and filter | F4 (Search & Filter — type filter + date range, combinable) |
| Identify and open permit | F3 (Permit List — date columns, sortable), F5 (Permit Detail View) |
| Read status history | F5 (Permit Detail View — status history timeline), F9 (Data Persistence — transition timestamps) |

---

## Cross-Journey Patterns

### Common Pain Points

- **Stale or inaccurate data destroys trust (JRN-01.1, JRN-03.1, JRN-03.2):** All three personas — Marcus, Daniel, and Priya — have been burned by out-of-date information in their current tools. Any mismatch between what Permit2 displays and the true database state will immediately cause a reversion to email/spreadsheet habits. Real-time accuracy is the single most critical reliability requirement across all journeys.

- **Search that only covers one field creates silent failures (JRN-01.2, JRN-02.2, JRN-03.2):** Marcus, Priya, and Daniel all approach search with different mental models — Marcus by applicant name, Priya by her own name, Daniel by permit type + date. A search bar that only covers permit title produces zero-results failures that feel like system bugs. Multi-field search (title + applicant + description) is a shared requirement across all three user groups.

- **Absence of rejection reason forces communication back to email (JRN-02.2):** Priya's most painful current failure — receiving a rejection with no explanation — recurs whenever the rejection reason is buried or absent on the detail page. While this is directly a Priya pain point, it also creates downstream noise for Marcus (follow-up emails) and undermines the self-serve value the whole system promises.

### Shared Opportunities

- **Prominent, color-coded status badges are load-bearing UI (JRN-01.1, JRN-01.2, JRN-02.2, JRN-03.1, JRN-03.2):** Every persona reads status badges in every journey. The green/amber/red pill design is not a cosmetic choice — it is the primary information-delivery mechanism across all five key stages. Badge legibility at a glance is a shared design investment that benefits all personas simultaneously.

- **Fast page loads signal operational maturity (JRN-01.1, JRN-03.1, JRN-03.2):** Marcus needs speed for efficiency; Daniel needs it for live presentations; Priya needs it to stay in a rhythm. A sub-2-second load on dashboard and list pages is a non-functional requirement that directly addresses trust and credibility concerns in all three primary journeys.

- **A persistent, discoverable top navigation reduces orientation cost for all personas (JRN-01.2, JRN-02.1, JRN-03.2):** Marcus needs to snap to the permit list, Priya needs the Create CTA, and Daniel needs to move from dashboard to list. A clear, always-visible nav with labelled links (Dashboard, Permits, + Create) eliminates "where do I go next?" moments shared across all six journeys.

### Convergence Points

- **Permit detail page is the shared action surface:** Marcus acts on permits here (approve/reject/revoke), Priya reads rejection reasons here, and Daniel reads status history here. All three personas land on the same page with different primary focuses — the layout must satisfy all three reading modes simultaneously: action buttons (Marcus), rejection reason block (Priya), and status history timeline (Daniel).

- **Dashboard is the entry point for two out of three personas:** Marcus and Daniel both start their key workflows on the dashboard. Its accuracy and visual quality affects both the daily operational flow (Marcus) and the high-stakes stakeholder impression (Daniel).

---

## Journey-to-JTBD Traceability

| Journey Stage | JTBD ID | Expected Outcome |
|--------------|---------|-----------------|
| JRN-01.1: Login | JTBD-01.1 | Marcus's session is persistent; login adds zero friction to his morning routine |
| JRN-01.1: Orient | JTBD-01.1 | Dashboard loads within 2 seconds; all stat card counts match actual database state with zero variance |
| JRN-01.1: Prioritize | JTBD-01.1 | Marcus identifies all pending permits within 60 seconds; recent activity feed surfaces the most recent requests with direct navigation |
| JRN-01.1: Act | JTBD-01.2 | Marcus completes an approval or rejection within 90 seconds of arriving at the permit detail page; status change is visible on screen before he navigates away |
| JRN-01.1: Return to queue | JTBD-01.2 | Updated status is immediately reflected on return to dashboard; no stale pending count |
| JRN-01.2: Navigate to list | JTBD-01.3 | Permit list is reachable in one click from anywhere in the application |
| JRN-01.2: Search | JTBD-01.3 | Free-text search matches across title, applicant name, and description fields in real time |
| JRN-01.2: Identify | JTBD-01.3 | Any permit in a 50-record dataset is locatable within 30 seconds; status is readable at a glance from the list row |
| JRN-02.1: Access form | JTBD-02.1 | "Create New Permit" CTA is visible without scrolling from the dashboard; form opens in under 1 second |
| JRN-02.1: Fill required fields | JTBD-02.1 | All form fields have clear labels and placeholder hints; no ambiguity about expected input format |
| JRN-02.1: Set dates | JTBD-02.1 | Date pickers prevent manual entry errors; inline validation flags date range conflicts before submission |
| JRN-02.1: Submit | JTBD-02.1 | Permit creation form is completable in under 3 minutes; no validation-related submission failures due to form ambiguity |
| JRN-02.1: Verify submission | JTBD-02.1 | On success, Priya is navigated to the new permit's detail page showing PENDING status — confirmation that the request reached Marcus |
| JRN-02.2: Filter to her permits | JTBD-02.2 | Filter by applicant name narrows the permit list to Priya's submissions; filter state persists in URL for bookmarking |
| JRN-02.2: Check pending permit status | JTBD-02.2 | Status of any submitted permit is visible within 10 seconds of loading the filtered list; no manager contact required |
| JRN-02.2: Spot the rejection | JTBD-02.2 | Rejected status badge is visually distinct (red pill) and immediately recognizable in the list view |
| JRN-02.2: Read rejection reason | JTBD-02.3 | Rejection reason is displayed prominently at the top of the permit detail page; status history shows the REJECTED transition with exact timestamp; Priya identifies the required correction within 30 seconds |
| JRN-03.1: Login | JTBD-03.3 | Login page renders in under 2 seconds with polished, consistent visual design — no layout shift on load |
| JRN-03.1: Scan dashboard | JTBD-03.1 | Stat cards display accurate permit counts (Total, Pending, Approved, Rejected, Revoked) matching database state with zero variance; dashboard loads in under 2 seconds |
| JRN-03.1: Validate recent activity | JTBD-03.1 | Recent activity feed surfaces last 5–10 permit updates with type, status, and timestamp — readable without drilling in |
| JRN-03.1: Prepare to present | JTBD-03.3 | Dashboard visual quality meets production-grade bar; at least one observer independently describes the UI as "polished and professional" without prompting |
| JRN-03.2: Search and filter | JTBD-03.2 | Type filter + date range filter are combinable; active filter chips show what is applied; results update in real time |
| JRN-03.2: Identify and open permit | JTBD-03.2 | Target permit is locatable within 30 seconds using search or combined filters in a 50-record dataset |
| JRN-03.2: Read status history | JTBD-03.2 | Status history timeline displays all state transitions (Created → Pending → Approved) with exact timestamps; Daniel independently verifies approval timing within 60 seconds of login, with no assistance from Marcus |

---

*Document generated by Pivota Spec Framework*
*Last updated: 2026-08-06 | Project: Permit2 | Version: 1.0*
