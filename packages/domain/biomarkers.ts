import {
  BucketAndReason,
  classifyEvidenceClass,
  emptyBucketAndReason,
  loadEvidenceForRules,
  PriorityBucket,
  PriorityPillar,
  PriorityScoreResult,
} from './scoring.ts';
import { buildTrendSkeleton, TrendObservation } from './trends.ts';
import { FEATURE_FLAG_TREND_SKELETON_READONLY } from './flags.ts';

export enum CanonicalStatus {
  Optimal = 'optimal',
  Good = 'good',
  Borderline = 'borderline',
  High = 'high',
  Critical = 'critical',
  Missing = 'missing',
}

export enum BiomarkerCategory {
  Core = 'core',
  Supporting = 'supporting',
  Contextual = 'contextual',
}

export enum EvidenceLevel {
  Primary = 'primary',
  Secondary = 'secondary',
  Experimental = 'experimental',
}

export enum ReferenceRangeKind {
  UpperBound = 'upper_bound',
  LowerBound = 'lower_bound',
  Range = 'range',
}

export interface ReferenceRange {
  kind: ReferenceRangeKind;
  optimalMin?: number;
  optimalMax?: number;
  notes?: string;
}

export interface BiomarkerDefinition {
  key: string;
  displayName: string;
  category: BiomarkerCategory;
  unit: string;
  priorityWeight: number;
  evidenceLevel: EvidenceLevel;
  description: string;
  referenceRange: ReferenceRange;
}

export const biomarkers: BiomarkerDefinition[] = [
  {
    key: 'apob',
    displayName: 'ApoB',
    category: BiomarkerCategory.Core,
    unit: 'mg/dL',
    priorityWeight: 3,
    evidenceLevel: EvidenceLevel.Primary,
    description: 'Primary lipid-risk marker used as a top-level cardiovascular signal in the MVP.',
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 130 },
  },
  {
    key: 'ldl',
    displayName: 'LDL',
    category: BiomarkerCategory.Core,
    unit: 'mg/dL',
    priorityWeight: 1,
    evidenceLevel: EvidenceLevel.Primary,
    description: 'Core lipid marker tracked alongside ApoB and triglycerides.',
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 100 },
  },
  {
    key: 'triglycerides',
    displayName: 'Triglycerides',
    category: BiomarkerCategory.Core,
    unit: 'mg/dL',
    priorityWeight: 1,
    evidenceLevel: EvidenceLevel.Secondary,
    description: 'Core metabolic and lipid-context marker in the MVP panel.',
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 150 },
  },
  {
    key: 'lpa',
    displayName: 'Lp(a)',
    category: BiomarkerCategory.Core,
    unit: 'mg/dL',
    priorityWeight: 1,
    evidenceLevel: EvidenceLevel.Secondary,
    description: 'Inherited cardiovascular-risk marker tracked as part of the core set.',
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 30 },
  },
  {
    key: 'hba1c',
    displayName: 'HbA1c',
    category: BiomarkerCategory.Core,
    unit: '%',
    priorityWeight: 2,
    evidenceLevel: EvidenceLevel.Primary,
    description: 'Long-range glucose marker used as a primary metabolic trend signal.',
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 5.7 },
  },
  {
    key: 'glucose',
    displayName: 'Glucose',
    category: BiomarkerCategory.Core,
    unit: 'mg/dL',
    priorityWeight: 1,
    evidenceLevel: EvidenceLevel.Primary,
    description: 'Core glucose marker for the initial biomarker workflow.',
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 100 },
  },
  {
    key: 'crp',
    displayName: 'CRP',
    category: BiomarkerCategory.Core,
    unit: 'mg/L',
    priorityWeight: 1.5,
    evidenceLevel: EvidenceLevel.Secondary,
    description: 'Inflammation-related marker included in the MVP set.',
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 3 },
  },
  {
    key: 'vitamin_d',
    displayName: 'Vitamin D',
    category: BiomarkerCategory.Supporting,
    unit: 'ng/mL',
    priorityWeight: 1,
    evidenceLevel: EvidenceLevel.Secondary,
    description: 'Supporting nutrient-status marker used for broader context.',
    referenceRange: { kind: ReferenceRangeKind.LowerBound, optimalMin: 20 },
  },
  {
    key: 'ferritin',
    displayName: 'Ferritin',
    category: BiomarkerCategory.Supporting,
    unit: 'ng/mL',
    priorityWeight: 1,
    evidenceLevel: EvidenceLevel.Primary,
    description: 'Supporting iron-status context marker.',
    referenceRange: { kind: ReferenceRangeKind.LowerBound, optimalMin: 30 },
  },
  {
    key: 'b12',
    displayName: 'B12',
    category: BiomarkerCategory.Supporting,
    unit: 'pg/mL',
    priorityWeight: 1,
    evidenceLevel: EvidenceLevel.Primary,
    description: 'Supporting nutrient marker used for context, not as a diagnostic endpoint.',
    referenceRange: { kind: ReferenceRangeKind.LowerBound, optimalMin: 400 },
  },
  {
    key: 'magnesium',
    displayName: 'Magnesium',
    category: BiomarkerCategory.Supporting,
    unit: 'mg/dL',
    priorityWeight: 1,
    evidenceLevel: EvidenceLevel.Secondary,
    description: 'Supporting mineral-status marker.',
    referenceRange: { kind: ReferenceRangeKind.LowerBound, optimalMin: 1.8 },
  },
  {
    key: 'dao',
    displayName: 'DAO',
    category: BiomarkerCategory.Contextual,
    unit: 'U/mL',
    priorityWeight: 1,
    evidenceLevel: EvidenceLevel.Experimental,
    description: 'Interpretation-sensitive contextual marker. Keep optional and bounded.',
    referenceRange: { kind: ReferenceRangeKind.LowerBound, optimalMin: 10 },
  },
];

