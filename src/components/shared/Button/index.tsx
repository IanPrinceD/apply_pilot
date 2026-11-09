// src\components\shared\Button\index.tsx
'use client';

import type { ButtonProps as MuiButtonProps } from '@mui/material';
import { StyledButton } from './button.element';

export type ButtonType = 'submit' | 'confirm' | 'cancel' | 'destructive';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'color' | 'type'> {
  buttonType?: ButtonType;
}

const VARIANTS: Record<ButtonType, Pick<MuiButtonProps, 'variant' | 'color' | 'type'>> = {
  submit: { variant: 'contained', color: 'primary', type: 'submit' },
  confirm: { variant: 'contained', color: 'primary', type: 'button' },
  cancel: { variant: 'outlined', color: 'inherit', type: 'button' },
  destructive: { variant: 'contained', color: 'error', type: 'button' },
};

/** App button. `buttonType` picks the variant/color; `loading` is MUI's built-in spinner. */
export const Button = ({ buttonType = 'confirm', ...props }: ButtonProps) => (
  <StyledButton {...VARIANTS[buttonType]} {...props} />
);
