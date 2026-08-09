import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getStats } from '@/lib/permit-service';
import { ok, unauthorized, serverError } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const stats = await getStats();
    return ok(stats);
  } catch (err: unknown) {
    const appErr = err as { status?: number; code?: string; message?: string };
    if (appErr.status === 401) return unauthorized(appErr.code ?? 'AUTH_UNAUTHORIZED', appErr.message ?? 'Authentication required.');
    console.error('[GET /api/permits/stats]', err);
    return serverError();
  }
}
