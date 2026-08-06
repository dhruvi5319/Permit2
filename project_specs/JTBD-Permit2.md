# Jobs to Be Done
## Permit2 — Permit Management System

| Field | Value |
|-------|-------|
| **Product Name** | Permit2 |
| **Date** | 2026-08-06 |
| **Related Personas** | PERSONAS-Permit2.md |
| **Related PRD** | PRD-Permit2.md |

---

## JTBD Summary

| ID | Persona | Job Statement | Priority |
|----|---------|--------------|----------|
| JTBD-01.1 | PER-01 Marcus Webb (Ops Manager) | When I start my workday, I want to see every permit's current status at a glance, so I can triage what needs action before anything else. | P0 |
| JTBD-01.2 | PER-01 Marcus Webb (Ops Manager) | When a permit requires a decision, I want to approve, reject, or revoke it in a single confirmed action, so I can close the loop without email round-trips. | P0 |
| JTBD-01.3 | PER-01 Marcus Webb (Ops Manager) | When a colleague asks about a specific permit, I want to locate it by title, applicant, or status within seconds, so I can answer confidently without searching across spreadsheets. | P1 |
| JTBD-02.1 | PER-02 Priya Nair (Team Lead) | When scheduling upcoming field work, I want to submit a complete, correctly validated permit request in under 3 minutes, so I can avoid delays caused by rejected or incomplete forms. | P0 |
| JTBD-02.2 | PER-02 Priya Nair (Team Lead) | When my team is waiting to deploy, I want to see the exact status of every permit I've submitted, so I can make scheduling decisions without emailing the manager to ask. | P0 |
| JTBD-02.3 | PER-02 Priya Nair (Team Lead) | When a permit I submitted is rejected, I want to read the rejection reason immediately, so I can correct the information and resubmit without guessing what was wrong. | P1 |
| JTBD-03.1 | PER-03 Daniel Osei (Senior Manager) | When conducting a weekly operations review, I want to assess overall permit health from a single dashboard screen, so I can confirm the process is running normally without clicking into individual records. | P0 |
| JTBD-03.2 | PER-03 Daniel Osei (Senior Manager) | When an incident or compliance question arises, I want to locate a specific permit and view its full status history, so I can independently verify what was approved and when without relying on Marcus. | P1 |
| JTBD-03.3 | PER-03 Daniel Osei (Senior Manager) | When presenting the permit system to stakeholders or regulators, I want the application to look and behave like a production-grade tool, so I can project operational maturity with confidence. | P0 |

---

## PER-01: Marcus Webb — Jobs

### JTBD-01.1: Daily Permit Triage at a Glance

**Job Statement:**
When I start my workday and need to understand the current permit landscape, I want to see every permit's status — total, pending, approved, rejected, revoked — in a single dashboard view, so I can immediately identify which requests need action without opening spreadsheets or scanning email.

**Current Alternatives:**
- Opens 3 separate spreadsheets owned by different team members and cross-references them manually each morning
- Scans email inbox for permit-related threads, frequently missing buried or unread messages
- Relies on team members to flag urgent permits verbally — information is informal and delayed

**Hiring Criteria:**
- Dashboard loads within 2 seconds and displays accurate, real-time permit counts on arrival
- Pending permits are visually distinguished so they stand out without manual filtering
- A recent activity feed surfaces the last 5–10 updated permits with direct navigation to each
- Zero stale data — counts on the dashboard match the actual database state at all times

**Success Measure:** Marcus can identify all permits requiring action within 60 seconds of logging in, with zero cases where a pending permit is invisible or a resolved permit still appears as pending.

**Related Features:** F1, F9
**Priority:** P0

---

### JTBD-01.2: Confident One-Step Permit Action

**Job Statement:**
When a permit requires a decision — approval, rejection, or revocation — I want to act on it from a single permit detail page with a clear confirmation step, so I can close the loop decisively and immediately without triggering a new email chain.

**Current Alternatives:**
- Sends an approval reply email to the requester, then a separate email to the field team — typically 3+ round-trips per permit decision
- No confirmation step exists; decisions are communicated informally and can be misread or lost
- Revoking an approved permit requires contacting multiple parties with no mechanism to record the change

