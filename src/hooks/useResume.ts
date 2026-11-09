// src\hooks\useResume.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToastQueue } from '@/components/shared/ToastQueueProvider';
import type { MasterResume, MasterResumeDto, ParsedResumeDraft } from '@/types/resume';
import { apiFetch } from '@/utils/apiFetch';

export const resumeKeys = {
  all: ['resume'] as const,
  master: () => [...resumeKeys.all, 'master'] as const,
};

interface SaveResumeInput {
  data: MasterResume;
  sourceFileName: string | null;
}

/** Loads the master resume (null if not saved yet). */
export const useMasterResume = () =>
  useQuery({
    queryKey: resumeKeys.master(),
    queryFn: () => apiFetch<MasterResumeDto | null>('/api/resume'),
  });

/** Saves the master resume. */
export const useSaveResume = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastQueue();
  return useMutation({
    mutationFn: (input: SaveResumeInput) =>
      apiFetch<MasterResumeDto>('/api/resume', { method: 'PUT', body: JSON.stringify(input) }),
    onSuccess: () => {
      showToast('Resume saved', 'success');
      return queryClient.invalidateQueries({ queryKey: resumeKeys.all });
    },
    onError: (err) => showToast(err.message, 'error'),
  });
};

/** Uploads a PDF/DOCX and returns an LLM-parsed draft. Nothing is saved until useSaveResume. */
export const useParseResume = () => {
  const { showToast } = useToastQueue();
  return useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.append('file', file);
      return apiFetch<ParsedResumeDraft>('/api/resume/parse', { method: 'POST', body });
    },
    onSuccess: () => showToast('Resume parsed — review the fields below, then save', 'info'),
    onError: (err) => showToast(err.message, 'error'),
  });
};
