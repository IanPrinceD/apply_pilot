// src\worker\errors.ts
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { Page } from 'playwright';
import { log } from '@/worker/log';

export const ERRORS_DIR = resolve('data/errors');
export const SNAPSHOTS_DIR = resolve('data/snapshots');

/** The page needs a human (CAPTCHA, verification, unknown state). The task pauses instead of failing. */
export class NeedsUserError extends Error {
  constructor(
    message: string,
    readonly screenshotPath: string | null,
  ) {
    super(message);
    this.name = 'NeedsUserError';
  }
}

/** The user cancelled the task from the dashboard. */
export class TaskCancelledError extends Error {
  constructor() {
    super('Task cancelled');
    this.name = 'TaskCancelledError';
  }
}

/** Filesystem-safe timestamp, e.g. 2026-11-10T14-03-22. */
const fileStamp = (): string => new Date().toISOString().slice(0, 19).replace(/:/g, '-');

/** Saves a full-page screenshot to data/errors/; returns the path, or null if it failed. */
export const saveScreenshot = async (page: Page, label: string): Promise<string | null> => {
  try {
    await mkdir(ERRORS_DIR, { recursive: true });
    const path = join(ERRORS_DIR, `${fileStamp()}-${label}.png`);
    await page.screenshot({ path, fullPage: true });
    return path;
  } catch (err) {
    log.warn('Could not save screenshot:', (err as Error).message);
    return null;
  }
};

/** Saves the page HTML + screenshot to data/snapshots/ (debugging selectors). */
export const saveSnapshot = async (page: Page, label: string): Promise<string> => {
  await mkdir(SNAPSHOTS_DIR, { recursive: true });
  const base = join(SNAPSHOTS_DIR, `${fileStamp()}-${label}`);
  await writeFile(`${base}.html`, await page.content(), 'utf8');
  await page.screenshot({ path: `${base}.png`, fullPage: true });
  return base;
};
