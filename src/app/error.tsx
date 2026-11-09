// src\app\error.tsx
'use client';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import { Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Button } from '@/components/shared/Button';

interface ErrorPageProps {
  error: unknown;
  retry: () => void;
}

/** Route-level error boundary. */
const ErrorPage = ({ error, retry }: ErrorPageProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Stack sx={{ alignItems: 'center', textAlign: 'center', gap: 2, py: 10 }}>
      <ErrorOutlineIcon color="error" sx={{ fontSize: 56 }} />
      <Typography variant="h5">Something went wrong</Typography>
      <Typography color="text.secondary">
        {error instanceof Error ? error.message : 'An unexpected error occurred.'}
      </Typography>
      <Button onClick={() => retry()}>Try again</Button>
    </Stack>
  );
};

export default ErrorPage;
