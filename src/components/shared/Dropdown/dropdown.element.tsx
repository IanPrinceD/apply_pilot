// src\components\shared\Dropdown\dropdown.element.tsx
import styled from '@emotion/styled';
import { Autocomplete, TextField } from '@mui/material';

export const SelectField = styled(TextField)({
  '& .MuiInputBase-root': {
    backgroundColor: 'var(--mui-palette-background-paper)',
  },
});

export const StyledAutocomplete = styled(Autocomplete)({
  '& .MuiInputBase-root': {
    backgroundColor: 'var(--mui-palette-background-paper)',
  },
}) as typeof Autocomplete;
