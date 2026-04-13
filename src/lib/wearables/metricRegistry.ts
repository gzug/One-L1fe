/**
 * Wearable Metric Registry — V1
 *
 * Canonical TypeScript mirror of wearable_metric_definitions.
 * Single source of truth for metric keys used in mobile sync, edge functions,
 * and UI. Must stay in sync with:
 *   - docs/architecture/wearable-metric-keys-v1.md
 *   - supabase/migrations/20260413214000_phase0_wearables_context.sql
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type WearableMetricKey =
  // Sleep
  | 'sleep_session'
  | 'sleep_duration'
  | 'awake_duration'
  // Activity
  | 'steps_total'
  | 'active_minutes'
  | 'workout_session'
  // Cardiovascular / recovery
  | 'heart_rate'
  | 'resting_heart_rate'
  | 'hrv'
  // Second wave — not enabled by default in V1
  | 'respiratory_rate'
  | 'spo2'
  | 'temperature_deviation'
  | 'distance_total'
  | 'active_energy_burned';

export type MetricDomain =
  | 'sleep'
  | 'activity'
  | 'cardiovascular'
  | 'recovery'
  | 'respiration'
  | 'body'
  | 'other';

export type MetricValueType = 'numeric' | 'boolean' | 'enum' | 'json';

export type AggregationHint = 'sample' | 'session' | 'day' | 'week';

export type EvidenceClass =
  | 'device_observed'
  | 'vendor_derived'
  | 'vendor_black_box'
  | 'self_report'
  | 'product_derived';

export type ConfidenceClass = 'high' | 'medium' | 'low' | 'variable';

export interface WearableMetricDefinition {
  key: WearableMetricKey;
  displayName: string;
  domain: MetricDomain;
  valueType: MetricValueType;
  defaultUnit: string | null;
  aggregationHint: AggregationHint;
  evidenceClass: EvidenceClass;
  confidenceClass: ConfidenceClass;
  /** Whether this metric is included in the V1 import set. */
  isV1Enabled: boolean;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const WEARABLE_METRIC_REGISTRY: Record<WearableMetricKey, WearableMetricDefinition> = {
  // --- Sleep ---
  sleep_session: {
    key: 'sleep_session',
    displayName: 'Sleep session',
    domain: 'sleep',
    valueType: 'json',
    defaultUnit: null,
    aggregationHint: 'session',
    evidenceClass: 'device_observed',
    confidenceClass: 'medium',
    isV1Enabled: true,
    notes: 'Session row: observed_at = sleep start, observation_end_at = sleep end.',
  },
  sleep_duration: {
    key: 'sleep_duration',
    displayName: 'Sleep duration',
    domain: 'sleep',
    valueType: 'numeric',
    defaultUnit: 'min',
    aggregationHint: 'session',
    evidenceClass: 'device_observed',
    confidenceClass: 'medium',
    isV1Enabled: true,
  },
  awake_duration: {
    key: 'awake_duration',
    displayName: 'Awake duration during sleep',
    domain: 'sleep',
    valueType: 'numeric',
    defaultUnit: 'min',
    aggregationHint: 'session',
    evidenceClass: 'vendor_derived',
    confidenceClass: 'low',
    isV1Enabled: true,
  },

  // --- Activity ---
  steps_total: {
    key: 'steps_total',
    displayName: 'Steps total',
    domain: 'activity',
    valueType: 'numeric',
    defaultUnit: 'count',
    aggregationHint: 'day',
    evidenceClass: 'device_observed',
    confidenceClass: 'high',
    isV1Enabled: true,
    notes: 'Prefer daily totals. Do not overfit to intraday granularity in V1.',
  },
  active_minutes: {
    key: 'active_minutes',
    displayName: 'Active minutes',
    domain: 'activity',
    valueType: 'numeric',
    defaultUnit: 'min',
    aggregationHint: 'day',
    evidenceClass: 'product_derived',
    confidenceClass: 'medium',
    isV1Enabled: true,
    notes:
      'Platform semantics vary. Use as trend signal only, not exact physiological quantity.',
  },
  workout_session: {
    key: 'workout_session',
    displayName: 'Workout session',
    domain: 'activity',
    valueType: 'json',
    defaultUnit: null,
    aggregationHint: 'session',
    evidenceClass: 'device_observed',
    confidenceClass: 'medium',
    isV1Enabled: true,
    notes:
      'Session row: observed_at = start, observation_end_at = end, value_text = workout type.',
  },

  // --- Cardiovascular / recovery ---
  heart_rate: {
    key: 'heart_rate',
    displayName: 'Heart rate',
    domain: 'cardiovascular',
    valueType: 'numeric',
    defaultUnit: 'bpm',
    aggregationHint: 'sample',
    evidenceClass: 'device_observed',
    confidenceClass: 'medium',
    isV1Enabled: true,
  },
  resting_heart_rate: {
    key: 'resting_heart_rate',
    displayName: 'Resting heart rate',
    domain: 'cardiovascular',
    valueType: 'numeric',
    defaultUnit: 'bpm',
    aggregationHint: 'day',
    evidenceClass: 'vendor_derived',
    confidenceClass: 'medium',
    isV1Enabled: true,
    notes: 'Keep source provenance — vendor calculation methods differ.',
  },
  hrv: {
    key: 'hrv',
    displayName: 'Heart rate variability',
    domain: 'recovery',
    valueType: 'numeric',
    defaultUnit: 'ms',
    aggregationHint: 'sample',
    evidenceClass: 'device_observed',
    confidenceClass: 'variable',
    isV1Enabled: true,
    notes:
      'CRITICAL: Apple Health = SDNN (HKQuantityTypeIdentifierHeartRateVariabilitySDNN). ' +
      'Health Connect = RMSSD (HeartRateVariabilityRmssdRecord). ' +
      'Store measurement_method explicitly. Never compare cross-platform HRV as the same signal.',
  },

  // --- Second wave (isV1Enabled: false) ---
  respiratory_rate: {
    key: 'respiratory_rate',
    displayName: 'Respiratory rate',
    domain: 'respiration',
    valueType: 'numeric',
    defaultUnit: 'breaths/min',
    aggregationHint: 'sample',
    evidenceClass: 'vendor_derived',
    confidenceClass: 'variable',
    isV1Enabled: false,
  },
  spo2: {
    key: 'spo2',
    displayName: 'Blood oxygen saturation',
    domain: 'recovery',
    valueType: 'numeric',
    defaultUnit: '%',
    aggregationHint: 'sample',
    evidenceClass: 'vendor_derived',
    confidenceClass: 'variable',
    isV1Enabled: false,
  },
  temperature_deviation: {
    key: 'temperature_deviation',
    displayName: 'Temperature deviation',
    domain: 'recovery',
    valueType: 'numeric',
    defaultUnit: 'delta_c',
    aggregationHint: 'day',
    evidenceClass: 'vendor_derived',
    confidenceClass: 'variable',
    isV1Enabled: false,
  },
  distance_total: {
    key: 'distance_total',
    displayName: 'Distance total',
    domain: 'activity',
    valueType: 'numeric',
    defaultUnit: 'm',
    aggregationHint: 'day',
    evidenceClass: 'device_observed',
    confidenceClass: 'high',
    isV1Enabled: false,
  },
  active_energy_burned: {
    key: 'active_energy_burned',
    displayName: 'Active energy burned',
    domain: 'activity',
    valueType: 'numeric',
    defaultUnit: 'kcal',
    aggregationHint: 'day',
    evidenceClass: 'vendor_derived',
    confidenceClass: 'low',
    isV1Enabled: false,
    notes: 'Calories are unreliable as a primary signal. Dashboard only, never rule input.',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All metric keys enabled for V1 import. */
export const V1_ENABLED_METRIC_KEYS = Object.values(WEARABLE_METRIC_REGISTRY)
  .filter((m) => m.isV1Enabled)
  .map((m) => m.key) satisfies WearableMetricKey[];

/** Metric keys that carry session-shaped data (require observation_end_at). */
export const SESSION_METRIC_KEYS: WearableMetricKey[] = ['sleep_session', 'workout_session'];

/** Whether a given metric key represents a session-shaped observation. */
export function isSessionMetric(key: WearableMetricKey): boolean {
  return SESSION_METRIC_KEYS.includes(key);
}

/** Get definition for a metric key, throws if unknown. */
export function getMetricDefinition(key: WearableMetricKey): WearableMetricDefinition {
  const def = WEARABLE_METRIC_REGISTRY[key];
  if (!def) throw new Error(`Unknown wearable metric key: ${key}`);
  return def;
}
