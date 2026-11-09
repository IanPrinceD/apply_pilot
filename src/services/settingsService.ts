// src\services\settingsService.ts
import type { Settings } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SETTINGS, filtersSchema, type SettingsDto, type SettingsInput } from '@/types/settings';

const SETTINGS_ID = 1;

/** Maps a Settings row to the API shape, falling back to defaults for malformed filter JSON. */
const toDto = (row: Settings): SettingsDto => {
  const filters = filtersSchema.safeParse(row.filters);
  return {
    filters: filters.success ? filters.data : DEFAULT_SETTINGS.filters,
    dailyCap: row.dailyCap,
    mode: row.mode,
    threshold: row.threshold,
    updatedAt: row.updatedAt.toISOString(),
  };
};

/** Returns the singleton settings row, creating it with defaults on first run. */
export const getSettings = async (): Promise<SettingsDto> => {
  const row = await prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID, ...DEFAULT_SETTINGS },
  });
  return toDto(row);
};

/** Replaces the singleton settings with validated input. */
export const updateSettings = async (input: SettingsInput): Promise<SettingsDto> => {
  const row = await prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    update: input,
    create: { id: SETTINGS_ID, ...input },
  });
  return toDto(row);
};
