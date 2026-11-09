// src\components\shared\ConfirmModal\index.tsx
'use client';

import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Dialog, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Button, type ButtonType } from '@/components/shared/Button';
import { ActionsRow, type ConfirmSeverity, ContentStack, IconCircle } from './confirmModal.element';

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  icon?: ReactNode;
  severity?: ConfirmSeverity;
  confirmButtonType?: ButtonType;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  children?: ReactNode;
}

/** Confirmation dialog for destructive or risky actions. */
export const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  icon = <WarningAmberIcon />,
  severity = 'warning',
  confirmButtonType = 'confirm',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  children,
}: ConfirmModalProps) => (
  <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
    <ContentStack>
      <IconCircle severity={severity}>{icon}</IconCircle>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
      {children}
    </ContentStack>
    <ActionsRow>
      <Button buttonType="cancel" onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button buttonType={confirmButtonType} onClick={onConfirm} loading={loading}>
        {confirmLabel}
      </Button>
    </ActionsRow>
  </Dialog>
);
