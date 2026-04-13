/**
 * Mobile Sync Contract — Wearables V1
 *
 * Defines the payload shapes that the mobile app sends to the backend
 * when syncing Apple Health (HealthKit) or Android Health Connect data.
 *
 * Design rules:
 *   - Mobile sends raw/near-raw observations. Backend handles dedup and summaries.
 *   - Every payload carries explicit provenance: source, method, timezone.
 *   - HRV MUST include measurement_method. No exceptions.
 *   - Session metrics MUST include observation_end_at.
 *   - Callers must not strip source_record_id — it is the dedup key.
 */

import type { WearableMetricKey } from './metricRegistry';

// ---------------------------------------------------------------------------
// Platform identifiers
// ---------------------------------------------------------------------------

export type SyncPlatform = 'apple_health' | 'health_connect';

export type SyncMode = 'manual' | 'app_launch' | 'foreground_refresh' | 'background' | 'backfill';

// ---------------------------------------------------------------------------
// HRV method — must be explicit, never inferred
// ---------------------------------------------------------------------------

export type HrvMethod =
  | 'sdnn'   // Apple Health default — HKQuantityTypeIdentifierHeartRateVariabilitySDNN
  | 'rmssd'  // Health Connect default — HeartRateVariabilityRmssdRecord
  | 'unknown'; // Only acceptable for legacy backfill with no method metadata available

// ---------------------------------------------------------------------------
// Single observation payload
// ---------------------------------------------------------------------------

export interface RawObservationPayload {
  /** Canonical metric key from WearableMetricKey. */
  metric_key: WearableMetricKey;

  /**
   * Platform-native record/sample ID.
   * Used as dedup key: (wearable_source_id, metric_key, source_record_id) must be unique.
   * Never omit or generate a synthetic ID on mobile.
   */
  source_record_id: string;

  /**
   * Platform-native type string for debugging and future raw_type indexing.
   * Examples:
   *   Apple Health: 'HKQuantityTypeIdentifierStepCount'
   *   Health Connect: 'StepsRecord'
   */
  raw_type: string;

  /** ISO 8601 with timezone offset. Observation start (or single sample time). */
  observed_at: string;

  /**
   * ISO 8601 with timezone offset. Required for session metrics (sleep_session, workout_session).
   * Must be null for point-in-time samples.
   */
  observation_end_at: string | null;

  /**
   * IANA timezone of the recording device at observation time.
   * Critical for sleep-across-midnight and travel correctness.
   * Examples: 'Europe/Berlin', 'America/New_York'
   */
  source_timezone: string;

  /** Numeric scalar value. Null if metric is session/json-shaped. */
  value_numeric: number | null;

  /** Text value. Use for workout_session type label, enum values. */
  value_text: string | null;

  /** JSON payload. Use for session-shaped metrics with rich source data. */
  value_json: Record<string, unknown> | null;

  /** Unit string matching wearable_metric_definitions.default_unit or explicit override. */
  unit: string | null;

  /**
   * Measurement method. REQUIRED for hrv — must be 'sdnn' or 'rmssd'.
   * Optional but recommended for other metrics where method affects interpretation.
   */
  measurement_method: HrvMethod | string | null;

  /**
   * Full source payload from the platform SDK for debugging.
   * Keep it — this is the audit trail if dedup or value issues arise later.
   */
  source_payload?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Sync request envelope
// ---------------------------------------------------------------------------

export interface WearableSyncRequest {
  /** The wearable_sources.id for this device/platform combination. */
  wearable_source_id: string;

  platform: SyncPlatform;

  sync_mode: SyncMode;

  /** ISO 8601. When the sync was initiated on device. */
  started_at: string;

  /**
   * Opaque cursor from the last successful sync.
   * Pass null for first sync or full backfill.
   * Backend echoes back the new cursor in the response.
   */
  source_cursor: string | null;

  observations: RawObservationPayload[];
}

// ---------------------------------------------------------------------------
// Sync response envelope
// ---------------------------------------------------------------------------

export interface WearableSyncResponse {
  /** wearable_sync_runs.id for this run. Use for status polling or support. */
  sync_run_id: string;

  status: 'success' | 'partial' | 'failed';

  records_seen: number;
  records_inserted: number;
  records_updated: number;

  /**
   * New cursor to store on device for the next incremental sync.
   * Null if sync failed or backend cannot advance cursor safely.
   */
  next_cursor: string | null;

  /** Human-readable error summary. Only set when status = 'failed' or 'partial'. */
  error_summary: string | null;
}

// ---------------------------------------------------------------------------
// Platform-specific source mapping hints
// (reference for mobile implementation — not enforced at runtime)
// ---------------------------------------------------------------------------

/**
 * Maps canonical metric keys to their likely Apple HealthKit identifiers.
 * Source: docs/architecture/wearable-metric-keys-v1.md
 */
export const HEALTHKIT_TYPE_MAP: Partial<Record<WearableMetricKey, string>> = {
  sleep_session:       'HKCategoryTypeIdentifierSleepAnalysis',
  sleep_duration:      'HKCategoryTypeIdentifierSleepAnalysis',
  awake_duration:      'HKCategoryTypeIdentifierSleepAnalysis',
  steps_total:         'HKQuantityTypeIdentifierStepCount',
  heart_rate:          'HKQuantityTypeIdentifierHeartRate',
  resting_heart_rate:  'HKQuantityTypeIdentifierRestingHeartRate',
  hrv:                 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN', // SDNN on Apple
  workout_session:     'HKWorkoutType',
  active_minutes:      'HKQuantityTypeIdentifierAppleExerciseTime',
  respiratory_rate:    'HKQuantityTypeIdentifierRespiratoryRate',
  spo2:                'HKQuantityTypeIdentifierOxygenSaturation',
  distance_total:      'HKQuantityTypeIdentifierDistanceWalkingRunning',
  active_energy_burned:'HKQuantityTypeIdentifierActiveEnergyBurned',
};

/**
 * Maps canonical metric keys to their likely Android Health Connect record types.
 * Source: docs/architecture/wearable-metric-keys-v1.md
 */
export const HEALTH_CONNECT_TYPE_MAP: Partial<Record<WearableMetricKey, string>> = {
  sleep_session:       'SleepSessionRecord',
  sleep_duration:      'SleepSessionRecord',
  awake_duration:      'SleepSessionRecord',
  steps_total:         'StepsRecord',
  heart_rate:          'HeartRateRecord',
  resting_heart_rate:  'RestingHeartRateRecord',
  hrv:                 'HeartRateVariabilityRmssdRecord', // RMSSD on Health Connect
  workout_session:     'ExerciseSessionRecord',
  active_minutes:      'ActiveCaloriesBurnedRecord', // proxy — platform semantics vary
  respiratory_rate:    'RespiratoryRateRecord',
  spo2:                'OxygenSaturationRecord',
  distance_total:      'DistanceRecord',
  active_energy_burned:'ActiveCaloriesBurnedRecord',
};
