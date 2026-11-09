// src\components\dashboard\SetupChecklist\setupChecklist.element.tsx
import styled from '@emotion/styled';
import { Box, Paper, Stack } from '@mui/material';

export const CardGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
}));

export const StepCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));

export const StepHeader = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const Spacer = styled(Box)({
  flexGrow: 1,
});
