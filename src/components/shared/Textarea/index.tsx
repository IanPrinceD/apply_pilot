// src\components\shared\Textarea\index.tsx
'use client';

import type { TextFieldProps } from '@mui/material';
import { StyledTextarea } from './textarea.element';

export type TextareaProps = Omit<TextFieldProps, 'multiline' | 'select'> & {
  minRows?: number;
  maxRows?: number;
};

/** Multi-line text field (cover letters, answers, summaries). */
export const Textarea = ({ minRows = 3, maxRows = 16, ...props }: TextareaProps) => (
  <StyledTextarea fullWidth size="small" multiline minRows={minRows} maxRows={maxRows} {...props} />
);
