import { evaluateMinimumSlice, MinimumSlicePanelInput } from './minimumSlice';

export const fixturePrimaryLipidWithBoundedModifiers: MinimumSlicePanelInput = {
  profileId: 'profile_demo_1',
  panelId: 'panel_demo_1',
  collectedAt: '2026-04-10T08:00:00.000Z',
  source: 'fixture',
  entries: [
    { marker: 'apob', value: 118, unit: 'mg/dL' },
    { marker: 'ldl', value: 152, unit: 'mg/dL' },
    { marker: 'hba1c', value: 5.8, unit: '%' },
    { marker: 'glucose', value: 104, unit: 'mg/dL', fastingContext: true },
    { marker: 'lpa', value: 62, unit: 'mg/dL' },
    { marker: 'crp', value: 2.4, unit: 'mg/L' },
  ],
};

export const fixtureFallbackLipidAndAssayBlockedCRP: MinimumSlicePanelInput = {
  profileId: 'profile_demo_2',
  panelId: 'panel_demo_2',
  collectedAt: '2026-04-10T08:00:00.000Z',
  source: 'fixture',
  entries: [
    { marker: 'ldl', value: 145, unit: 'mg/dL' },
    { marker: 'hba1c', value: 41, unit: 'mmol/mol' },
    { marker: 'glucose', value: 5.8, unit: 'mmol/L' },
    { marker: 'lpa', value: 130, unit: 'nmol/L' },
    { marker: 'crp', value: 2.9, unit: 'mg/L' },
  ],
};

export const fixtureAmbiguousHbA1cAndStalePanel: MinimumSlicePanelInput = {
  profileId: 'profile_demo_3',
  panelId: 'panel_demo_3',
  collectedAt: '2025-07-10T08:00:00.000Z',
  source: 'fixture',
  entries: [
    { marker: 'apob', value: 95, unit: 'mg/dL' },
    { marker: 'ldl', value: 140, unit: 'mg/dL' },
    { marker: 'hba1c', value: 5.9 },
    { marker: 'glucose', value: 101, unit: 'mg/dL' },
  ],
};

export const fixtureExpectations = {
  primaryLipidWithBoundedModifiers: {
    expectedPrimaryDriver: 'apob',
    expectedLDLScoreInclusion: false,
    expectedHasBoundedModifierNote: true,
  },
  fallbackLipidAndAssayBlockedCRP: {
    expectedPrimaryDriver: 'ldl',
    expectedCoverageState: 'partial',
    expectedCRPRecommendationType: 'collect_more_data',
  },
  ambiguousHbA1cAndStalePanel: {
    expectedCoverageState: 'stale',
    expectedFreshnessBlock: true,
  },
} as const;

export function runFixtureSet(now: Date = new Date('2026-04-12T21:50:00.000Z')) {
  return {
    primaryLipidWithBoundedModifiers: evaluateMinimumSlice(fixturePrimaryLipidWithBoundedModifiers, now),
    fallbackLipidAndAssayBlockedCRP: evaluateMinimumSlice(fixtureFallbackLipidAndAssayBlockedCRP, now),
    ambiguousHbA1cAndStalePanel: evaluateMinimumSlice(fixtureAmbiguousHbA1cAndStalePanel, now),
  };
}
