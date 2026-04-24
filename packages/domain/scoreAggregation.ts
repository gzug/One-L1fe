// One L1fe score aggregation.
//
// Formula (per the Dot/Score architecture):
//   effectiveWeight = baseWeight × coverage × freshness × confidenceModifier
//   oneLIfeScore    = Σ(dotScore × effectiveWeight) / Σ(effectiveWeight)
//
// Only 'ready' and 'needs_update' dots with a non-null score enter aggregation.
// 'planned_locked', 'excluded', and 'missing' dots are skipped — never penalized.
//
// DECISION: confidence modifier table is low=0.6 / medium=0.8 / high=1.0 —
// mirrors the existing biomarker evidenceConfidenceModifier 0.3–1.0 range
// but compressed: dot-level confidence is derived from adapter heuristics,
// not from clinical evidence grade, so we don't need the full 0.3 floor.
// DECISION: aggregation is pure — input arrives as DotScoreInput[] already
// built by adapters. The domain package does not reach out to data sources.

import type {
  DotConfidence,
  DotDefinition,
  DotScore,
  DotStatus,
} from './dots.ts';

export interface DotScoreInput {
  definition: DotDefinition;
  runtime: DotScore;
}

export const CONFIDENCE_MODIFIER: Record<DotConfidence, number> = {
  low: 0.6,
  medium: 0.8,
  high: 1.0,
};

const SCORE_ELIGIBLE_STATUSES: ReadonlyArray<DotStatus> = ['ready', 'needs_update'];

export function isDotScoreEligible(input: DotScoreInput): boolean {
  if (!input.definition.isLeaf) return false;
  if (input.definition.scoreContribution !== 'input') return false;
  if (!SCORE_ELIGIBLE_STATUSES.includes(input.runtime.status)) return false;
  if (input.runtime.score === null) return false;
  return true;
}

export function effectiveWeight(input: DotScoreInput): number {
  const { definition, runtime } = input;
  return (
    definition.baseWeight *
    runtime.coverage *
    runtime.freshness *
    CONFIDENCE_MODIFIER[runtime.confidence]
  );
}

export interface OneL1feAggregateResult {
  /** Weighted mean of eligible dot scores. null = no eligible dots / zero weight. */
  score: number | null;
  totalEffectiveWeight: number;
  eligibleDotCount: number;
  /** Ratio of active input leaves with usable data to all active input leaves. */
  coverageRatio: number;
  /** Total active (non-planned_locked, non-excluded) input leaves in the catalog. */
  activeLeafTotal: number;
  /** Count of active input leaves that had usable data and were included. */
  activeLeafWithData: number;
}

export function aggregateOneL1feScore(
  dots: ReadonlyArray<DotScoreInput>,
): OneL1feAggregateResult {
  const coverage = computeActiveLeafCoverage(dots);

  const eligible = dots.filter(isDotScoreEligible);
  if (eligible.length === 0) {
    return {
      score: null,
      totalEffectiveWeight: 0,
      eligibleDotCount: 0,
      coverageRatio: coverage.ratio,
      activeLeafTotal: coverage.total,
      activeLeafWithData: coverage.withData,
    };
  }

  let weightedSum = 0;
  let totalWeight = 0;
  for (const dot of eligible) {
    const w = effectiveWeight(dot);
    if (w === 0 || dot.runtime.score === null) continue;
    weightedSum += dot.runtime.score * w;
    totalWeight += w;
  }

  const score = totalWeight > 0 ? weightedSum / totalWeight : null;

  return {
    score,
    totalEffectiveWeight: totalWeight,
    eligibleDotCount: eligible.length,
    coverageRatio: coverage.ratio,
    activeLeafTotal: coverage.total,
    activeLeafWithData: coverage.withData,
  };
}

interface ActiveLeafCoverage {
  total: number;
  withData: number;
  ratio: number;
}

function computeActiveLeafCoverage(
  dots: ReadonlyArray<DotScoreInput>,
): ActiveLeafCoverage {
  // Denominator: input leaves that are neither planned_locked nor excluded.
  // Numerator:   the subset of those with DotStatus ready | needs_update.
  let total = 0;
  let withData = 0;
  for (const dot of dots) {
    if (!dot.definition.isLeaf) continue;
    if (dot.definition.scoreContribution !== 'input') continue;
    const { status } = dot.runtime;
    if (status === 'planned_locked' || status === 'excluded') continue;
    total += 1;
    if (SCORE_ELIGIBLE_STATUSES.includes(status)) {
      withData += 1;
    }
  }

  const ratio = total > 0 ? withData / total : 0;
  return { total, withData, ratio };
}
