// src\worker\runTask.ts
import { TASK_TYPES } from '@/constants/worker';
import { failTask } from '@/services/taskService';
import type { TaskDto } from '@/types/task';
import { NeedsUserError, saveScreenshot, TaskCancelledError } from '@/worker/errors';
import { log } from '@/worker/log';
import { setWorkerState } from '@/worker/state';
import { searchJobs, type TaskContext } from '@/worker/tasks/searchJobs';

/** Runs one claimed task and records how it ended. Never throws. */
export const runTask = async (task: TaskDto, ctx: TaskContext): Promise<void> => {
  log.info(`Task ${task.id} (${task.type}, ${task.source}) started`);
  await setWorkerState({ state: 'SEARCHING', currentTaskId: task.id, message: 'Searching…' });
  try {
    if (task.type === TASK_TYPES.SEARCH_JOBS) await searchJobs(task, ctx);
    else await failTask(task.id, `Unknown task type: ${task.type}`);
  } catch (err) {
    if (err instanceof TaskCancelledError) {
      log.info(`Task ${task.id} cancelled by user`);
    } else if (err instanceof NeedsUserError) {
      log.warn(`Task ${task.id} stopped: ${err.message}`);
      await failTask(task.id, err.message, err.screenshotPath);
    } else {
      const message = err instanceof Error ? err.message : String(err);
      log.error(`Task ${task.id} failed:`, message);
      const screenshot = await saveScreenshot(ctx.session.page, `failed-${task.id}`);
      await failTask(task.id, message, screenshot);
    }
  } finally {
    await setWorkerState({ state: 'IDLE', currentTaskId: null, message: 'Idle' }).catch(() => undefined);
  }
};
