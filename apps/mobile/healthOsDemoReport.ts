import type {
  HealthConnectGarminReadResult,
  HealthConnectGarminSummary,
} from './healthConnectGarminReader';

export interface ManualDemoInputs {
  baselineComplete: boolean;
  bloodPanelAvailable: boolean;
  nutritionLogged: boolean;
  emotionalCheckInComplete: boolean;
}

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
  isManualFallback: boolean;
}

export const DEFAULT_MANUAL_DEMO_INPUTS: ManualDemoInputs = {
  baselineComplete: true,
  bloodPanelAvailable: true,
  nutritionLogged: true,
  emotionalCheckInComplete: true,
};

export function buildHealthOsDemoReport(params: {
  healthConnectResult: HealthConnectGarminReadResult | null;
  manualInputs: ManualDemoInputs;
  manualFallbackEnabled: boolean;
}): HealthOsDemoReport {
  const summary = params.healthConnectResult?.summary ?? null;
  const hasLiveRecords = params.healthConnectResult?.status === 'live';
  const scoreSource = hasLiveRecords ? 'Health Connect live read' : 'Manual demo fallback';

  const exerciseScore = hasLiveRecords && summary
    ? scoreExercise(summary)
    : params.manualFallbackEnabled
      ? 73
      : 0;
  const sleepScore = hasLiveRecords && summary
    ? scoreSleep(summary)
    : params.manualFallbackEnabled
      ? 68
      : 0;
  const nutritionScore = params.manualInputs.nutritionLogged ? 64 : 0;
  const emotionalHealthScore = params.manualInputs.emotionalCheckInComplete ? 71 : 0;
  const dataCompleteness = calculateCompleteness(summary, params.manualInputs, hasLiveRecords);

  const pillarScores = [
    { pillar: 'Exercise', score: exerciseScore },
    { pillar: 'Sleep', score: sleepScore },
    { pillar: 'Nutrition', score: nutritionScore },
    { pillar: 'Emotional Health', score: emotionalHealthScore },
  ].filter((entry) => entry.score > 0);

  const weakestPillar = pillarScores.length > 0
    ? [...pillarScores].sort((a, b) => a.score - b.score)[0].pillar
    : 'Not enough data';

  const actions = chooseActions(weakestPillar, hasLiveRecords, params.manualFallbackEnabled);

  return {
    exerciseScore,
    sleepScore,
    nutritionScore,
    emotionalHealthScore,
    dataCompleteness,
    garminConnectionState: getGarminConnectionState(params.healthConnectResult),
    weakestPillar,
    biggestOpportunity: getBiggestOpportunity(weakestPillar, hasLiveRecords),
    longTermRisk:
      'Sustained gaps in activity, sleep regularity, or recovery data can reduce long-term trend confidence.',
    bottleneck: getBottleneck(summary, params.manualInputs, hasLiveRecords),
    actions,
    sourceLabel: scoreSource,
    isManualFallback: !hasLiveRecords,
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

function calculateCompleteness(
  summary: HealthConnectGarminSummary | null,
  manualInputs: ManualDemoInputs,
  hasLiveRecords: boolean,
): number {
  const liveFields = summary && hasLiveRecords
    ? [
        summary.stepsTotal,
        summary.sleepDurationSeconds,
        summary.sleepSessionCount > 0 ? summary.sleepSessionCount : null,
        summary.restingHeartRateBpm,
        summary.hrvRmssdMs,
        summary.activeEnergyKcal,
        summary.distanceMeters,
      ].filter((value) => value !== null).length
    : 0;
  const manualFields = [
    manualInputs.baselineComplete,
    manualInputs.bloodPanelAvailable,
    manualInputs.nutritionLogged,
    manualInputs.emotionalCheckInComplete,
  ].filter(Boolean).length;

  return Math.round(((liveFields + manualFields) / 11) * 100);
}

function getGarminConnectionState(result: HealthConnectGarminReadResult | null): string {
  if (!result) return 'Not checked';
  if (result.status === 'unavailable') return 'Health Connect unavailable';
  if (result.status === 'error') return 'Health Connect read error';
  if (result.status === 'no-records') return 'No readable Health Connect records';

  const hasGarminOrigin = result.summary.sourceOrigins.some((origin) =>
    origin.toLowerCase().includes('garmin'),
  );
  return hasGarminOrigin
    ? 'Garmin-origin Health Connect records readable'
    : 'Health Connect records readable, Garmin origin not confirmed';
}

function getBiggestOpportunity(weakestPillar: string, hasLiveRecords: boolean): string {
  if (!hasLiveRecords) {
    return 'Connect Garmin through Health Connect or use the clearly labelled manual demo mode.';
  }
  if (weakestPillar === 'Sleep') return 'Improve sleep regularity and recovery visibility.';
  if (weakestPillar === 'Exercise') return 'Increase consistent movement days before adding intensity.';
  if (weakestPillar === 'Nutrition') return 'Add a lightweight food pattern check-in.';
  if (weakestPillar === 'Emotional Health') return 'Add a short weekly check-in to connect stress and sleep context.';
  return 'Add missing data sources to raise confidence.';
}

function getBottleneck(
  summary: HealthConnectGarminSummary | null,
  manualInputs: ManualDemoInputs,
  hasLiveRecords: boolean,
): string {
  if (!hasLiveRecords) return 'Health Connect has not returned readable Garmin data in this demo session.';
  if (!summary?.hrvRmssdMs) return 'HRV is missing, so recovery confidence is limited.';
  if (!summary.restingHeartRateBpm) return 'Resting heart rate is missing, so sleep/recovery context is thinner.';
  if (!manualInputs.bloodPanelAvailable) return 'Blood panel is missing, so biomarker context is manual-only.';
  return 'Completeness is good enough for a reduced weekly report.';
}

function chooseActions(
  weakestPillar: string,
  hasLiveRecords: boolean,
  manualFallbackEnabled: boolean,
): string[] {
  if (!hasLiveRecords && !manualFallbackEnabled) {
    return [
      'Open Garmin Connect and confirm Health Connect sharing is enabled.',
      'Grant all One L1fe Health Connect permissions.',
      'Run sync again after Garmin Connect finishes syncing the watch.',
    ];
  }

  const actionsByPillar: Record<string, string[]> = {
    Exercise: [
      'Target one more 20-minute easy walk this week.',
      'Keep intensity low until sleep trend is stable.',
      'Review steps and distance again after 7 days.',
    ],
    Sleep: [
      'Protect a consistent sleep window for the next 3 nights.',
      'Keep late caffeine and alcohol context visible in the weekly check-in.',
      'Re-check HRV and resting heart rate after the next Garmin sync.',
    ],
    Nutrition: [
      'Log two typical meals as pattern context, not calorie diagnosis.',
      'Compare protein and fiber consistency across the week.',
      'Use blood panel context before making major changes.',
    ],
    'Emotional Health': [
      'Complete one short stress and energy check-in.',
      'Pair high-stress days with sleep and HRV context.',
      'Pick one recovery block before the next report.',
    ],
  };

  return (actionsByPillar[weakestPillar] ?? [
    'Add the missing source with the lowest effort.',
    'Keep the weekly report to the top 3 actions.',
    'Review source freshness before changing behavior.',
  ]).slice(0, 3);
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}
