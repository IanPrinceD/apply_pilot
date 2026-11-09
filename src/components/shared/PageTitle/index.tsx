// src\components\shared\PageTitle\index.tsx
'use client';

import type { SxProps, Theme, TypographyProps } from '@mui/material';
import { Typography } from '@mui/material';
import { Highlight, TitleStack } from './pageTitle.element';

export interface PageTitleProps {
  title: string;
  subtitle: string;
  variant?: TypographyProps['variant'];
  sx?: SxProps<Theme>;
}

/** Page heading; words after the first render in the primary color. */
export const PageTitle = ({ title, subtitle, variant = 'h4', sx }: PageTitleProps) => {
  const [first, ...rest] = title.trim().split(/\s+/);
  return (
    <TitleStack sx={sx}>
      <Typography variant={variant} component="h1">
        {first}
        {rest.length > 0 && (
          <>
            {' '}
            <Highlight>{rest.join(' ')}</Highlight>
          </>
        )}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {subtitle}
      </Typography>
    </TitleStack>
  );
};
