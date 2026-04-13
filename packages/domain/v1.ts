import { BiomarkerDefinition, biomarkers, CanonicalStatus, getBiomarkerDefinition } from './biomarkers.ts';

export type BiomarkerKey = BiomarkerDefinition['key'];

export enum MarkerRole {
  Core = 'core',
  Supporting = 'supporting',
  Contextual = 'contextual',
  Weekly = 'weekly',
  Coverage = 'coverage',
}

export enum ScoreRole {
  Primary = 'primary',
  Fallback = 'fallback',
  BoundedModifier = 'bounded_modifier',
  Excluded = 'excluded',
}

export enum InterpretabilityState {
  Interpretable = 'interpretable',
  InterpretationLimited = 'interpretation_limited',
  Missing = 'missing',
}

export enum FreshnessState {
  Current = 'current',
  Recent = 'recent',
  Aging = 'aging',
  Stale = 'stale',
  Unknown = 'unknown',
}

export enum RecommendationEligibilityClass {
  Full = 'full',
  Bounded = 'bounded',
  CoverageOnly = 'coverage_only',
  Blocked = 'blocked',
}

export interface MarkerRuntimeConfig {
  key: BiomarkerKey;
  markerRole: MarkerRole;
  scoreRole: ScoreRole;
  allowedUnits: string[];
  requiresAssay: boolean;
  allowedRecommendationClass: RecommendationEligibilityClass;
  notes?: string;
}

export interface InterpretationInput {
  marker: BiomarkerKey;
  value?: number | null;
  unit?: string | null;
  assayType?: string | null;
  collectedAt?: string | Date | null;
  fastingContext?: boolean | null;
  acuteContext?: boolean | null;
}

export interface InterpretabilityAssessment {
  marker: BiomarkerKey;
  state: InterpretabilityState;
  freshness: FreshnessState;
  blockingReason?: string;
  scoreBlocked: boolean;
}

export interface LipidHierarchyDecision {
  primaryDriver: 'apob' | 'ldl' | null;
  includeApoBScore: boolean;
  includeLDLScore: boolean;
  notes: string[];
  ruleIds: string[];
}

export const V1_RULE_VERSION = 'v1-draft-implementation-bridge';

