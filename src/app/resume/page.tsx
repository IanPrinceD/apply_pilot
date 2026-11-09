// src\app\resume\page.tsx
import { ResumeEditor } from '@/components/resume/ResumeEditor';
import { PageTitle } from '@/components/shared/PageTitle';

const ResumePage = () => (
  <>
    <PageTitle
      title="Master Resume"
      subtitle="Your source of truth. Tailored resumes only reorder and re-emphasize what's here."
    />
    <ResumeEditor />
  </>
);

export default ResumePage;
