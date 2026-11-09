// src\components\shared\LoadingState\index.tsx
'use client';

import { CircularProgress, Typography } from '@mui/material';
import { LoadingStack } from './loadingState.element';

export interface LoadingStateProps {
  label?: string;
  /** Fill most of the viewport (route-level loading). */
  fullHeight?: boolean;
}

/** Centered spinner with an optional label. */
export const LoadingState = ({ label = 'Loading…', fullHeight }: LoadingStateProps) => (
  <LoadingStack fullHeight={fullHeight} role="status" aria-live="polite">
    <CircularProgress size={32} />
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </LoadingStack>
);
