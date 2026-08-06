---

## Y0: Database Schema — Full DDL

**Document:** Permit2 FRD — Cross-Feature Chunk
**Section:** Database Schema

All tables, enums, indexes, and constraints for the Permit2 database.
Implementer note: Use Prisma schema (`schema.prisma`) as the canonical source; the SQL DDL below is the logical equivalent for documentation purposes.

---

### Enums

```sql
-- Permit lifecycle status values
CREATE TYPE "PermitStatus" AS ENUM (
  'PENDING',    -- Initial state on creation; awaiting action
  'APPROVED',   -- Permit has been approved and is active
  'REJECTED',   -- Permit has been rejected (terminal state)
  'REVOKED'     -- Previously approved permit has been revoked (terminal state)
);

-- Permit category values
CREATE TYPE "PermitType" AS ENUM (
  'WORK',       -- Work permit
  'ACCESS',     -- Access permit
  'ACTIVITY',   -- Activity authorization
  'SAFETY',     -- Safety permit
  'OTHER'       -- Catch-all for types not listed
);
```

---

### Table: users

Stores manager accounts. All authenticated sessions are linked to a user record.

```sql
CREATE TABLE users (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255)  NOT NULL UNIQUE,
  password_hash  VARCHAR(255)  NOT NULL,
  name           VARCHAR(255)  NOT NULL,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
```

**Field Notes:**
- `id`: UUID v4, auto-generated. Used as the `sub` claim in JWT.
- `email`: Used as the login identifier. Must be unique across all accounts.
- `password_hash`: bcrypt hash with minimum cost factor 10. NEVER store plaintext passwords.
- `name`: Full display name shown in the navigation bar and status history entries.
- `created_at`: Immutable once set.

---

### Table: permits

Core permit records. One row per permit throughout its entire lifecycle.

```sql
CREATE TABLE permits (
  id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  title               VARCHAR(255)   NOT NULL,
  type                "PermitType"   NOT NULL,
  applicant_name      VARCHAR(255)   NOT NULL,
  description         TEXT           NOT NULL,
  notes               TEXT           NULL,
  status              "PermitStatus" NOT NULL DEFAULT 'PENDING',
  start_date          DATE           NOT NULL,
  end_date            DATE           NOT NULL,
  rejection_reason    TEXT           NULL,
  revocation_reason   TEXT           NULL,
  created_by          UUID           NOT NULL REFERENCES users(id),
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),

  CONSTRAINT chk_end_date_after_start CHECK (end_date >= start_date)
);

-- Indexes for common query patterns
CREATE INDEX idx_permits_status          ON permits(status);
CREATE INDEX idx_permits_type            ON permits(type);
CREATE INDEX idx_permits_created_at      ON permits(created_at DESC);
CREATE INDEX idx_permits_updated_at      ON permits(updated_at DESC);
CREATE INDEX idx_permits_start_date      ON permits(start_date);
CREATE INDEX idx_permits_created_by      ON permits(created_by);
CREATE INDEX idx_permits_status_type     ON permits(status, type);

-- Full-text search index (PostgreSQL) — optional for POC, improves ILIKE performance
CREATE INDEX idx_permits_title_trgm      ON permits USING GIN (title gin_trgm_ops);
CREATE INDEX idx_permits_applicant_trgm  ON permits USING GIN (applicant_name gin_trgm_ops);
```

> Note: GIN trigram indexes require `CREATE EXTENSION IF NOT EXISTS pg_trgm;`. Use `ILIKE` for simple substring matching in the POC if trigram extension is unavailable.

**Field Notes:**
- `title`: 1–255 characters; required.
- `type`: Must match `PermitType` enum.
- `applicant_name`: Name of the person requesting the permit.
- `description`: Purpose / scope of the permit; required, up to 2000 chars in practice (TEXT allows more).
- `notes`: Optional supplementary information.
- `status`: Always starts as `PENDING`. Updated by lifecycle action endpoints only.
- `start_date` / `end_date`: Permit validity window. `end_date >= start_date` enforced by CHECK constraint.
- `rejection_reason`: Non-null only when `status = 'REJECTED'`.
- `revocation_reason`: Non-null only when `status = 'REVOKED'`.
- `created_by`: References the manager who created the permit via the API. Set from `req.user.id`, never from request body.
- `updated_at`: Auto-updated by Prisma `@updatedAt` or a database trigger.

