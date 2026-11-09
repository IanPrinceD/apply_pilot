// src\components\shared\Input\input.element.tsx
import styled from '@emotion/styled';
import { TextField } from '@mui/material';

export const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    backgroundColor: 'var(--mui-palette-background-paper)',
  },
});
