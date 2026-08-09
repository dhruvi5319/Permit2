import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths — skip auth
  if (pathname === '/api/auth/login') {
    return NextResponse.next();
  }

  // Verify token for all other /api routes
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('token')?.value;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : cookieToken;

  if (!token) {
    return NextResponse.json(
      { data: null, error: { code: 'AUTH_UNAUTHORIZED', message: 'Authentication required.' }, meta: {} },
      { status: 401 }
    );
  }

  try {
    verifyToken(token);
    return NextResponse.next();
  } catch (err: unknown) {
    const appErr = err as { code?: string; message?: string };
    return NextResponse.json(
      {
        data: null,
        error: {
          code:    appErr.code    ?? 'AUTH_UNAUTHORIZED',
          message: appErr.message ?? 'Authentication required.',
        },
        meta: {},
      },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
