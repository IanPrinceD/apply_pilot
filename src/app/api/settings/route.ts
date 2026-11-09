// src\app\api\settings\route.ts
import { connection, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/services/settingsService';
import { settingsSchema } from '@/types/settings';
import { handleRouteError } from '@/utils/routeError';

/** Returns the current settings. */
export const GET = async () => {
  // Sync SQLite reads don't stop prerendering under Cache Components — opt into request time.
  await connection();
  try {
    return NextResponse.json(await getSettings());
  } catch (err) {
    return handleRouteError(err);
  }
};

/** Replaces the settings. */
export const PUT = async (req: Request) => {
  try {
    const input = settingsSchema.parse(await req.json());
    return NextResponse.json(await updateSettings(input));
  } catch (err) {
    return handleRouteError(err);
  }
};
