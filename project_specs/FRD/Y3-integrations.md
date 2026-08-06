---

## Y3: External Integration Points

**Document:** Permit2 FRD — Cross-Feature Chunk
**Section:** External Integrations

---

### Overview

Permit2 POC is explicitly designed with **no external system integrations** (see PRD §9 Out of Scope: OOS-6). The application is entirely self-contained: a frontend, a backend API, and a database. There are no webhooks, no third-party APIs, no message queues, and no event buses in scope for this POC.

This document enumerates the minimal external dependencies that exist at the infrastructure/tooling level (not business integrations) and defines their contracts.

---

### Infrastructure Dependencies

| Dependency | Type | Required | POC Usage |
|---|---|---|---|
| PostgreSQL (or SQLite) | Database | Yes | Primary data store for all Permit2 records |
| Node.js runtime | Runtime | Yes | Backend API server |
| npm / package registry | Build tool | Yes | Dependency installation (`npm install`) |
| Vercel / Railway / Render | Hosting | Yes (for deployed demo) | Zero-config deployment target |
| Google Fonts CDN | Font delivery | Optional | Serves `Inter` font; can be self-hosted |

---

### Database Connection

**Contract:**
- Connection string via `DATABASE_URL` environment variable.
- Format: `postgresql://user:password@host:port/database` (PostgreSQL) or `file:./dev.db` (SQLite).
- The application will not start if `DATABASE_URL` is unset or the connection fails.
- Prisma Client is the only consumer of the database; no direct SQL queries from the API layer (all queries go through Prisma).

**Environment Variables Required:**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/permit2
```

---

### JWT Secret

**Contract:**
- JWT signing secret via `JWT_SECRET` environment variable.
- Must be a cryptographically random string, minimum 32 characters.
- If unset, the application refuses to start (fail-fast on startup).

**Environment Variables Required:**
```
JWT_SECRET=your-secret-key-minimum-32-chars
JWT_EXPIRES_IN=1h
```

---

### Environment Configuration Summary

All required environment variables for Permit2:

| Variable | Required | Example | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://...` | Database connection string |
| `JWT_SECRET` | Yes | `supersecret...` | JWT signing secret (≥32 chars) |
| `JWT_EXPIRES_IN` | No | `1h` | JWT expiry duration (default: `1h`) |
| `NODE_ENV` | No | `production` | `development` or `production` |
| `PORT` | No | `3000` | Server port (default: `3000`) |
| `BCRYPT_COST_FACTOR` | No | `10` | bcrypt rounds (default: `10`, min: `10`) |

---

### Out of Scope Integrations (Explicitly Excluded)

The following integrations are out of scope for the Permit2 POC and must not be introduced without explicit re-scoping:

| Integration | Reason Excluded |
|---|---|
| Email provider (SendGrid, Resend, etc.) | Notifications are out of scope (OOS-3) |
| SMS provider (Twilio, etc.) | Notifications are out of scope (OOS-3) |
| External auth provider (Auth0, Okta, Azure AD) | Credential-based login sufficient for POC (OOS-4) |
| ERP / HRMS systems | No external integrations required (OOS-6) |
| File storage (S3, Cloudflare R2) | File attachments are out of scope (OOS-8) |
| Analytics (Mixpanel, Segment, etc.) | Advanced analytics out of scope (OOS-10) |
| Webhook endpoints | No external consumers in scope (OOS-7) |

---

### Deployment Integration Contracts

#### Vercel (Recommended)

- Connect GitHub repository to Vercel project.
- Set environment variables in the Vercel dashboard.
- Build command: `npm run build` (Next.js) or equivalent.
- No additional configuration required for POC.
- Database: use Railway PostgreSQL addon or a Supabase free tier database; set `DATABASE_URL` in Vercel environment settings.

#### Railway

- Deploy via Railway's GitHub integration or CLI (`railway up`).
- Add a PostgreSQL service within the same Railway project; `DATABASE_URL` is auto-injected.
- All other env vars set via Railway's variable management.

#### Render

- Connect GitHub repository; select "Web Service."
- Add a Render PostgreSQL database; `DATABASE_URL` auto-injected.
- Set remaining env vars via Render's environment settings.

---

### Security Notes for Infrastructure

- `JWT_SECRET` must never be committed to source control. Use `.env` (git-ignored) locally and platform env vars in production.
- `DATABASE_URL` must never be committed to source control.
- The `.env.example` file in the repository should list all required variables with placeholder values (not real secrets).
- bcrypt cost factor must be ≥10 in all environments (including development).
- All API routes must enforce HTTPS in production deployments (handled by Vercel/Railway/Render platform layer).

---

### README Setup Instructions (Required per NFR-6)

The repository `README.md` must include:

```markdown
## Setup

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your values
4. Run `npx prisma migrate dev`
5. Run `npx prisma db seed`
6. Run `npm run dev`
7. Open http://localhost:3000

## Demo Login
- Email: manager@permit2.dev
- Password: demo1234
```

---

*End of FRD — Permit2 v1.0 — Generated 2026-08-06*
