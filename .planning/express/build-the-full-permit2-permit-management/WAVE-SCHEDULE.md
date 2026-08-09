wave: 1
domain: database
depends_on: []
features: [F9]
objective: "Create database schema, Prisma ORM setup, migrations, and seed data"
estimated_plans: 1
---
wave: 2
domain: backend
depends_on: [1]
features: [F0, F8]
objective: "REST API endpoints, JWT authentication, business logic, state machine"
estimated_plans: 1
---
wave: 3
domain: frontend
depends_on: [2]
features: [F1, F2, F3, F4, F5, F6, F7]
objective: "All UI screens: dashboard, permit list/filters, creation form, detail view, lifecycle actions, design system"
estimated_plans: 2
---
wave: 4
domain: integration
depends_on: [1, 2, 3]
features: [F0, F1, F2, F3, F4, F5, F6, F7, F8, F9]
objective: "End-to-end wiring, env config, seed data verification, README, deployment readiness"
estimated_plans: 1

## WAVE SCHEDULE

| Wave | Domain | Plans | Features | Objective |
|------|--------|-------|----------|-----------|
| 1 | database | 1 | F9 | Create DB schema, Prisma, migrations, seed |
| 2 | backend | 1 | F0, F8 | REST API, JWT auth, state machine |
| 3 | frontend | 2 | F1-F7 | All UI screens and design system |
| 4 | integration | 1 | all | E2E wiring, env, README, deploy |

**Total features:** 10 | **Covered:** 10 | **Uncovered:** 0
