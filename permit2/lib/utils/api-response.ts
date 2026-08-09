import { NextResponse } from 'next/server';

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function ok<T>(data: T, meta: object = {}): NextResponse {
  return NextResponse.json({ data, error: null, meta }, { status: 200 });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json({ data, error: null, meta: {} }, { status: 201 });
}

export function badRequest(
  code: string,
  message: string,
  details?: Array<{ field: string; message: string }>
): NextResponse {
  const error: ApiError = { code, message, ...(details ? { details } : {}) };
  return NextResponse.json({ data: null, error, meta: {} }, { status: 400 });
}

export function unauthorized(code: string, message: string): NextResponse {
  return NextResponse.json({ data: null, error: { code, message }, meta: {} }, { status: 401 });
}

export function notFound(message: string): NextResponse {
  return NextResponse.json(
    { data: null, error: { code: 'PERMIT_NOT_FOUND', message }, meta: {} },
    { status: 404 }
  );
}

export function serverError(message = 'An unexpected error occurred. Please try again.'): NextResponse {
  return NextResponse.json(
    { data: null, error: { code: 'SERVER_ERROR', message }, meta: {} },
    { status: 500 }
  );
}
