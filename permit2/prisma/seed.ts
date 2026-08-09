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
