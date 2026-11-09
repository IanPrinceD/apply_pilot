// src\components\shared\StatusChip\index.tsx
'use client';

import { Chip, type ChipProps } from '@mui/material';
import { APPLICATION_STATUS_META } from '@/constants/applicationStatus';
import type { ApplicationStatus } from '@/generated/prisma/enums';

export interface StatusChipProps {
  status: ApplicationStatus;
  size?: ChipProps['size'];
}

/** Colored chip for an application status. */
export const StatusChip = ({ status, size = 'small' }: StatusChipProps) => {
  const meta = APPLICATION_STATUS_META[status];
  return <Chip label={meta.label} color={meta.color} size={size} variant="outlined" />;
};
