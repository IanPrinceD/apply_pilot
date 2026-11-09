// src\components\shared\ConfirmModal\confirmModal.element.tsx
import styled from '@emotion/styled';
import { Box, DialogActions, Stack } from '@mui/material';

export type ConfirmSeverity = 'error' | 'warning' | 'primary';

export const ContentStack = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  textAlign: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(4, 3, 1),
}));

export const IconCircle = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'severity',
})<{ severity: ConfirmSeverity }>(({ theme, severity }) => ({
  width: 56,
  height: 56,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  color: theme.palette[severity].main,
  backgroundColor: `rgba(${theme.vars?.palette[severity].mainChannel ?? '0 0 0'} / 0.12)`,
  '& svg': { fontSize: 30 },
}));

export const ActionsRow = styled(DialogActions)(({ theme }) => ({
  justifyContent: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(2, 3, 3),
}));
