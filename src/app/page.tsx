// src\app\page.tsx
import { SetupChecklist } from '@/components/dashboard/SetupChecklist';
import { PageTitle } from '@/components/shared/PageTitle';

const DashboardPage = () => (
  <>
    <PageTitle
      title="Welcome to ApplyPilot"
      subtitle="Finish setup below. Job search, scoring and applying arrive in the next phases."
    />
    <SetupChecklist />
  </>
);

export default DashboardPage;
