// src\components\shared\Input\index.tsx
'use client';

import type { TextFieldProps } from '@mui/material';
import { StyledTextField } from './input.element';

export type InputProps = Omit<TextFieldProps, 'multiline' | 'minRows' | 'maxRows' | 'rows' | 'select'>;

/** Single-line text field with app defaults. */
export const Input = (props: InputProps) => <StyledTextField fullWidth size="small" {...props} />;
