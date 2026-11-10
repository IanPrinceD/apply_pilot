// src\worker\sites\indeed\searchUrl.ts
// Pure: builds an Indeed search URL from saved filters.
import type { SearchQuery } from '@/worker/sites/types';

/** Indeed shows 10–15 cards per page; `start` advances by 10. */
const RESULTS_PER_PAGE = 10;

/** Indeed "remote" / "hybrid" attribute filters (sc param). */
const WORK_SETUP_ATTR = {
  remote: '0kf:attr(DSQF7);',
  hybrid: '0kf:attr(PAXZC);',
} as const;

/**
 * Builds `${baseUrl}/jobs?q=…&l=…&fromage=…&jt=…&sc=…&start=…`.
 * - Job type / work setup are only sent when exactly one is selected (Indeed takes a single value);
 *   otherwise results are filtered later during scoring.
 * - Salary isn't sent: Indeed's salary filter differs per country. It's applied at scoring time (Phase 3).
 */
export const buildIndeedSearchUrl = (baseUrl: string, { keyword, filters, pageIndex }: SearchQuery): string => {
  const params = new URLSearchParams();
  params.set('q', keyword);

  const remoteOnly = filters.workSetup.length === 1 && filters.workSetup[0] === 'remote';
  if (filters.location) params.set('l', filters.location);
  else if (remoteOnly) params.set('l', 'Remote');

  if (filters.datePosted !== 'any') params.set('fromage', filters.datePosted);
  if (filters.jobType.length === 1) params.set('jt', filters.jobType[0]);

  if (filters.workSetup.length === 1) {
    const setup = filters.workSetup[0];
    if (setup === 'remote' || setup === 'hybrid') params.set('sc', WORK_SETUP_ATTR[setup]);
  }

  if (pageIndex > 0) params.set('start', String(pageIndex * RESULTS_PER_PAGE));
  return `${baseUrl}/jobs?${params.toString()}`;
};

/** Direct job page URL for a job key. */
export const buildIndeedJobUrl = (baseUrl: string, jobKey: string): string =>
  `${baseUrl}/viewjob?jk=${encodeURIComponent(jobKey)}`;