export const markerRuntimeConfigs: Record<BiomarkerKey, MarkerRuntimeConfig> = {
  apob: {
    key: 'apob',
    markerRole: MarkerRole.Core,
    scoreRole: ScoreRole.Primary,
    allowedUnits: ['mg/dL'],
    requiresAssay: false,
    allowedRecommendationClass: RecommendationEligibilityClass.Full,
  },
  ldl: {
    key: 'ldl',
    markerRole: MarkerRole.Core,
    scoreRole: ScoreRole.Fallback,
    allowedUnits: ['mg/dL'],
    requiresAssay: false,
    allowedRecommendationClass: RecommendationEligibilityClass.Full,
    notes: 'Acts as fallback or secondary lens only when ApoB is present.',
  },
  triglycerides: {
    key: 'triglycerides',
    markerRole: MarkerRole.Core,
    scoreRole: ScoreRole.Primary,
    allowedUnits: ['mg/dL'],
    requiresAssay: false,
    allowedRecommendationClass: RecommendationEligibilityClass.Full,
  },
  lpa: {
    key: 'lpa',
    markerRole: MarkerRole.Supporting,
    scoreRole: ScoreRole.BoundedModifier,
    allowedUnits: ['mg/dL', 'nmol/L'],
    requiresAssay: false,
    allowedRecommendationClass: RecommendationEligibilityClass.Bounded,
    notes: 'Bounded modifier only. Unit-specific interpretation required.',
  },
  hba1c: {
    key: 'hba1c',
    markerRole: MarkerRole.Core,
    scoreRole: ScoreRole.Primary,
    allowedUnits: ['%', 'mmol/mol'],
    requiresAssay: false,
    allowedRecommendationClass: RecommendationEligibilityClass.Full,
  },
  glucose: {
    key: 'glucose',
    markerRole: MarkerRole.Core,
    scoreRole: ScoreRole.Primary,
    allowedUnits: ['mg/dL', 'mmol/L'],
    requiresAssay: false,
    allowedRecommendationClass: RecommendationEligibilityClass.Full,
    notes: 'Fasting context preferred but not mandatory for the minimum slice.',
  },
  crp: {
    key: 'crp',
    markerRole: MarkerRole.Supporting,
    scoreRole: ScoreRole.BoundedModifier,
    allowedUnits: ['mg/L'],
    requiresAssay: true,
    allowedRecommendationClass: RecommendationEligibilityClass.Bounded,
    notes: 'Preventive interpretation requires assay clarity and stable context.',
  },
  vitamin_d: {
    key: 'vitamin_d',
    markerRole: MarkerRole.Contextual,
    scoreRole: ScoreRole.Excluded,
    allowedUnits: ['ng/mL', 'nmol/L'],
    requiresAssay: false,
    allowedRecommendationClass: RecommendationEligibilityClass.Bounded,
  },
  ferritin: {
    key: 'ferritin',
    markerRole: MarkerRole.Contextual,
    scoreRole: ScoreRole.Excluded,
    allowedUnits: ['ng/mL', 'µg/L', 'ug/L'],
    requiresAssay: false,
    allowedRecommendationClass: RecommendationEligibilityClass.Bounded,
    notes: 'High ferritin requires context gate before escalation.',
  },
  b12: {
    key: 'b12',
    markerRole: MarkerRole.Contextual,
    scoreRole: ScoreRole.Excluded,
    allowedUnits: ['pg/mL', 'pmol/L'],
    requiresAssay: false,
    allowedRecommendationClass: RecommendationEligibilityClass.Bounded,
  },
  magnesium: {
    key: 'magnesium',
    markerRole: MarkerRole.Contextual,
    scoreRole: ScoreRole.Excluded,
    allowedUnits: ['mg/dL', 'mmol/L'],
    requiresAssay: false,
    allowedRecommendationClass: RecommendationEligibilityClass.Bounded,
  },
  dao: {
    key: 'dao',
    markerRole: MarkerRole.Contextual,
    scoreRole: ScoreRole.Excluded,
    allowedUnits: ['U/mL'],
    requiresAssay: false,
    allowedRecommendationClass: RecommendationEligibilityClass.Bounded,
    notes: 'Contextual only in V1.',
  },
};

export const statusSeverityMap: Record<CanonicalStatus, number> = {
  [CanonicalStatus.Optimal]: 0,
  [CanonicalStatus.Good]: 1,
  [CanonicalStatus.Borderline]: 2,
  [CanonicalStatus.High]: 3,
  [CanonicalStatus.Critical]: 4,
  [CanonicalStatus.Missing]: 0,
};

export function getMarkerRuntimeConfig(key: BiomarkerKey): MarkerRuntimeConfig {
  const config = markerRuntimeConfigs[key];
  if (!config) {
    throw new Error(`Missing runtime config for biomarker key: ${key}`);
  }
  return config;
}

export function getFreshnessState(
  collectedAt?: string | Date | null,
  now: Date = new Date(),
): FreshnessState {
  if (!collectedAt) return FreshnessState.Unknown;

  const collected = collectedAt instanceof Date ? collectedAt : new Date(collectedAt);
  if (Number.isNaN(collected.getTime())) return FreshnessState.Unknown;

  const ageDays = Math.floor((now.getTime() - collected.getTime()) / (1000 * 60 * 60 * 24));

  if (ageDays <= 30) return FreshnessState.Current;
  if (ageDays <= 90) return FreshnessState.Recent;
  if (ageDays <= 180) return FreshnessState.Aging;
  return FreshnessState.Stale;
}

