// src\services\workerStateService.ts
import { HEARTBEAT_STALE_MS } from '@/constants/worker';
import type { WorkerStateValue } from '@/generated/prisma/enums';
import { prisma } from '@/lib/prisma';
import type { WorkerStatusDto } from '@/types/worker';

const WORKER_ID = 1;

export interface WorkerStatePatch {
  state?: WorkerStateValue;
  loggedIn?: boolean;
  currentTaskId?: string | null;
  message?: string | null;
}

/** Records a heartbeat (and optional state change) from the worker. */
export const heartbeat = async (patch: WorkerStatePatch = {}): Promise<void> => {
  const now = new Date();
  await prisma.workerState.upsert({
    where: { id: WORKER_ID },
    update: { ...patch, heartbeatAt: now },
    create: { id: WORKER_ID, ...patch, heartbeatAt: now },
  });
};

/** Worker status for the dashboard; OFFLINE when the heartbeat is stale or missing. */
export const getWorkerStatus = async (now: Date = new Date()): Promise<WorkerStatusDto> => {
  const row = await prisma.workerState.findUnique({ where: { id: WORKER_ID } });
  if (!row) return { state: 'OFFLINE', loggedIn: false, currentTaskId: null, message: null, heartbeatAt: null };

  const stale = now.getTime() - row.heartbeatAt.getTime() > HEARTBEAT_STALE_MS;
  return {
    state: stale ? 'OFFLINE' : row.state,
    loggedIn: row.loggedIn,
    currentTaskId: stale ? null : row.currentTaskId,
    message: stale ? null : row.message,
    heartbeatAt: row.heartbeatAt.toISOString(),
  };
};
