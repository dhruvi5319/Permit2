---
phase: build-the-full-permit2-permit-management
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - permit2/prisma/schema.prisma
  - permit2/prisma/seed.ts
  - permit2/lib/db.ts
  - permit2/.env.example
  - permit2/package.json
autonomous: true

features:
  implements: ["F9"]
  depends_on: []
  enables: ["F0", "F8", "F1", "F2", "F3", "F4", "F5", "F6", "F7"]

must_haves:
  truths:
    - "prisma generate succeeds without errors"
    - "prisma migrate dev applies migrations against PostgreSQL"
    - "prisma db seed creates exactly 1 manager user (manager@permit2.dev) and 15 permits spread across all 4 statuses"
    - "Prisma client singleton in lib/db.ts is importable from API routes without connection leaks in dev hot-reload"
    - ".env.example documents all required env vars"
  artifacts:
    - path: "permit2/prisma/schema.prisma"
      provides: "Canonical Prisma schema: User, Permit, PermitStatusHistory models with enums"
      contains: "model User"
    - path: "permit2/prisma/seed.ts"
      provides: "Demo seed: 1 manager user + 15 permits across PENDING/APPROVED/REJECTED/REVOKED"
      contains: "manager@permit2.dev"
    - path: "permit2/lib/db.ts"
      provides: "Prisma client singleton"
      exports: ["prisma"]
    - path: "permit2/.env.example"
      provides: "Environment variable documentation"
      contains: "DATABASE_URL"
  key_links:
    - from: "permit2/lib/db.ts"
      to: "prisma/schema.prisma"
      via: "PrismaClient import from @prisma/client"
      pattern: "from '@prisma/client'"
    - from: "permit2/prisma/seed.ts"
      to: "prisma/schema.prisma"
      via: "prisma.user.upsert + prisma.permit.create"
      pattern: "prisma\\.user\\.upsert"

integration_contracts:
  requires: []
  provides:
    - artifact: "permit2/prisma/schema.prisma"
      exports: ["User", "Permit", "PermitStatusHistory", "PermitStatus", "PermitType"]
      shape: |
        enum PermitStatus { PENDING APPROVED REJECTED REVOKED }
        enum PermitType   { WORK ACCESS ACTIVITY SAFETY OTHER }
        model User { id String @id; email String @unique; passwordHash String @map("password_hash"); name String; createdAt DateTime @default(now()) @map("created_at") }
        model Permit { id String @id; title String; type PermitType; applicantName String @map("applicant_name"); description String; notes String?; status PermitStatus @default(PENDING); startDate DateTime @map("start_date") @db.Date; endDate DateTime @map("end_date") @db.Date; rejectionReason String? @map("rejection_reason"); revocationReason String? @map("revocation_reason"); createdBy String @map("created_by"); createdAt DateTime @default(now()) @map("created_at"); updatedAt DateTime @updatedAt @map("updated_at") }
        model PermitStatusHistory { id String @id; permitId String @map("permit_id"); status PermitStatus; event String; actorId String @map("actor_id"); actorName String @map("actor_name"); notes String?; createdAt DateTime @default(now()) @map("created_at") }
      verify: "grep -n 'model User' permit2/prisma/schema.prisma && grep -n 'model Permit ' permit2/prisma/schema.prisma && grep -n 'model PermitStatusHistory' permit2/prisma/schema.prisma && echo CONTRACT_OK"
    - artifact: "permit2/lib/db.ts"
      exports: ["prisma"]
      shape: "export const prisma: PrismaClient"
      verify: "grep -n 'export const prisma' permit2/lib/db.ts && echo CONTRACT_OK"
    - artifact: "permit2/prisma/seed.ts"
      exports: ["seed data: 1 user + 15 permits"]
      shape: "manager@permit2.dev user upsert + 15 permit.create calls"
      verify: "grep -n 'manager@permit2.dev' permit2/prisma/seed.ts && echo CONTRACT_OK"
---

<objective>
Set up the complete Permit2 database layer: Prisma ORM schema, PostgreSQL migrations, Prisma client singleton, and a realistic seed dataset.

