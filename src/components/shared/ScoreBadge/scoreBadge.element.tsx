// src\components\shared\ScoreBadge\scoreBadge.element.tsx
import styled from '@emotion/styled';
import { Box } from '@mui/material';

export type ScoreTone = 'success' | 'warning' | 'error';

export const Badge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: ScoreTone }>(({ theme, tone }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 44,
  padding: theme.spacing(0.25, 1),
  borderRadius: 999,
  fontWeight: 700,
  fontSize: theme.typography.body2.fontSize,
  color: theme.palette[tone].main,
  backgroundColor: `rgba(${theme.vars?.palette[tone].mainChannel ?? '0 0 0'} / 0.12)`,
}));
