import { summarizeMinimumSliceResult } from './minimumSliceResultSummary.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runMinimumSliceResultSummaryAssertions(): void {
  const summary = summarizeMinimumSliceResult({
    evaluation: {
      profileId: 'profile_demo_1',
      panelId: 'panel_demo_1',
      coverage: {
        state: 'partial',
        notes: [],
      },
      priorityScore: {
        value: 47,
        topDrivers: ['ApoB', 'HbA1c'],
      },
    },
    persistence: {
      interpretationRunId: 'run_demo_1',
      interpretedEntryIds: ['entry_1', 'entry_2'],
      recommendationIds: ['rec_1'],
    },
  } as any);

  assert(summary.profileId === 'profile_demo_1', 'Result summary should preserve the profile id.');
  assert(summary.panelId === 'panel_demo_1', 'Result summary should preserve the panel id.');
  assert(summary.interpretationRunId === 'run_demo_1', 'Result summary should preserve the interpretation run id.');
  assert(summary.interpretedEntryCount === 2, 'Result summary should count interpreted entries.');
  assert(summary.recommendationCount === 1, 'Result summary should count recommendations.');
  assert(summary.coverageState === 'partial', 'Result summary should preserve the coverage state.');
  assert(summary.priorityScoreValue === 47, 'Result summary should preserve the priority score value.');
  assert(summary.topDrivers.join(',') === 'ApoB,HbA1c', 'Result summary should preserve top drivers.');
}
