// src\worker\sites\types.ts
import type { Page } from 'playwright';
import type { ScrapedListing } from '@/types/job';
import type { Filters } from '@/types/settings';

export type LoginState = 'in' | 'out' | 'unknown';

export interface BlockCheck {
  blocked: boolean;
  /** Why the page looks blocked, shown to the user. */
  reason?: string;
}

export interface SearchQuery {
  keyword: string;
  filters: Filters;
  /** 0-based results page. */
  pageIndex: number;
}

/** One job site. Add a new site by implementing this — the worker loop doesn't change. */
export interface SiteAdapter {
  /** Value stored in `Job.site`, e.g. "indeed:ph". */
  readonly jobSite: string;
  readonly baseUrl: string;
  /** Reads the current page to tell whether the user is signed in. Never types credentials. */
  checkLogin: (page: Page) => Promise<LoginState>;
  /** Detects CAPTCHA / verification / challenge pages. */
  detectBlock: (page: Page) => Promise<BlockCheck>;
  buildSearchUrl: (query: SearchQuery) => string;
  /** Waits until result cards (or a "no results" message) have rendered. */
  waitForResults: (page: Page) => Promise<void>;
  /** True if the results page explicitly says there are no matching jobs. */
  isEmptyResults: (page: Page) => Promise<boolean>;
  /** Parses job cards on the current results page. */
  parseListings: (page: Page) => Promise<ScrapedListing[]>;
  /** True if the current results page has a next page. */
  hasNextPage: (page: Page) => Promise<boolean>;
  /** Opens a job and returns its description text (null if not found). */
  fetchDescription: (page: Page, externalId: string) => Promise<string | null>;
}