export function assessInterpretability(
  input: InterpretationInput,
  now: Date = new Date(),
): InterpretabilityAssessment {
  const config = getMarkerRuntimeConfig(input.marker);
  const freshness = getFreshnessState(input.collectedAt, now);

  if (input.value == null || Number.isNaN(input.value)) {
    return {
      marker: input.marker,
      state: InterpretabilityState.Missing,
      freshness,
      blockingReason: 'missing_value',
      scoreBlocked: true,
    };
  }

  if (!input.unit || !config.allowedUnits.includes(input.unit)) {
    return {
      marker: input.marker,
      state: InterpretabilityState.InterpretationLimited,
      freshness,
      blockingReason: 'missing_or_unsupported_unit',
      scoreBlocked: true,
    };
  }

  if (config.requiresAssay && !input.assayType) {
    return {
      marker: input.marker,
      state: InterpretabilityState.InterpretationLimited,
      freshness,
      blockingReason: 'missing_assay',
      scoreBlocked: true,
    };
  }

  if (freshness === FreshnessState.Stale) {
    return {
      marker: input.marker,
      state: InterpretabilityState.Interpretable,
      freshness,
      blockingReason: 'stale_panel',
      scoreBlocked: true,
    };
  }

  if (input.marker === 'crp' && input.acuteContext) {
    return {
      marker: input.marker,
      state: InterpretabilityState.InterpretationLimited,
      freshness,
      blockingReason: 'acute_context',
      scoreBlocked: true,
    };
  }

  return {
    marker: input.marker,
    state: InterpretabilityState.Interpretable,
    freshness,
    scoreBlocked: false,
  };
}

export function determineLipidHierarchyDecision(params: {
  apob?: InterpretabilityAssessment | null;
  ldl?: InterpretabilityAssessment | null;
}): LipidHierarchyDecision {
  const apobInterpretable = params.apob?.state === InterpretabilityState.Interpretable && !params.apob.scoreBlocked;
  const ldlInterpretable = params.ldl?.state === InterpretabilityState.Interpretable && !params.ldl.scoreBlocked;

  if (apobInterpretable && ldlInterpretable) {
    return {
      primaryDriver: 'apob',
      includeApoBScore: true,
      includeLDLScore: false,
      notes: ['ApoB is interpretable and remains the primary lipid driver. LDL stays visible as a secondary lens only.'],
      ruleIds: ['LIP-001', 'LIP-002'],
    };
  }

  if (apobInterpretable) {
    return {
      primaryDriver: 'apob',
      includeApoBScore: true,
      includeLDLScore: false,
      notes: ['ApoB is interpretable. LDL does not affect the score unless a separate-lens policy is activated later.'],
      ruleIds: ['LIP-001'],
    };
  }

  if (ldlInterpretable) {
    return {
      primaryDriver: 'ldl',
      includeApoBScore: false,
      includeLDLScore: true,
      notes: ['ApoB is missing or not score-eligible. LDL is allowed to act as a bounded fallback lipid driver.'],
      ruleIds: ['LIP-002', 'LIP-003'],
    };
  }

  return {
    primaryDriver: null,
    includeApoBScore: false,
    includeLDLScore: false,
    notes: ['Neither ApoB nor LDL is currently usable for lipid scoring. Treat this as a coverage problem, not a severity signal.'],
    ruleIds: ['LIP-003', 'COV-001'],
  };
}

export function canContributeToPriorityScore(params: {
  marker: BiomarkerKey;
  assessment: InterpretabilityAssessment;
  lipidDecision?: LipidHierarchyDecision;
}): boolean {
  const { marker, assessment, lipidDecision } = params;
  const config = getMarkerRuntimeConfig(marker);

  if (assessment.state !== InterpretabilityState.Interpretable || assessment.scoreBlocked) {
    return false;
  }

  if (config.scoreRole === ScoreRole.Excluded) return false;
  if (config.scoreRole === ScoreRole.BoundedModifier) return marker === 'lpa' || marker === 'crp';

  if (marker === 'apob') return lipidDecision?.includeApoBScore ?? true;
  if (marker === 'ldl') return lipidDecision?.includeLDLScore ?? false;

  return true;
}

export function getSupportedBiomarkerKeys(): BiomarkerKey[] {
  return biomarkers.map((biomarker) => biomarker.key);
}

export function getBiomarkerOrThrow(key: BiomarkerKey): BiomarkerDefinition {
  const biomarker = getBiomarkerDefinition(key);
  if (!biomarker) {
    throw new Error(`Unknown biomarker key: ${key}`);
  }
  return biomarker;
}
