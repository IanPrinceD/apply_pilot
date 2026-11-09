// src\components\shared\ThemeRegistry\index.tsx
'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import type { ReactNode } from 'react';
import { theme } from '@/styles/theme';

interface ThemeRegistryProps {
  children: ReactNode;
}

/** Emotion SSR cache + MUI theme + CssBaseline. Mounted once in providers.tsx. */
export const ThemeRegistry = ({ children }: ThemeRegistryProps) => (
  <AppRouterCacheProvider options={{ key: 'mui' }}>
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  </AppRouterCacheProvider>
);
