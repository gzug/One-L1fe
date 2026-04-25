import type {
  HealthConnectGarminReadResult,
  HealthConnectGarminSummary,
} from './healthConnectGarminReader';
import {
  applyDataModeToSummary,
  type DataMode,
  type SummaryNumericKey,
} from './healthOsDataMode';

export type SignalSourceStatus =
  | 'Live Health Connect'
  | 'Demo placeholder'
  | 'Not available';

export type SignalScoreUsage =
  | 'Feeds Activity'
  | 'Feeds Recovery'
  | 'Context only'
  | 'Not used';

export interface HealthConnectSignalRow {
  key: string;
  label: string;
  value: string;
  unit: string | null;
  sourceStatus: SignalSourceStatus;
  source: string;
  scoreUsage: SignalScoreUsage;
  isSynthetic: boolean;
}

export function buildHealthConnectSignalRows(
  result: HealthConnectGarminReadResult | null,
  mode: DataMode,
): HealthConnectSignalRow[] {
  const applied = applyDataModeToSummary(result, mode);
  const summary = applied.summary;

  return [
    buildNumericSignal({
      key: 'stepsTotal',
      label: 'Steps',
      summary,
      applied,
      mode,
      unit: 'steps',
      usage: 'Feeds Activity',
      formatter: (value) => Math.round(value).toLocaleString(),
    }),
    buildNumericSignal({
      key: 'distanceMeters',
      label: 'Distance',
      summary,
      applied,
      mode,
      unit: 'km',
      usage: 'Feeds Activity',
      formatter: (value) => (value / 1000).toFixed(1),
    }),
    buildNumericSignal({
      key: 'activeEnergyKcal',
      label: 'Active energy',
      summary,
      applied,
      mode,
      unit: 'kcal',
      usage: 'Feeds Activity',
      formatter: (value) => Math.round(value).toLocaleString(),
    }),
    buildNumericSignal({
      key: 'sleepDurationSeconds',
      label: 'Sleep duration',
      summary,
      applied,
      mode,
      unit: 'h',
      usage: 'Feeds Recovery',
      formatter: (value) => (value / 3600).toFixed(1),
    }),
    buildSleepSessionSignal({ summary, mode, hasAnyLiveValue: applied.hasAnyLiveValue }),
    buildNumericSignal({
      key: 'restingHeartRateBpm',
      label: 'Resting heart rate',
      summary,
      applied,
      mode,
      unit: 'bpm',
      usage: 'Feeds Recovery',
      formatter: (value) => Math.round(value).toLocaleString(),
    }),
    buildNumericSignal({
      key: 'hrvRmssdMs',
      label: 'HRV RMSSD',
      summary,
      applied,
      mode,
      unit: 'ms',
      usage: 'Feeds Recovery',
      formatter: (value) => Math.round(value).toLocaleString(),
    }),
    buildNumericSignal({
      key: 'heartRateAvgBpm',
      label: 'Heart rate avg',
      summary,
      applied,
      mode,
      unit: 'bpm',
      usage: 'Context only',
      formatter: (value) => Math.round(value).toLocaleString(),
    }),
    buildDataOriginSignal({ result, mode }),
  ];
}

function buildNumericSignal(params: {
  key: SummaryNumericKey;
  label: string;
  summary: HealthConnectGarminSummary | null;
  applied: ReturnType<typeof applyDataModeToSummary>;
  mode: DataMode;
  unit: string;
  usage: SignalScoreUsage;
  formatter: (value: number) => string;
}): HealthConnectSignalRow {
  const value = params.summary?.[params.key] ?? null;
  const isSynthetic = isSyntheticNumericField({
    key: params.key,
    value,
    mode: params.mode,
    applied: params.applied,
  });

  if (value === null) {
    return missingSignal(params.label, params.unit, params.usage);
  }

  return {
    key: params.key,
    label: params.label,
    value: params.formatter(value),
    unit: params.unit,
    sourceStatus: isSynthetic ? 'Demo placeholder' : 'Live Health Connect',
    source: isSynthetic ? 'Synthetic demo' : getLiveSource(params.summary),
    scoreUsage: params.usage,
    isSynthetic,
  };
}

function buildSleepSessionSignal(params: {
  summary: HealthConnectGarminSummary | null;
  mode: DataMode;
  hasAnyLiveValue: boolean;
}): HealthConnectSignalRow {
  const count = params.summary?.sleepSessionCount ?? 0;
  if (count <= 0) {
    return missingSignal('Sleep session count', 'sessions', 'Context only');
  }

  const isSynthetic = params.mode === 'demo-filled' && !params.hasAnyLiveValue;
  return {
    key: 'sleepSessionCount',
    label: 'Sleep session count',
    value: `${count}`,
    unit: count === 1 ? 'session' : 'sessions',
    sourceStatus: isSynthetic ? 'Demo placeholder' : 'Live Health Connect',
    source: isSynthetic ? 'Synthetic demo' : getLiveSource(params.summary),
    scoreUsage: 'Context only',
    isSynthetic,
  };
}

function buildDataOriginSignal(params: {
  result: HealthConnectGarminReadResult | null;
  mode: DataMode;
}): HealthConnectSignalRow {
  if (params.result?.status === 'live') {
    const origins = params.result.summary.sourceOrigins;
    const hasGarminOrigin = origins.some((origin) => origin.toLowerCase().includes('garmin'));
    return {
      key: 'dataOrigin',
      label: 'Data origin',
      value: hasGarminOrigin
        ? origins.join(', ')
        : 'Health Connect origin not confirmed',
      unit: null,
      sourceStatus: 'Live Health Connect',
      source: hasGarminOrigin
        ? 'Garmin-origin Health Connect'
        : 'Health Connect origin not confirmed',
      scoreUsage: 'Context only',
      isSynthetic: false,
    };
  }

  if (params.mode === 'demo-filled') {
    return {
      key: 'dataOrigin',
      label: 'Data origin',
      value: 'Synthetic demo',
      unit: null,
      sourceStatus: 'Demo placeholder',
      source: 'Synthetic demo',
      scoreUsage: 'Context only',
      isSynthetic: true,
    };
  }

  return missingSignal('Data origin', null, 'Context only');
}

function isSyntheticNumericField(params: {
  key: SummaryNumericKey;
  value: number | null;
  mode: DataMode;
  applied: ReturnType<typeof applyDataModeToSummary>;
}): boolean {
  if (params.mode !== 'demo-filled' || params.value === null) return false;
  return !params.applied.hasAnyLiveValue || params.applied.syntheticFields.has(params.key);
}

function missingSignal(
  label: string,
  unit: string | null,
  usage: SignalScoreUsage,
): HealthConnectSignalRow {
  return {
    key: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    label,
    value: 'Not available',
    unit,
    sourceStatus: 'Not available',
    source: 'Not available',
    scoreUsage: usage,
    isSynthetic: false,
  };
}

function getLiveSource(summary: HealthConnectGarminSummary | null): string {
  const origins = summary?.sourceOrigins ?? [];
  const hasGarminOrigin = origins.some((origin) => origin.toLowerCase().includes('garmin'));
  if (hasGarminOrigin) return 'Garmin-origin Health Connect';
  return 'Health Connect origin not confirmed';
}