---

### Table: permit_status_history

Immutable event log of every status transition for every permit. Used to render the status timeline on the detail view (→ F05).

```sql
CREATE TABLE permit_status_history (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_id   UUID           NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
  status      "PermitStatus" NOT NULL,
  event       VARCHAR(50)    NOT NULL,
  actor_id    UUID           NOT NULL REFERENCES users(id),
  actor_name  VARCHAR(255)   NOT NULL,
  notes       TEXT           NULL,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_permit_history_permit_id ON permit_status_history(permit_id);
CREATE INDEX idx_permit_history_created_at ON permit_status_history(created_at);
```

**Field Notes:**
- `permit_id`: Foreign key to `permits.id`. CASCADE DELETE ensures history is cleaned up if a permit is deleted (not expected in POC, but schema-safe).
- `status`: The status value AFTER this event (e.g., the `CREATED` event has `status = 'PENDING'`).
- `event`: A human-readable event label. Valid values: `CREATED`, `APPROVED`, `REJECTED`, `REVOKED`.
- `actor_id`: References the manager who performed the action.
- `actor_name`: Denormalized copy of `users.name` at the time of the event. This ensures the timeline display remains accurate even if the user's name is later changed.
- `notes`: Optional reason or notes captured at time of action (from the confirmation dialog).
- `created_at`: Immutable timestamp of the event. Never updated after insert.

---

### Relationships

```
users ─────────────────────────────────────────────────────────────────
  │                                                                     │
  │ 1                                                               1   │
  │                                                                     │
  ├─< permits (created_by FK) >─────────────────────────────── 1:many  │
  │                                                                     │
  └─< permit_status_history (actor_id FK) >──────────────────── 1:many │
                                                                        │
permits ──────────────────────────────────────────────────────────────  │
  │                                                                     │
  └─< permit_status_history (permit_id FK, CASCADE DELETE) >─── 1:many
```

**Cardinality:**
- 1 `user` → many `permits` (a manager can create many permits)
- 1 `user` → many `permit_status_history` events (a manager can act on many permits)
- 1 `permit` → many `permit_status_history` events (min 1: the CREATED event)

---

### Database Trigger: auto-update `updated_at` (optional)

If not using Prisma `@updatedAt`, add a trigger:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_permits_updated_at
BEFORE UPDATE ON permits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

### Migration Sequence

Using Prisma:
```bash
# First-time setup
npx prisma migrate dev --name init

# Production deploy
npx prisma migrate deploy

# Seed data
npx prisma db seed
```

SQLite variant (for POC with simpler setup):
- Replace `UUID` with `TEXT DEFAULT (lower(hex(randomblob(16))))`
- Replace `TIMESTAMPTZ` with `DATETIME`
- Enums are emulated as TEXT with CHECK constraints
- GIN indexes are not available; use LIKE for search

---

### Seed Data SQL (Abbreviated)

```sql
-- Seed manager account (password: demo1234)
INSERT INTO users (id, email, password_hash, name)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'manager@permit2.dev',
  '$2b$10$...', -- bcrypt hash of 'demo1234'
  'Alex Manager'
);

-- Sample PENDING permits (4)
INSERT INTO permits (title, type, applicant_name, description, status, start_date, end_date, created_by)
VALUES
  ('Roof Access — Maintenance', 'ACCESS', 'Tom Bradley', 'Routine maintenance inspection of HVAC units on roof level.', 'PENDING', '2026-08-10', '2026-08-11', 'a0000000-...'),
  ('Electrical Panel Upgrade — Floor 2', 'WORK', 'Sarah Chen', 'Replacement of main distribution board.', 'PENDING', '2026-08-12', '2026-08-14', 'a0000000-...'),
  ...

-- Each permit gets a CREATED history entry
INSERT INTO permit_status_history (permit_id, status, event, actor_id, actor_name)
VALUES ('...', 'PENDING', 'CREATED', 'a0000000-...', 'Alex Manager');
```

Full seed script lives at `prisma/seed.ts` (or `prisma/seed.js`) in the repository.
