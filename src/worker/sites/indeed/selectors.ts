// src\worker\sites\indeed\selectors.ts
// Every Indeed selector lives here. When Indeed changes its markup, this is the only file to fix.
// PROVISIONAL: verify against snapshots from `npm run worker:snapshot` (Phase 2, step 3 checkpoint).
import type { Locator, Page } from 'playwright';

export const INDEED_SELECTORS = {
  // ── Login state (header) ──────────────────────────────────────────
  /** Visible when signed out. */
  signInLink: (page: Page): Locator => page.getByRole('link', { name: /^sign in$/i }),
  /** Visible when signed in (account / profile menu in the header). */
  accountMenu: (page: Page): Locator =>
    page
      .locator('[data-gnav-element-name="AccountMenu"], #AccountMenu, [data-testid="gnav-AccountMenu"]')
      .or(page.getByRole('button', { name: /account|profile/i })),

  // ── Block / verification detection ────────────────────────────────
  challengeFrames:
    'iframe[src*="hcaptcha"], iframe[src*="recaptcha"], iframe[src*="turnstile"], iframe[src*="challenges.cloudflare.com"], iframe[title*="challenge" i]',
  blockTitlePatterns: [/just a moment/i, /security check/i, /attention required/i, /access denied/i],
  blockTextPatterns: [
    /verify you are human/i,
    /additional verification required/i,
    /unusual (activity|traffic)/i,
    /complete the security check/i,
  ],
  blockUrlPatterns: [/\/captcha/i, /challenges\.cloudflare\.com/i, /\/checkpoint/i],

  // ── Search results ────────────────────────────────────────────────
  /** One element per job card, carrying the job key in data-jk. */
  jobCard: '[data-jk]',
  cardTitle: 'h2.jobTitle span[title], h2.jobTitle a span, h2 a span, [id^="jobTitle-"]',
  cardCompany: '[data-testid="company-name"], .companyName',
  cardLocation: '[data-testid="text-location"], .companyLocation',
  cardSalary: '[data-testid="attribute_snippet_testid"], .salary-snippet-container, .metadata.salary-snippet-container',
  cardPosted: '[data-testid="myJobsStateDate"], span.date',
  cardEasyApply: '[data-testid="indeedApply"], .iaLabel, .ialbl',
  easyApplyText: /easily apply/i,
  /** Results page has no cards and shows this. */
  noResultsText: /did not match any jobs|no jobs found/i,
  nextPage: (page: Page): Locator =>
    page.locator('a[data-testid="pagination-page-next"]').or(page.getByRole('link', { name: /^next( page)?$/i })),

  // ── Job page ──────────────────────────────────────────────────────
  description: '#jobDescriptionText, [data-testid="jobsearch-JobComponent-description"]',
} as const;
