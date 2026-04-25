import { Platform } from 'react-native';
import type {
  ReadRecordsOptions,
  RecordResult,
  RecordType,
} from 'react-native-health-connect';
import type {
  WearableObservationInput,
  WearableSyncRequest,
} from './wearableSyncClient';

export type GarminHealthConnectRecordType =
  | 'Steps'
  | 'SleepSession'
  | 'HeartRate'
  | 'RestingHeartRate'
  | 'HeartRateVariabilityRmssd'
  | 'ActiveCaloriesBurned'
  | 'Distance';

export const GARMIN_HEALTH_CONNECT_TYPES: readonly GarminHealthConnectRecordType[] = [
  'Steps',
  'SleepSession',
  'HeartRate',
  'RestingHeartRate',
  'HeartRateVariabilityRmssd',
  'ActiveCaloriesBurned',
  'Distance',
];

export type NormalizedHealthConnectMetric =
  | 'steps_total'
  | 'sleep_duration'
  | 'sleep_session'
  | 'heart_rate'
  | 'resting_heart_rate'
  | 'hrv'
  | 'active_energy_burned'
  | 'distance_total';

export interface HealthConnectGarminSummary {
  stepsTotal: number | null;
  sleepDurationSeconds: number | null;
  sleepSessionCount: number;
  heartRateAvgBpm: number | null;
  restingHeartRateBpm: number | null;
  hrvRmssdMs: number | null;
  activeEnergyKcal: number | null;
  distanceMeters: number | null;
  latestRecordAt: string | null;
  sourceOrigins: string[];
  recordCounts: Record<GarminHealthConnectRecordType, number>;
  skippedRecords: number;
}

export type HealthConnectReadStatus =
  | 'live'
  | 'no-records'
  | 'unavailable'
  | 'error';

export interface HealthConnectGarminReadResult {
  status: HealthConnectReadStatus;
  message: string;
  request: WearableSyncRequest | null;
  observations: WearableObservationInput[];
  summary: HealthConnectGarminSummary;
}

type HealthConnectModule = Pick<
  typeof import('react-native-health-connect'),
  'initialize' | 'readRecords'
>;

const MS_PER_DAY = 86_400_000;
const DEFAULT_TIMEZONE = 'UTC';

export async function readGarminHealthConnectData(options: {
  wearableSourceId: string;
  lookbackDays?: number;
}): Promise<HealthConnectGarminReadResult> {
  const summary = createEmptySummary();

  if (Platform.OS !== 'android') {
    return {
      status: 'unavailable',
      message: 'Health Connect is only available in this Android demo.',
      request: null,
      observations: [],
      summary,
    };
  }

  try {
    const hc: HealthConnectModule = await import('react-native-health-connect');
    const initialized = await hc.initialize();

    if (!initialized) {
      return {
        status: 'unavailable',
        message: 'Health Connect is not available or not initialized on this device.',
        request: null,
        observations: [],
        summary,
      };
    }

    const now = new Date();
    const start = new Date(now.getTime() - (options.lookbackDays ?? 14) * MS_PER_DAY);
    const readOptions: ReadRecordsOptions = {
      timeRangeFilter: {
        operator: 'between',
        startTime: start.toISOString(),
        endTime: now.toISOString(),
      },
      ascendingOrder: false,
      pageSize: 500,
    };

    const steps = await readRecords(hc, 'Steps', readOptions);
    const sleep = await readRecords(hc, 'SleepSession', readOptions);
    const heartRate = await readRecords(hc, 'HeartRate', readOptions);
    const restingHeartRate = await readRecords(hc, 'RestingHeartRate', readOptions);
    const hrv = await readRecords(hc, 'HeartRateVariabilityRmssd', readOptions);
    const activeCalories = await readRecords(hc, 'ActiveCaloriesBurned', readOptions);
    const distance = await readRecords(hc, 'Distance', readOptions);

    const observations = [
      ...steps.flatMap((record) => mapSteps(record, summary)),
      ...sleep.flatMap((record) => mapSleep(record, summary)),
      ...heartRate.flatMap((record) => mapHeartRate(record, summary)),
      ...restingHeartRate.flatMap((record) => mapRestingHeartRate(record, summary)),
      ...hrv.flatMap((record) => mapHrv(record, summary)),
      ...activeCalories.flatMap((record) => mapActiveCalories(record, summary)),
      ...distance.flatMap((record) => mapDistance(record, summary)),
    ];

    summary.recordCounts.Steps = steps.length;
    summary.recordCounts.SleepSession = sleep.length;
    summary.recordCounts.HeartRate = heartRate.length;
    summary.recordCounts.RestingHeartRate = restingHeartRate.length;
    summary.recordCounts.HeartRateVariabilityRmssd = hrv.length;
    summary.recordCounts.ActiveCaloriesBurned = activeCalories.length;
    summary.recordCounts.Distance = distance.length;

    summary.sourceOrigins = Array.from(new Set(summary.sourceOrigins)).sort();

    if (observations.length === 0) {
      return {
        status: 'no-records',
        message:
          'No readable Health Connect records were found for the requested Garmin data types.',
        request: null,
        observations,
        summary,
      };
    }

    return {
      status: 'live',
      message: 'Health Connect records were read on this device.',
      request: buildWearableSyncRequest(options.wearableSourceId, observations),
      observations,
      summary,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown Health Connect read error.',
      request: null,
      observations: [],
      summary,
    };
  }
}

