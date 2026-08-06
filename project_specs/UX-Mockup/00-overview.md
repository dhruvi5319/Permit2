# UX Mockup — Permit2 Permit Management System

**Project:** Permit2
**Generated:** 2026-08-06
**Based on:** UserStories-Permit2.md, PRD-Permit2.md, FRD-Permit2.md, JOURNEYS-Permit2.md

---

## Overview

Permit2 is a proof-of-concept permit management system for small operational teams. Its defining characteristic is **beautiful, production-grade visual design** — this is an explicit first-class requirement, not an enhancement. The UX must reflect a polished, modern SaaS product that instills confidence in stakeholders during live demonstrations.

### Design Philosophy

1. **Clarity through hierarchy** — Status is always the most prominent signal. Color-coded badges, card elevation, and typography weight collectively guide the eye to what matters most.
2. **Speed of action** — Every key workflow (triage, lookup, creation, approval) is completable in under 2 minutes from the landing page. Navigation is never more than 2 clicks deep.
3. **Confidence through feedback** — Every action has a visible response: loading states, success toasts, inline errors. Users are never left wondering if something worked.
4. **Progressive disclosure** — Complex detail (status history, rejection reasons, notes) is available but does not compete with primary content.
5. **Delight through polish** — Micro-animations, shimmer skeletons, hover states, and smooth modal transitions elevate the experience beyond a standard CRUD app.

### Design System Summary

| Token | Value | Use |
|-------|-------|-----|
| Brand Primary | Indigo-600 `#4F46E5` | Buttons, nav active, links |
| Brand Hover | Indigo-700 `#4338CA` | Hover states |
| Status: Pending | Amber-600 on Amber-100 | Pending badges everywhere |
| Status: Approved | Emerald-600 on Emerald-100 | Approved badges everywhere |
| Status: Rejected | Red-600 on Red-100 | Rejected badges everywhere |
| Status: Revoked | Gray-500 on Gray-100 | Revoked badges everywhere |
| Surface | White `#FFFFFF` | Cards, panels |
| Background | Gray-50 `#F9FAFB` | Page background |
| Border | Gray-200 `#E5E7EB` | Card borders, dividers |
| Text Primary | Gray-900 `#111827` | Headings, body text |
| Text Secondary | Gray-500 `#6B7280` | Labels, captions |
| Font | Inter | All text |
| Base Spacing | 4px | All spacing multiples |
| Card Radius | 12px | All card borders |

### Personas

| ID | Name | Role | Primary Journey |
|----|------|------|-----------------|
| PER-01 | Marcus Webb | Operations Manager | Daily triage, approvals, rapid lookup |
| PER-02 | Priya Nair | Department Team Lead | Permit creation, status checking |
| PER-03 | Daniel Osei | Senior Manager / Stakeholder | Dashboard reviews, compliance tracing |

---

## Navigation Map

| Screen | Route | Reached From | Nav Element |
|--------|-------|--------------|-------------|
| Login | `/login` | Direct URL / any unauthenticated access | Unauthenticated redirect |
| Dashboard | `/dashboard` | Login success / Nav bar | Nav bar: "Dashboard" link; post-login redirect |
| Permit List | `/permits` | Dashboard / Nav bar / breadcrumb | Nav bar: "Permits" link; Dashboard "View all permits"; Stat card clicks |
| Permit List (filtered) | `/permits?status=X` | Dashboard stat cards | Stat card click (Pending/Approved/Rejected/Revoked) |
| Create Permit | `/permits/new` | Dashboard / Permit List / Nav CTA | Dashboard "Create New Permit" button; Permit List "Create New Permit" button |
| Permit Detail | `/permits/:id` | Permit List row click / Recent Activity row click / Action links | Table row click; "View" link in actions column; Activity feed row click |
| Permit Detail (action) | `/permits/:id?action=approve\|reject\|revoke` | Permit List action links | "Approve" / "Reject" / "Revoke" quick-action links in table |

**Invariant — no orphan screens:** All screens above are reachable from the persistent top navigation bar or a parent screen that itself traces to the nav bar. The Login screen is the unauthenticated entry point. All authenticated screens require a valid session.
