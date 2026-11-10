// src\types\worker.ts
import type { WorkerDisplayState } from '@/constants/taskStatus';

export interface WorkerStatusDto {
  state: WorkerDisplayState;
  loggedIn: boolean;
  currentTaskId: string | null;
  message: string | null;
  /** ISO time of the last heartbeat, or null if the worker never ran. */
  heartbeatAt: string | null;
}
