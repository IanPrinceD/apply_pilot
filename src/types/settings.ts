// src\types\settings.ts
import { z } from 'zod';
import {
  DATE_POSTED_VALUES,
  DEFAULT_DAILY_CAP,
  DEFAULT_THRESHOLD,
  JOB_TYPE_VALUES,
  MAX_DAILY_CAP,
  RUN_MODE_VALUES,
  SALARY_PERIOD_VALUES,
  WORK_SETUP_VALUES,
} from '@/constants/settings';
import { INDEED_SITE_VALUES } from '@/constants/indeed';

export const filtersSchema = z.object({
  roleKeywords: z.array(z.string().trim().min(1)).default([]),
  techStack: z.array(z.string().trim().min(1)).default([]),
  workSetup: z.array(z.enum(WORK_SETUP_VALUES)).default(['remote']),
  location: z.string().trim().default(''),
  salaryMin: z.number().int().nonnegative().nullable().default(null),
  salaryCurrency: z.string().trim().min(1).max(5).default('USD'),
  salaryPeriod: z.enum(SALARY_PERIOD_VALUES).default('year'),
  jobType: z.array(z.enum(JOB_TYPE_VALUES)).default(['fulltime']),
  datePosted: z.enum(DATE_POSTED_VALUES).default('7'),
});

export const settingsSchema = z.object({
  filters: filtersSchema,
  dailyCap: z.number().int().min(1).max(MAX_DAILY_CAP).default(DEFAULT_DAILY_CAP),
  mode: z.enum(RUN_MODE_VALUES).default('REVIEW'),
  threshold: z.number().int().min(0).max(100).default(DEFAULT_THRESHOLD),
  indeedSite: z.enum(INDEED_SITE_VALUES).default('us'),
  scheduleEnabled: z.boolean().default(false),
  scheduleTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a time like 09:00')
    .default('09:00'),
});

export type Filters = z.infer<typeof filtersSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;

export interface SettingsDto extends SettingsInput {
  lastScheduledRunAt: string | null;
  updatedAt: string;
}

export const DEFAULT_SETTINGS: SettingsInput = settingsSchema.parse({ filters: {} });