Purpose: All Wave 2 API routes and Wave 3 UI features depend on a running, seeded PostgreSQL database with correct schema. This wave delivers that foundation.
Output: prisma/schema.prisma (canonical models), lib/db.ts (singleton), prisma/seed.ts (15 permits + 1 manager), .env.example, package.json scripts.
</objective>

<feature_dependencies>
Implements: F9: Permit Data Model & Persistence — relational schema, Prisma ORM, migration, seed
Depends on: None
Enables: F0 (auth uses User model), F8 (API routes use Permit/PermitStatusHistory), F1–F7 (all UI features read/write permits)
</feature_dependencies>

<execution_context>
@/root/.local/share/pivota/opencode-xdg/opencode/pivota_spec-framework/workflows/execute-plan.md
</execution_context>

<context>
@permit2/package.json
@permit2/next.config.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Prisma schema, db singleton, env example, and package.json scripts</name>
  <files>
    permit2/prisma/schema.prisma
    permit2/lib/db.ts
    permit2/.env.example
    permit2/package.json
  </files>
  <action>
Work inside the `permit2/` directory (the Next.js 16 app root).

**Step 1 — Create `prisma/schema.prisma`** (copy verbatim from TechArch — do NOT paraphrase):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum PermitStatus {
  PENDING
  APPROVED
  REJECTED
  REVOKED
}

enum PermitType {
  WORK
  ACCESS
  ACTIVITY
  SAFETY
  OTHER
}

model User {
  id            String                @id @default(uuid())
  email         String                @unique
  passwordHash  String                @map("password_hash")
  name          String
  createdAt     DateTime              @default(now()) @map("created_at")
  permits       Permit[]              @relation("CreatedBy")
  historyEvents PermitStatusHistory[]

  @@map("users")
}

model Permit {
  id                String                @id @default(uuid())
  title             String                @db.VarChar(255)
  type              PermitType
  applicantName     String                @map("applicant_name") @db.VarChar(255)
  description       String                @db.Text
  notes             String?               @db.Text
  status            PermitStatus          @default(PENDING)
  startDate         DateTime              @map("start_date") @db.Date
  endDate           DateTime              @map("end_date")   @db.Date
  rejectionReason   String?               @map("rejection_reason")  @db.Text
  revocationReason  String?               @map("revocation_reason") @db.Text
  createdBy         String                @map("created_by")
  creator           User                  @relation("CreatedBy", fields: [createdBy], references: [id])
  createdAt         DateTime              @default(now())   @map("created_at")
  updatedAt         DateTime              @updatedAt        @map("updated_at")
  statusHistory     PermitStatusHistory[]

  @@index([status])
  @@index([type])
  @@index([createdAt])
  @@index([updatedAt])
  @@index([startDate])
  @@index([createdBy])
  @@index([status, type])
  @@map("permits")
}

model PermitStatusHistory {
  id        String       @id @default(uuid())
  permitId  String       @map("permit_id")
  permit    Permit       @relation(fields: [permitId], references: [id], onDelete: Cascade)
  status    PermitStatus
  event     String       @db.VarChar(50)
  actorId   String       @map("actor_id")
  actor     User         @relation(fields: [actorId], references: [id])
  actorName String       @map("actor_name") @db.VarChar(255)
  notes     String?      @db.Text
  createdAt DateTime     @default(now()) @map("created_at")

  @@index([permitId])
  @@index([createdAt])
  @@map("permit_status_history")
}
```

**Step 2 — Create `lib/db.ts`** (Prisma singleton from TechArch §7 verbatim):

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query'] : [] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Step 3 — Create `.env.example`**:

```
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/permit2"

# JWT signing key — must be at least 32 characters
JWT_SECRET="change-me-to-a-random-string-at-least-32-chars"

# Optional — JWT expiry (default: 1h)
JWT_EXPIRES_IN="1h"

# Optional — bcrypt cost factor (default: 10, min: 10)
BCRYPT_COST_FACTOR="10"

# Optional — server port
PORT="3000"