**Hiring Criteria:**
- Approve, Reject, and Revoke actions are available as buttons on the permit detail page, conditionally shown based on current status
- Each action triggers a confirmation dialog before executing, preventing accidental state changes
- After an action is taken, the permit status updates in place immediately — no page reload or manual refresh required
- Success and error outcomes are surfaced via toast notifications so Marcus always knows if the action succeeded

**Success Measure:** Marcus can complete a full approval or rejection within 90 seconds of arriving at a permit detail page, with a confirmed status change visible on screen before navigating away.

**Related Features:** F5, F6
**Priority:** P0

---

### JTBD-01.3: Rapid Permit Lookup by Any Attribute

**Job Statement:**
When a colleague asks about a specific permit by name, requester, or status, I want to locate that permit within seconds using free-text search or structured filters, so I can answer questions confidently and avoid the reputation of someone who "has to check the spreadsheet."

**Current Alternatives:**
- Ctrl+F through a shared spreadsheet, which requires knowing which file to open first
- Scrolls through email threads to find a specific permit request by subject line
- Asks the permit requester directly to resend the original request email

**Hiring Criteria:**
- Free-text search matches permit title, applicant name, and description in real time (debounced)
- Status and type filters are combinable so Marcus can narrow results to a specific intersection
- Any permit in a 50-record dataset is locatable within 30 seconds
- Active filters are visually indicated so Marcus always knows what narrowing is applied

**Success Measure:** Marcus can locate any specific permit in a 50-record dataset within 30 seconds using search or filters, without opening any record to confirm it is the right one.

**Related Features:** F3, F4
**Priority:** P1

---

## PER-02: Priya Nair — Jobs

### JTBD-02.1: Fast, Error-Free Permit Submission

**Job Statement:**
When scheduling an upcoming field job and needing authorization in advance, I want to complete and submit a new permit creation form with all required fields in under 3 minutes — without ambiguity about what each field expects — so I can avoid the day-long delays that come from a rejected or incomplete submission.

**Current Alternatives:**
- Emails Marcus a permit request written in a free-text format — field interpretation is inconsistent and often triggers a clarifying reply
- Fills in a shared Excel template that lacks date validation, causing incorrect duration entries that expire permits prematurely in the field
- Has no submission confirmation — she is never certain the request was received until Marcus replies

**Hiring Criteria:**
- Form fields include clear labels and input hints that eliminate guessing (e.g., date pickers instead of free text, type dropdown with defined options)
- Client-side validation surfaces inline errors before submission, preventing incomplete requests from reaching the manager
- On successful submission, Priya is navigated to the new permit's detail page so she has immediate proof the request was created
- Cancel action returns to the previous page without saving, giving her a clear escape path

**Success Measure:** Priya can complete the permit creation form from scratch — including all required fields — and submit it successfully in under 3 minutes on her first use, with zero validation-related rejections due to form ambiguity.

**Related Features:** F2, F7
**Priority:** P0

---

### JTBD-02.2: Self-Serve Status Visibility Without Manager Contact

**Job Statement:**
When my team is waiting on a permit to be approved before deploying to a job site, I want to see the current status of every permit I have submitted — filtered to my team's requests — so I can make scheduling decisions without sending a follow-up email that feels intrusive and wastes both my time and Marcus's.

**Current Alternatives:**
- Sends a follow-up email to Marcus asking "any update on the permit for X?" — typically waits 4–8 hours for a reply
- Checks a shared spreadsheet that is updated intermittently and may not reflect Marcus's most recent action
- Makes conservative scheduling decisions (builds in extra buffer days) to compensate for status uncertainty

**Hiring Criteria:**
- Permit list shows status badges (Pending, Approved, Rejected) that update in real time after Marcus takes action
- Filter controls allow Priya to narrow the list to permits by applicant name or status without instruction
- Status of any submitted permit is visible at all times — no manager interaction required to check it
- Filter state persists in the URL so Priya can bookmark her filtered view

**Success Measure:** Priya can determine the approval status of any permit she submitted within 10 seconds of loading the permit list, without sending a message to Marcus.

**Related Features:** F3, F4, F5
**Priority:** P0

---

### JTBD-02.3: Clear Rejection Reason for Immediate Correction

