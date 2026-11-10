// src\app\api\worker\status\route.ts
import { connection, NextResponse } from 'next/server';
import { getWorkerStatus } from '@/services/workerStateService';
import { handleRouteError } from '@/utils/routeError';

/** Returns the worker's live status (OFFLINE if not running). */
export const GET = async () => {
  await connection();
  try {
    return NextResponse.json(await getWorkerStatus());
  } catch (err) {
    return handleRouteError(err);
  }
};
