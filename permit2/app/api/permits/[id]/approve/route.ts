import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { approvePermit } from '@/lib/permit-service';
import { approveSchema } from '@/lib/validations/permit.schema';
import { ok, badRequest, unauthorized, notFound, serverError } from '@/lib/utils/api-response';
import { NotFoundError, InvalidTransitionError } from '@/lib/utils/errors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAuth(request);
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const parsed = approveSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('VALIDATION_ERROR', 'Invalid request body.');
    }

    const permit = await approvePermit(id, actor, parsed.data.notes);
    return ok(permit);
  } catch (err: unknown) {
    if (err instanceof InvalidTransitionError) return badRequest(err.code, err.message);
    if (err instanceof NotFoundError) return notFound(err.message);
    const appErr = err as { status?: number; code?: string; message?: string };
    if (appErr.status === 401) return unauthorized(appErr.code ?? 'AUTH_UNAUTHORIZED', appErr.message ?? 'Authentication required.');
    console.error('[PATCH /api/permits/[id]/approve]', err);
    return serverError();
  }
}
