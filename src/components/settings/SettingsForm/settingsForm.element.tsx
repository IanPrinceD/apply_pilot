// src\components\settings\SettingsForm\settingsForm.element.tsx
import styled from '@emotion/styled';
import { Box, Paper, Stack } from '@mui/material';

export const FormStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
}));

export const Section = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const SectionHeader = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

export const FieldGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
}));

export const SalaryRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  gridTemplateColumns: '2fr 1fr 1.4fr',
}));

export const SliderBox = styled(Box)(({ theme }) => ({
  paddingInline: theme.spacing(1),
}));

export const ActionsRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
}));
