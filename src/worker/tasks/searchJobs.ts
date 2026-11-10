// src\worker\tasks\searchJobs.ts
import {
  DELAY_BETWEEN_JOBS_MS,
  DELAY_BETWEEN_KEYWORDS_MS,
  DELAY_BETWEEN_PAGES_MS,
  MAX_DESCRIPTIONS_PER_RUN,
  MAX_KEYWORDS_PER_RUN,
  MAX_PAGES_PER_KEYWORD,
} from '@/constants/worker';
import { jobsNeedingDescription, saveDescription, upsertListings } from '@/services/jobService';
import { getSettings } from '@/services/settingsService';
import { completeTask, failTask, isTaskCancelled, updateProgress } from '@/services/taskService';
import { EMPTY_PROGRESS, type SearchProgress, type TaskDto } from '@/types/task';
import type { BrowserSession } from '@/worker/browser';
import { saveSnapshot, TaskCancelledError } from '@/worker/errors';
import { ensureLoggedIn, ensureNotBlocked } from '@/worker/gates';
import { log } from '@/worker/log';
import { humanScroll, randomDelay } from '@/worker/pacing';
import type { SiteAdapter } from '@/worker/sites/types';

export interface TaskContext {
  session: BrowserSession;
  adapter: SiteAdapter;
  isStopping: () => boolean;
}

/** Throws if the user cancelled the task. */
const throwIfCancelled = async (taskId: string): Promise<void> => {
  if (await isTaskCancelled(taskId)) throw new TaskCancelledError();
};

/** Read-only search: each role keyword × up to N pages → save listings → fetch descriptions for new jobs. */
export const searchJobs = async (task: TaskDto, { session, adapter, isStopping }: TaskContext): Promise<void> => {
  const { page } = session;
  const settings = await getSettings();
  const keywords = settings.filters.roleKeywords.slice(0, MAX_KEYWORDS_PER_RUN);
  if (keywords.length === 0) {
    await failTask(task.id, 'Add at least one role keyword in Settings first.');
    return;
  }

  const gate = { taskId: task.id, isStopping };
  const progress: SearchProgress = { ...EMPTY_PROGRESS, keywordsTotal: keywords.length };
  /** Writes progress + a status line for the Jobs page. */
  const report = (message: string) => updateProgress(task.id, progress, message);
  const warnings: string[] = [];

  await ensureLoggedIn(session, adapter, gate);

  for (const keyword of keywords) {
    progress.keyword = keyword;
    for (let pageIndex = 0; pageIndex < MAX_PAGES_PER_KEYWORD; pageIndex += 1) {
      await throwIfCancelled(task.id);
      if (isStopping()) return;
      await report(`Searching "${keyword}" — page ${pageIndex + 1}`);

      await page.goto(adapter.buildSearchUrl({ keyword, filters: settings.filters, pageIndex }), {
        waitUntil: 'domcontentloaded',
      });
      await ensureNotBlocked(session, adapter, gate);
      await adapter.waitForResults(page);
      await humanScroll(page);

      const listings = await adapter.parseListings(page);
      if (listings.length === 0) {
        if (pageIndex === 0 && !(await adapter.isEmptyResults(page))) {
          // Unknown page layout — keep evidence so selectors can be fixed, but don't loop on it.
          const base = await saveSnapshot(page, `no-cards-${task.id}`).catch(() => null);
          const note = `No job cards found for "${keyword}" — the page layout may have changed${base ? ` (snapshot: ${base}.html)` : ''}.`;
          log.warn(note);
          warnings.push(note);
        }
        break;
      }

      const result = await upsertListings(adapter.jobSite, keyword, listings);
      progress.pages += 1;
      progress.found += result.found;
      progress.new += result.new;
      log.info(`"${keyword}" p${pageIndex + 1}: ${result.found} jobs, ${result.new} new`);
      await report(`"${keyword}" page ${pageIndex + 1}: ${result.found} jobs (${result.new} new)`);

      if (!(await adapter.hasNextPage(page))) break;
      await randomDelay(DELAY_BETWEEN_PAGES_MS);
    }
    progress.keywordsDone += 1;
    if (progress.keywordsDone < keywords.length) await randomDelay(DELAY_BETWEEN_KEYWORDS_MS);
  }

  progress.keyword = null;
  const pending = await jobsNeedingDescription(adapter.jobSite, MAX_DESCRIPTIONS_PER_RUN);
  for (const job of pending) {
    await throwIfCancelled(task.id);
    if (isStopping()) return;
    await report(`Reading job descriptions (${progress.descriptions + 1}/${pending.length})`);
    const description = await adapter.fetchDescription(page, job.externalId);
    await ensureNotBlocked(session, adapter, gate);
    if (description) {
      await saveDescription(job.id, description);
      progress.descriptions += 1;
    } else {
      log.warn(`No description found for ${job.externalId} (${job.title})`);
    }
    await randomDelay(DELAY_BETWEEN_JOBS_MS);
  }

  const summary = `Found ${progress.found} jobs (${progress.new} new) across ${progress.pages} page(s); read ${progress.descriptions} description(s).`;
  await updateProgress(task.id, progress);
  await completeTask(task.id, warnings.length ? `${summary} ${warnings.join(' ')}` : summary);
  log.info(summary);
};
