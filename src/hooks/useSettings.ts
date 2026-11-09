// src\hooks\useSettings.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToastQueue } from '@/components/shared/ToastQueueProvider';
import type { SettingsDto, SettingsInput } from '@/types/settings';
import { apiFetch } from '@/utils/apiFetch';

export const settingsKeys = {
  all: ['settings'] as const,
  detail: () => [...settingsKeys.all, 'detail'] as const,
};

/** Loads the singleton settings. */
export const useSettings = () =>
  useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: () => apiFetch<SettingsDto>('/api/settings'),
  });

/** Saves settings; toasts on success/error. */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastQueue();
  return useMutation({
    mutationFn: (input: SettingsInput) =>
      apiFetch<SettingsDto>('/api/settings', { method: 'PUT', body: JSON.stringify(input) }),
    onSuccess: () => {
      showToast('Settings saved', 'success');
      return queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
    onError: (err) => showToast(err.message, 'error'),
  });
};
