import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { AppError } from './utils/errors';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export function signToken(payload: { sub: string; email: string; name: string }): string {
  if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set.');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError('AUTH_TOKEN_EXPIRED', 'Your session has expired. Please log in again.', 401);
    }
    throw new AppError('AUTH_UNAUTHORIZED', 'Authentication required.', 401);
  }
}

/**
 * Extract and verify the JWT from the Authorization header or the `token` cookie.
 * Throws AppError (401) if missing or invalid.
 */
export async function requireAuth(request: NextRequest): Promise<JwtPayload> {
  // 1. Try Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    return verifyToken(token);
  }
  // 2. Fallback: httpOnly cookie named `token`
  const cookieToken = request.cookies.get('token')?.value;
  if (cookieToken) {
    return verifyToken(cookieToken);
  }
  throw new AppError('AUTH_UNAUTHORIZED', 'Authentication required.', 401);
}
