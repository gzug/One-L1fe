/**
 * scoreColor.ts
 *
 * Single source of truth for score colour mapping.
 * Used by:
 *   - ReadinessOrbit ring + segment fills + segment values
 *   - TodaySignalsRow chips
 *   - ScoreTrendCard endpoint marker
 *
 * Bands (intentionally non traffic-light — warmer, calmer):
 *   0–49   muted deep red   (calls for review, not alarm)
 *   50–69  burnt orange     (softer than baseline)
 *   70–84  warm gold        (steady)
 *   85–100 soft green       (strong)
 *
 * Training Load deltas remain contextual via loadDeltaColor() in the consumer
 * — this file is intentionally about score bands only.
 */
import type { ThemeColors } from './marathonTheme';

export type ScoreBand = 'low' | 'soft' | 'steady' | 'strong';

export function scoreBand(value: number): ScoreBand {
  if (value >= 85) return 'strong';
  if (value >= 70) return 'steady';
  if (value >= 50) return 'soft';
  return 'low';
}

export function scoreColor(value: number, colors: ThemeColors): string {
  switch (scoreBand(value)) {
    case 'strong': return colors.scoreStrong;
    case 'steady': return colors.scoreSteady;
    case 'soft':   return colors.scoreSoft;
    case 'low':    return colors.scoreLow;
  }
}

export function scoreSoftBg(value: number, colors: ThemeColors): string {
  switch (scoreBand(value)) {
    case 'strong': return colors.scoreStrongSoft;
    case 'steady': return colors.scoreSteadySoft;
    case 'soft':   return colors.scoreSoftSoft;
    case 'low':    return colors.scoreLowSoft;
  }
}

export function scoreBandLabel(value: number): string {
  switch (scoreBand(value)) {
    case 'strong': return 'strong';
    case 'steady': return 'steady';
    case 'soft':   return 'softer';
    case 'low':    return 'review';
  }
}
