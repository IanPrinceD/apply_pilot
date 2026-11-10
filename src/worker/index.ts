// src\worker\index.ts
// ApplyPilot worker: `npm run worker`. Keeps a visible browser open, polls the Task table, runs searches.
import type { IndeedSite } from '@/constants/indeed';
import { HEARTBEAT_INTERVAL_MS, WORKER_POLL_MS } from '@/constants/worker';
import { getSettings, isScheduledRunDue, markScheduledRun } from '@/services/settingsService';
import { claimNextTask, enqueueSearch, failStaleTasks } from '@/services/taskService';
import { type BrowserSession, openBrowser } from '@/worker/browser';
import { ensureLoggedIn } from '@/worker/gates';
import { log } from '@/worker/log';
import { sleep } from '@/worker/pacing';
import { runTask } from '@/worker/runTask';
import { createIndeedAdapter } from '@/worker/sites/indeed';
import type { SiteAdapter } from '@/worker/sites/types';
import { beat, setWorkerState } from '@/worker/state';

let stopping = false;
let session: BrowserSession | null = null;

/** Queues the daily search when it's due (no-op if a search is already queued/running). */
const queueScheduledSearch = async (): Promise<void> => {
  if (!(await isScheduledRunDue())) return;
  try {
    await enqueueSearch('schedule');
    log.info('Daily search queued.');
  } catch (err) {
    if ((err as { status?: number }).status !== 409) throw err;
  }
  await markScheduledRun();
};

/** Closes the browser and exits. */
const shutdown = async (reason: string): Promise<void> => {
  if (stopping) return;
  stopping = true;
  log.info(`Stopping worker (${reason})…`);
  await setWorkerState({ state: 'IDLE', currentTaskId: null, message: 'Stopped' }).catch(() => undefined);
  await session?.context.close().catch(() => undefined);
  process.exit(0);
};

/** Worker entry point. */
const main = async (): Promise<void> => {
  log.info('ApplyPilot worker starting…');
  const stale = await failStaleTasks();
  if (stale) log.warn(`Marked ${stale} unfinished task(s) from a previous run as failed.`);

  await setWorkerState({ state: 'IDLE', currentTaskId: null, message: 'Opening browser…' });
  setInterval(() => void beat().catch((err) => log.warn('Heartbeat failed:', (err as Error).message)), HEARTBEAT_INTERVAL_MS);

  session = await openBrowser();
  session.context.on('close', () => void shutdown('browser window closed'));

  let site: IndeedSite = (await getSettings()).indeedSite;
  let adapter: SiteAdapter = createIndeedAdapter(site);
  const isStopping = () => stopping;

  await ensureLoggedIn(session, adapter, { timeoutMs: Number.POSITIVE_INFINITY, isStopping });
  await setWorkerState({ state: 'IDLE', message: 'Idle — waiting for a search' });
  log.info('Ready. Waiting for searches from the dashboard (Ctrl+C to stop).');

  while (!stopping) {
    try {
      const settings = await getSettings();
      if (settings.indeedSite !== site) {
        site = settings.indeedSite;
        adapter = createIndeedAdapter(site);
        log.info(`Indeed site changed to ${adapter.baseUrl}`);
        await ensureLoggedIn(session, adapter, { timeoutMs: Number.POSITIVE_INFINITY, isStopping });
        await setWorkerState({ state: 'IDLE', message: 'Idle — waiting for a search' });
      }

      await queueScheduledSearch();

      const task = await claimNextTask();
      if (task) await runTask(task, { session, adapter, isStopping });
      else await sleep(WORKER_POLL_MS);
    } catch (err) {
      log.error('Worker loop error:', err instanceof Error ? err.message : err);
      await sleep(WORKER_POLL_MS * 3);
    }
  }
};

process.on('SIGINT', () => void shutdown('Ctrl+C'));
process.on('SIGTERM', () => void shutdown('terminated'));

main().catch(async (err) => {
  log.error('Worker crashed:', err instanceof Error ? err.stack : err);
  await shutdown('crash');
});
