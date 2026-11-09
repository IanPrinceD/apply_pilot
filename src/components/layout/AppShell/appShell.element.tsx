// src\components\layout\AppShell\appShell.element.tsx
import styled from '@emotion/styled';
import { AppBar, Box, type BoxProps, Toolbar } from '@mui/material';

export const DRAWER_WIDTH = 240;

export const ShellRoot = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
});

export const TopBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.up('md')]: {
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    marginLeft: DRAWER_WIDTH,
  },
}));

export const NavBox = styled((props: BoxProps) => <Box component="nav" {...props} />)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: DRAWER_WIDTH,
    flexShrink: 0,
  },
}));

export const BrandToolbar = styled(Toolbar)(({ theme }) => ({
  gap: theme.spacing(1),
  color: theme.palette.primary.main,
}));

export const Main = styled((props: BoxProps) => <Box component="main" {...props} />)(({ theme }) => ({
  flexGrow: 1,
  minWidth: 0,
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}));

export const ContentBox = styled(Box)({
  maxWidth: 1200,
  marginInline: 'auto',
});

export const MenuButtonBox = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: { display: 'none' },
}));
