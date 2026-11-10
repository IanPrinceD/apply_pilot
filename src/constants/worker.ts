// src\constants\worker.ts
// Worker limits and pacing. Shared by the worker, services and the Jobs page.

/** Result pages read per role keyword. */
export const MAX_PAGES_PER_KEYWORD = 3;
/** Role keywords searched per run (the first N in Settings). */
export const MAX_KEYWORDS_PER_RUN = 5;
/** Job pages opened per run to read full descriptions (new jobs only). */
export const MAX_DESCRIPTIONS_PER_RUN = 15;

/** Random delay ranges in ms — keeps pacing human-like. */
export const DELAY_BETWEEN_PAGES_MS = { min: 2000, max: 6000 } as const;
export const DELAY_BETWEEN_JOBS_MS = { min: 4000, max: 10000 } as const;
export const DELAY_BETWEEN_KEYWORDS_MS = { min: 5000, max: 12000 } as const;

/** Worker loop timing. */
export const WORKER_POLL_MS = 3000;
export const HEARTBEAT_INTERVAL_MS = 5000;
/** No heartbeat for this long → shown as Offline. */
export const HEARTBEAT_STALE_MS = 15000;
/** How long to wait for the user to clear a CAPTCHA / verification page. */
export const NEEDS_USER_TIMEOUT_MS = 10 * 60 * 1000;
/** How often to re-check login / block state while waiting on the user. */
export const USER_WAIT_POLL_MS = 4000;

export const TASK_TYPES = {
  SEARCH_JOBS: 'SEARCH_JOBS',
} as const;

export type TaskType = (typeof TASK_TYPES)[keyof typeof TASK_TYPES];

export const TASK_SOURCES = ['manual', 'schedule'] as const;
export type TaskSource = (typeof TASK_SOURCES)[number];
