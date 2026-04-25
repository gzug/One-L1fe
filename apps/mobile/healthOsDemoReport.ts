import type {
  HealthConnectGarminReadResult,
  HealthConnectGarminSummary,
} from './healthConnectGarminReader';
import {
  applyDataModeToSummary,
  type DataMode,
  type SummaryNumericKey,
} from './healthOsDataMode';
import { getAllLatestRealMarkers } from './realBiomarkerPanels';

export interface HealthOsDemoReport {
  exerciseScore: number;
  sleepScore: number;
  nutritionScore: number;
  emotionalHealthScore: number;
  dataCompleteness: number;
  garminConnectionState: string;
  weakestPillar: string;
  biggestOpportunity: string;
  longTermRisk: string;
  bottleneck: string;
  actions: string[];
  sourceLabel: string;
  dataMode: DataMode;
  hasLiveHealthConnect: boolean;
  usesSyntheticData: boolean;
  syntheticFields: SummaryNumericKey[];
  realLabPanelCount: number;
}

export function buildHealthOsDemoReport(params: {
  healthConnectResult: HealthConnectGarminReadResult | null;
  dataMode: DataMode;
}): HealthOsDemoReport {
  const { healthConnectResult, dataMode } = params;
  const applied = applyDataModeToSummary(healthConnectResult, dataMode);
  const summary = applied.summary;
  const hasLiveHealthConnect = applied.hasAnyLiveValue;
  const isDemoFilled = dataMode === 'demo-filled';

  const exerciseScore = summary ? scoreExercise(summary) : 0;
  const sleepScore = summary ? scoreSleep(summary) : 0;
  // Nutrition and emotional self-reports are intentionally excluded from V1 Marathon scoring.
  // This prototype uses measured wearable signals + real lab context only.
  const nutritionScore = 0;
  const emotionalHealthScore = 0;

  const realMarkers = getAllLatestRealMarkers();
  const realLabPanelCount = countDistinctRealPanels(realMarkers);

  const dataCompleteness = calculateCompleteness({
    summary,
    syntheticFields: applied.syntheticFields,
    isDemoFilled,
    realMarkerCount: realMarkers.length,
  });

  const pillarScores = [
    { pillar: 'Activity', score: exerciseScore },
    { pillar: 'Recovery', score: sleepScore },
  ].filter((entry) => entry.score > 0);

  const weakestPillar = pillarScores.length > 0
    ? [...pillarScores].sort((a, b) => a.score - b.score)[0].pillar
    : 'Not enough data';

  const actions = chooseActions({
    weakestPillar,
    hasLiveHealthConnect,
    dataMode,
  });

  return {
    exerciseScore,
    sleepScore,
    nutritionScore,
    emotionalHealthScore,
    dataCompleteness,
    garminConnectionState: getGarminConnectionState(healthConnectResult, dataMode),
    weakestPillar,
    biggestOpportunity: getBiggestOpportunity(weakestPillar, hasLiveHealthConnect, dataMode),
    longTermRisk:
      'Sustained gaps in activity, sleep regularity, or recovery data can reduce long-term trend confidence.',
    bottleneck: getBottleneck({
      summary,
      hasLiveHealthConnect,
      dataMode,
      realMarkerCount: realMarkers.length,
    }),
    actions,
    sourceLabel: getSourceLabel(dataMode, hasLiveHealthConnect, realLabPanelCount),
    dataMode,
    hasLiveHealthConnect,
    usesSyntheticData: applied.syntheticFields.size > 0,
    syntheticFields: Array.from(applied.syntheticFields),
    realLabPanelCount,
  };
}

function scoreExercise(summary: HealthConnectGarminSummary): number {
  const stepsScore = clampScore(((summary.stepsTotal ?? 0) / 8_000) * 45);
  const energyScore = clampScore(((summary.activeEnergyKcal ?? 0) / 450) * 30);
  const distanceScore = clampScore(((summary.distanceMeters ?? 0) / 6_000) * 25);
  return Math.round(Math.min(100, stepsScore + energyScore + distanceScore));
}

function scoreSleep(summary: HealthConnectGarminSummary): number {
  const sleepHours = (summary.sleepDurationSeconds ?? 0) / 3600;
  const durationScore = clampScore((sleepHours / 8) * 55);
  const hrvScore = summary.hrvRmssdMs === null ? 0 : clampScore((summary.hrvRmssdMs / 65) * 25);
  const rhrScore = summary.restingHeartRateBpm === null
    ? 0
    : clampScore(((75 - summary.restingHeartRateBpm) / 25) * 20);
  return Math.round(Math.min(100, durationScore + hrvScore + rhrScore));
}