# NODE_ENV: development | production
NODE_ENV="development"
```

**Step 4 — Update `package.json` scripts** (add Prisma scripts alongside existing ones, do NOT remove existing scripts):

Add to the `"scripts"` block:
```json
"db:migrate": "prisma migrate dev",
"db:push": "prisma db push",
"db:seed": "prisma db seed",
"db:studio": "prisma studio",
"typecheck": "tsc --noEmit"
```

Also add a `"prisma"` config block at the top level of package.json to wire the seed script:
```json
"prisma": {
  "seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"
}
```

Note: `prisma` package is already installed (`^7.9.1`). Also install `ts-node` as dev dependency by adding it to devDependencies: `"ts-node": "^10.9.2"`. Run `npm install --save-dev ts-node` inside `permit2/`.
  </action>
  <verify>
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2 && npx prisma validate && echo "SCHEMA_VALID"
grep -n 'model User' /root/pivota-workspaces/dhruvi/Permit2/permit2/prisma/schema.prisma && echo "USER_MODEL_OK"
grep -n 'model Permit ' /root/pivota-workspaces/dhruvi/Permit2/permit2/prisma/schema.prisma && echo "PERMIT_MODEL_OK"
grep -n 'model PermitStatusHistory' /root/pivota-workspaces/dhruvi/Permit2/permit2/prisma/schema.prisma && echo "HISTORY_MODEL_OK"
grep -n 'export const prisma' /root/pivota-workspaces/dhruvi/Permit2/permit2/lib/db.ts && echo "DB_SINGLETON_OK"
grep -n 'DATABASE_URL' /root/pivota-workspaces/dhruvi/Permit2/permit2/.env.example && echo "ENV_EXAMPLE_OK"
grep -n '"db:migrate"' /root/pivota-workspaces/dhruvi/Permit2/permit2/package.json && echo "SCRIPTS_OK"
```
  </verify>
  <done>
- `prisma validate` exits 0 with no errors
- `prisma/schema.prisma` contains all three models (User, Permit, PermitStatusHistory) and both enums (PermitStatus, PermitType) exactly as specified in TechArch
- `lib/db.ts` exports `prisma` singleton with hot-reload guard
- `.env.example` documents DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_COST_FACTOR, PORT, NODE_ENV
- `package.json` includes db:migrate, db:push, db:seed, db:studio scripts and prisma.seed config
  </done>
</task>

<task type="auto">
  <name>Task 2: Seed script — 1 manager user + 15 realistic permits across all statuses</name>
  <files>
    permit2/prisma/seed.ts
  </files>
  <action>
Create `permit2/prisma/seed.ts`. This script must be **idempotent** (safe to re-run; uses upsert for the user, skips existing permits by checking count first, or clears and re-seeds).

The seed creates:
- **1 manager user**: email `manager@permit2.dev`, password `demo1234` (bcrypt hash, cost 10), name `"Alex Manager"`
- **15 permits** spread across all 4 statuses: 4 PENDING, 4 APPROVED, 4 REJECTED, 3 REVOKED
- Each permit has a corresponding `PermitStatusHistory` entry (CREATED event), and APPROVED/REJECTED/REVOKED permits have a second history entry for their transition
- Covers all 5 permit types (WORK, ACCESS, ACTIVITY, SAFETY, OTHER) with variation
- Uses realistic titles and applicant names (e.g., "Electrical Panel Upgrade — Building C", "Site Access — Contractor Team Alpha")

