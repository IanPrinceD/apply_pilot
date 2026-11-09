// src\app\api\resume\route.ts
import { connection, NextResponse } from 'next/server';
import { z } from 'zod';
import { getMasterResume, saveMasterResume } from '@/services/resumeService';
import { masterResumeSchema } from '@/types/resume';
import { handleRouteError } from '@/utils/routeError';

const saveSchema = z.object({
  data: masterResumeSchema,
  sourceFileName: z.string().nullable().default(null),
});

/** Returns the master resume (or null). */
export const GET = async () => {
  await connection();
  try {
    return NextResponse.json(await getMasterResume());
  } catch (err) {
    return handleRouteError(err);
  }
};

/** Saves the master resume. */
export const PUT = async (req: Request) => {
  try {
    const { data, sourceFileName } = saveSchema.parse(await req.json());
    return NextResponse.json(await saveMasterResume(data, sourceFileName));
  } catch (err) {
    return handleRouteError(err);
  }
};
