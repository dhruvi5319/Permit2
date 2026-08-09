import { NextRequest } from 'next/server';
import { ok, serverError } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Require auth so the middleware hasn't already rejected (belt-and-suspenders)
    await requireAuth(request).catch(() => null);

    const response = ok({ message: 'Logged out successfully' });
    // Clear the httpOnly cookie by setting maxAge=0
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('[POST /api/auth/logout]', err);
    return serverError();
  }
}
