// src\components\resume\ResumeUpload\index.tsx
'use client';

import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Typography } from '@mui/material';
import { type ChangeEvent, useRef } from 'react';
import { Button } from '@/components/shared/Button';
import { useParseResume } from '@/hooks/useResume';
import type { ParsedResumeDraft } from '@/types/resume';
import { HiddenInput, TextStack, UploadPaper } from './resumeUpload.element';

const ACCEPT = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

interface ResumeUploadProps {
  onParsed: (draft: ParsedResumeDraft) => void;
}

/** PDF/DOCX upload that returns an LLM-parsed draft for review. */
export const ResumeUpload = ({ onParsed }: ResumeUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const parseResume = useParseResume();

  /** Sends the chosen file for parsing, then clears the input so the same file can be re-picked. */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    parseResume.mutate(file, { onSuccess: onParsed });
  };

  return (
    <UploadPaper>
      <TextStack>
        <Typography variant="subtitle1">Import from an existing resume</Typography>
        <Typography variant="body2" color="text.secondary">
          PDF or DOCX, up to 5 MB. The text is sent to the LLM to fill in the form below. Review every field
          before saving — nothing is saved automatically.
        </Typography>
      </TextStack>
      <HiddenInput ref={inputRef} type="file" accept={ACCEPT} onChange={handleChange} />
      <Button
        startIcon={<UploadFileIcon />}
        onClick={() => inputRef.current?.click()}
        loading={parseResume.isPending}
        loadingPosition="start"
      >
        {parseResume.isPending ? 'Parsing…' : 'Upload resume'}
      </Button>
    </UploadPaper>
  );
};
