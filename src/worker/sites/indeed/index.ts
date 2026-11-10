// src\worker\sites\indeed\index.ts
import type { Locator, Page } from 'playwright';
import { INDEED_SITES, type IndeedSite, indeedJobSite } from '@/constants/indeed';
import { type ScrapedListing, scrapedListingSchema } from '@/types/job';
import { log } from '@/worker/log';
import { INDEED_SELECTORS as SEL } from '@/worker/sites/indeed/selectors';
import { buildIndeedJobUrl, buildIndeedSearchUrl } from '@/worker/sites/indeed/searchUrl';
import type { BlockCheck, LoginState, SiteAdapter } from '@/worker/sites/types';

/** True if the locator's first match is visible (false on any error). */
const visible = async (locator: Locator): Promise<boolean> => locator.first().isVisible().catch(() => false);

/** Trimmed text of the first match inside `root`, or null. */
const textOf = async (root: Locator, selector: string): Promise<string | null> => {
  const el = root.locator(selector).first();
  if ((await el.count()) === 0) return null;
  const text = (await el.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
  return text || null;
};

/** Indeed adapter for one country site. */
export const createIndeedAdapter = (site: IndeedSite): SiteAdapter => {
  const { baseUrl } = INDEED_SITES[site];

  /** Header shows an account menu when signed in, a Sign in link when not. */
  const checkLogin = async (page: Page): Promise<LoginState> => {
    if (await visible(SEL.accountMenu(page))) return 'in';
    if (await visible(SEL.signInLink(page))) return 'out';
    return 'unknown';
  };

  /** Looks for CAPTCHA frames, challenge URLs/titles and verification text. */
  const detectBlock = async (page: Page): Promise<BlockCheck> => {
    const url = page.url();
    if (SEL.blockUrlPatterns.some((p) => p.test(url))) return { blocked: true, reason: 'Verification page' };
    const title = await page.title().catch(() => '');
    if (SEL.blockTitlePatterns.some((p) => p.test(title))) return { blocked: true, reason: `Page title: "${title}"` };
    if ((await page.locator(SEL.challengeFrames).count()) > 0) return { blocked: true, reason: 'CAPTCHA challenge' };
    const body = await page
      .locator('body')
      .innerText()
      .catch(() => '');
    const match = SEL.blockTextPatterns.find((p) => p.test(body.slice(0, 5000)));
    if (match) return { blocked: true, reason: 'Verification required' };
    return { blocked: false };
  };

  /** Reads every job card on the current results page; invalid cards are skipped and logged. */
  const parseListings = async (page: Page): Promise<ScrapedListing[]> => {
    const cards = page.locator(SEL.jobCard);
    const count = await cards.count();
    const listings: ScrapedListing[] = [];

    for (let i = 0; i < count; i += 1) {
      const card = cards.nth(i);
      const externalId = await card.getAttribute('data-jk');
      if (!externalId) continue;
      const cardText = await card.innerText().catch(() => '');
      const candidate = {
        externalId,
        url: buildIndeedJobUrl(baseUrl, externalId),
        title: await textOf(card, SEL.cardTitle),
        company: await textOf(card, SEL.cardCompany),
        location: await textOf(card, SEL.cardLocation),
        salary: await textOf(card, SEL.cardSalary),
        postedText: await textOf(card, SEL.cardPosted),
        easyApply: (await card.locator(SEL.cardEasyApply).count()) > 0 || SEL.easyApplyText.test(cardText),
      };
      const parsed = scrapedListingSchema.safeParse(candidate);
      if (parsed.success) listings.push(parsed.data);
      else log.warn(`Skipped card ${externalId}: ${parsed.error.issues.map((x) => x.path.join('.')).join(', ')}`);
    }

    // The same job can appear twice on a page (e.g. sponsored + organic).
    return [...new Map(listings.map((l) => [l.externalId, l])).values()];
  };

  /** True when the pagination "Next" link is visible. */
  const hasNextPage = async (page: Page): Promise<boolean> => visible(SEL.nextPage(page));

  /** Opens the job page and returns its description text. */
  const fetchDescription = async (page: Page, externalId: string): Promise<string | null> => {
    await page.goto(buildIndeedJobUrl(baseUrl, externalId), { waitUntil: 'domcontentloaded' });
    const el = page.locator(SEL.description).first();
    await el.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    if ((await el.count()) === 0) return null;
    const text = (await el.innerText().catch(() => '')).trim();
    return text || null;
  };

  /** Waits up to 15s for the first job card. */
  const waitForResults = async (page: Page): Promise<void> => {
    await page.locator(SEL.jobCard).first().waitFor({ timeout: 15000 }).catch(() => undefined);
  };

  /** Checks the page text for Indeed's "no jobs matched" message. */
  const isEmptyResults = async (page: Page): Promise<boolean> => {
    const body = await page
      .locator('body')
      .innerText()
      .catch(() => '');
    return SEL.noResultsText.test(body);
  };

  return {
    jobSite: indeedJobSite(site),
    baseUrl,
    checkLogin,
    detectBlock,
    buildSearchUrl: (query) => buildIndeedSearchUrl(baseUrl, query),
    waitForResults,
    isEmptyResults,
    parseListings,
    hasNextPage,
    fetchDescription,
  };
};
