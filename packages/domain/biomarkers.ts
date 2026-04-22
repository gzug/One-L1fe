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

/**
 * scoringClass: classifies the causal/evidential role of the marker in the scoring engine.
 * - causal-primary: direct causal evidence from Mendelian randomization or large RCTs (ApoB, HbA1c)
 * - supporting-actionable: strong observational + mechanistic support, actionable (LDL, Glucose, CRP, Triglycerides)
 * - contextual-low-certainty: limited or context-dependent evidence; contributes with reduced weight (DAO, Lp(a), VitD, Ferritin, B12, Mg)
 *
 * evidenceConfidenceModifier: multiplied into priorityWeight at score time (0.3–1.0).
 * Allows markers to remain in the system at reduced contribution without changing their priorityWeight.
 * Effective score = baseSeverity * priorityWeight * evidenceConfidenceModifier
 */
export type ScoringClass = 'causal-primary' | 'supporting-actionable' | 'contextual-low-certainty';

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
  /** Multiplied into priorityWeight at score time. Range 0.3–1.0. Default 1.0. */
  evidenceConfidenceModifier: number;
  /** Causal/evidential classification used by the scoring engine. */
  scoringClass: ScoringClass;
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
    evidenceConfidenceModifier: 1.0,
    scoringClass: 'causal-primary',
    evidenceLevel: EvidenceLevel.Primary,
    description: 'Primary lipid-risk marker. Causal cardiovascular signal via Mendelian randomization. Top-level scoring driver.',
    // Synced to thresholds.ts evaluateApoB optimalMax: 80. Attia target for primordial prevention: ≤60.
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 80 },
  },
  {
    key: 'ldl',
    displayName: 'LDL',
    category: BiomarkerCategory.Core,
    unit: 'mg/dL',
    priorityWeight: 1,
    evidenceConfidenceModifier: 1.0,
    scoringClass: 'supporting-actionable',
    evidenceLevel: EvidenceLevel.Primary,
    description: 'Core lipid marker tracked alongside ApoB. Acts as fallback primary lipid driver when ApoB is absent.',
    // Synced to thresholds.ts evaluateLDL optimalMax: 70.
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 70 },
  },
  {
    key: 'triglycerides',
    displayName: 'Triglycerides',
    category: BiomarkerCategory.Core,
    unit: 'mg/dL',
    priorityWeight: 1,
    evidenceConfidenceModifier: 1.0,
    scoringClass: 'supporting-actionable',
    evidenceLevel: EvidenceLevel.Secondary,
    description: 'Core metabolic and lipid-context marker. Tightened to 100 mg/dL optimal per Medicine 3.0 framework.',
    // Tightened from 150 → 100 per Attia/Medicine 3.0. Synced to new evaluateTriglycerides() in thresholds.ts.
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 100 },
  },
  {
    key: 'lpa',
    displayName: 'Lp(a)',
    category: BiomarkerCategory.Core,
    unit: 'mg/dL',
    priorityWeight: 1,
    evidenceConfidenceModifier: 0.7,
    scoringClass: 'contextual-low-certainty',
    evidenceLevel: EvidenceLevel.Secondary,
    description: 'Inherited cardiovascular-risk marker. Bounded modifier only — no intervention changes Lp(a) meaningfully in V1.',
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 30 },
  },
  {
    key: 'hba1c',
    displayName: 'HbA1c',
    category: BiomarkerCategory.Core,
    unit: '%',
    priorityWeight: 2,
    evidenceConfidenceModifier: 1.0,
    scoringClass: 'causal-primary',
    evidenceLevel: EvidenceLevel.Primary,
    description: 'Long-range glucose marker. Primary metabolic trend signal. Causal link to T2D and cardiovascular outcomes.',
    // Tightened from 5.7 → 5.3 per Attia optimal target. Synced to thresholds.ts evaluateHbA1c.
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 5.3 },
  },
  {
    key: 'glucose',
    displayName: 'Glucose',
    category: BiomarkerCategory.Core,
    unit: 'mg/dL',
    priorityWeight: 1,
    evidenceConfidenceModifier: 1.0,
    scoringClass: 'supporting-actionable',
    evidenceLevel: EvidenceLevel.Primary,
    description: 'Core fasting glucose marker. Tightened to 85 mg/dL optimal per Medicine 3.0 pre-diabetic early-warning threshold.',
    // Tightened from 100 → 85 per Attia/Medicine 3.0. Synced to thresholds.ts evaluateGlucose.
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 85 },
  },
  {
    key: 'crp',
    displayName: 'CRP',
    category: BiomarkerCategory.Core,
    unit: 'mg/L',
    priorityWeight: 1.5,
    evidenceConfidenceModifier: 0.8,
    scoringClass: 'supporting-actionable',
    evidenceLevel: EvidenceLevel.Secondary,
    description: 'Inflammation marker. Tightened to 1 mg/dL optimal (hsCRP standard). Confidence modifier applied due to acute-context sensitivity.',
    // Tightened from 3 → 1 per hsCRP preventive standard. Synced to thresholds.ts evaluateCRP.
    referenceRange: { kind: ReferenceRangeKind.UpperBound, optimalMax: 1 },
  },
  {
    key: 'vitamin_d',
    displayName: 'Vitamin D',
    category: BiomarkerCategory.Supporting,
    unit: 'ng/mL',
    priorityWeight: 1,
    evidenceConfidenceModifier: 0.8,
    scoringClass: 'contextual-low-certainty',
    evidenceLevel: EvidenceLevel.Secondary,
    description: 'Supporting nutrient-status marker. Attia targets 40–60 ng/mL. Raised from 20 → 30 optimal minimum.',
    // Raised from 20 → 30 per Attia (targets 40–60). Synced to thresholds.ts evaluateVitaminD optimalMin: 40.
    referenceRange: { kind: ReferenceRangeKind.LowerBound, optimalMin: 30 },
  },
  {
    key: 'ferritin',
    displayName: 'Ferritin',
    category: BiomarkerCategory.Supporting,
    unit: 'ng/mL',
    priorityWeight: 1,
    evidenceConfidenceModifier: 0.8,
    scoringClass: 'contextual-low-certainty',
    evidenceLevel: EvidenceLevel.Primary,
    description: 'Supporting iron-status context marker. Context-gated interpretation for elevated values.',
    referenceRange: { kind: ReferenceRangeKind.LowerBound, optimalMin: 30 },
  },
  {
    key: 'b12',
    displayName: 'B12',
    category: BiomarkerCategory.Supporting,
    unit: 'pg/mL',
    priorityWeight: 1,
    evidenceConfidenceModifier: 0.8,
    scoringClass: 'contextual-low-certainty',
    evidenceLevel: EvidenceLevel.Primary,
    description: 'Supporting nutrient marker for context, not a diagnostic endpoint in V1.',
    referenceRange: { kind: ReferenceRangeKind.LowerBound, optimalMin: 400 },
  },
  {
    key: 'magnesium',
    displayName: 'Magnesium',
    category: BiomarkerCategory.Supporting,
    unit: 'mg/dL',
    priorityWeight: 1,
    evidenceConfidenceModifier: 0.7,
    scoringClass: 'contextual-low-certainty',
    evidenceLevel: EvidenceLevel.Secondary,
    description: 'Supporting mineral-status marker. Serum magnesium is a weak proxy for intracellular status.',
    referenceRange: { kind: ReferenceRangeKind.LowerBound, optimalMin: 1.8 },
  },
  {
    key: 'dao',
    displayName: 'DAO',
    category: BiomarkerCategory.Contextual,
    unit: 'U/mL',
    priorityWeight: 1,
    evidenceConfidenceModifier: 0.3,
    scoringClass: 'contextual-low-certainty',
    evidenceLevel: EvidenceLevel.Experimental,
    description: 'Interpretation-sensitive contextual marker. Experimental evidence only. Effective score contribution suppressed via 0.3 confidence modifier.',
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

  // Apply evidenceConfidenceModifier to suppress low-certainty markers proportionally.
  return baseSeverity[status] * biomarker.priorityWeight * biomarker.evidenceConfidenceModifier;
}

