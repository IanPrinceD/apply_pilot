// src\components\answerBank\AnswerBankModal\index.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/shared/Button';
import { Dropdown } from '@/components/shared/Dropdown';
import { Input } from '@/components/shared/Input';
import { Modal } from '@/components/shared/Modal';
import { ANSWER_TAG_SUGGESTIONS } from '@/constants/answerBank';
import { useCreateAnswer, useUpdateAnswer } from '@/hooks/useAnswerBank';
import { Textarea } from '@/components/shared/Textarea';
import { type AnswerBankEntryDto, type AnswerBankInput, answerBankInputSchema } from '@/types/answerBank';

const TAG_OPTIONS = ANSWER_TAG_SUGGESTIONS.map((t) => ({ value: t, label: t }));

interface AnswerBankModalProps {
  open: boolean;
  onClose: () => void;
  /** Entry to edit; omit to create. */
  entry?: AnswerBankEntryDto | null;
}

type FieldErrors = Partial<Record<keyof AnswerBankInput, string>>;

/** Add / edit dialog for an answer bank entry. Remount with a `key` per entry. */
export const AnswerBankModal = ({ open, onClose, entry }: AnswerBankModalProps) => {
  const [form, setForm] = useState<AnswerBankInput>({
    question: entry?.question ?? '',
    answer: entry?.answer ?? '',
    tags: entry?.tags ?? [],
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const createAnswer = useCreateAnswer();
  const updateAnswer = useUpdateAnswer();
  const saving = createAnswer.isPending || updateAnswer.isPending;

  /** Validates, then creates or updates. */
  const handleSave = () => {
    const parsed = answerBankInputSchema.safeParse(form);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof AnswerBankInput;
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    const options = { onSuccess: onClose };
    if (entry) updateAnswer.mutate({ id: entry.id, input: parsed.data }, options);
    else createAnswer.mutate(parsed.data, options);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      disableClose={saving}
      title={entry ? 'Edit answer' : 'Add answer'}
      actions={
        <>
          <Button buttonType="cancel" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            {entry ? 'Save changes' : 'Add answer'}
          </Button>
        </>
      }
    >
      <Input
        label="Question"
        placeholder="e.g. How many years of experience do you have with React?"
        value={form.question}
        error={Boolean(errors.question)}
        helperText={errors.question ?? 'Write it the way forms usually ask it. Similar wording is matched later.'}
        onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
        autoFocus
      />
      <Textarea
        label="Your answer"
        minRows={3}
        value={form.answer}
        error={Boolean(errors.answer)}
        helperText={errors.answer ?? 'Only true answers — this is reused as-is on applications.'}
        onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
      />
      <Dropdown
        label="Tags"
        placeholder="Pick or type tags"
        options={TAG_OPTIONS}
        multiple
        searchable
        creatable
        value={form.tags}
        error={Boolean(errors.tags)}
        helperText={errors.tags}
        onChange={(tags) => setForm((f) => ({ ...f, tags }))}
      />
    </Modal>
  );
};
