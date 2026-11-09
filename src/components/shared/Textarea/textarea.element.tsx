// src\components\shared\Textarea\textarea.element.tsx
import styled from '@emotion/styled';
import { TextField } from '@mui/material';

export const StyledTextarea = styled(TextField)({
  '& .MuiInputBase-root': {
    backgroundColor: 'var(--mui-palette-background-paper)',
    alignItems: 'flex-start',
  },
});
