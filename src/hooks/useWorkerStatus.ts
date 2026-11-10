// src\hooks\useWorkerStatus.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import type { WorkerStatusDto } from '@/types/worker';
import { apiFetch } from '@/utils/apiFetch';

export const workerKeys = {
  all: ['worker'] as const,
  status: () => [...workerKeys.all, 'status'] as const,
};

/** Live worker status, polled every 5s. */
export const useWorkerStatus = () =>
  useQuery({
    queryKey: workerKeys.status(),
    queryFn: () => apiFetch<WorkerStatusDto>('/api/worker/status'),
    refetchInterval: 5000,
  });
