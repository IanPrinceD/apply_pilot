// src\hooks\useAnswerBank.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToastQueue } from '@/components/shared/ToastQueueProvider';
import type { AnswerBankEntryDto, AnswerBankInput } from '@/types/answerBank';
import { apiFetch } from '@/utils/apiFetch';

export const answerBankKeys = {
  all: ['answerBank'] as const,
  list: () => [...answerBankKeys.all, 'list'] as const,
};

/** Lists answer bank entries. */
export const useAnswerBank = () =>
  useQuery({
    queryKey: answerBankKeys.list(),
    queryFn: () => apiFetch<AnswerBankEntryDto[]>('/api/answer-bank'),
  });

/** Creates an entry. */
export const useCreateAnswer = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastQueue();
  return useMutation({
    mutationFn: (input: AnswerBankInput) =>
      apiFetch<AnswerBankEntryDto>('/api/answer-bank', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => {
      showToast('Answer added', 'success');
      return queryClient.invalidateQueries({ queryKey: answerBankKeys.all });
    },
    onError: (err) => showToast(err.message, 'error'),
  });
};

/** Updates an entry. */
export const useUpdateAnswer = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastQueue();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AnswerBankInput }) =>
      apiFetch<AnswerBankEntryDto>(`/api/answer-bank/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
    onSuccess: () => {
      showToast('Answer updated', 'success');
      return queryClient.invalidateQueries({ queryKey: answerBankKeys.all });
    },
    onError: (err) => showToast(err.message, 'error'),
  });
};

/** Deletes an entry with an optimistic removal. */
export const useDeleteAnswer = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastQueue();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/answer-bank/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: answerBankKeys.list() });
      const previous = queryClient.getQueryData<AnswerBankEntryDto[]>(answerBankKeys.list());
      queryClient.setQueryData<AnswerBankEntryDto[]>(answerBankKeys.list(), (old) =>
        old?.filter((entry) => entry.id !== id),
      );
      return { previous };
    },
    onError: (err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(answerBankKeys.list(), context.previous);
      showToast(err.message, 'error');
    },
    onSuccess: () => showToast('Answer deleted', 'success'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: answerBankKeys.all }),
  });
};
