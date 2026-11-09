// src\components\resume\ResumeEditor\index.tsx
'use client';

import { Alert, Link } from '@mui/material';
import NextLink from 'next/link';
import { useState } from 'react';
import { LoadingState } from '@/components/shared/LoadingState';
import { useToastQueue } from '@/components/shared/ToastQueueProvider';
import { ResumeForm } from '@/components/resume/ResumeForm';
import { ResumeUpload } from '@/components/resume/ResumeUpload';
import { useMasterResume, useSaveResume } from '@/hooks/useResume';
import { EMPTY_RESUME, type MasterResume, type MasterResumeDto, masterResumeSchema } from '@/types/resume';
import { EditorStack } from './resumeEditor.element';

interface ResumeEditorInnerProps {
  saved: MasterResumeDto | null;
}

/** Drops blank list entries and blank highlight lines before saving. */
const clean = (resume: MasterResume): MasterResume => ({
  ...resume,
  skills: resume.skills.map((s) => s.trim()).filter(Boolean),
  experience: resume.experience
    .map((e) => ({ ...e, highlights: e.highlights.map((h) => h.trim()).filter(Boolean) }))
    .filter((e) => e.title.trim() || e.company.trim()),
  education: resume.education.filter((e) => e.institution.trim() || e.degree.trim()),
  certifications: resume.certifications.filter((c) => c.name.trim()),
  projects: resume.projects.filter((p) => p.name.trim()),
});

/** Holds the working draft; remounted (via `key`) when the saved resume changes. */
const ResumeEditorInner = ({ saved }: ResumeEditorInnerProps) => {
  const initial = saved?.data ?? EMPTY_RESUME;
  const [draft, setDraft] = useState<MasterResume>(initial);
  const [sourceFileName, setSourceFileName] = useState<string | null>(saved?.sourceFileName ?? null);
  const [fromUpload, setFromUpload] = useState(false);
  const saveResume = useSaveResume();
  const { showToast } = useToastQueue();

  const dirty = fromUpload || JSON.stringify(draft) !== JSON.stringify(initial);

  /** Validates and saves the cleaned draft. */
  const handleSave = () => {
    const parsed = masterResumeSchema.safeParse(clean(draft));
    if (!parsed.success) {
      showToast('Resume data is invalid — check the fields and try again', 'error');
      return;
    }
    saveResume.mutate({ data: parsed.data, sourceFileName });
  };

  return (
    <EditorStack>
      <ResumeUpload
        onParsed={({ data, sourceFileName: name }) => {
          setDraft(data);
          setSourceFileName(name);
          setFromUpload(true);
        }}
      />
      {fromUpload && (
        <Alert severity="info">
          Parsed from “{sourceFileName}”. Check every field against your real resume, then save.
        </Alert>
      )}
      {!saved && !fromUpload && (
        <Alert severity="warning">No master resume yet. Upload one above or fill in the form.</Alert>
      )}
      <ResumeForm
        value={draft}
        onChange={setDraft}
        onSave={handleSave}
        onDiscard={() => {
          setDraft(initial);
          setSourceFileName(saved?.sourceFileName ?? null);
          setFromUpload(false);
        }}
        saving={saveResume.isPending}
        dirty={dirty}
      />
      {saved && !dirty && (
        <Alert severity="success">
          Resume saved.{' '}
          <Link component={NextLink} href="/settings">
            Next: set your filters →
          </Link>
        </Alert>
      )}
    </EditorStack>
  );
};

/** Master resume page body: upload + editable form. */
export const ResumeEditor = () => {
  const { data, isPending, isError, error } = useMasterResume();
  if (isPending) return <LoadingState label="Loading resume…" />;
  if (isError) return <Alert severity="error">{error.message}</Alert>;
  return <ResumeEditorInner key={data?.updatedAt ?? 'new'} saved={data} />;
};