function calculateCompleteness(params: {
  summary: HealthConnectGarminSummary | null;
  syntheticFields: ReadonlySet<SummaryNumericKey>;
  isDemoFilled: boolean;
  realMarkerCount: number;
}): number {
  const wearableSlots: SummaryNumericKey[] = [
    'stepsTotal',
    'sleepDurationSeconds',
    'restingHeartRateBpm',
    'hrvRmssdMs',
    'activeEnergyKcal',
    'distanceMeters',
  ];

  const liveWearableFields = params.summary
    ? wearableSlots.filter((key) =>
        params.summary![key] !== null && !params.syntheticFields.has(key),
      ).length
    : 0;
  const syntheticWearableFields = params.summary
    ? wearableSlots.filter((key) => params.syntheticFields.has(key)).length
    : 0;

  const wearableContribution = liveWearableFields + (params.isDemoFilled ? syntheticWearableFields : 0);
  const labContribution = Math.min(params.realMarkerCount, 8);
  const denominator = wearableSlots.length + 8;
  return Math.round(((wearableContribution + labContribution) / denominator) * 100);
}

function getGarminConnectionState(
  result: HealthConnectGarminReadResult | null,
  dataMode: DataMode,
): string {
  if (!result) {
    return dataMode === 'demo-filled'
      ? 'Not checked (Demo Filled covering gaps)'
      : 'Not checked';
  }
  if (result.status === 'unavailable') return 'Health Connect unavailable';
  if (result.status === 'error') return 'Health Connect read error';
  if (result.status === 'no-records') {
    return dataMode === 'demo-filled'
      ? 'No live records (Demo Filled covering gaps)'
      : 'No live Health Connect data available yet';
  }

  const hasGarminOrigin = result.summary.sourceOrigins.some((origin) =>
    origin.toLowerCase().includes('garmin'),
  );
  return hasGarminOrigin
    ? 'Garmin-origin Health Connect records readable'
    : 'Health Connect records readable, Garmin origin not confirmed';
}

function getBiggestOpportunity(
  weakestPillar: string,
  hasLiveHealthConnect: boolean,
  dataMode: DataMode,
): string {
  if (!hasLiveHealthConnect && dataMode === 'real') {
    return 'Connect Garmin through Health Connect. Real lab values are already available from Apr 2025 + Oct 2023 panels.';
  }
  if (weakestPillar === 'Recovery') return 'Improve sleep regularity and recovery visibility.';
  if (weakestPillar === 'Activity') return 'Increase consistent movement days before adding intensity.';
  return 'Add the missing source with the lowest effort.';
}

function getBottleneck(params: {
  summary: HealthConnectGarminSummary | null;
  hasLiveHealthConnect: boolean;
  dataMode: DataMode;
  realMarkerCount: number;
}): string {
  if (!params.hasLiveHealthConnect && params.dataMode === 'real') {
    return 'Health Connect has not returned readable Garmin data yet. Real lab panels are still usable for biomarker context.';
  }
  if (!params.summary?.hrvRmssdMs) return 'HRV is missing, so recovery confidence is limited.';
  if (!params.summary.restingHeartRateBpm) return 'Resting heart rate is missing, so sleep/recovery context is thinner.';
  if (params.realMarkerCount === 0) return 'No real lab markers loaded.';
  return 'Completeness is good enough for a reduced weekly report.';
}

function chooseActions(params: {
  weakestPillar: string;
  hasLiveHealthConnect: boolean;
  dataMode: DataMode;
}): string[] {
  if (!params.hasLiveHealthConnect && params.dataMode === 'real') {
    return [
      'Open Garmin Connect and confirm Health Connect sharing is enabled.',
      'Grant all One L1fe Health Connect permissions.',
      'Run sync again after Garmin Connect finishes syncing the watch.',
    ];
  }

  const actionsByPillar: Record<string, string[]> = {
    Activity: [
      'Target one more 20-minute easy walk this week.',
      'Keep intensity low until recovery trend is stable.',
      'Review steps, distance, and active energy again after 7 days.',
    ],
    Recovery: [
      'Protect a consistent sleep window for the next 3 nights.',
      'Keep intensity conservative until HRV and resting heart rate are visible.',
      'Re-check HRV and resting heart rate after the next Garmin sync.',
    ],
  };

  return (actionsByPillar[params.weakestPillar] ?? [
    'Add the missing source with the lowest effort.',
    'Keep the weekly report to the top 3 actions.',
    'Review source freshness before changing behavior.',
  ]).slice(0, 3);
}

function getSourceLabel(
  dataMode: DataMode,
  hasLiveHealthConnect: boolean,
  realLabPanelCount: number,
): string {
  const labFragment = realLabPanelCount > 0
    ? `${realLabPanelCount} real lab panel${realLabPanelCount === 1 ? '' : 's'}`
    : 'no real lab data';
  if (dataMode === 'real') {
    const hcFragment = hasLiveHealthConnect ? 'Health Connect live read' : 'no live Health Connect data';
    return `Real data — ${labFragment} + ${hcFragment}`;
  }
  return `Demo Filled — ${labFragment} + synthetic placeholders for missing live fields`;
}

function countDistinctRealPanels(
  markers: ReturnType<typeof getAllLatestRealMarkers>,
): number {
  const ids = new Set<string>();
  for (const reading of markers) {
    ids.add(reading.panelId);
  }
  return ids.size;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}
