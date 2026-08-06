# Functional Requirements Document
## Permit2 — Permit Management System (POC)

**Document Version:** 1.0
**Date:** 2026-08-06
**Status:** Active
**Acronym:** Permit2
**Derived From:** PRD-Permit2.md v1.0

---

## Scope

This FRD specifies the functional behaviour of every feature in the Permit2 POC. It is the authoritative reference for implementation: developers must be able to build each feature from this document alone without returning to the PRD. The FRD covers all layers — frontend screens and flows, backend REST API, and database schema — for all ten PRD features (F0–F9).

---

## Conventions

- **Feature IDs** match PRD: `F0`–`F9`. Chunk filenames use zero-padded form (`F00`, `F01`, …, `F09`) for correct lexicographic sort.
- **Status enum values** are written in `SCREAMING_SNAKE_CASE` throughout (e.g., `PENDING`, `APPROVED`).
- **HTTP methods** are written in `UPPER CASE`; paths use `:param` notation for path parameters.
- **Required** fields are marked `(required)`; optional fields `(optional)`.
- **Cross-references** use the pattern `→ F{n}` or `→ Y0-schema.md §TableName`.
- **Error table columns:** Scenario | HTTP Status | Error Code | Message.
- **API summary tables** in feature chunks are abbreviated; full request/response schemas live in `Y1-api.md`.
- **DDL** in feature chunks is abbreviated; full DDL lives in `Y0-schema.md`.

---

## Master Table of Contents

| Chunk File | Section |
|---|---|
| `00-header.md` | This file — conventions, TOC, shared terminology |
| `F00-auth.md` | F0: Manager Authentication |
| `F01-dashboard.md` | F1: Manager Dashboard |
| `F02-permit-creation.md` | F2: Permit Creation |
| `F03-permit-list.md` | F3: Permit List / Table View |
| `F04-search-filter.md` | F4: Search & Filter |
| `F05-permit-detail.md` | F5: Permit Detail View |
| `F06-lifecycle-actions.md` | F6: Permit Lifecycle Actions (Approve / Reject / Revoke) |
| `F07-design-system.md` | F7: UI Design System & Visual Polish |
| `F08-api.md` | F8: Permit Data API (Backend REST Endpoints) |
| `F09-data-model.md` | F9: Permit Data Model & Persistence |
| `Y0-schema.md` | Database DDL — all tables |
| `Y1-api.md` | REST API catalog — all endpoints |
| `Y2-errors.md` | Cross-feature error catalog |
| `Y3-integrations.md` | External integration points |

---

## Shared Terminology

| Term | Definition |
|---|---|
| **Manager** | The sole user persona; a team lead or department manager who creates and acts on permits. |
| **Permit** | A formal record representing a work, access, activity, or safety authorization. |
| **Permit Lifecycle** | The ordered state machine: `PENDING` → `APPROVED` or `REJECTED`; `APPROVED` → `REVOKED`. |
| **Terminal State** | A permit status from which no further transitions are allowed: `REJECTED`, `REVOKED`. |
| **Session** | An authenticated context established after login; persists across page refreshes until logout. |
| **JWT** | JSON Web Token used as the bearer token for API authentication. |
| **Toast** | A transient, non-blocking notification message displayed in the UI corner. |
| **Skeleton Screen** | A loading placeholder that mimics the shape of the content being loaded. |
| **Status Badge** | A color-coded pill-shaped UI element showing the current permit status. |
| **Confirmation Dialog** | A modal overlay requiring explicit user confirmation before executing a destructive or irreversible action. |
| **POC** | Proof of Concept — this project's scope boundary. |
| **CRUD** | Create, Read, Update, Delete — standard data operations. |
| **ORM** | Object-Relational Mapper (Prisma in the recommended stack). |

---

## Permit Status State Machine

```
                    ┌─────────┐
           create   │         │
        ──────────► │ PENDING │
                    │         │
                    └────┬────┘
                         │
              ┌──────────┴──────────┐
              │ approve             │ reject
              ▼                     ▼
        ┌──────────┐         ┌──────────┐
        │ APPROVED │         │ REJECTED │  (terminal)
        └────┬─────┘         └──────────┘
             │ revoke
             ▼
        ┌─────────┐
        │ REVOKED │  (terminal)
        └─────────┘
```

Valid transitions:
- `PENDING` → `APPROVED` (approve action)
- `PENDING` → `REJECTED` (reject action)
- `APPROVED` → `REVOKED` (revoke action)

Invalid transitions (all others) return `400 Bad Request`.

---

## Permit Type Enum

| Value | Display Label |
|---|---|
| `WORK` | Work Permit |
| `ACCESS` | Access Permit |
| `ACTIVITY` | Activity Authorization |
| `SAFETY` | Safety Permit |
| `OTHER` | Other |

---

*End of header — continue to F00-auth.md*