export const biomarkerRegistry: Record<string, BiomarkerDefinition> = Object.fromEntries(
  biomarkers.map((biomarker) => [biomarker.key, biomarker]),
);

export function getBiomarkerDefinition(key: string): BiomarkerDefinition | undefined {
  return biomarkerRegistry[key.toLowerCase()];
}

function ratioFromUpperBound(value: number, max: number): number {
  if (max <= 0) return 0;
  return value / max;
}

function ratioFromLowerBound(value: number, min: number): number {
  if (value <= 0) return Number.POSITIVE_INFINITY;
  return min / value;
}

function statusFromRatio(ratio: number): CanonicalStatus {
  if (!Number.isFinite(ratio)) return CanonicalStatus.Critical;
  if (ratio <= 1) return CanonicalStatus.Optimal;
  if (ratio <= 1.1) return CanonicalStatus.Good;
  if (ratio <= 1.25) return CanonicalStatus.Borderline;
  if (ratio <= 1.5) return CanonicalStatus.High;
  return CanonicalStatus.Critical;
}

export function calculateCanonicalStatus(
  biomarker: BiomarkerDefinition,
  value?: number | null,
): CanonicalStatus {
  if (value == null || Number.isNaN(value)) {
    return CanonicalStatus.Missing;
  }

  const { referenceRange } = biomarker;

  switch (referenceRange.kind) {
    case ReferenceRangeKind.UpperBound:
      return statusFromRatio(ratioFromUpperBound(value, referenceRange.optimalMax ?? 0));
    case ReferenceRangeKind.LowerBound:
      return statusFromRatio(ratioFromLowerBound(value, referenceRange.optimalMin ?? 0));
    case ReferenceRangeKind.Range: {
      const min = referenceRange.optimalMin ?? Number.NEGATIVE_INFINITY;
      const max = referenceRange.optimalMax ?? Number.POSITIVE_INFINITY;
      if (value >= min && value <= max) return CanonicalStatus.Optimal;
      const distance = value < min ? min - value : value - max;
      const anchor = value < min ? Math.max(min, 1) : Math.max(max, 1);
      return statusFromRatio(1 + distance / anchor);
    }
    default:
      return CanonicalStatus.Missing;
  }
}

export function mapPriorityScore(score: number): number {
  if (score <= 0) return 0;
  if (score <= 1) return 1;
  if (score <= 2) return 2;
  if (score <= 3) return 3;
  return 4;
}

export function calculateWeightedScore(
  biomarker: BiomarkerDefinition,
  value?: number | null,
): number {
  const status = calculateCanonicalStatus(biomarker, value);
  const baseSeverity: Record<CanonicalStatus, number> = {
    [CanonicalStatus.Optimal]: 0,
    [CanonicalStatus.Good]: 1,
    [CanonicalStatus.Borderline]: 2,
    [CanonicalStatus.High]: 3,
    [CanonicalStatus.Critical]: 4,
    [CanonicalStatus.Missing]: 0,
  };

  return baseSeverity[status] * biomarker.priorityWeight;
}

export function aggregateTotalPriorityScore(
  biomarkerValues: Record<string, number | null | undefined>,
): number {
  return biomarkers.reduce((total, biomarker) => {
    const value = biomarkerValues[biomarker.key];
    return total + calculateWeightedScore(biomarker, value);
  }, 0);
}

export interface AggregatePriorityScoreWithEvidenceInput {
  biomarkerValues: Record<string, number | null | undefined>;
  pillarByBiomarker: Partial<Record<string, PriorityPillar>>;
  ruleIds: string[];
  lipidHierarchyDecision?: 'apob_primary' | 'ldl_primary' | 'none' | null;
  observations?: Partial<Record<string, TrendObservation[]>>;
  trendWindowDays?: number;
}

function toPriorityBucket(score: number): PriorityBucket {
  return mapPriorityScore(score) as PriorityBucket;
}

