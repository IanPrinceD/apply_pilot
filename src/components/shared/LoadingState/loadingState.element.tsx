// src\components\shared\LoadingState\loadingState.element.tsx
import styled from '@emotion/styled';
import { Stack } from '@mui/material';

export const LoadingStack = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'fullHeight',
})<{ fullHeight?: boolean }>(({ theme, fullHeight }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(6, 2),
  minHeight: fullHeight ? '60vh' : undefined,
}));
