/**
 * Task 8 — Evidence Ingest Mock: multi-observation-type coverage
 *
 * Builds WearableObservationInput fixtures for every metric type the
 * wearables-sync edge function accepts, verifying that the shape contract
 * is satisfied before hitting a real device or Supabase instance.
 *
 * Run via: npx ts-node apps/mobile/evidenceIngestMock.assertions.ts
 */
import type { WearableObservationInput } from './wearableSyncClient';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
}

function assertObservationShape(obs: WearableObservationInput, label: string): void {
  assert(typeof obs.metric_key === 'string' && obs.metric_key.length > 0, `${label}: metric_key`);
  assert(
    typeof obs.source_record_id === 'string' && obs.source_record_id.length > 0,
    `${label}: source_record_id`,
  );
  assert(typeof obs.raw_type === 'string' && obs.raw_type.length > 0, `${label}: raw_type`);
  assert(typeof obs.observed_at === 'string', `${label}: observed_at`);
}

const BASE_DATE = '2026-04-20T08:00:00Z';
const BASE_END = '2026-04-20T09:00:00Z';

const MOCK_OBSERVATIONS: WearableObservationInput[] = [
  // Steps
  {
    metric_key: 'steps_daily',
    source_record_id: 'garmin-steps-001',
    raw_type: 'Steps',
    observed_at: BASE_DATE,
    observation_end_at: BASE_END,
    source_timezone: 'Europe/Berlin',
    value_numeric: 8432,
    value_text: null,
    value_json: null,
    unit: 'count',
    measurement_method: 'sensor',
  },
  // HeartRate
  {
    metric_key: 'heart_rate_resting',
    source_record_id: 'garmin-hr-001',
    raw_type: 'HeartRate',
    observed_at: BASE_DATE,
    observation_end_at: null,
    source_timezone: 'Europe/Berlin',
    value_numeric: 58,
    value_text: null,
    value_json: null,
    unit: 'bpm',
    measurement_method: 'optical_sensor',
  },
  // SleepSession
  {
    metric_key: 'sleep_duration',
    source_record_id: 'garmin-sleep-001',
    raw_type: 'SleepSession',
    observed_at: '2026-04-19T22:30:00Z',
    observation_end_at: '2026-04-20T06:15:00Z',
    source_timezone: 'Europe/Berlin',
    value_numeric: 465,
    value_text: null,
    value_json: { stages: { deep: 90, light: 210, rem: 80, awake: 35 } },
    unit: 'minutes',
    measurement_method: 'accelerometer',
  },
  // ActiveCaloriesBurned
  {
    metric_key: 'active_calories',
    source_record_id: 'garmin-cal-001',
    raw_type: 'ActiveCaloriesBurned',
    observed_at: BASE_DATE,
    observation_end_at: BASE_END,
    source_timezone: 'Europe/Berlin',
    value_numeric: 312,
    value_text: null,
    value_json: null,
    unit: 'kcal',
    measurement_method: 'sensor',
  },
  // Distance
  {
    metric_key: 'distance_daily',
    source_record_id: 'garmin-dist-001',
    raw_type: 'Distance',
    observed_at: BASE_DATE,
    observation_end_at: BASE_END,
    source_timezone: 'Europe/Berlin',
    value_numeric: 6.4,
    value_text: null,
    value_json: null,
    unit: 'km',
    measurement_method: 'gps',
  },
];

function runEvidenceIngestMockAssertions(): void {
  assert(MOCK_OBSERVATIONS.length === 5, 'Five distinct observation types present');

  const types = MOCK_OBSERVATIONS.map((o) => o.raw_type);
  const expected = ['Steps', 'HeartRate', 'SleepSession', 'ActiveCaloriesBurned', 'Distance'];
  expected.forEach((t) => assert(types.includes(t), `Observation type present: ${t}`));

  MOCK_OBSERVATIONS.forEach((obs) => assertObservationShape(obs, obs.raw_type));

  // SleepSession: value_json must carry stages
  const sleep = MOCK_OBSERVATIONS.find((o) => o.raw_type === 'SleepSession')!;
  assert(sleep.value_json !== null, 'SleepSession has value_json stages');
  assert(
    typeof (sleep.value_json as Record<string, unknown>).stages === 'object',
    'SleepSession stages is an object',
  );

  // All numeric observations carry a non-null value_numeric
  const numericTypes = ['Steps', 'HeartRate', 'ActiveCaloriesBurned', 'Distance'];
  numericTypes.forEach((t) => {
    const obs = MOCK_OBSERVATIONS.find((o) => o.raw_type === t)!;
    assert(typeof obs.value_numeric === 'number', `${t}: value_numeric is a number`);
  });

  console.log('[evidenceIngestMock.assertions] All assertions passed.');
}

runEvidenceIngestMockAssertions();
