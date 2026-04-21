import { TrendSkeleton } from './scoring.ts';

export interface TrendObservation {
  timestamp: string;
  value: number;
}

export function buildTrendSkeleton(
  observations: TrendObservation[],
  windowDays: number,
  markerKey: string,
): TrendSkeleton | null {
  if (observations.length === 0) {
    return null;
  }

  const sorted = [...observations].sort((left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime());
  const first = new Date(sorted[0].timestamp);
  const last = new Date(sorted[sorted.length - 1].timestamp);
  const spanDays = Math.max(0, (last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));

  return {
    markerKey,
    samples: sorted,
    windowDays,
    sparse: sorted.length < 3 || spanDays < windowDays,
    note: 'READ_ONLY_V1_NOT_COUPLED_TO_SCORE',
  };
}
