/**
 * biomarkers.ts — Canonical biomarker registry and scoring primitives.
 *
 * IMPORTANT: Two evaluation paths exist in this codebase:
 *
 *   1. evaluateByThreshold() in thresholds.ts
 *      Used by the minimum-slice evaluation pipeline (evaluateMinimumSlice).
 *      Implements precise, preventive-grade per-unit thresholds.
 *      This is the CANONICAL path for scoring and recommendations.
 *
 *   2. calculateCanonicalStatus() in this file
 *      Used for quick ratio-based estimates and aggregate scoring.
 *      Based on referenceRange.optimalMax/Min below.
 *      Do NOT use this path for primary scoring logic.
 *
 * The referenceRange values below MUST stay aligned with the threshold
 * midpoints used in thresholds.ts to avoid silent inconsistencies.
 * When adding or changing thresholds in thresholds.ts, update the
 * corresponding referenceRange here as a cross-reference.
 */

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
    // Aligned with thresholds.ts evaluateApoB optimalMax (80 mg/dL preventive target).
    // The canonical evaluation path uses evaluateByThreshold(), not this range.
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 80 },
  },
  {
    key: 'ldl',
    displayName: 'LDL',
    category: BiomarkerCategory.Core,
    unit: 'mg/dL',
    priorityWeight: 1,
    evidenceLevel: EvidenceLevel.Primary,
    description: 'Core lipid marker. Secondary to ApoB per the lipid hierarchy policy.',
    // Aligned with thresholds.ts evaluateLDL optimalMax (70 mg/dL preventive target).
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 70 },
  },
  {
    key: 'triglycerides',
    displayName: 'Triglycerides',
    category: BiomarkerCategory.Core,
    unit: 'mg/dL',
    priorityWeight: 1,
    evidenceLevel: EvidenceLevel.Secondary,
    description: 'Core metabolic and lipid-context marker in the MVP panel.',
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 100 },
  },
  {
    key: 'lpa',
    displayName: 'Lp(a)',
    category: BiomarkerCategory.Core,
    unit: 'mg/dL',
    priorityWeight: 1,
    evidenceLevel: EvidenceLevel.Secondary,
    description: 'Inherited cardiovascular-risk marker. Treated as a bounded modifier, not a recurring core score driver.',
    // Aligned with thresholds.ts evaluateLpa optimalMax mg/dL path (30 mg/dL).
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
    // Aligned with thresholds.ts evaluateHbA1c optimalMax (5.3%). Preventive-grade threshold.
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 5.3 },
  },
  {
    key: 'glucose',
    displayName: 'Glucose',
    category: BiomarkerCategory.Core,
    unit: 'mg/dL',
    priorityWeight: 1,
    evidenceLevel: EvidenceLevel.Primary,
    description: 'Core glucose marker for the initial biomarker workflow.',
    // Aligned with thresholds.ts evaluateGlucose optimalMax mg/dL path (85 mg/dL fasting estimate).
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 85 },
  },
  {
    key: 'crp',
    displayName: 'CRP',
    // Note: CRP is registered as Core here for weight purposes, but is treated as a
    // bounded optional marker in the minimum-slice evaluation pipeline. It does NOT
    // behave as a primary core score driver. See minimumSlice.ts and v1.ts.
    category: BiomarkerCategory.Core,
    unit: 'mg/L',
    priorityWeight: 1.5,
    evidenceLevel: EvidenceLevel.Secondary,
    description: 'Inflammation-related marker. Context-sensitive and assay-dependent. Bounded optional in minimum-slice.',
    // Aligned with thresholds.ts evaluateCRP optimalMax (1 mg/L hs-CRP target).
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 1 },
  },
  {
    key: 'vitamin_d',
    displayName: 'Vitamin D',
    category: BiomarkerCategory.Supporting,
    unit: 'ng/mL',
    priorityWeight: 1,
    evidenceLevel: EvidenceLevel.Secondary,
    description: 'Supporting nutrient-status marker used for broader context.',
    // Aligned with thresholds.ts evaluateVitaminD optimalMin ng/mL path (30 ng/mL).
    referenceRange: { kind: ReferenceRangeKind.LowerBound, optimalMin: 30 },
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

/**
 * Quick ratio-based status estimate using biomarker.referenceRange.
 * For primary scoring, use evaluateByThreshold() in thresholds.ts instead.
 */
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
