// src\components\shared\Button\button.element.tsx
import styled from '@emotion/styled';
import { Button } from '@mui/material';

export const StyledButton = styled(Button)(({ theme }) => ({
  minWidth: theme.spacing(12),
  paddingInline: theme.spacing(2),
}));
