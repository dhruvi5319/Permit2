# Project State

## Project
**Name:** Permit2
**Description:** A simple, beautiful permit management system for small teams and POC demonstrations.

## Status

**Current state:** Express task complete — full application delivered
**Last activity:** 2026-08-10 - UAT verified express task build-the-full-permit2-permit-management (0/0 passed — DOCKER_UNAVAILABLE in sandbox; build ✓ exit 0)

## What's Been Built

The full Permit2 application has been built end-to-end:

- **Database layer** (Wave 1): PostgreSQL schema with Prisma 7 ORM, User/Permit/PermitStatusHistory models, seed data (15 permits + 1 manager user), Docker Compose
- **Backend API** (Wave 2): 10 REST endpoints, JWT authentication, state machine enforcement, Zod validation, Next.js middleware
- **Frontend** (Wave 3): Design system, dashboard with stat cards + donut chart + recent activity, permit list with filter/sort/pagination
- **Frontend** (Wave 3): Login page, permit creation form, detail view, approve/reject/revoke action dialogs, API client
- **Integration** (Wave 4): Security headers, lazy Prisma initialization, production build (exit 0), README

## Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL 16 (Docker)
- **ORM:** Prisma 7.9.1 with `@prisma/adapter-pg`
- **Auth:** JWT HS256 + httpOnly cookies
- **Frontend:** React + TanStack Query v5 + Recharts + Tailwind CSS
- **Validation:** Zod v4
- **Deployment:** Docker Compose (db + app services)

## Demo Credentials

- **URL:** http://localhost:3000
- **Email:** `manager@permit2.dev`
- **Password:** `demo1234`

## Blockers/Concerns

None.

## Express Tasks Completed

| # | Description | Date | Commit | UAT | Directory |
|---|-------------|------|--------|-----|-----------|
| build-the-full-permit2-permit-management | Build the full Permit2 permit management application | 2026-08-10 | 2283256 | ⚠ DOCKER_UNAVAILABLE (build ✓) | [build-the-full-permit2-permit-management](./express/build-the-full-permit2-permit-management/) |
