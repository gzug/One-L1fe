import { ProductEvidenceClass } from './provenance.ts';

export const MANDATORY_MARKER_KEYS = ['apob', 'ldl', 'hba1c', 'glucose'] as const;
export type MandatoryMarkerKey = typeof MANDATORY_MARKER_KEYS[number];

export const OPTIONAL_MARKER_KEYS = [
  'lpa',
  'triglycerides',
  'crp',
  'vitamin_d',
  'ferritin',
  'b12',
  'magnesium',
  'dao',
] as const;
export type OptionalMarkerKey = typeof OPTIONAL_MARKER_KEYS[number];

export const DEFAULT_HC_RECORD_TYPES = [
  'Steps',
  'HeartRate',
  'RestingHeartRate',
  'HeartRateVariabilityRms',
  'SleepSession',
  'ActiveCaloriesBurned',
  'TotalCaloriesBurned',
  'ExerciseSession',
] as const;

export type MarkerPreference = {
  markerKey: string;
  enabled: boolean;
};

export type WearablePreference = {
  hcRecordType: string;
  enabled: boolean;
};

export type PanelConfiguration = {
  enabledMarkerKeys: Set<string>;
  excludedMandatoryKeys: Set<string>;
  excludedOptionalKeys: Set<string>;
};

export type ScoreLockedResult = {
  kind: 'score_locked';
  reason: 'MANDATORY_MARKER_EXCLUDED';
  missingKeys: MandatoryMarkerKey[];
  userAction: 'RE_ENABLE_IN_SETTINGS';
};

const EVIDENCE_CLASS_ORDER: ProductEvidenceClass[] = ['strong', 'moderate', 'limited', 'insufficient'];

export function downgradeEvidenceClass(current: ProductEvidenceClass): ProductEvidenceClass {
  const index = EVIDENCE_CLASS_ORDER.indexOf(current);
  if (index === -1 || index === EVIDENCE_CLASS_ORDER.length - 1) {
    return current;
  }

  return EVIDENCE_CLASS_ORDER[index + 1];
}

export function resolvePanelConfiguration(preferences: MarkerPreference[]): PanelConfiguration {
  const prefMap = new Map(preferences.map((pref) => [pref.markerKey, pref.enabled]));

  const excludedMandatoryKeys = new Set<string>(
    MANDATORY_MARKER_KEYS.filter((key) => prefMap.get(key) === false),
  );
  const excludedOptionalKeys = new Set<string>(
    OPTIONAL_MARKER_KEYS.filter((key) => prefMap.get(key) === false),
  );

  const enabledMarkerKeys = new Set<string>([
    ...MANDATORY_MARKER_KEYS.filter((key) => !excludedMandatoryKeys.has(key)),
    ...OPTIONAL_MARKER_KEYS.filter((key) => !excludedOptionalKeys.has(key)),
  ]);

  return {
    enabledMarkerKeys,
    excludedMandatoryKeys,
    excludedOptionalKeys,
  };
}
