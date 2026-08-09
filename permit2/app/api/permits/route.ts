import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { listPermits, createPermit } from '@/lib/permit-service';
import { listQuerySchema, createPermitSchema } from '@/lib/validations/permit.schema';
import { ok, created, badRequest, unauthorized, serverError } from '@/lib/utils/api-response';
import type { PaginationMeta } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = request.nextUrl;
    const rawQuery = Object.fromEntries(searchParams.entries());

    const parsed = listQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      // Silently fall back to defaults per FRD validation rules
      const withDefaults = listQuerySchema.parse({});
      const result = await listPermits(withDefaults);
      const meta: PaginationMeta = {
        total: result.total,
        page: withDefaults.page,
        limit: withDefaults.limit,
        totalPages: Math.ceil(result.total / withDefaults.limit),
      };
      return ok({ items: result.items }, meta);
    }

    const query = parsed.data;
    const result = await listPermits(query);
    const meta: PaginationMeta = {
      total: result.total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(result.total / query.limit),
    };
    return ok({ items: result.items }, meta);
  } catch (err: unknown) {
    const appErr = err as { status?: number; code?: string; message?: string };
    if (appErr.status === 401) return unauthorized(appErr.code ?? 'AUTH_UNAUTHORIZED', appErr.message ?? 'Authentication required.');
    console.error('[GET /api/permits]', err);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAuth(request);

    const body = await request.json().catch(() => ({}));
    const parsed = createPermitSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((e) => ({ field: e.path.join('.'), message: e.message }));
      return badRequest('VALIDATION_ERROR', details[0]?.message ?? 'Validation error.', details);
    }

    const permit = await createPermit(parsed.data, actor.sub, actor.name);
    return created(permit);
  } catch (err: unknown) {
    const appErr = err as { status?: number; code?: string; message?: string };
    if (appErr.status === 401) return unauthorized(appErr.code ?? 'AUTH_UNAUTHORIZED', appErr.message ?? 'Authentication required.');
    console.error('[POST /api/permits]', err);
    return serverError();
  }
}
