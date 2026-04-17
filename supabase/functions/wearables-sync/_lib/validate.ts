/**
 * Request validation for wearables-sync.
 * Throws with a descriptive message on any structural violation.
 * Does NOT do deep domain validation — that lives in sync.ts.
 */

import type { WearableSyncRequest, RawObservationPayload } from './types.ts';

const VALID_PLATFORMS = ['apple_health', 'health_connect'] as const;
const VALID_SYNC_MODES = ['manual', 'app_launch', 'foreground_refresh', 'background', 'backfill'] as const;
const VALID_METRIC_KEYS = new Set([
  'sleep_session', 'sleep_duration', 'awake_duration',
  'steps_total', 'active_minutes', 'workout_session',
  'heart_rate', 'resting_heart_rate', 'hrv',
  'respiratory_rate', 'spo2', 'temperature_deviation',
  'distance_total', 'active_energy_burned',
]);

export function validateSyncRequest(raw: unknown): WearableSyncRequest {
  if (!raw || typeof raw !== 'object') throw new Error('Request body must be a JSON object.');
  const body = raw as Record<string, unknown>;

  if (typeof body.wearable_source_id !== 'string' || !body.wearable_source_id) {
    throw new Error('wearable_source_id is required (string).');
  }
  if (!VALID_PLATFORMS.includes(body.platform as never)) {
    throw new Error(`platform must be one of: ${VALID_PLATFORMS.join(', ')}`);
  }
  if (!VALID_SYNC_MODES.includes(body.sync_mode as never)) {
    throw new Error(`sync_mode must be one of: ${VALID_SYNC_MODES.join(', ')}`);
  }
  if (typeof body.started_at !== 'string' || !body.started_at) {
    throw new Error('started_at is required (ISO 8601 string).');
  }
  if (!Array.isArray(body.observations)) {
    throw new Error('observations must be an array.');
  }
  if (body.observations.length === 0) {
    throw new Error('observations must not be empty. Send at least one observation per sync request.');
  }
  if (body.observations.length > 5000) {
    throw new Error('observations exceeds maximum batch size of 5000.');
  }

  for (let i = 0; i < body.observations.length; i++) {
    validateObservation(body.observations[i], i);
  }

  return body as unknown as WearableSyncRequest;
}

function validateObservation(raw: unknown, index: number): asserts raw is RawObservationPayload {
  const prefix = `observations[${index}]`;
  if (!raw || typeof raw !== 'object') throw new Error(`${prefix} must be an object.`);
  const o = raw as Record<string, unknown>;

  if (typeof o.metric_key !== 'string' || !VALID_METRIC_KEYS.has(o.metric_key)) {
    throw new Error(`${prefix}.metric_key is invalid: "${o.metric_key}".`);
  }
  if (typeof o.source_record_id !== 'string' || !o.source_record_id) {
    throw new Error(`${prefix}.source_record_id is required.`);
  }
  if (typeof o.raw_type !== 'string' || !o.raw_type) {
    throw new Error(`${prefix}.raw_type is required.`);
  }
  if (typeof o.observed_at !== 'string' || !o.observed_at) {
    throw new Error(`${prefix}.observed_at is required (ISO 8601).`);
  }
  if (typeof o.source_timezone !== 'string' || !o.source_timezone) {
    throw new Error(`${prefix}.source_timezone is required (IANA timezone).`);
  }

  // HRV requires explicit measurement_method
  if (o.metric_key === 'hrv') {
    if (!o.measurement_method || o.measurement_method === 'unknown') {
      throw new Error(
        `${prefix}: hrv observations MUST include measurement_method ('sdnn' or 'rmssd'). ` +
        `'unknown' is not accepted for new observations.`
      );
    }
  }

  // Session metrics require observation_end_at
  if (o.metric_key === 'sleep_session' || o.metric_key === 'workout_session') {
    if (typeof o.observation_end_at !== 'string' || !o.observation_end_at) {
      throw new Error(`${prefix}: session metric '${o.metric_key}' requires observation_end_at.`);
    }
  }
}
