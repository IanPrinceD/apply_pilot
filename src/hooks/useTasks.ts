// src\hooks\useTasks.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToastQueue } from '@/components/shared/ToastQueueProvider';
import { ACTIVE_TASK_STATUSES } from '@/constants/taskStatus';
import { jobsKeys } from '@/hooks/useJobs';
import { workerKeys } from '@/hooks/useWorkerStatus';
import type { TaskDto } from '@/types/task';
import { apiFetch } from '@/utils/apiFetch';

export const tasksKeys = {
  all: ['tasks'] as const,
  recent: () => [...tasksKeys.all, 'recent'] as const,
};

/** True if any task is still queued, running, or waiting on the user. */
export const hasActiveTask = (tasks: TaskDto[] | undefined): boolean =>
  Boolean(tasks?.some((t) => ACTIVE_TASK_STATUSES.includes(t.status)));

/** Recent tasks; polls every 3s while one is active. */
export const useTasks = () =>
  useQuery({
    queryKey: tasksKeys.recent(),
    queryFn: () => apiFetch<TaskDto[]>('/api/tasks?limit=10'),
    refetchInterval: (query) => (hasActiveTask(query.state.data) ? 3000 : 15000),
  });

/** Queues a manual search. */
export const useStartSearch = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastQueue();
  return useMutation({
    mutationFn: () => apiFetch<TaskDto>('/api/tasks/search', { method: 'POST' }),
    onSuccess: () => {
      showToast('Search queued — the worker will pick it up', 'success');
      return queryClient.invalidateQueries({ queryKey: tasksKeys.all });
    },
    onError: (err) => showToast(err.message, 'error'),
  });
};

/** Cancels a queued or running task. */
export const useCancelTask = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastQueue();
  return useMutation({
    mutationFn: (id: string) => apiFetch<TaskDto>(`/api/tasks/${id}/cancel`, { method: 'POST' }),
    onSuccess: () => {
      showToast('Search cancelled', 'info');
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: tasksKeys.all }),
        queryClient.invalidateQueries({ queryKey: workerKeys.all }),
        queryClient.invalidateQueries({ queryKey: jobsKeys.all }),
      ]);
    },
    onError: (err) => showToast(err.message, 'error'),
  });
};