```typescript
import { PrismaClient, PermitStatus, PermitType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── 1. Upsert manager user ─────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('demo1234', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@permit2.dev' },
    update: {},
    create: {
      email: 'manager@permit2.dev',
      passwordHash,
      name: 'Alex Manager',
    },
  });
  console.log(`Manager upserted: ${manager.email} (id: ${manager.id})`);

  // ── 2. Skip seeding permits if already seeded ──────────────────────────────
  const existingCount = await prisma.permit.count();
  if (existingCount >= 15) {
    console.log(`Permits already seeded (${existingCount} found). Skipping.`);
    return;
  }

  // ── 3. Define permit templates ─────────────────────────────────────────────
  const now = new Date();
  const d = (offsetDays: number): Date => {
    const date = new Date(now);
    date.setDate(date.getDate() + offsetDays);
    return date;
  };

  interface PermitTemplate {
    title: string;
    type: PermitType;
    applicantName: string;
    description: string;
    notes?: string;
    status: PermitStatus;
    startDate: Date;
    endDate: Date;
    rejectionReason?: string;
    revocationReason?: string;
  }

  const permits: PermitTemplate[] = [
    // ── PENDING (4) ──────────────────────────────────────────────────────────
    {
      title: 'Electrical Panel Upgrade — Building C',
      type: PermitType.WORK,
      applicantName: 'Jordan Ellis',
      description: 'Replacement of the main electrical panel in Building C to support increased load capacity. Requires full power shutdown for 4 hours.',
      notes: 'Coordinate with facilities team for tenant notifications.',
      status: PermitStatus.PENDING,
      startDate: d(3),
      endDate: d(5),
    },
    {
      title: 'Contractor Site Access — Foundation Works',
      type: PermitType.ACCESS,
      applicantName: 'Taylor Reid',
      description: 'Access permit for excavation and foundation crew to enter restricted construction zone for Phase 2 groundwork.',
      status: PermitStatus.PENDING,
      startDate: d(7),
      endDate: d(21),
    },
    {
      title: 'Community Safety Drill — Warehouse District',
      type: PermitType.ACTIVITY,
      applicantName: 'Morgan Flores',
      description: 'Authorized evacuation and fire safety drill for all warehouse personnel. Includes simulated alarm activation.',
      notes: 'Notify local fire department 48 hours prior.',
      status: PermitStatus.PENDING,
      startDate: d(14),
      endDate: d(14),
    },
    {
      title: 'Confined Space Entry — Utility Tunnel B',
      type: PermitType.SAFETY,
      applicantName: 'Casey Nguyen',
      description: 'Entry permit for maintenance team to inspect and repair gas line junction in confined utility tunnel. Full PPE required.',
      status: PermitStatus.PENDING,
      startDate: d(10),
      endDate: d(11),
    },

    // ── APPROVED (4) ─────────────────────────────────────────────────────────
    {
      title: 'Roof Access — HVAC Maintenance Q3',
      type: PermitType.WORK,
      applicantName: 'Riley Patel',
      description: 'Quarterly servicing of rooftop HVAC units across Buildings A, B, and D. Includes filter replacement and coolant top-up.',
      notes: 'Use secondary stairwell access only.',
      status: PermitStatus.APPROVED,
      startDate: d(-5),
      endDate: d(2),
    },
    {
      title: 'VIP Visitor Access — Executive Floor',
      type: PermitType.ACCESS,
      applicantName: 'Dana Kim',
      description: 'Access authorization for external auditors to enter the executive floor and server room annex for the annual compliance review.',
      status: PermitStatus.APPROVED,
      startDate: d(-2),
      endDate: d(1),
    },
    {
      title: 'Product Demo Event — Atrium',
      type: PermitType.ACTIVITY,
      applicantName: 'Avery Chen',
      description: 'Authorization to host a live product demonstration in the main atrium. Includes AV setup, catering, and 50 external guests.',
      notes: 'Security check-in required for all external attendees.',
      status: PermitStatus.APPROVED,
      startDate: d(-1),
      endDate: d(-1),
    },
    {
      title: 'Chemical Storage Relocation — Lab 4',
      type: PermitType.SAFETY,
      applicantName: 'Quinn Walker',
      description: 'Permit to relocate hazardous chemical storage from Lab 4 to the new Class II safety cabinet in Lab 7. Full MSDS review completed.',
      status: PermitStatus.APPROVED,
      startDate: d(-3),
      endDate: d(0),
    },

    // ── REJECTED (4) ─────────────────────────────────────────────────────────
    {
      title: 'Weekend Welding — Loading Dock',
      type: PermitType.WORK,
      applicantName: 'Skylar Brown',
      description: 'Hot work permit for welding repairs on the loading dock steel frame. Proposed for weekend execution.',
      status: PermitStatus.REJECTED,
      startDate: d(-10),
      endDate: d(-8),
      rejectionReason: 'Hot work cannot be performed without fire watch present. Weekend staffing insufficient for required fire watch coverage.',
    },
    {
      title: 'Unescorted Server Room Access — Vendor',
      type: PermitType.ACCESS,
      applicantName: 'Phoenix Adams',
      description: 'Request for unescorted overnight access to the main server room for a third-party hardware vendor.',
      status: PermitStatus.REJECTED,
      startDate: d(-15),
      endDate: d(-15),
      rejectionReason: 'Policy prohibits unescorted vendor access to the server room at any time. Resubmit with escorted access arrangement.',
    },
    {
      title: 'Public Concert — East Parking Lot',
      type: PermitType.ACTIVITY,
      applicantName: 'Reese Martinez',
      description: 'Request to hold an outdoor concert in the east parking lot for 200+ attendees, including amplified music until midnight.',
      status: PermitStatus.REJECTED,
      startDate: d(-20),
      endDate: d(-20),
      rejectionReason: 'Noise ordinance prohibits amplified outdoor music after 10 PM. Activity conflicts with shift handover for neighboring industrial zone.',
    },
    {
      title: 'Improvised Scaffold Erection — Facade',
      type: PermitType.SAFETY,
      applicantName: 'Harley Thompson',
      description: 'Request to erect temporary scaffold on the east facade using non-certified materials for cost savings.',
      status: PermitStatus.REJECTED,
      startDate: d(-7),
      endDate: d(-5),
      rejectionReason: 'Non-certified scaffolding materials do not meet safety standards. Permit denied until certified equipment is procured.',
    },

    // ── REVOKED (3) ──────────────────────────────────────────────────────────
    {
      title: 'Crane Operation — North Yard',
      type: PermitType.WORK,
      applicantName: 'Sage Wilson',
      description: 'Heavy crane operation permit for structural steel beam placement in the north yard expansion area.',
      status: PermitStatus.REVOKED,
      startDate: d(-30),
      endDate: d(-15),
      revocationReason: 'Weather conditions deteriorated beyond safe operational limits. Permit revoked pending rescheduling.',
    },
    {
      title: 'Media Crew Access — Production Floor',
      type: PermitType.ACCESS,
      applicantName: 'River Scott',
      description: 'Access authorization for a film crew to capture b-roll footage of production operations for a corporate marketing video.',
      status: PermitStatus.REVOKED,
      startDate: d(-25),
      endDate: d(-20),
      revocationReason: 'Production floor safety incident required immediate area lockdown. Media access revoked for the duration of the incident investigation.',
    },
    {
      title: 'Forklift Operations — Aisle 9 Reconfiguration',
      type: PermitType.OTHER,
      applicantName: 'Blake Hernandez',
      description: 'Permit for extended forklift operations in Aisle 9 to reconfigure warehouse racking layout. Pedestrian access restricted during operations.',
      status: PermitStatus.REVOKED,
      startDate: d(-40),
      endDate: d(-35),
      revocationReason: 'Operator certification lapsed during the permit period. Operations halted and permit revoked until recertification is complete.',
    },
  ];

  // ── 4. Create permits + status history ────────────────────────────────────
  for (const p of permits) {
    const created = await prisma.permit.create({
      data: {
        title: p.title,
        type: p.type,
        applicantName: p.applicantName,
        description: p.description,
        notes: p.notes ?? null,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate,
        rejectionReason: p.rejectionReason ?? null,
        revocationReason: p.revocationReason ?? null,
        createdBy: manager.id,
      },
    });

    // CREATED history entry (all permits)
    await prisma.permitStatusHistory.create({
      data: {
        permitId: created.id,
        status: PermitStatus.PENDING,
        event: 'CREATED',
        actorId: manager.id,
        actorName: manager.name,
        notes: null,
      },
    });

    // Transition history entry for non-PENDING permits
    if (p.status === PermitStatus.APPROVED) {
      await prisma.permitStatusHistory.create({
        data: {
          permitId: created.id,
          status: PermitStatus.APPROVED,
          event: 'APPROVED',
          actorId: manager.id,
          actorName: manager.name,
          notes: 'Approved after review.',
        },
      });
    } else if (p.status === PermitStatus.REJECTED) {
      await prisma.permitStatusHistory.create({
        data: {
          permitId: created.id,
          status: PermitStatus.REJECTED,
          event: 'REJECTED',
          actorId: manager.id,
          actorName: manager.name,
          notes: p.rejectionReason ?? null,
        },
      });
    } else if (p.status === PermitStatus.REVOKED) {
      await prisma.permitStatusHistory.create({
        data: {
          permitId: created.id,
          status: PermitStatus.APPROVED,
          event: 'APPROVED',
          actorId: manager.id,
          actorName: manager.name,
          notes: 'Initially approved.',
        },
      });
      await prisma.permitStatusHistory.create({
        data: {
          permitId: created.id,
          status: PermitStatus.REVOKED,
          event: 'REVOKED',
          actorId: manager.id,
          actorName: manager.name,
          notes: p.revocationReason ?? null,
        },
      });
    }

    console.log(`Created permit: "${p.title}" [${p.status}]`);
  }

  console.log(`\nSeed complete: 1 user + ${permits.length} permits created.`);
  console.log('Login: manager@permit2.dev / demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Also install `bcryptjs` types if not present — check if `@types/bcryptjs` needs to be added. Run:
```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2 && npm install --save-dev @types/bcryptjs 2>/dev/null || true
```
  </action>
  <verify>
```bash
# Verify seed file exists with correct user credentials
grep -n 'manager@permit2.dev' /root/pivota-workspaces/dhruvi/Permit2/permit2/prisma/seed.ts && echo "EMAIL_OK"
grep -n 'demo1234' /root/pivota-workspaces/dhruvi/Permit2/permit2/prisma/seed.ts && echo "PASS_OK"
grep -n 'Alex Manager' /root/pivota-workspaces/dhruvi/Permit2/permit2/prisma/seed.ts && echo "NAME_OK"