**Job Statement:**
When a permit I submitted is rejected, I want to read the rejection reason directly on the permit detail page, so I can understand exactly what was wrong, correct it, and resubmit without guessing or waiting for Marcus to clarify.

**Current Alternatives:**
- Receives a rejection email with no explanation — must reply to ask what was wrong, adding another 4–8 hour delay
- Sometimes infers the problem from context (wrong dates, wrong type) but frequently guesses incorrectly and submits a second rejected version
- Has no record of what was submitted in the original request, making it hard to compare the rejected version to what she thought she sent

**Hiring Criteria:**
- Rejection reason (if provided by Marcus) is displayed prominently on the permit detail page — not buried or hidden
- Status history timeline shows the sequence of state transitions with timestamps so Priya can see when the rejection occurred
- The full original permit fields remain visible on the detail page so she can review what was submitted

**Success Measure:** Priya can read a rejection reason and identify the specific correction needed within 30 seconds of opening a rejected permit's detail page, requiring zero communication with Marcus to understand the problem.

**Related Features:** F5, F6
**Priority:** P1

---

## PER-03: Daniel Osei — Jobs

### JTBD-03.1: Instant Operational Health Assessment

**Job Statement:**
When conducting a weekly operations review or preparing for a stakeholder meeting, I want to assess the overall permit landscape from a single dashboard screen — total volume, status distribution, recent activity — so I can confirm the process is running normally and identify any anomalies without clicking into individual records.

**Current Alternatives:**
- Receives a hand-prepared weekly email summary from Marcus — always at least one business day out of date by the time it arrives
- Has no way to verify the summary's accuracy independently — must trust Marcus's manual count
- In board or operations meetings, cannot answer real-time questions about permit status without calling Marcus

**Hiring Criteria:**
- Dashboard stat cards display accurate permit counts for each status: Total, Pending, Approved, Rejected, Revoked
- Data reflects the real-time database state — zero variance between what the dashboard shows and actual record counts
- Dashboard loads within 2 seconds so Daniel can open it during a live meeting without awkward delay
- A recent activity feed surfaces the last 5–10 permits so unusual spikes in rejections or new submissions are immediately visible

**Success Measure:** Daniel can confirm overall permit health — including whether pending volume is within normal range — within 30 seconds of logging in, with dashboard counts matching actual database state with zero variance.

**Related Features:** F1, F9
**Priority:** P0

---

### JTBD-03.2: Independent Permit Lookup During Incident Review

**Job Statement:**
When an incident occurs in the field and compliance questions arise about whether the right permits were in place, I want to locate the relevant permit and view its complete status history — including who took action and when — so I can independently verify the facts without relying on Marcus to search spreadsheets on my behalf.

**Current Alternatives:**
- Asks Marcus to search the spreadsheets for the permit in question — Marcus typically takes 10–30 minutes to find and compile the information
- Has no mechanism to independently access permit records — entirely dependent on Marcus as an intermediary
- Cannot produce a clear timeline of permit state changes for a regulator or incident review committee

**Hiring Criteria:**
- Search and filter controls allow Daniel to locate a specific permit by title, applicant, or status within 30 seconds, without prior preparation
- Permit detail page displays a status history timeline with all state transitions and their timestamps
- The detail page is accessible directly from the permit list with a single click
- All permit information is accurate and reflects the actual database state — no cached or stale data

**Success Measure:** Daniel can locate a specific permit and view its complete approval timeline within 60 seconds of logging in during a live incident review, with no assistance from Marcus.

**Related Features:** F3, F4, F5
**Priority:** P1

---

### JTBD-03.3: Stakeholder-Grade Visual Confidence

**Job Statement:**
When presenting Permit2 to regulators, auditors, or executive stakeholders, I want the application to look and behave indistinguishably from a production SaaS product — polished typography, consistent layout, professional status indicators — so I can project operational maturity and credibility without the tool undermining the process it represents.

**Current Alternatives:**
- Shows stakeholders a spreadsheet with color-coded cells — visually informal and unconvincing as a managed process
- No existing tool meets the bar for a live demonstration in a formal compliance or leadership context
- Relies on verbal descriptions of the permit process rather than a live system walkthrough

