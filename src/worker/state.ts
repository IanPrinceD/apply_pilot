// src\worker\state.ts
// In-memory copy of the worker's status; every change (and every heartbeat) is written to the DB.
import { heartbeat, type WorkerStatePatch } from '@/services/workerStateService';

let current: Required<WorkerStatePatch> = {
  state: 'IDLE',
  loggedIn: false,
  currentTaskId: null,
  message: 'Starting…',
};

/** Updates the worker status and writes it immediately. */
export const setWorkerState = async (patch: WorkerStatePatch): Promise<void> => {
  current = { ...current, ...patch };
  await heartbeat(current);
};

/** Re-sends the current status so the dashboard knows the worker is alive. */
export const beat = (): Promise<void> => heartbeat(current);
