// src\constants\applicationStatus.ts
import type { ApplicationStatus } from '@/generated/prisma/enums';

export type StatusColor = 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';

export interface StatusMeta {
  label: string;
  color: StatusColor;
}

export const APPLICATION_STATUS_META: Record<ApplicationStatus, StatusMeta> = {
  QUEUED: { label: 'Queued', color: 'default' },
  APPROVED: { label: 'Approved', color: 'info' },
  SUBMITTED: { label: 'Submitted', color: 'success' },
  FAILED: { label: 'Failed', color: 'error' },
  SKIPPED: { label: 'Skipped', color: 'secondary' },
  NEEDS_USER: { label: 'Needs you', color: 'warning' },
  EXTERNAL_MANUAL: { label: 'External (manual)', color: 'primary' },
};
