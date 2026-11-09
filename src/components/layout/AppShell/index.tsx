// src\components\layout\AppShell\index.tsx
'use client';

import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useState } from 'react';
import {
  BrandToolbar,
  ContentBox,
  DRAWER_WIDTH,
  Main,
  MenuButtonBox,
  NavBox,
  ShellRoot,
  TopBar,
} from './appShell.element';
import { NAV_ITEMS } from './navItems';

interface AppShellProps {
  children: ReactNode;
}

/** True when `href` is the active route (exact for "/", prefix otherwise). */
const isActive = (pathname: string, href: string): boolean =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

/** App chrome: left nav drawer (permanent on desktop, toggled on mobile) + top bar. */
export const AppShell = ({ children }: AppShellProps) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <>
      <BrandToolbar>
        <FlightTakeoffIcon />
        <Typography variant="h6" component="span">
          ApplyPilot
        </Typography>
      </BrandToolbar>
      <Divider />
      <List>
        {NAV_ITEMS.map(({ label, href, icon: Icon, comingIn }) =>
          comingIn ? (
            <ListItemButton key={href} disabled>
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={label} secondary={comingIn} />
            </ListItemButton>
          ) : (
            <ListItemButton
              key={href}
              component={Link}
              href={href}
              selected={isActive(pathname, href)}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          ),
        )}
      </List>
    </>
  );

  return (
    <ShellRoot>
      <TopBar position="fixed" elevation={0}>
        <Toolbar>
          <MenuButtonBox>
            <IconButton edge="start" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          </MenuButtonBox>
          <Typography variant="subtitle1">Job application assistant</Typography>
        </Toolbar>
      </TopBar>

      <NavBox aria-label="Main navigation">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {nav}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {nav}
        </Drawer>
      </NavBox>

      <Main>
        <Toolbar />
        <ContentBox>{children}</ContentBox>
      </Main>
    </ShellRoot>
  );
};
