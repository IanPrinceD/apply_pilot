// src\app\api\tasks\[id]\cancel\route.ts
import { NextResponse } from 'next/server';
import { cancelTask } from '@/services/taskService';
import { handleRouteError } from '@/utils/routeError';

/** Cancels a queued or running task. */
export const POST = async (_req: Request, ctx: RouteContext<'/api/tasks/[id]/cancel'>) => {
  try {
    const { id } = await ctx.params;
    return NextResponse.json(await cancelTask(id));
  } catch (err) {
    return handleRouteError(err);
  }
};