# Verify all 4 statuses are represented
grep -c 'PermitStatus.PENDING\|PENDING,' /root/pivota-workspaces/dhruvi/Permit2/permit2/prisma/seed.ts || true
grep -c 'PermitStatus.APPROVED\|APPROVED,' /root/pivota-workspaces/dhruvi/Permit2/permit2/prisma/seed.ts || true
grep -c 'PermitStatus.REJECTED\|REJECTED,' /root/pivota-workspaces/dhruvi/Permit2/permit2/prisma/seed.ts || true
grep -c 'PermitStatus.REVOKED\|REVOKED,' /root/pivota-workspaces/dhruvi/Permit2/permit2/prisma/seed.ts || true

# Verify all 5 permit types present
grep -n 'PermitType.WORK\|PermitType.ACCESS\|PermitType.ACTIVITY\|PermitType.SAFETY\|PermitType.OTHER' /root/pivota-workspaces/dhruvi/Permit2/permit2/prisma/seed.ts | wc -l

# Confirm prisma package.json seed config
grep -n 'prisma db seed\|ts-node' /root/pivota-workspaces/dhruvi/Permit2/permit2/package.json && echo "SEED_CONFIG_OK"
```
  </verify>
  <done>
- `prisma/seed.ts` exists and contains `manager@permit2.dev` / `demo1234` / `Alex Manager`
- Exactly 15 permit objects defined across PENDING (4), APPROVED (4), REJECTED (4), REVOKED (3)
- All 5 PermitType values used at least once
- Every permit has at least one PermitStatusHistory CREATED entry; non-PENDING permits have transition entries
- `package.json` has `"prisma": { "seed": "ts-node ..." }` config block
- Script is idempotent (skips if 15+ permits already exist)
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| env→schema | DATABASE_URL from environment crosses into Prisma datasource config |
| seed→db | Seed script writes directly to PostgreSQL using elevated credentials |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-01-01 | Information disclosure | `.env.example` | mitigate | `.env.example` contains only placeholder values, never real secrets. Real `.env` must be git-ignored. Executor MUST verify `.gitignore` in `permit2/` includes `.env` (add if missing). |
| T-01-02 | Tampering | `prisma/seed.ts` — bcrypt hash | mitigate | `bcrypt.hash('demo1234', 10)` with cost factor 10 in `prisma/seed.ts`. The plaintext password `demo1234` is demo-only; `passwordHash` stored column never exposed in API responses (enforced by Wave 2 API layer). |
| T-01-03 | Elevation of privilege | `lib/db.ts` — PrismaClient singleton | mitigate | PrismaClient singleton in `lib/db.ts` uses `global` guard to prevent multiple connection pool creation during dev hot-reload. Production singleton reuse controlled by `NODE_ENV !== 'production'` guard. |
| T-01-04 | Denial of service | `prisma/seed.ts` — idempotency | mitigate | Seed script checks `prisma.permit.count() >= 15` before inserting; safe to re-run without duplicating 15×N records on repeated `prisma db seed` invocations. |
</threat_model>

<verification>
Run these checks after all tasks complete to confirm Wave 1 is green:

```bash
cd /root/pivota-workspaces/dhruvi/Permit2/permit2

