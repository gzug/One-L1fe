import { buildTrendSkeleton } from './trends.ts';
import { FEATURE_FLAG_TREND_SKELETON_READONLY } from './flags.ts';
import { evaluateMinimumSlice } from './minimumSlice.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runTrendAssertions(): void {
  const samples = [
    { timestamp: '2026-04-01T00:00:00.000Z', value: 10 },
    { timestamp: '2026-04-06T00:00:00.000Z', value: 12 },
    { timestamp: '2026-04-14T00:00:00.000Z', value: 14 },
  ];

  const skeleton = buildTrendSkeleton(samples, 30, 'apob');
  assert(skeleton !== null, 'buildTrendSkeleton should emit a skeleton when observations exist.');
  assert(skeleton?.note === 'READ_ONLY_V1_NOT_COUPLED_TO_SCORE', 'Trend skeleton note should be read-only and score-decoupled.');
  assert(skeleton?.sparse === true, 'Trend skeleton should be sparse when the span is shorter than the window.');

  const panel = {
    profileId: 'profile_trend_1',
    panelId: 'panel_trend_1',
    collectedAt: '2026-04-14T00:00:00.000Z',
    entries: [
      { marker: 'apob', value: 165, unit: 'mg/dL' },
      { marker: 'ldl', value: 160, unit: 'mg/dL' },
      { marker: 'hba1c', value: 6.8, unit: '%' },
      { marker: 'glucose', value: 110, unit: 'mg/dL' },
    ],
  } as const;

  const noObservations = evaluateMinimumSlice(panel);
  const withObservations = evaluateMinimumSlice(panel, new Date('2026-04-14T00:00:00.000Z'), {
    apob: samples,
  });

  assert(
    noObservations.priorityScore.rawValue === withObservations.priorityScore.rawValue,
    'Trend observations must not change rawScore.',
  );
  assert(
    noObservations.priorityScore.value === withObservations.priorityScore.value,
    'Trend observations must not change bucket/value.',
  );
  assert(
    noObservations.priorityScore.trendSkeleton === null,
    'Without observations, trendSkeleton should stay null.',
  );
  assert(
    withObservations.priorityScore.trendSkeleton?.markerKey === 'apob',
    'With observations, trendSkeleton should attach to the primary marker.',
  );
  assert(
    FEATURE_FLAG_TREND_SKELETON_READONLY === true,
    'Trend skeleton feature flag should default to enabled in v1.',
  );
  const disabledFeature = evaluateMinimumSlice(
    panel,
    new Date('2026-04-14T00:00:00.000Z'),
    { apob: samples },
    { trendSkeletonReadonly: false },
  );
  assert(
    disabledFeature.priorityScore.trendSkeleton === null,
    'Trend skeleton should be suppressed when the feature flag is off.',
  );
}
