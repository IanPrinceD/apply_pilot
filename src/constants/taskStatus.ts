// src\constants\taskStatus.ts
import type { StatusColor } from '@/constants/applicationStatus';
import type { TaskStatus, WorkerStateValue } from '@/generated/prisma/enums';

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

/** Worker state as shown on the dashboard; OFFLINE is derived from a stale heartbeat. */
export type WorkerDisplayState = WorkerStateValue | 'OFFLINE';

export const WORKER_STATE_META: Record<WorkerDisplayState, StatusLabel> = {
  OFFLINE: { label: 'Offline', color: 'default' },
  IDLE: { label: 'Idle', color: 'success' },
  SEARCHING: { label: 'Searching', color: 'info' },
  NEEDS_LOGIN: { label: 'Needs login', color: 'warning' },
  NEEDS_USER: { label: 'Needs you', color: 'warning' },
};

/** Statuses where a task is still in progress. */
export const ACTIVE_TASK_STATUSES: TaskStatus[] = ['PENDING', 'RUNNING', 'NEEDS_USER'];
