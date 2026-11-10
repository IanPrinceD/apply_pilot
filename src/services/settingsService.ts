// src\services\settingsService.ts
import { INDEED_SITE_VALUES, type IndeedSite } from '@/constants/indeed';
import type { Settings } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { DEFAULT_SETTINGS, filtersSchema, type SettingsDto, type SettingsInput } from '@/types/settings';
import { isRunDue } from '@/utils/schedule';

const SETTINGS_ID = 1;

/** Narrows the stored site string to a known site, defaulting to "us". */
const toIndeedSite = (value: string): IndeedSite =>
  (INDEED_SITE_VALUES as readonly string[]).includes(value) ? (value as IndeedSite) : 'us';

/** Maps a Settings row to the API shape, falling back to defaults for malformed filter JSON. */
const toDto = (row: Settings): SettingsDto => {
  const filters = filtersSchema.safeParse(row.filters);
  return {
    filters: filters.success ? filters.data : DEFAULT_SETTINGS.filters,
    dailyCap: row.dailyCap,
    mode: row.mode,
    threshold: row.threshold,
    indeedSite: toIndeedSite(row.indeedSite),
    scheduleEnabled: row.scheduleEnabled,
    scheduleTime: row.scheduleTime,
    lastScheduledRunAt: row.lastScheduledRunAt?.toISOString() ?? null,
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

/** Replaces the user-editable settings with validated input. */
export const updateSettings = async (input: SettingsInput): Promise<SettingsDto> => {
  const row = await prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    update: input,
    create: { id: SETTINGS_ID, ...input },
  });
  return toDto(row);
};

/** True when the daily search is enabled and today's run is due. */
export const isScheduledRunDue = async (now: Date = new Date()): Promise<boolean> => {
  const settings = await getSettings();
  if (!settings.scheduleEnabled) return false;
  const lastRun = settings.lastScheduledRunAt ? new Date(settings.lastScheduledRunAt) : null;
  return isRunDue(settings.scheduleTime, lastRun, now);
};

/** Records that today's scheduled run was queued. */
export const markScheduledRun = async (now: Date = new Date()): Promise<void> => {
  await prisma.settings.update({ where: { id: SETTINGS_ID }, data: { lastScheduledRunAt: now } });
};
