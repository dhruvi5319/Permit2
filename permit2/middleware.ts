import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// Routes that do NOT require authentication
const PUBLIC_PATHS = new Set(['/login', '/api/auth/login']);

// Routes that are always public even as prefixes
function isPublic(pathname: string): boolean {
  return (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/auth/login')
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (isPublic(pathname)) {
    // If already authenticated and visiting /login → redirect to /dashboard
    if (pathname === '/login') {
      const cookieToken = request.cookies.get('token')?.value;
      if (cookieToken) {
        try {
          verifyToken(cookieToken);
          return NextResponse.redirect(new URL('/dashboard', request.url));
        } catch {
          // Token invalid — let login page render
        }
      }
    }
    return NextResponse.next();
  }

  // Verify token for all other paths (page routes + /api/* except /api/auth/login)
  const cookieToken = request.cookies.get('token')?.value;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = bearerToken ?? cookieToken;

  if (!token) {
    // API routes → 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { data: null, error: { code: 'AUTH_UNAUTHORIZED', message: 'Authentication required.' }, meta: {} },
        { status: 401 }
      );
    }
    // Page routes → redirect to /login with ?redirect= param
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  try {
    verifyToken(token);
    return NextResponse.next();
  } catch (err: unknown) {
    const appErr = err as { code?: string; message?: string };
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          data: null,
          error: { code: appErr.code ?? 'AUTH_UNAUTHORIZED', message: appErr.message ?? 'Authentication required.' },
          meta: {},
        },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    // Match all routes EXCEPT Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