**Hiring Criteria:**
- Consistent design language — typography, spacing, color palette — applied uniformly across all screens
- Status badges are color-coded, pill-shaped, and visually distinct: green for Approved, amber for Pending, red for Rejected/Revoked
- Smooth micro-animations on page transitions, modals, and hover states — subtle but present, signaling production quality
- Empty states and loading states are illustrated or use skeleton screens — never bare text or blank areas
- Application loads in under 2 seconds with no visual jank or layout shift on first render

**Success Measure:** In a stakeholder walkthrough covering all P0 features, at least one observer independently describes the application as "polished and professional" — with no prompting — and no broken pages or unhandled errors occur during the session.

**Related Features:** F7, F1, F5
**Priority:** P0

---

## Outcome-to-Feature Traceability

| JTBD ID | Feature(s) | Expected Outcome |
|---------|-----------|-----------------|
| JTBD-01.1 | F1, F9 | Marcus identifies all pending permits within 60 seconds of login; dashboard counts match actual database state with zero variance |
| JTBD-01.2 | F5, F6 | Marcus completes an approval or rejection within 90 seconds from the permit detail page; status change is visible immediately on screen |
| JTBD-01.3 | F3, F4 | Marcus locates any permit in a 50-record dataset within 30 seconds using search or combined filters |
| JTBD-02.1 | F2, F7 | Priya submits a complete, valid permit in under 3 minutes on first use with zero form-ambiguity rejections |
| JTBD-02.2 | F3, F4, F5 | Priya determines the status of any submitted permit within 10 seconds of loading the filtered permit list |
| JTBD-02.3 | F5, F6 | Priya reads a rejection reason and identifies the required correction within 30 seconds of opening the permit detail page |
| JTBD-03.1 | F1, F9 | Daniel confirms permit health from the dashboard within 30 seconds; stat card counts match actual database state |
| JTBD-03.2 | F3, F4, F5 | Daniel locates a permit and views its full approval timeline within 60 seconds during a live incident review |
| JTBD-03.3 | F7, F1, F5 | All P0 screens render with production-grade visual quality; stakeholders describe the UI as "polished and professional" unprompted |

---

## NaC Preview

| JTBD ID | Outcome | Candidate NaC |
|---------|---------|--------------|
| JTBD-01.1 | Dashboard shows real-time permit counts | Given the database has 5 pending permits, when Marcus loads the dashboard, then the Pending stat card displays exactly 5 with no page refresh required |
| JTBD-01.2 | Approve/reject completes within 90 seconds from detail page | Given a permit is in PENDING state, when Marcus clicks Approve and confirms the dialog, then the status badge updates to APPROVED in place and a success toast appears within 2 seconds |
| JTBD-01.3 | Any permit found within 30 seconds in a 50-record dataset | Given 50 permits exist, when Marcus types an applicant name in the search bar, then the permit list filters in real time and returns the matching permit within 30 seconds |
| JTBD-02.1 | Permit creation form completable in under 3 minutes | Given Priya opens the creation form, when she fills all required fields and submits, then a PENDING permit is created and she is navigated to its detail page without validation errors blocking submission |
| JTBD-02.2 | Status visible without manager contact | Given Marcus has approved one of Priya's permits, when Priya loads the permit list filtered to her applicant name, then the permit's status badge shows APPROVED without any page action from Priya |
| JTBD-02.3 | Rejection reason visible within 30 seconds on detail page | Given Marcus rejected a permit with a reason, when Priya opens that permit's detail page, then the rejection reason text is displayed prominently and the status history shows the REJECTED transition with a timestamp |
| JTBD-03.1 | Dashboard counts match database with zero variance | Given the database state is known (seeded data), when Daniel loads the dashboard, then each stat card (Total, Pending, Approved, Rejected, Revoked) matches the exact database count with zero discrepancy |
| JTBD-03.2 | Specific permit locatable within 60 seconds during live review | Given Daniel knows a permit title, when he uses search or filters on the permit list, then the target permit is visible and navigable within 30 seconds; its status history timeline shows all transitions with timestamps |
| JTBD-03.3 | Application renders with production-grade visual quality | Given Daniel loads any P0 screen, then typography, spacing, color palette, and status badges are consistent with the design system; no unstyled elements, blank empty states, or spinner-only loading states appear |

---

*Document generated by Pivota Spec Framework*
*Last updated: 2026-08-06 | Project: Permit2 | Version: 1.0*
