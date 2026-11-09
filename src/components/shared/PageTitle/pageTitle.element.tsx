// src\components\shared\PageTitle\pageTitle.element.tsx
import styled from '@emotion/styled';
import { Box, type BoxProps, Stack } from '@mui/material';

export const TitleStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(0.5),
  marginBottom: theme.spacing(3),
}));

export const Highlight = styled((props: BoxProps) => <Box component="span" {...props} />)(({ theme }) => ({
  display: 'inline',
  color: theme.palette.primary.main,
}));
