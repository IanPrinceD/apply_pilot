// src\constants\taskStatus.ts
import type { StatusColor } from '@/constants/applicationStatus';
import type { TaskStatus } from '@/generated/prisma/enums';

export const TASK_TYPES = {
  SEARCH_JOBS: 'SEARCH_JOBS',
} as const;

export type TaskType = (typeof TASK_TYPES)[keyof typeof TASK_TYPES];

/** What queued a task: the user ("Search now") or the daily schedule. */
export const TASK_SOURCES = ['manual', 'schedule'] as const;
export type TaskSource = (typeof TASK_SOURCES)[number];

export interface StatusLabel {
  label: string;
  color: StatusColor;
}

export const TASK_STATUS_META: Record<TaskStatus, StatusLabel> = {
  PENDING: { label: 'Queued', color: 'default' },
  RUNNING: { label: 'Running', color: 'info' },
  NEEDS_USER: { label: 'Needs you', color: 'warning' },
  DONE: { label: 'Done', color: 'success' },
  FAILED: { label: 'Failed', color: 'error' },
  CANCELLED: { label: 'Cancelled', color: 'secondary' },
};

/** Statuses where a task is still in progress. */
export const ACTIVE_TASK_STATUSES: TaskStatus[] = ['PENDING', 'RUNNING', 'NEEDS_USER'];
