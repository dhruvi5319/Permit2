import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPermit } from '@/lib/permit-service';
import { ok, unauthorized, notFound, serverError } from '@/lib/utils/api-response';
import { NotFoundError } from '@/lib/utils/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const permit = await getPermit(id);
    return ok(permit);
  } catch (err: unknown) {
    if (err instanceof NotFoundError) return notFound(err.message);
    const appErr = err as { status?: number; code?: string; message?: string };
    if (appErr.status === 401) return unauthorized(appErr.code ?? 'AUTH_UNAUTHORIZED', appErr.message ?? 'Authentication required.');
    console.error('[GET /api/permits/[id]]', err);
    return serverError();
  }
}
