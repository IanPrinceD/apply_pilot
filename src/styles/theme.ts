// src\styles\theme.ts
'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#2563eb' },
        secondary: { main: '#7c3aed' },
        background: { default: '#f6f7fb', paper: '#ffffff' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#60a5fa' },
        secondary: { main: '#a78bfa' },
        background: { default: '#0f1218', paper: '#161b24' },
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiTextField: { defaultProps: { fullWidth: true, size: 'small' } },
  },
});
