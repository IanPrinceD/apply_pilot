// src\constants\indeed.ts
// Indeed country sites. Shared by Settings (dropdown) and the worker (base URL).

export const INDEED_SITE_VALUES = ['us', 'ph', 'uk', 'ca', 'au', 'nz', 'in', 'sg', 'my', 'ae', 'ie'] as const;

export type IndeedSite = (typeof INDEED_SITE_VALUES)[number];

export interface IndeedSiteInfo {
  label: string;
  baseUrl: string;
}

export const INDEED_SITES: Record<IndeedSite, IndeedSiteInfo> = {
  us: { label: 'United States (indeed.com)', baseUrl: 'https://www.indeed.com' },
  ph: { label: 'Philippines (ph.indeed.com)', baseUrl: 'https://ph.indeed.com' },
  uk: { label: 'United Kingdom (uk.indeed.com)', baseUrl: 'https://uk.indeed.com' },
  ca: { label: 'Canada (ca.indeed.com)', baseUrl: 'https://ca.indeed.com' },
  au: { label: 'Australia (au.indeed.com)', baseUrl: 'https://au.indeed.com' },
  nz: { label: 'New Zealand (nz.indeed.com)', baseUrl: 'https://nz.indeed.com' },
  in: { label: 'India (in.indeed.com)', baseUrl: 'https://in.indeed.com' },
  sg: { label: 'Singapore (sg.indeed.com)', baseUrl: 'https://sg.indeed.com' },
  my: { label: 'Malaysia (malaysia.indeed.com)', baseUrl: 'https://malaysia.indeed.com' },
  ae: { label: 'United Arab Emirates (ae.indeed.com)', baseUrl: 'https://ae.indeed.com' },
  ie: { label: 'Ireland (ie.indeed.com)', baseUrl: 'https://ie.indeed.com' },
};

export const INDEED_SITE_OPTIONS = INDEED_SITE_VALUES.map((value) => ({ value, label: INDEED_SITES[value].label }));

/** `Job.site` value for a country, e.g. "indeed:ph". */
export const indeedJobSite = (site: IndeedSite): string => `indeed:${site}`;
