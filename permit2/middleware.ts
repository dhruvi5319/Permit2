import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Edge-runtime-compatible JWT verification using jose (Web Crypto API)
// lib/auth.ts still uses jsonwebtoken for API routes (Node.js runtime only)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'change-me-in-production-must-be-at-least-32-chars'
);

async function verifyTokenEdge(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET, { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (isPublic(pathname)) {
    // If already authenticated and visiting /login → redirect to /dashboard
    if (pathname === '/login') {
      const cookieToken = request.cookies.get('token')?.value;
      if (cookieToken && (await verifyTokenEdge(cookieToken))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
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

  const valid = await verifyTokenEdge(token);
  if (!valid) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          data: null,
          error: { code: 'AUTH_UNAUTHORIZED', message: 'Authentication required.' },
          meta: {},
        },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes EXCEPT Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
