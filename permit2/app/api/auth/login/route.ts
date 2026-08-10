import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations/auth.schema';
import { ok, badRequest, unauthorized, serverError } from '@/lib/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Zod validation
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return badRequest('VALIDATION_ERROR', 'Email and password are required.', details);
    }

    const { email, password } = parsed.data;

    // Look up user — unified error message (never reveal which field is wrong)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return unauthorized('AUTH_INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return unauthorized('AUTH_INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    // Sign JWT
    const token = signToken({ sub: user.id, email: user.email, name: user.name });

    // Set httpOnly cookie (24h) + return token in body
    const isLocalhost = request.headers.get('host')?.includes('localhost') || request.headers.get('host')?.includes('127.0.0.1');
    const secureCookie = process.env.NODE_ENV === 'production' && !isLocalhost;

    const response = ok({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return serverError();
  }
}
