// src\types\task.ts
import { z } from 'zod';
import { TASK_SOURCES } from '@/constants/worker';
import type { TaskStatus } from '@/generated/prisma/enums';

export const searchTaskPayloadSchema = z.object({
  source: z.enum(TASK_SOURCES).default('manual'),
});

export type SearchTaskPayload = z.infer<typeof searchTaskPayloadSchema>;

export const searchProgressSchema = z.object({
  keyword: z.string().nullable().default(null),
  keywordsDone: z.number().int().default(0),
  keywordsTotal: z.number().int().default(0),
  pages: z.number().int().default(0),
  found: z.number().int().default(0),
  new: z.number().int().default(0),
  descriptions: z.number().int().default(0),
});

export type SearchProgress = z.infer<typeof searchProgressSchema>;

export const EMPTY_PROGRESS: SearchProgress = searchProgressSchema.parse({});

export interface TaskDto {
  id: string;
  type: string;
  status: TaskStatus;
  source: SearchTaskPayload['source'];
  progress: SearchProgress;
  message: string | null;
  error: string | null;
  screenshotPath: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}
