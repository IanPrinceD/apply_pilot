// src\components\resume\ResumeUpload\resumeUpload.element.tsx
import styled from '@emotion/styled';
import { Paper, Stack } from '@mui/material';

export const UploadPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  border: `1px dashed ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

export const TextStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(0.5),
}));

export const HiddenInput = styled('input')({
  display: 'none',
});
