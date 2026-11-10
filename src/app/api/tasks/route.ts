// src\app\api\tasks\route.ts
import { connection, NextResponse } from 'next/server';
import { z } from 'zod';
import { listRecentTasks } from '@/services/taskService';
import { handleRouteError } from '@/utils/routeError';

const querySchema = z.object({ limit: z.coerce.number().int().min(1).max(50).default(10) });

/** Lists recent worker tasks, newest first. */
export const GET = async (req: Request) => {
  await connection();
  try {
    const { limit } = querySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
    return NextResponse.json(await listRecentTasks(limit));
  } catch (err) {
    return handleRouteError(err);
  }
};
