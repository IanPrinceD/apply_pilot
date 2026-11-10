// src\worker\snapshot.ts
// Debug helper: `npm run worker:snapshot -- "customer service"`.
// Saves HTML + screenshots of the Indeed home, one search page and one job page to data/snapshots/,
// and prints what the current selectors can read. Stop `npm run worker` first (they share the browser profile).
import { getSettings } from '@/services/settingsService';
import { openBrowser } from '@/worker/browser';
import { saveSnapshot } from '@/worker/errors';
import { log } from '@/worker/log';
import { humanScroll, sleep } from '@/worker/pacing';
import { createIndeedAdapter } from '@/worker/sites/indeed';

/** Captures snapshots and logs a parse summary. */
const main = async (): Promise<void> => {
  const settings = await getSettings();
  const keyword = process.argv[2] ?? settings.filters.roleKeywords[0] ?? 'customer service';
  const adapter = createIndeedAdapter(settings.indeedSite);

  let session;
  try {
    session = await openBrowser();
  } catch (err) {
    log.error('Could not open the browser. Is `npm run worker` still running? Stop it first.', (err as Error).message);
    process.exit(1);
  }
  const { page, context } = session;

  try {
    await page.goto(adapter.baseUrl, { waitUntil: 'domcontentloaded' });
    await sleep(3000);
    log.info('Login state:', await adapter.checkLogin(page), '| block check:', JSON.stringify(await adapter.detectBlock(page)));
    log.info('Saved:', await saveSnapshot(page, 'home'));

    const url = adapter.buildSearchUrl({ keyword, filters: settings.filters, pageIndex: 0 });
    log.info('Search URL:', url);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await sleep(4000);
    await humanScroll(page);
    log.info('Saved:', await saveSnapshot(page, 'search'));

    const listings = await adapter.parseListings(page);
    log.info(`Parsed ${listings.length} job card(s). Next page link: ${await adapter.hasNextPage(page)}`);
    for (const l of listings.slice(0, 5)) log.info('  •', JSON.stringify(l));

    if (listings[0]) {
      await sleep(3000);
      const description = await adapter.fetchDescription(page, listings[0].externalId);
      log.info(`Description for ${listings[0].externalId}: ${description ? `${description.length} chars` : 'NOT FOUND'}`);
      log.info('Saved:', await saveSnapshot(page, 'job'));
    }
  } finally {
    await context.close();
  }
};

main().catch((err) => {
  log.error('Snapshot failed:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
