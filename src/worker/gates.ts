// src\worker\gates.ts
// "Hand control to the user" checkpoints: login and CAPTCHA/verification. Never solves or bypasses anything.
import { NEEDS_USER_TIMEOUT_MS, USER_WAIT_POLL_MS } from '@/constants/worker';
import { isTaskCancelled, markNeedsUser, resumeTask } from '@/services/taskService';
import type { BrowserSession } from '@/worker/browser';
import { NeedsUserError, saveScreenshot, TaskCancelledError } from '@/worker/errors';
import { log } from '@/worker/log';
import { sleep } from '@/worker/pacing';
import type { SiteAdapter } from '@/worker/sites/types';
import { setWorkerState } from '@/worker/state';

interface GateOptions {
  /** Task being paused, if any (its status flips to NEEDS_USER while waiting). */
  taskId?: string;
  /** Give up after this long. Defaults to NEEDS_USER_TIMEOUT_MS. */
  timeoutMs?: number;
  /** Stops waiting when this returns true (e.g. worker shutting down). */
  isStopping?: () => boolean;
}

/** Polls `done` until it returns true, the timeout passes, the task is cancelled, or the worker stops. */
const waitUntil = async (done: () => Promise<boolean>, { taskId, timeoutMs, isStopping }: GateOptions): Promise<boolean> => {
  const deadline = Date.now() + (timeoutMs ?? NEEDS_USER_TIMEOUT_MS);
  while (Date.now() < deadline) {
    if (isStopping?.()) return false;
    if (taskId && (await isTaskCancelled(taskId))) throw new TaskCancelledError();
    if (await done()) return true;
    await sleep(USER_WAIT_POLL_MS);
  }
  return false;
};

/** Makes sure the user is signed in; if not, asks them to log in in the browser window and waits. */
export const ensureLoggedIn = async (session: BrowserSession, adapter: SiteAdapter, opts: GateOptions = {}): Promise<void> => {
  const { page } = session;
  if (!page.url().startsWith(adapter.baseUrl)) {
    await page.goto(adapter.baseUrl, { waitUntil: 'domcontentloaded' });
  }
  if ((await adapter.checkLogin(page)) === 'in') {
    await setWorkerState({ loggedIn: true });
    return;
  }

  const message = `Log in to Indeed in the browser window (${adapter.baseUrl}). ApplyPilot never sees your password.`;
  log.info(message);
  await setWorkerState({ state: 'NEEDS_LOGIN', loggedIn: false, message });
  if (opts.taskId) await markNeedsUser(opts.taskId, message, null);

  const ok = await waitUntil(async () => (await adapter.checkLogin(page)) === 'in', opts);
  if (!ok) {
    if (opts.isStopping?.()) return;
    throw new NeedsUserError('Timed out waiting for you to log in to Indeed.', null);
  }

  log.info('Logged in to Indeed.');
  await setWorkerState({ state: opts.taskId ? 'SEARCHING' : 'IDLE', loggedIn: true, message: 'Logged in' });
  if (opts.taskId) await resumeTask(opts.taskId);
};

/** Pauses on CAPTCHA / verification pages: screenshot, NEEDS_USER, wait for the user to clear it. */
export const ensureNotBlocked = async (session: BrowserSession, adapter: SiteAdapter, opts: GateOptions = {}): Promise<void> => {
  const { page } = session;
  const check = await adapter.detectBlock(page);
  if (!check.blocked) return;

  const screenshot = await saveScreenshot(page, `blocked${opts.taskId ? `-${opts.taskId}` : ''}`);
  const message = `Indeed is asking for verification (${check.reason}). Please complete it in the browser window — ApplyPilot will continue on its own.`;
  log.warn(message, screenshot ? `Screenshot: ${screenshot}` : '');
  await setWorkerState({ state: 'NEEDS_USER', message });
  if (opts.taskId) await markNeedsUser(opts.taskId, message, screenshot);

  const cleared = await waitUntil(async () => !(await adapter.detectBlock(page)).blocked, opts);
  if (!cleared) throw new NeedsUserError('Verification was not completed in time.', screenshot);

  log.info('Verification cleared, resuming.');
  await setWorkerState({ state: 'SEARCHING', message: 'Resumed' });
  if (opts.taskId) await resumeTask(opts.taskId);
};