function buildWearableSyncRequest(
  wearableSourceId: string,
  observations: WearableObservationInput[],
): WearableSyncRequest {
  return {
    wearable_source_id: wearableSourceId,
    platform: 'health_connect',
    sync_mode: 'manual',
    started_at: new Date().toISOString(),
    source_cursor: null,
    observations,
  };
}

async function readRecords<T extends RecordType>(
  hc: HealthConnectModule,
  recordType: T,
  options: ReadRecordsOptions,
): Promise<RecordResult<T>[]> {
  const result = await hc.readRecords(recordType, options);
  return result.records;
}

function createEmptySummary(): HealthConnectGarminSummary {
  return {
    stepsTotal: null,
    sleepDurationSeconds: null,
    sleepSessionCount: 0,
    heartRateAvgBpm: null,
    restingHeartRateBpm: null,
    hrvRmssdMs: null,
    activeEnergyKcal: null,
    distanceMeters: null,
    latestRecordAt: null,
    sourceOrigins: [],
    recordCounts: {
      Steps: 0,
      SleepSession: 0,
      HeartRate: 0,
      RestingHeartRate: 0,
      HeartRateVariabilityRmssd: 0,
      ActiveCaloriesBurned: 0,
      Distance: 0,
    },
    skippedRecords: 0,
  };
}

function mapSteps(
  record: RecordResult<'Steps'>,
  summary: HealthConnectGarminSummary,
): WearableObservationInput[] {
  const base = makeBaseObservation(record, 'Steps');
  if (!base) return markSkipped(summary);
  summary.stepsTotal = (summary.stepsTotal ?? 0) + record.count;
  noteLatest(summary, record.endTime);
  noteOrigin(summary, record.metadata?.dataOrigin);
  return [{
    ...base,
    metric_key: 'steps_total',
    raw_type: 'HealthConnect.Steps',
    observed_at: record.startTime,
    observation_end_at: record.endTime,
    value_numeric: record.count,
    unit: 'count',
  }];
}

