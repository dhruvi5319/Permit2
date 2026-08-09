import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { ok, unauthorized, serverError } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return unauthorized('AUTH_UNAUTHORIZED', 'User not found.');
    }

    return ok({ id: user.id, email: user.email, name: user.name });
  } catch (err: unknown) {
    const appErr = err as { code?: string; message?: string; status?: number };
    if (appErr.status === 401) {
      return unauthorized(appErr.code ?? 'AUTH_UNAUTHORIZED', appErr.message ?? 'Authentication required.');
    }
    console.error('[GET /api/auth/me]', err);
    return serverError();
  }
}
