// src\components\shared\ScoreBadge\index.tsx
'use client';

import { Tooltip } from '@mui/material';
import { DEFAULT_THRESHOLD } from '@/constants/settings';
import { Badge, type ScoreTone } from './scoreBadge.element';

export interface ScoreBadgeProps {
  score: number | null | undefined;
  threshold?: number;
}

const NEAR_MISS_MARGIN = 15;

/** Picks a color: green at/above threshold, amber within 15 points, red below. */
const toneFor = (score: number, threshold: number): ScoreTone => {
  if (score >= threshold) return 'success';
  if (score >= threshold - NEAR_MISS_MARGIN) return 'warning';
  return 'error';
};

/** Match score pill colored relative to the user's threshold. */
export const ScoreBadge = ({ score, threshold = DEFAULT_THRESHOLD }: ScoreBadgeProps) => {
  if (score === null || score === undefined) {
    return <Badge tone="warning">—</Badge>;
  }
  return (
    <Tooltip title={`Threshold: ${threshold}`}>
      <Badge tone={toneFor(score, threshold)}>{score}</Badge>
    </Tooltip>
  );
};