function mapSleep(
  record: RecordResult<'SleepSession'>,
  summary: HealthConnectGarminSummary,
): WearableObservationInput[] {
  const base = makeBaseObservation(record, 'SleepSession');
  if (!base) return markSkipped(summary);
  const seconds = Math.max(
    0,
    Math.round((new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / 1000),
  );
  summary.sleepDurationSeconds = (summary.sleepDurationSeconds ?? 0) + seconds;
  summary.sleepSessionCount += 1;
  noteLatest(summary, record.endTime);
  noteOrigin(summary, record.metadata?.dataOrigin);
  return [
    {
      ...base,
      source_record_id: `${base.source_record_id}:sleep_session`,
      metric_key: 'sleep_session',
      raw_type: 'HealthConnect.SleepSession',
      observed_at: record.startTime,
      observation_end_at: record.endTime,
      value_numeric: null,
      value_json: {
        title: record.title ?? null,
        notes_present: typeof record.notes === 'string' && record.notes.length > 0,
        stages_count: record.stages?.length ?? 0,
      },
      unit: null,
    },
    {
      ...base,
      source_record_id: `${base.source_record_id}:sleep_duration`,
      metric_key: 'sleep_duration',
      raw_type: 'HealthConnect.SleepSession',
      observed_at: record.startTime,
      observation_end_at: record.endTime,
      value_numeric: seconds,
      unit: 'seconds',
    },
  ];
}

function mapHeartRate(
  record: RecordResult<'HeartRate'>,
  summary: HealthConnectGarminSummary,
): WearableObservationInput[] {
  const base = makeBaseObservation(record, 'HeartRate');
  if (!base) return markSkipped(summary);
  const samples = record.samples ?? [];
  const avg = average(samples.map((sample) => sample.beatsPerMinute));
  summary.heartRateAvgBpm = averageNullable(summary.heartRateAvgBpm, avg);
  noteLatest(summary, record.endTime);
  noteOrigin(summary, record.metadata?.dataOrigin);
  return [{
    ...base,
    metric_key: 'heart_rate',
    raw_type: 'HealthConnect.HeartRate',
    observed_at: record.startTime,
    observation_end_at: record.endTime,
    value_numeric: avg,
    value_json: { samples_count: samples.length },
    unit: 'bpm',
  }];
}

function mapRestingHeartRate(
  record: RecordResult<'RestingHeartRate'>,
  summary: HealthConnectGarminSummary,
): WearableObservationInput[] {
  const base = makeBaseObservation(record, 'RestingHeartRate');
  if (!base) return markSkipped(summary);
  summary.restingHeartRateBpm = latestNumber(summary.restingHeartRateBpm, record.beatsPerMinute);
  noteLatest(summary, record.time);
  noteOrigin(summary, record.metadata?.dataOrigin);
  return [{
    ...base,
    metric_key: 'resting_heart_rate',
    raw_type: 'HealthConnect.RestingHeartRate',
    observed_at: record.time,
    observation_end_at: null,
    value_numeric: record.beatsPerMinute,
    unit: 'bpm',
  }];
}

function mapHrv(
  record: RecordResult<'HeartRateVariabilityRmssd'>,
  summary: HealthConnectGarminSummary,
): WearableObservationInput[] {
  const base = makeBaseObservation(record, 'HeartRateVariabilityRmssd');
  if (!base) return markSkipped(summary);
  summary.hrvRmssdMs = latestNumber(summary.hrvRmssdMs, record.heartRateVariabilityMillis);
  noteLatest(summary, record.time);
  noteOrigin(summary, record.metadata?.dataOrigin);
  return [{
    ...base,
    metric_key: 'hrv',
    raw_type: 'HealthConnect.HeartRateVariabilityRmssd',
    observed_at: record.time,
    observation_end_at: null,
    value_numeric: record.heartRateVariabilityMillis,
    unit: 'ms',
    measurement_method: 'rmssd',
  }];
}

function mapActiveCalories(
  record: RecordResult<'ActiveCaloriesBurned'>,
  summary: HealthConnectGarminSummary,
): WearableObservationInput[] {
  const base = makeBaseObservation(record, 'ActiveCaloriesBurned');
  if (!base) return markSkipped(summary);
  const kcal = record.energy.inKilocalories;
  summary.activeEnergyKcal = (summary.activeEnergyKcal ?? 0) + kcal;
  noteLatest(summary, record.endTime);
  noteOrigin(summary, record.metadata?.dataOrigin);
  return [{
    ...base,
    metric_key: 'active_energy_burned',
    raw_type: 'HealthConnect.ActiveCaloriesBurned',
    observed_at: record.startTime,
    observation_end_at: record.endTime,
    value_numeric: kcal,
    unit: 'kcal',
  }];
}

function mapDistance(
  record: RecordResult<'Distance'>,
  summary: HealthConnectGarminSummary,
): WearableObservationInput[] {
  const base = makeBaseObservation(record, 'Distance');
  if (!base) return markSkipped(summary);
  const meters = record.distance.inMeters;
  summary.distanceMeters = (summary.distanceMeters ?? 0) + meters;
  noteLatest(summary, record.endTime);
  noteOrigin(summary, record.metadata?.dataOrigin);
  return [{
    ...base,
    metric_key: 'distance_total',
    raw_type: 'HealthConnect.Distance',
    observed_at: record.startTime,
    observation_end_at: record.endTime,
    value_numeric: meters,
    unit: 'm',
  }];
}

function makeBaseObservation(
  record: Record<string, unknown>,
  type: GarminHealthConnectRecordType,
): Omit<
  WearableObservationInput,
  'metric_key' | 'raw_type' | 'observed_at' | 'observation_end_at' | 'value_numeric' | 'unit'
> | null {
  const metadata = record.metadata;
  const recordId = getRecordId(metadata);

  if (!recordId) return null;

  return {
    source_record_id: recordId,
    source_timezone: getLocalTimeZone(),
    value_text: null,
    value_json: {
      health_connect_type: type,
      data_origin: getMetadataField(metadata, 'dataOrigin'),
      recording_method: getMetadataField(metadata, 'recordingMethod'),
      device: getMetadataField(metadata, 'device'),
    },
    measurement_method: null,
  };
}

function getRecordId(metadata: unknown): string | null {
  const id = getMetadataField(metadata, 'id');
  if (typeof id === 'string' && id.length > 0) return id;
  const clientRecordId = getMetadataField(metadata, 'clientRecordId');
  return typeof clientRecordId === 'string' && clientRecordId.length > 0 ? clientRecordId : null;
}

function getMetadataField(metadata: unknown, key: string): unknown {
  if (!metadata || typeof metadata !== 'object') return null;
  return (metadata as Record<string, unknown>)[key] ?? null;
}

function getLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
}

function noteLatest(summary: HealthConnectGarminSummary, value: string): void {
  if (!summary.latestRecordAt || value > summary.latestRecordAt) {
    summary.latestRecordAt = value;
  }
}

function noteOrigin(summary: HealthConnectGarminSummary, origin: string | undefined): void {
  if (origin && !summary.sourceOrigins.includes(origin)) {
    summary.sourceOrigins.push(origin);
  }
}

function markSkipped(summary: HealthConnectGarminSummary): WearableObservationInput[] {
  summary.skippedRecords += 1;
  return [];
}

function average(values: number[]): number | null {
  const usable = values.filter((value) => Number.isFinite(value));
  if (usable.length === 0) return null;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function averageNullable(current: number | null, next: number | null): number | null {
  if (current === null) return next;
  if (next === null) return current;
  return (current + next) / 2;
}

function latestNumber(_current: number | null, next: number): number {
  return next;
}
