// Score display-state derivation.
//
// Maps a OneL1feAggregateResult to the user-facing display state.
// The hard rule from the product spec: never render raw 0 for missing data —
// show "Not enough data" with a prompt to complete a check-in instead.
//
// DECISION: coverage thresholds are named constants at module top so first-run
// calibration is a one-line edit. V1 starter metric count is ~5 so the
// starter-usable boundary is deliberately low; tune after first real-user run.
// DECISION: confidence in the display view is derived from coverage buckets,
// independent of per-dot DotScore.confidence — they answer different questions
// (per-dot data quality vs. overall aggregate reliability).

import type { DotConfidence } from './dots.ts';
import type { OneL1feAggregateResult } from './scoreAggregation.ts';

export type ScoreDisplayState = 'no_data' | 'starter' | 'usable' | 'strong';

export interface ScoreDisplayView {
  state: ScoreDisplayState;
  /** 0–100 rounded for display, or null when state is 'no_data'. */
  score: number | null;
  /** 0–100 integer percentage of active leaves with usable data. */
  coveragePct: number;
  confidence: DotConfidence;
  /** Ready-to-render string for the score hub. */
  message: string;
}

/** TUNE after first real-user run. */
export const COVERAGE_THRESHOLD_STARTER = 0.3;
/** TUNE after first real-user run. */
export const COVERAGE_THRESHOLD_USABLE = 0.7;

export const MESSAGE_NO_DATA =
  'Not enough data — complete your first Check-in';

export function deriveScoreDisplayState(
  aggregate: OneL1feAggregateResult,
): ScoreDisplayView {
  const coveragePct = Math.round(aggregate.coverageRatio * 100);

  if (aggregate.score === null || aggregate.eligibleDotCount === 0) {
    return {
      state: 'no_data',
      score: null,
      coveragePct,
      confidence: 'low',
      message: MESSAGE_NO_DATA,
    };
  }

  let state: ScoreDisplayState;
  let confidence: DotConfidence;
  if (aggregate.coverageRatio < COVERAGE_THRESHOLD_STARTER) {
    state = 'starter';
    confidence = 'low';
  } else if (aggregate.coverageRatio < COVERAGE_THRESHOLD_USABLE) {
    state = 'usable';
    confidence = 'medium';
  } else {
    state = 'strong';
    confidence = 'high';
  }

  return {
    state,
    score: Math.round(aggregate.score),
    coveragePct,
    confidence,
    message: `Confidence: ${capitalize(confidence)} · Coverage: ${coveragePct}%`,
  };
}

function capitalize(value: string): string {
  return value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);
}
