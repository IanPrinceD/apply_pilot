// src\types\emotion.d.ts
// Lets `@emotion/styled` callbacks see the MUI theme (palette, spacing, breakpoints...).
import type { Theme as MuiTheme } from '@mui/material/styles';

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface Theme extends MuiTheme {}
}
