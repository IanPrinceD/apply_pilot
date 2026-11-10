// src\worker\browser.ts
import { resolve } from 'node:path';
import { type BrowserContext, chromium, type Page } from 'playwright';
import { log } from '@/worker/log';

/** Persistent profile: cookies/session survive restarts, so you only log in once. */
export const PROFILE_DIR = resolve('data/browser-profile');

export interface BrowserSession {
  context: BrowserContext;
  page: Page;
}

/** Opens a visible browser with the persistent profile — installed Chrome first, bundled Chromium as fallback. */
export const openBrowser = async (): Promise<BrowserSession> => {
  const options = { headless: false, viewport: null } as const;
  let context: BrowserContext;
  try {
    context = await chromium.launchPersistentContext(PROFILE_DIR, { ...options, channel: 'chrome' });
    log.info('Browser: using installed Google Chrome');
  } catch (err) {
    log.warn('Chrome not available, falling back to bundled Chromium:', (err as Error).message.split('\n')[0]);
    context = await chromium.launchPersistentContext(PROFILE_DIR, options);
  }
  const page = context.pages()[0] ?? (await context.newPage());
  return { context, page };
};
