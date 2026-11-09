// src\components\shared\Modal\modal.element.tsx
import styled from '@emotion/styled';
import { DialogActions, DialogTitle, Stack } from '@mui/material';

export const TitleRow = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  paddingRight: theme.spacing(1.5),
}));

export const ActionsRow = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  gap: theme.spacing(1),
}));

export const BodyStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1),
}));
