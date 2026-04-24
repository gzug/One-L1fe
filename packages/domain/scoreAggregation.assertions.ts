import { getDotDefinition } from './dots.ts';
import type { DotConfidence, DotScore, DotStatus } from './dots.ts';
import {
  CONFIDENCE_MODIFIER,
  aggregateOneL1feScore,
  effectiveWeight,
  isDotScoreEligible,
} from './scoreAggregation.ts';
import type { DotScoreInput } from './scoreAggregation.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function approx(a: number, b: number, eps = 1e-9): boolean {
  return Math.abs(a - b) < eps;
}

function makeInput(params: {
  key: Parameters<typeof getDotDefinition>[0];
  score: number | null;
  coverage?: number;
  freshness?: number;
  confidence?: DotConfidence;
  status?: DotStatus;
}): DotScoreInput {
  const runtime: DotScore = {
    score: params.score,
    coverage: params.coverage ?? 1,
    freshness: params.freshness ?? 1,
    confidence: params.confidence ?? 'high',
    status: params.status ?? 'ready',
  };
  return { definition: getDotDefinition(params.key), runtime };
}

export function runScoreAggregationAssertions(): void {
  // CONFIDENCE_MODIFIER table.
  assert(CONFIDENCE_MODIFIER.low === 0.6, 'low confidence modifier must be 0.6.');
  assert(CONFIDENCE_MODIFIER.medium === 0.8, 'medium confidence modifier must be 0.8.');
  assert(CONFIDENCE_MODIFIER.high === 1.0, 'high confidence modifier must be 1.0.');

  // --- Eligibility ---------------------------------------------------------
  const readyLeaf = makeInput({ key: 'sleep_duration', score: 80, status: 'ready' });
  assert(isDotScoreEligible(readyLeaf), 'ready input leaf with score should be eligible.');

  const needsUpdate = makeInput({ key: 'energy', score: 60, status: 'needs_update' });
  assert(isDotScoreEligible(needsUpdate), 'needs_update leaf should remain eligible.');

  const missing = makeInput({ key: 'stress', score: null, status: 'missing' });
  assert(!isDotScoreEligible(missing), 'missing leaf must not be eligible.');

  const planned = makeInput({ key: 'vo2_max', score: 80, status: 'planned_locked' });
  assert(!isDotScoreEligible(planned), 'planned_locked leaf must not be eligible.');

  const excluded = makeInput({ key: 'steps', score: 70, status: 'excluded' });
  assert(!isDotScoreEligible(excluded), 'excluded leaf must not be eligible.');

  const nullScore = makeInput({ key: 'steps', score: null, status: 'ready' });
  assert(!isDotScoreEligible(nullScore), 'null score must not be eligible even when status is ready.');

  const outputLeaf = makeInput({ key: 'symptoms', score: 90, status: 'ready' });
  assert(
    !isDotScoreEligible(outputLeaf),
    'Output-contribution leaf (symptoms) must never enter aggregation.',
  );

  const group = makeInput({ key: 'health_data', score: 80, status: 'ready' });
  assert(!isDotScoreEligible(group), 'Group nodes must never be eligible.');

  // --- Effective weight ----------------------------------------------------
  // sleep_duration baseWeight = 2.0. With coverage=0.5, freshness=1, confidence=medium (0.8):
  //   2.0 * 0.5 * 1 * 0.8 = 0.8
  const weighted = makeInput({
    key: 'sleep_duration',
    score: 80,
    coverage: 0.5,
    freshness: 1,
    confidence: 'medium',
  });
  assert(approx(effectiveWeight(weighted), 0.8), 'effectiveWeight formula mismatch.');

  // --- Empty / no-data case -----------------------------------------------
  const empty = aggregateOneL1feScore([]);
  assert(empty.score === null, 'Empty input should produce null score.');
  assert(empty.eligibleDotCount === 0, 'Empty input should have zero eligible dots.');
  assert(empty.coverageRatio === 0, 'Empty input should have 0 coverage.');

  // --- All planned_locked → no score, no penalty --------------------------
  const allLocked = aggregateOneL1feScore([
    makeInput({ key: 'mood', score: null, status: 'planned_locked' }),
    makeInput({ key: 'mental_load', score: null, status: 'planned_locked' }),
    makeInput({ key: 'vo2_max', score: null, status: 'planned_locked' }),
  ]);
  assert(allLocked.score === null, 'All planned_locked input should yield null score.');
  assert(
    allLocked.activeLeafTotal === 0,
    'planned_locked leaves must not count toward activeLeafTotal.',
  );

  // --- Single active leaf with data ---------------------------------------
  // Only sleep_duration (baseWeight 2, score 80, all 1s, high):
  //   effectiveWeight = 2 * 1 * 1 * 1 = 2
  //   weightedSum     = 80 * 2 = 160
  //   score           = 160 / 2 = 80
  const onlySleep = aggregateOneL1feScore([
    makeInput({ key: 'sleep_duration', score: 80 }),
  ]);
  assert(onlySleep.score !== null && approx(onlySleep.score, 80), 'Single leaf aggregate mismatch.');
  assert(onlySleep.eligibleDotCount === 1, 'Single leaf aggregate should count 1 eligible dot.');

  // --- Mixed: planned_locked does not pull the score down ----------------
  const mixed = aggregateOneL1feScore([
    makeInput({ key: 'sleep_duration', score: 80 }),
    makeInput({ key: 'mood', score: null, status: 'planned_locked' }),
    makeInput({ key: 'mental_load', score: null, status: 'planned_locked' }),
  ]);
  assert(
    mixed.score !== null && approx(mixed.score, 80),
    'planned_locked dots must never dilute the score.',
  );

  // --- Weighted mean across two leaves ------------------------------------
  // sleep_duration: baseWeight 2, score 100, all 1s, high  → eff weight 2, contrib 200
  // steps:          baseWeight 1, score 40,  all 1s, high  → eff weight 1, contrib 40
  // sum = 240 / 3 = 80
  const twoLeaves = aggregateOneL1feScore([
    makeInput({ key: 'sleep_duration', score: 100 }),
    makeInput({ key: 'steps', score: 40 }),
  ]);
  assert(
    twoLeaves.score !== null && approx(twoLeaves.score, 80),
    'Two-leaf weighted mean should be 80.',
  );
  assert(approx(twoLeaves.totalEffectiveWeight, 3), 'totalEffectiveWeight should be 3.');

  // --- Coverage ratio denominator excludes planned_locked and excluded ---
  // 2 active leaves with data + 1 missing leaf + 2 locked leaves →
  // activeLeafTotal = 3, withData = 2, ratio = 2/3
  const withMissing = aggregateOneL1feScore([
    makeInput({ key: 'sleep_duration', score: 100 }),
    makeInput({ key: 'steps', score: 40 }),
    makeInput({ key: 'stress', score: null, status: 'missing' }),
    makeInput({ key: 'mood', score: null, status: 'planned_locked' }),
    makeInput({ key: 'vo2_max', score: null, status: 'planned_locked' }),
  ]);
  assert(withMissing.activeLeafTotal === 3, 'activeLeafTotal should count only active leaves.');
  assert(withMissing.activeLeafWithData === 2, 'activeLeafWithData should count ready+needs_update.');
  assert(approx(withMissing.coverageRatio, 2 / 3), 'coverageRatio should be 2/3.');
}