export function aggregateTotalPriorityScore(
  biomarkerValues: Record<string, number | null | undefined>,
): number {
  return biomarkers.reduce((total, biomarker) => {
    const value = biomarkerValues[biomarker.key];
    return total + calculateWeightedScore(biomarker, value);
  }, 0);
}

export function aggregateTotalPriorityScoreWithEvidence(
  biomarkerValues: Record<string, number | null | undefined>,
  anchors: Array<{ sourceId: string; tier: number; bucket: string }>,
): {
  score: number;
  product_evidence_class: 'strong' | 'moderate' | 'limited' | 'unanchored';
  anchor_count: number;
} {
  if (anchors.length === 0) {
    throw new Error('Priority score cannot be calculated without evidence anchors');
  }

  const rawScore = biomarkers.reduce((total, biomarker) => {
    const value = biomarkerValues[biomarker.key];
    return total + calculateWeightedScore(biomarker, value);
  }, 0);

  const tier1Anchors = anchors.filter((a) => a.tier === 1);
  const strongBucketCount = anchors.filter((a) => a.bucket === 'strong').length;

  let classification: 'strong' | 'moderate' | 'limited' | 'unanchored';
  if (tier1Anchors.length > 0 && strongBucketCount >= 2) {
    classification = 'strong';
  } else if (tier1Anchors.length > 0 && strongBucketCount >= 1) {
    classification = 'moderate';
  } else if (strongBucketCount >= 1) {
    classification = 'moderate';
  } else {
    classification = 'limited';
  }

  return {
    score: rawScore,
    product_evidence_class: classification,
    anchor_count: anchors.length,
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
