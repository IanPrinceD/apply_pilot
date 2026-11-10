// src\services\jobService.ts
import type { Job, Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import type { JobDto, JobListQuery, ScrapedListing, UpsertResult } from '@/types/job';
import { jobDedupeHash } from '@/utils/jobHash';

/** Maps a Job row to the API shape. */
const toDto = (row: Job): JobDto => ({
  id: row.id,
  site: row.site,
  externalId: row.externalId,
  url: row.url,
  title: row.title,
  company: row.company,
  location: row.location,
  salary: row.salary,
  postedText: row.postedText,
  easyApply: row.easyApply,
  searchKeyword: row.searchKeyword,
  hasDescription: Boolean(row.descriptionFetchedAt),
  score: row.score,
  firstSeenAt: row.firstSeenAt.toISOString(),
  lastSeenAt: row.lastSeenAt.toISOString(),
});

/**
 * Saves listings with dedupe: first by (site, job key), then by company+title+location hash
 * (catches reposts with a new key). Known jobs only get `lastSeenAt` and listing fields refreshed.
 */
export const upsertListings = async (
  site: string,
  keyword: string,
  listings: ScrapedListing[],
): Promise<UpsertResult> => {
  const now = new Date();
  const newJobIds: string[] = [];

  await prisma.$transaction(async (tx) => {
    for (const listing of listings) {
      const dedupeHash = jobDedupeHash(listing.company, listing.title, listing.location);
      const refresh = {
        lastSeenAt: now,
        salary: listing.salary,
        postedText: listing.postedText,
        easyApply: listing.easyApply,
      };

      const byKey = await tx.job.findUnique({
        where: { site_externalId: { site, externalId: listing.externalId } },
        select: { id: true },
      });
      if (byKey) {
        await tx.job.update({ where: { id: byKey.id }, data: refresh });
        continue;
      }

      const byHash = await tx.job.findFirst({ where: { site, dedupeHash }, select: { id: true } });
      if (byHash) {
        await tx.job.update({ where: { id: byHash.id }, data: refresh });
        continue;
      }

      const created = await tx.job.create({
        data: {
          site,
          externalId: listing.externalId,
          dedupeHash,
          url: listing.url,
          title: listing.title,
          company: listing.company,
          location: listing.location,
          salary: listing.salary,
          postedText: listing.postedText,
          easyApply: listing.easyApply,
          searchKeyword: keyword,
          firstSeenAt: now,
          lastSeenAt: now,
        },
        select: { id: true },
      });
      newJobIds.push(created.id);
    }
  });

  return { found: listings.length, new: newJobIds.length, newJobIds };
};

/** Jobs on a site still missing a description — Easily apply first, newest first. */
export const jobsNeedingDescription = async (
  site: string,
  limit: number,
): Promise<Pick<Job, 'id' | 'externalId' | 'url' | 'title'>[]> =>
  prisma.job.findMany({
    where: { site, descriptionFetchedAt: null },
    orderBy: [{ easyApply: 'desc' }, { firstSeenAt: 'desc' }],
    take: limit,
    select: { id: true, externalId: true, url: true, title: true },
  });

/** Stores a job's full description text. */
export const saveDescription = async (jobId: string, description: string): Promise<void> => {
  await prisma.job.update({
    where: { id: jobId },
    data: { description, descriptionFetchedAt: new Date() },
  });
};

/** Lists jobs for the Jobs page, newest first. */
export const listJobs = async ({ easyApply, search, limit }: JobListQuery): Promise<JobDto[]> => {
  const where: Prisma.JobWhereInput = {
    ...(easyApply === undefined ? {} : { easyApply }),
    ...(search
      ? { OR: [{ title: { contains: search } }, { company: { contains: search } }, { location: { contains: search } }] }
      : {}),
  };
  const rows = await prisma.job.findMany({ where, orderBy: { firstSeenAt: 'desc' }, take: limit });
  return rows.map(toDto);
};
