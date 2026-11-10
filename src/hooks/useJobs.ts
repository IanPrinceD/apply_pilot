// src\hooks\useJobs.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import type { JobDto } from '@/types/job';
import { apiFetch } from '@/utils/apiFetch';

export interface JobFilters {
  easyApply?: boolean;
  search?: string;
}

export const jobsKeys = {
  all: ['jobs'] as const,
  list: (filters: JobFilters) => [...jobsKeys.all, 'list', filters.easyApply ?? null, filters.search ?? null] as const,
};

/** Builds the /api/jobs query string. */
const toQuery = ({ easyApply, search }: JobFilters): string => {
  const params = new URLSearchParams();
  if (easyApply !== undefined) params.set('easyApply', String(easyApply));
  if (search) params.set('search', search);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

/** Lists saved jobs; pass `live` while a search runs so new rows show up. */
export const useJobs = (filters: JobFilters, live = false) =>
  useQuery({
    queryKey: jobsKeys.list(filters),
    queryFn: () => apiFetch<JobDto[]>(`/api/jobs${toQuery(filters)}`),
    refetchInterval: live ? 5000 : false,
  });
