# Personas
## Permit2 — Permit Management System

| Field | Value |
|-------|-------|
| **Product Name** | Permit2 |
| **Date** | 2026-08-06 |
| **Related PRD** | PRD-Permit2.md |

---

## Persona Summary

| ID | Name | Role | Primary Goal |
|----|------|------|-------------|
| PER-01 | Marcus Webb | Operations Manager | Maintain real-time visibility over all permits and act on pending requests the same day they arrive |
| PER-02 | Priya Nair | Department Team Lead | Create accurate permit requests quickly and track their status without chasing anyone |
| PER-03 | Daniel Osei | Senior Manager / Stakeholder | Validate that the permit process is running smoothly with a single-glance dashboard review |

---

## PER-01: Marcus Webb

**Role & Context:**
Marcus is an Operations Manager at a mid-size facilities or field-services organization, responsible for overseeing permit activity across his department of 15–20 people. He is the primary decision-maker for permit approvals and rejections: on a typical day he reviews 5–12 permit requests, approves the ones that are in order, rejects those that conflict with schedules or policy, and occasionally revokes an approved permit when site conditions change. He works from a desktop or laptop at his desk, keeps multiple browser tabs open, and checks the permit system at least three times a day — morning, mid-day, and before close of business.

Marcus has been managing permits via shared spreadsheets and email threads for years. He finds that approach error-prone: permits get buried in inboxes, he can't tell at a glance which ones are still pending, and reconstructing the history of a disputed permit is painful. He wants a tool that surfaces exactly what needs his attention without requiring him to dig.

**Goals:**
- See every permit's current status at a glance from a single dashboard, eliminating the need to search across spreadsheets or email (F1)
- Act on pending permits (approve, reject, revoke) quickly and confidently from one place, with a clear confirmation step before any state change (F5, F6)
- Locate any specific permit by title, applicant, or status within seconds rather than minutes (F3, F4)
- Trust that the data he sees is accurate — no stale counts, no phantom pending requests (F1, F9)

**Pain Points:**
- Currently tracks permit statuses across 3 separate spreadsheets, each owned by a different team member; no single source of truth
- Approving or rejecting a permit requires at least 3 email round-trips, each adding delay to field operations
- Has no mechanism to see which permits are about to expire or have already lapsed — he finds out reactively
- Existing tools (generic spreadsheets, email) provide no audit trail; when a permit is disputed he cannot quickly reconstruct who approved it and when

**Technical Expertise:** Intermediate — comfortable with web applications, SaaS tools, and standard business software; does not use command-line tools; expects UI affordances to be obvious without a training session

**Top Tasks:**
1. Review the dashboard on login and triage any new pending permits (daily, critical — first action of the day)
2. Open a specific permit from the list and approve or reject it with a confirmation step (daily, high — primary workflow)
3. Search or filter permits by status or type to answer a colleague's question about a specific permit (several times/week, high)
4. Revoke an approved permit when a situation changes (weekly, medium — time-sensitive when needed)
5. Review the status history timeline on a permit detail page to reconstruct what happened (as-needed, medium)

**Success Criteria:**
- Can complete a full approval or rejection within 90 seconds of logging in, starting from the dashboard
- Permit list shows accurate, real-time status — zero cases where a permit appears pending after it was already approved
- Can locate any permit in a 50-record dataset within 30 seconds using search or filters (PRD Success Metric)
- Completes a full create → approve → revoke lifecycle in under 5 minutes with no guidance (PRD Success Metric)

---

## PER-02: Priya Nair

**Role & Context:**
Priya is a Department Team Lead responsible for coordinating work permits and access authorizations on behalf of her team of 6 field technicians. She does not have final approval authority — that belongs to Operations Managers like Marcus — but she is the person who creates permit requests, fills in the details accurately, and monitors whether a submitted permit has been approved so she can schedule field work accordingly. She submits 3–8 new permits per week and checks on the status of outstanding permits daily.

Priya works primarily on a laptop, often while also referencing a calendar or schedule document in a second window. She cares deeply about getting the form details right (correct dates, correct permit type, accurate description) because a rejected permit due to bad information delays her team's work by at least a day. She also needs the permit creation form to be fast and self-evident — she does not want to read instructions to figure out which field means what.

**Goals:**
- Create a new permit request with all required fields in under 3 minutes, without ambiguity about what each field expects (F2, F7)
- Know the exact status of every permit she has submitted — pending, approved, or rejected — without emailing the manager to ask (F3, F5)
- Filter the permit list to show only her team's permits to avoid noise from other departments (F4)
- Understand why a permit was rejected so she can correct it and resubmit (F5, F6)

**Pain Points:**
- Currently submits permit requests via email to her manager; she has no way to check status without following up manually, which feels intrusive
- When a permit is rejected, she often receives no explanation — she has to guess what was wrong and resubmit blindly
- Date entry errors on paper/spreadsheet forms have caused permits to be created with incorrect durations, leading to premature expiry in the field
- The volume of email back-and-forth for a single permit obscures which version is the current, approved one

