// src\app\api\tasks\search\route.ts
import { NextResponse } from 'next/server';
import { enqueueSearch } from '@/services/taskService';
import { handleRouteError } from '@/utils/routeError';

/** Queues a manual job search for the worker. */
export const POST = async () => {
  try {
    return NextResponse.json(await enqueueSearch('manual'), { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
};
