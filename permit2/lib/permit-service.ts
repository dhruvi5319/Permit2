import { Prisma, PermitStatus, PermitType } from '@prisma/client';
import { prisma } from './db';
import { InvalidTransitionError, NotFoundError } from './utils/errors';
import type { CreatePermitInput, ListQueryInput } from './validations/permit.schema';
import type { JwtPayload } from './auth';

// ─── State Machine ─────────────────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<string, PermitStatus> = {
  'PENDING:approve':  PermitStatus.APPROVED,
  'PENDING:reject':   PermitStatus.REJECTED,
  'APPROVED:revoke':  PermitStatus.REVOKED,
};

export function validateTransition(
  current: PermitStatus,
  action: 'approve' | 'reject' | 'revoke'
): PermitStatus {
  const key = `${current}:${action}`;
  const next = VALID_TRANSITIONS[key];
  if (!next) throw new InvalidTransitionError(current, action);
  return next;
}

// ─── Type Helpers ──────────────────────────────────────────────────────────────

/** Shape of a permit summary object returned by the list endpoint */
function toSummary(p: {
  id: string; title: string; type: PermitType; applicantName: string;
  status: PermitStatus; startDate: Date; endDate: Date; createdAt: Date; updatedAt: Date;
}) {
  return {
    id: p.id,
    title: p.title,
    type: p.type,
    applicant_name: p.applicantName,
    status: p.status,
    start_date: p.startDate.toISOString().split('T')[0],
    end_date:   p.endDate.toISOString().split('T')[0],
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
  };
}

type PermitWithHistory = {
  id: string;
  title: string;
  type: PermitType;
  applicantName: string;
  status: PermitStatus;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  notes: string | null;
  rejectionReason: string | null;
  revocationReason: string | null;
  createdBy: string;
  statusHistory: Array<{
    id: string;
    status: PermitStatus;
    event: string;
    actorName: string;
    notes: string | null;
    createdAt: Date;
  }>;
};

/** Shape of a full permit object (with status_history) */
function toFull(p: PermitWithHistory) {
  return {
    ...toSummary(p),
    description: p.description,
    notes: p.notes,
    rejection_reason: p.rejectionReason,
    revocation_reason: p.revocationReason,
    created_by: p.createdBy,
    status_history: p.statusHistory.map((h) => ({
      id: h.id,
      status: h.status,
      event: h.event,
      actor_name: h.actorName,
      notes: h.notes,
      created_at: h.createdAt.toISOString(),
    })),
  };
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

export async function getStats() {
  const counts = await prisma.permit.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  const result = { total: 0, pending: 0, approved: 0, rejected: 0, revoked: 0 };
  for (const row of counts) {
    const n = row._count.id;
    result.total += n;
    if (row.status === PermitStatus.PENDING)  result.pending  = n;
    if (row.status === PermitStatus.APPROVED) result.approved = n;
    if (row.status === PermitStatus.REJECTED) result.rejected = n;
    if (row.status === PermitStatus.REVOKED)  result.revoked  = n;
  }
  return result;
}

// ─── List ──────────────────────────────────────────────────────────────────────

/** Prisma field name map for sort columns sent from the frontend */
const SORT_FIELD_MAP: Record<string, string> = {
  title: 'title', type: 'type', applicant_name: 'applicantName',
  status: 'status', start_date: 'startDate', end_date: 'endDate', created_at: 'createdAt',
};

export async function listPermits(query: ListQueryInput) {
  const { search, status, type, start_date_from, start_date_to, sort, order, page, limit } = query;

  const where: Prisma.PermitWhereInput = {};

  if (search?.trim()) {
    const term = search.trim();
    where.OR = [
      { title:         { contains: term, mode: 'insensitive' } },
      { applicantName: { contains: term, mode: 'insensitive' } },
      { description:   { contains: term, mode: 'insensitive' } },
    ];
  }
  if (status) where.status = status as PermitStatus;
  if (type)   where.type   = type   as PermitType;

  // Date range on start_date
  if (start_date_from || start_date_to) {
    where.startDate = {};
    if (start_date_from) (where.startDate as Prisma.DateTimeFilter).gte = new Date(start_date_from);
    if (start_date_to)   (where.startDate as Prisma.DateTimeFilter).lte = new Date(start_date_to);
  }

  const sortField = SORT_FIELD_MAP[sort] ?? 'createdAt';
  const orderBy = { [sortField]: order } as Prisma.PermitOrderByWithRelationInput;

  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.permit.findMany({ where, orderBy, skip, take: limit }),
    prisma.permit.count({ where }),
  ]);

  return { items: items.map(toSummary), total };
}

