// src\app\providers.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';
import { ThemeRegistry } from '@/components/shared/ThemeRegistry';
import { ToastQueueProvider } from '@/components/shared/ToastQueueProvider';
import { getQueryClient } from '@/lib/queryClient';

interface ProvidersProps {
  children: ReactNode;
}

/** App-wide client providers: theme, TanStack Query, toasts. */
export const Providers = ({ children }: ProvidersProps) => {
  const queryClient = getQueryClient();
  return (
    <ThemeRegistry>
      <QueryClientProvider client={queryClient}>
        <ToastQueueProvider>{children}</ToastQueueProvider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ThemeRegistry>
  );
};
