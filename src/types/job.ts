// src\types\job.ts
import { z } from 'zod';

/** One job card as read from a search results page (validated before saving). */
export const scrapedListingSchema = z.object({
  externalId: z.string().trim().min(1),
  url: z.url(),
  title: z.string().trim().min(1),
  company: z.string().trim().min(1),
  location: z.string().trim().nullable(),
  salary: z.string().trim().nullable(),
  postedText: z.string().trim().nullable(),
  easyApply: z.boolean(),
});

export type ScrapedListing = z.infer<typeof scrapedListingSchema>;

export interface UpsertResult {
  found: number;
  new: number;
  /** IDs of jobs inserted by this call. */
  newJobIds: string[];
}

export interface JobDto {
  id: string;
  site: string;
  externalId: string;
  url: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  postedText: string | null;
  easyApply: boolean;
  searchKeyword: string | null;
  hasDescription: boolean;
  score: number | null;
  firstSeenAt: string;
  lastSeenAt: string;
}

export const jobListQuerySchema = z.object({
  easyApply: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  search: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(200),
});

export type JobListQuery = z.infer<typeof jobListQuerySchema>;