**Technical Expertise:** Intermediate — uses business web apps daily (scheduling tools, project trackers, HR portals); comfortable with forms and table-based lists; does not need onboarding for standard UI patterns

**Top Tasks:**
1. Fill out and submit a new permit creation form for an upcoming job (3–5×/week, critical — primary input action)
2. Check the permit list filtered to pending/approved status to see which permits are ready for field deployment (daily, high)
3. Open a specific permit's detail view to read the full information and check the status history for a rejection reason (several times/week, high)
4. Search for a permit by applicant name or job title when a field tech asks about a specific authorization (weekly, medium)

**Success Criteria:**
- Permit creation form is completable without confusion in under 3 minutes on first use
- Status of any submitted permit is visible without contacting the approving manager
- Rejection reason (if provided) is displayed clearly on the permit detail page so a correction can be made immediately
- Filter controls are findable and usable without instruction

---

## PER-03: Daniel Osei

**Role & Context:**
Daniel is a Senior Manager or Director who oversees multiple departments, including the teams that Marcus and Priya belong to. He is not involved in day-to-day permit operations — he does not create or approve permits himself — but he needs periodic assurance that the permit process is functioning correctly. He checks the Permit2 dashboard during weekly operations reviews, stakeholder walkthroughs, or when an incident prompts questions about whether the right permits were in place at the time.

Daniel's interaction with Permit2 is light-touch and high-level. He logs in to view the dashboard summary, glances at the stat cards to verify that the volume of pending permits is normal and no unusual spike of rejections has occurred, and occasionally navigates to a specific permit detail when a compliance or incident question arises. He is the primary audience for the "polished and professional" quality requirement — if the tool looks like a prototype, it undermines his confidence in the process it represents.

**Goals:**
- Get an accurate, instant overview of permit volume and status distribution from the dashboard without clicking into individual records (F1)
- Quickly navigate to a specific permit during an incident debrief or compliance conversation (F3, F4, F5)
- Trust that the system looks and behaves like a production-grade tool — visual quality signals operational maturity (F7)

**Pain Points:**
- Currently receives permit status via a hand-prepared weekly email summary from Marcus, which is always at least a day out of date by the time he reads it
- Has no way to independently verify permit status before or after a field incident — must ask Marcus, who then searches spreadsheets
- Existing informal tools (email, spreadsheets) are not something he can show to a regulator or auditor with confidence

**Technical Expertise:** Intermediate — uses executive dashboards, reporting tools, and SaaS platforms regularly; expects information to be immediately scannable without training; does not engage with form workflows

**Top Tasks:**
1. Log in and review the dashboard stat cards to assess overall permit health (weekly, high — primary use case)
2. Navigate to the permit list and locate a specific permit for a compliance or incident review (as-needed, high — high stakes when it occurs)
3. View the status history timeline on a permit detail to confirm when a permit was approved relative to a field event (as-needed, medium)

**Success Criteria:**
- Dashboard accurately reflects real permit counts with zero variance from the actual database state
- Application loads in under 2 seconds and looks visually polished — indistinguishable from a production SaaS product on first impression (PRD Success Metric)
- Can locate any specific permit during a live review without pre-preparation, using search or filters within 30 seconds

---

## Persona Relationships

| Persona | Interacts With | Nature of Interaction |
|---------|---------------|----------------------|
| PER-02 (Priya, Team Lead) | PER-01 (Marcus, Ops Manager) | Priya creates permit requests that Marcus reviews and approves or rejects; currently mediated by email, replaced by the Permit2 workflow |
| PER-01 (Marcus, Ops Manager) | PER-03 (Daniel, Senior Manager) | Marcus manages the day-to-day permit queue; Daniel reviews aggregate permit health and escalates when incidents arise |
| PER-03 (Daniel, Senior Manager) | PER-01 (Marcus, Ops Manager) | Daniel receives assurance that operations are running correctly; in incident scenarios, Daniel traces back through permits that Marcus approved |

---

## Feature-Persona Matrix

| Feature | PER-01 Marcus (Ops Manager) | PER-02 Priya (Team Lead) | PER-03 Daniel (Sr. Manager) |
|---------|----------------------------|--------------------------|------------------------------|
| F0: Manager Authentication | Primary | Primary | Primary |
| F1: Manager Dashboard | Primary | Secondary | Primary |
| F2: Permit Creation | Primary | Primary | — |
| F3: Permit List / Table View | Primary | Primary | Secondary |
| F4: Search & Filter | Primary | Primary | Secondary |
| F5: Permit Detail View | Primary | Primary | Secondary |
| F6: Permit Lifecycle Actions (Approve / Reject / Revoke) | Primary | — | — |
| F7: UI Design System & Visual Polish | Secondary | Secondary | Primary |
| F8: Permit Data API (Backend REST Endpoints) | — | — | — |
| F9: Permit Data Model & Persistence | — | — | — |

> **Matrix Key:** Primary = this persona is the principal user of this feature; Secondary = this persona uses or benefits from this feature but is not its primary driver; — = not a direct user of this feature.

---

*Document generated by Pivota Spec Framework*
*Last updated: 2026-08-06 | Project: Permit2 | Version: 1.0*
