// src\utils\routeError.ts
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/** Turns expected service/validation errors into JSON responses; rethrows anything unexpected. */
export const handleRouteError = (err: unknown): NextResponse => {
  if (err instanceof ZodError) {
    return NextResponse.json({ error: 'Invalid input', issues: err.issues }, { status: 400 });
  }
  const status = (err as { status?: number }).status;
  if (status && err instanceof Error) return NextResponse.json({ error: err.message }, { status });
  throw err;
};
