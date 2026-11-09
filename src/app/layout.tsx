// src\app\layout.tsx
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import type { Metadata } from 'next';
import { Providers } from '@/app/providers';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'ApplyPilot',
  description: 'Local-first job application assistant',
};

const RootLayout = ({ children }: LayoutProps<'/'>) => (
  <html lang="en" suppressHydrationWarning>
    <body>
      <InitColorSchemeScript attribute="class" />
      <Providers>
        <AppShell>{children}</AppShell>
      </Providers>
    </body>
  </html>
);

export default RootLayout;
