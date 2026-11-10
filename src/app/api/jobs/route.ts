// src\app\api\jobs\route.ts
import { connection, NextResponse } from 'next/server';
import { listJobs } from '@/services/jobService';
import { jobListQuerySchema } from '@/types/job';
import { handleRouteError } from '@/utils/routeError';

/** Lists saved jobs (optional `easyApply`, `search`, `limit` query params). */
export const GET = async (req: Request) => {
  await connection();
  try {
    const query = jobListQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
    return NextResponse.json(await listJobs(query));
  } catch (err) {
    return handleRouteError(err);
  }
};