function selectPillarScore(
  pillar: PriorityPillar,
  biomarkerValues: Record<string, number | null | undefined>,
  pillarByBiomarker: Partial<Record<string, PriorityPillar>>,
): BucketAndReason {
  const candidates = biomarkers
    .filter((biomarker) => {
      const value = biomarkerValues[biomarker.key];
      if (value == null || Number.isNaN(value)) {
        return false;
      }

      const assignedPillar = pillarByBiomarker[biomarker.key];
      if (!assignedPillar) {
        throw new Error(`Missing pillar assignment for biomarker key: ${biomarker.key}`);
      }

      return assignedPillar === pillar;
    })
    .map((biomarker) => ({
      markerKey: biomarker.key,
      weightedScore: calculateWeightedScore(biomarker, biomarkerValues[biomarker.key]),
    }))
    .sort((left, right) => right.weightedScore - left.weightedScore);

  const strongest = candidates[0];
  if (!strongest) {
    return emptyBucketAndReason();
  }

  return {
    bucket: toPriorityBucket(strongest.weightedScore),
    reason: 'HIGHEST_WEIGHTED_MARKER',
    markerKey: strongest.markerKey,
    weightedScore: strongest.weightedScore,
  };
}

export function aggregateTotalPriorityScoreWithEvidence(
  input: AggregatePriorityScoreWithEvidenceInput,
): PriorityScoreResult {
  const rawScore = aggregateTotalPriorityScore(input.biomarkerValues);
  const anchors = loadEvidenceForRules(input.ruleIds);
  const evidenceClass = classifyEvidenceClass(anchors);

  const pillarScores: PriorityScoreResult['pillarScores'] = {
    cardiovascular: selectPillarScore('cardiovascular', input.biomarkerValues, input.pillarByBiomarker),
    metabolic: selectPillarScore('metabolic', input.biomarkerValues, input.pillarByBiomarker),
    inflammation: selectPillarScore('inflammation', input.biomarkerValues, input.pillarByBiomarker),
    nutrientContext: selectPillarScore('nutrientContext', input.biomarkerValues, input.pillarByBiomarker),
  };

  if (input.lipidHierarchyDecision === 'apob_primary') {
    const apobDefinition = getBiomarkerDefinition('apob');
    const ldlDefinition = getBiomarkerDefinition('ldl');
    const apobStatus = apobDefinition ? calculateCanonicalStatus(apobDefinition, input.biomarkerValues.apob) : CanonicalStatus.Missing;
    const ldlWeightedScore = ldlDefinition ? calculateWeightedScore(ldlDefinition, input.biomarkerValues.ldl) : 0;
    const ldlBucket = toPriorityBucket(ldlWeightedScore);

    if (apobStatus === CanonicalStatus.Optimal || apobStatus === CanonicalStatus.Good) {
      pillarScores.cardiovascular = {
        bucket: Math.max(0, ldlBucket - 1) as PriorityBucket,
        reason: 'CLAMPED_BY_APOB_PRIMARY',
        markerKey: 'ldl',
        weightedScore: ldlWeightedScore,
      };
    }
  }

  let bucket = Math.max(
    pillarScores.cardiovascular.bucket,
    pillarScores.metabolic.bucket,
    pillarScores.inflammation.bucket,
    pillarScores.nutrientContext.bucket,
  ) as PriorityBucket;

  if (evidenceClass === 'unanchored') {
    bucket = 0;
    pillarScores.cardiovascular = emptyBucketAndReason('NOT_EVIDENCE_ANCHORED');
    pillarScores.metabolic = emptyBucketAndReason('NOT_EVIDENCE_ANCHORED');
    pillarScores.inflammation = emptyBucketAndReason('NOT_EVIDENCE_ANCHORED');
    pillarScores.nutrientContext = emptyBucketAndReason('NOT_EVIDENCE_ANCHORED');
  }

  const trendEnabled = FEATURE_FLAG_TREND_SKELETON_READONLY && input.observations !== undefined;
  const trendMarker = trendEnabled
    ? (Object.entries(pillarScores)
        .reduce<Array<{ markerKey: string; weightedScore: number }>>((acc, [_, bucket]) => {
          if (bucket.markerKey) {
            acc.push({ markerKey: bucket.markerKey, weightedScore: bucket.weightedScore });
          }
          return acc;
        }, [])
        .sort((left, right) => right.weightedScore - left.weightedScore)[0]?.markerKey ?? null)
    : null;

  return {
    rawScore,
    bucket,
    pillarScores,
    evidenceClass,
    anchors,
    trendSkeleton:
      trendEnabled && trendMarker !== null
        ? buildTrendSkeleton(
            input.observations?.[trendMarker] ?? [],
            input.trendWindowDays ?? 30,
            trendMarker,
          )
        : null,
  };
}

export function determinePrimaryFocus(
  biomarkerValues: Record<string, number | null | undefined>,
): BiomarkerDefinition | undefined {
  const ranked = biomarkers
    .map((biomarker) => ({
      biomarker,
      score: calculateWeightedScore(biomarker, biomarkerValues[biomarker.key]),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.score ? ranked[0].biomarker : undefined;
}
