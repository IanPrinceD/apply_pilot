// src\app\settings\page.tsx
import { SettingsForm } from '@/components/settings/SettingsForm';
import { PageTitle } from '@/components/shared/PageTitle';

const SettingsPage = () => (
  <>
    <PageTitle title="Search Settings" subtitle="Filters, match threshold, daily limit and run mode." />
    <SettingsForm />
  </>
);

export default SettingsPage;
