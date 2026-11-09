// src\app\not-found.tsx
'use client';

import { Link, Stack, Typography } from '@mui/material';
import NextLink from 'next/link';

const NotFound = () => (
  <Stack sx={{ alignItems: 'center', textAlign: 'center', gap: 2, py: 10 }}>
    <Typography variant="h3" color="primary">
      404
    </Typography>
    <Typography variant="h5">Page not found</Typography>
    <Typography color="text.secondary">This page doesn&apos;t exist (yet).</Typography>
    <Link component={NextLink} href="/">
      Back to dashboard
    </Link>
  </Stack>
);

export default NotFound;