# 1. Schema validates
npx prisma validate && echo "PRISMA_VALIDATE_OK"

# 2. All three models present
grep -n 'model User\b' prisma/schema.prisma && echo "USER_OK"
grep -n 'model Permit\b' prisma/schema.prisma && echo "PERMIT_OK"
grep -n 'model PermitStatusHistory\b' prisma/schema.prisma && echo "HISTORY_OK"

# 3. Both enums present
grep -n 'enum PermitStatus' prisma/schema.prisma && echo "STATUS_ENUM_OK"
grep -n 'enum PermitType' prisma/schema.prisma && echo "TYPE_ENUM_OK"

# 4. Prisma client singleton exports correctly
grep -n 'export const prisma' lib/db.ts && echo "SINGLETON_OK"

# 5. Seed has correct credentials
grep -n 'manager@permit2.dev' prisma/seed.ts && echo "SEED_EMAIL_OK"

# 6. .env.example has required vars
grep -n 'DATABASE_URL' .env.example && grep -n 'JWT_SECRET' .env.example && echo "ENV_EXAMPLE_OK"

# 7. package.json has db scripts
grep -n '"db:migrate"' package.json && grep -n '"db:seed"' package.json && echo "SCRIPTS_OK"

# 8. .gitignore includes .env
grep -n '\.env$\|^\.env' .gitignore 2>/dev/null && echo "GITIGNORE_OK" || echo "WARNING: add .env to .gitignore"
```

If DATABASE_URL is set in the environment, also run:
```bash
npx prisma migrate dev --name init && echo "MIGRATE_OK"
npx prisma db seed && echo "SEED_OK"
```
</verification>

<success_criteria>
- [ ] `npx prisma validate` exits 0 — schema is syntactically correct
- [ ] `prisma/schema.prisma` contains User, Permit, PermitStatusHistory models verbatim from TechArch
- [ ] Both enums (PermitStatus, PermitType) defined with all values
- [ ] All Prisma indexes defined per TechArch DDL (status, type, createdAt, updatedAt, startDate, createdBy, status+type composite, permitId, history createdAt)
- [ ] `lib/db.ts` exports `prisma` singleton with global hot-reload guard
- [ ] `.env.example` documents DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_COST_FACTOR, PORT, NODE_ENV
- [ ] `package.json` includes db:migrate, db:push, db:seed, db:studio scripts
- [ ] `package.json` has `prisma.seed` config pointing to `prisma/seed.ts` via ts-node
- [ ] `prisma/seed.ts` creates manager@permit2.dev / demo1234 via bcrypt upsert
- [ ] `prisma/seed.ts` creates exactly 15 permits: 4 PENDING, 4 APPROVED, 4 REJECTED, 3 REVOKED
- [ ] All 5 PermitType values (WORK, ACCESS, ACTIVITY, SAFETY, OTHER) used in seed
- [ ] Each permit has CREATED history entry; non-PENDING permits have transition entries
- [ ] Seed is idempotent (safe to re-run)
- [ ] `.env` is git-ignored
</success_criteria>

<output>
After completion, create `.planning/express/build-the-full-permit2-permit-management/01-SUMMARY.md` documenting:
- What was created (schema, db.ts, seed, .env.example, package.json scripts)
- Prisma schema models and their field names (exact — Wave 2 needs these for Prisma queries)
- Seed credentials: manager@permit2.dev / demo1234
- Note on ts-node setup for seed execution
- Any deviations from TechArch spec
</output>