// ─── Create ────────────────────────────────────────────────────────────────────

export async function createPermit(data: CreatePermitInput, userId: string, actorName: string) {
  const permit = await prisma.permit.create({
    data: {
      title:         data.title,
      type:          data.type as PermitType,
      applicantName: data.applicant_name,
      description:   data.description,
      notes:         data.notes ?? null,
      status:        PermitStatus.PENDING,
      startDate:     new Date(data.start_date),
      endDate:       new Date(data.end_date),
      createdBy:     userId,
    },
  });

  // Write CREATED history entry
  await prisma.permitStatusHistory.create({
    data: {
      permitId:  permit.id,
      status:    PermitStatus.PENDING,
      event:     'CREATED',
      actorId:   userId,
      actorName: actorName,
      notes:     null,
    },
  });

  // Re-fetch with history to build full response
  const full = await prisma.permit.findUniqueOrThrow({
    where: { id: permit.id },
    include: { statusHistory: { orderBy: { createdAt: 'asc' } } },
  });
  return toFull(full);
}

// ─── Get One ───────────────────────────────────────────────────────────────────

export async function getPermit(id: string) {
  const permit = await prisma.permit.findUnique({
    where: { id },
    include: { statusHistory: { orderBy: { createdAt: 'asc' } } },
  });
  if (!permit) throw new NotFoundError('Permit');
  return toFull(permit);
}

// ─── Lifecycle Actions ─────────────────────────────────────────────────────────

async function executeTransition(
  id: string,
  actor: JwtPayload,
  action: 'approve' | 'reject' | 'revoke',
  extra?: { rejectionReason?: string; revocationReason?: string; notes?: string }
) {
  return prisma.$transaction(async (tx) => {
    const permit = await tx.permit.findUnique({ where: { id } });
    if (!permit) throw new NotFoundError('Permit');

    const newStatus = validateTransition(permit.status, action);

    const updated = await tx.permit.update({
      where: { id },
      data: {
        status: newStatus,
        ...(extra?.rejectionReason != null  ? { rejectionReason:  extra.rejectionReason }  : {}),
        ...(extra?.revocationReason != null ? { revocationReason: extra.revocationReason } : {}),
      },
      include: { statusHistory: { orderBy: { createdAt: 'asc' } } },
    });

    await tx.permitStatusHistory.create({
      data: {
        permitId:  id,
        status:    newStatus,
        event:     action.toUpperCase(),
        actorId:   actor.sub,
        actorName: actor.name,
        notes:     extra?.notes ?? extra?.rejectionReason ?? extra?.revocationReason ?? null,
      },
    });

    return updated;
  });
}

export async function approvePermit(id: string, actor: JwtPayload, notes?: string | null) {
  const updated = await executeTransition(id, actor, 'approve', { notes: notes ?? undefined });
  return toFull(updated);
}

export async function rejectPermit(id: string, actor: JwtPayload, reason?: string | null) {
  const updated = await executeTransition(id, actor, 'reject', { rejectionReason: reason ?? undefined, notes: reason ?? undefined });
  return toFull(updated);
}

export async function revokePermit(id: string, actor: JwtPayload, reason?: string | null) {
  const updated = await executeTransition(id, actor, 'revoke', { revocationReason: reason ?? undefined, notes: reason ?? undefined });
  return toFull(updated);
}
