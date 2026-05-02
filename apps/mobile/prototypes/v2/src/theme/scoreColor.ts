/**
 * scoreColor.ts
 *
 * Single source of truth for score colour mapping.
 * Used by:
 *   - ReadinessOrbit ring + segment fills + segment values
 *   - TodaySignalsRow chips
 *   - ScoreTrendCard endpoint marker
 *
 * Bands are intentionally not traffic-light colours. Lower values become
 * paler and lower-confidence; higher values become deeper mint/green.
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
