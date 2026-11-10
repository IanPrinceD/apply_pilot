// src\services\taskService.ts
import { ACTIVE_TASK_STATUSES } from '@/constants/taskStatus';
import { TASK_TYPES, type TaskSource } from '@/constants/worker';
import type { Task } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import {
  EMPTY_PROGRESS,
  type SearchProgress,
  searchProgressSchema,
  searchTaskPayloadSchema,
  type TaskDto,
} from '@/types/task';

/** Throws a service error carrying an HTTP status. */
const fail = (message: string, status: number): never => {
  throw Object.assign(new Error(message), { status });
};

/** Maps a Task row to the API shape (tolerates malformed JSON). */
const toDto = (row: Task): TaskDto => {
  const payload = searchTaskPayloadSchema.safeParse(row.payload);
  const progress = searchProgressSchema.safeParse(row.progress ?? {});
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    source: payload.success ? payload.data.source : 'manual',
    progress: progress.success ? progress.data : EMPTY_PROGRESS,
    message: row.message,
    error: row.error,
    screenshotPath: row.screenshotPath,
    createdAt: row.createdAt.toISOString(),
    startedAt: row.startedAt?.toISOString() ?? null,
    finishedAt: row.finishedAt?.toISOString() ?? null,
  };
};

/** Queues a job search; 409 if one is already queued or running. */
export const enqueueSearch = async (source: TaskSource): Promise<TaskDto> => {
  const active = await prisma.task.findFirst({
    where: { type: TASK_TYPES.SEARCH_JOBS, status: { in: ACTIVE_TASK_STATUSES } },
  });
  if (active) return fail('A search is already queued or running.', 409);

  const row = await prisma.task.create({
    data: {
      type: TASK_TYPES.SEARCH_JOBS,
      payload: { source },
      progress: EMPTY_PROGRESS,
      message: source === 'schedule' ? 'Queued by daily schedule' : 'Queued',
    },
  });
  return toDto(row);
};

/** Atomically takes the oldest pending task (PENDING → RUNNING). Returns null if none. */
export const claimNextTask = async (): Promise<TaskDto | null> => {
  const next = await prisma.task.findFirst({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' } });
  if (!next) return null;
  const { count } = await prisma.task.updateMany({
    where: { id: next.id, status: 'PENDING' },
    data: { status: 'RUNNING', startedAt: new Date(), message: 'Starting…' },
  });
  if (count === 0) return null;
  const row = await prisma.task.findUniqueOrThrow({ where: { id: next.id } });
  return toDto(row);
};

/** Updates live progress (ignored once the task is cancelled or finished). */
export const updateProgress = async (id: string, progress: SearchProgress, message?: string): Promise<void> => {
  await prisma.task.updateMany({
    where: { id, status: { in: ['RUNNING', 'NEEDS_USER'] } },
    data: { progress, ...(message ? { message } : {}) },
  });
};

/** Pauses a task waiting for the user (CAPTCHA, verification, login). */
export const markNeedsUser = async (id: string, message: string, screenshotPath: string | null): Promise<void> => {
  await prisma.task.updateMany({
    where: { id, status: 'RUNNING' },
    data: { status: 'NEEDS_USER', message, screenshotPath },
  });
};

/** Resumes a paused task after the user cleared the problem. */
export const resumeTask = async (id: string): Promise<void> => {
  await prisma.task.updateMany({
    where: { id, status: 'NEEDS_USER' },
    data: { status: 'RUNNING', message: 'Resumed' },
  });
};

/** Marks a running task done. */
export const completeTask = async (id: string, message: string): Promise<void> => {
  await prisma.task.updateMany({
    where: { id, status: { in: ['RUNNING', 'NEEDS_USER'] } },
    data: { status: 'DONE', message, finishedAt: new Date() },
  });
};

/** Marks a running task failed. */
export const failTask = async (id: string, error: string, screenshotPath?: string | null): Promise<void> => {
  await prisma.task.updateMany({
    where: { id, status: { in: ['PENDING', 'RUNNING', 'NEEDS_USER'] } },
    data: {
      status: 'FAILED',
      error,
      message: 'Failed',
      finishedAt: new Date(),
      ...(screenshotPath ? { screenshotPath } : {}),
    },
  });
};

/** Cancels a queued or running task; the worker stops at its next check. */
export const cancelTask = async (id: string): Promise<TaskDto> => {
  const row = await prisma.task.findUnique({ where: { id } });
  if (!row) return fail(`Task ${id} not found`, 404);
  if (!ACTIVE_TASK_STATUSES.includes(row.status)) return fail('This task already finished.', 409);
  const updated = await prisma.task.update({
    where: { id },
    data: { status: 'CANCELLED', message: 'Cancelled', finishedAt: new Date() },
  });
  return toDto(updated);
};

/** True if the user cancelled this task. */
export const isTaskCancelled = async (id: string): Promise<boolean> => {
  const row = await prisma.task.findUnique({ where: { id }, select: { status: true } });
  return row?.status === 'CANCELLED';
};

/** Most recent tasks, newest first. */
export const listRecentTasks = async (limit = 10): Promise<TaskDto[]> => {
  const rows = await prisma.task.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
  return rows.map(toDto);
};

/** On worker start: tasks left running by a previous worker can't continue. */
export const failStaleTasks = async (): Promise<number> => {
  const { count } = await prisma.task.updateMany({
    where: { status: { in: ['RUNNING', 'NEEDS_USER'] } },
    data: { status: 'FAILED', error: 'Worker restarted before the task finished.', finishedAt: new Date() },
  });
  return count;
};
