// src\components\shared\Modal\index.tsx
'use client';

import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, type DialogProps, IconButton } from '@mui/material';
import type { ReactNode } from 'react';
import { ActionsRow, BodyStack, TitleRow } from './modal.element';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** Footer buttons. */
  actions?: ReactNode;
  maxWidth?: DialogProps['maxWidth'];
  /** Prevents closing via backdrop/Escape (e.g. while saving). */
  disableClose?: boolean;
}

/** General-purpose dialog with a title bar, close button, body, and optional actions. */
export const Modal = ({ open, onClose, title, children, actions, maxWidth = 'sm', disableClose }: ModalProps) => (
  <Dialog open={open} onClose={disableClose ? undefined : onClose} maxWidth={maxWidth} fullWidth>
    <TitleRow>
      {title}
      <IconButton aria-label="Close" onClick={onClose} disabled={disableClose} size="small">
        <CloseIcon fontSize="small" />
      </IconButton>
    </TitleRow>
    <DialogContent dividers>
      <BodyStack>{children}</BodyStack>
    </DialogContent>
    {actions && <ActionsRow>{actions}</ActionsRow>}
  </Dialog>
);
