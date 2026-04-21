import {
  aggregateTotalPriorityScore,
  aggregateTotalPriorityScoreWithEvidence,
  calculateWeightedScore,
  getBiomarkerDefinition,
  mapPriorityScore,
} from './biomarkers.ts';
import {
  fixtureAmbiguousHbA1cAndStalePanel,
  fixtureFallbackLipidAndAssayBlockedCRP,
  fixturePrimaryLipidWithBoundedModifiers,
  FIXTURE_NOW,
} from './fixtures.v1.ts';
import { evaluateMinimumSlice, MinimumSlicePanelInput } from './minimumSlice.ts';
import { markerRuntimeConfigs } from './v1.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function toBiomarkerValues(panel: MinimumSlicePanelInput): Record<string, number | null> {
  return Object.fromEntries(panel.entries.map((entry) => [entry.marker, entry.value ?? null])) as Record<
    string,
    number | null
  >;
}

const pillarByBiomarker = Object.fromEntries(
  Object.entries(markerRuntimeConfigs).map(([marker, config]) => [marker, config.pillar]),
);

export function runScoringAssertions(): void {
  const configuredKeys = Object.keys(markerRuntimeConfigs).sort();
  const expectedKeys = [
    'apob',
    'b12',
    'crp',
    'dao',
    'ferritin',
    'glucose',
    'hba1c',
    'ldl',
    'lpa',
    'magnesium',
    'triglycerides',
    'vitamin_d',
  ].sort();

  assert(
    configuredKeys.join(',') === expectedKeys.join(','),
    'Every biomarker currently present in the domain registry should carry an explicit pillar assignment.',
  );

  const existingFixtures = [
    fixturePrimaryLipidWithBoundedModifiers,
    fixtureFallbackLipidAndAssayBlockedCRP,
    fixtureAmbiguousHbA1cAndStalePanel,
  ];

  for (const fixture of existingFixtures) {
    const evaluation = evaluateMinimumSlice(fixture, FIXTURE_NOW);
    const expectedRawScore = aggregateTotalPriorityScore(toBiomarkerValues(fixture));

    assert(
      evaluation.priorityScore.rawValue === expectedRawScore,
      `Priority raw score should stay backward-compatible for fixture ${fixture.panelId}.`,
    );
  }

  const optimalPanel = evaluateMinimumSlice(
    {
      profileId: 'profile_optimal_1',
      panelId: 'panel_optimal_1',
      collectedAt: '2026-04-13T09:00:00.000Z',
      entries: [
        { marker: 'apob', value: 70, unit: 'mg/dL' },
        { marker: 'ldl', value: 68, unit: 'mg/dL' },
        { marker: 'hba1c', value: 5.1, unit: '%' },
        { marker: 'glucose', value: 82, unit: 'mg/dL', fastingContext: true },
      ],
    },
    FIXTURE_NOW,
  );

  assert(optimalPanel.priorityScore.bucket === 0, 'All-optimal panels should emit bucket 0.');

  const dominantCardiovascularPanel = evaluateMinimumSlice(
    {
      profileId: 'profile_dominant_cardio_1',
      panelId: 'panel_dominant_cardio_1',
      collectedAt: '2026-04-13T09:00:00.000Z',
      entries: [
        { marker: 'apob', value: 165, unit: 'mg/dL' },
        { marker: 'ldl', value: 140, unit: 'mg/dL' },
        { marker: 'hba1c', value: 6.8, unit: '%' },
        { marker: 'glucose', value: 118, unit: 'mg/dL', fastingContext: true },
        { marker: 'crp', value: 6, unit: 'mg/L', assayType: 'hs-crp' },
      ],
    },
    FIXTURE_NOW,
  );

  assert(dominantCardiovascularPanel.priorityScore.bucket === 4, 'Severe ApoB + HbA1c + CRP should emit bucket 4.');
  assert(
    dominantCardiovascularPanel.priorityScore.pillarScores.cardiovascular.markerKey === 'apob',
    'The severe mixed-risk panel should still be cardiovascular-dominant when ApoB is the strongest signal.',
  );

  const apobClampGoodPanel = evaluateMinimumSlice(
    {
      profileId: 'profile_apob_clamp_good_1',
      panelId: 'panel_apob_clamp_good_1',
      collectedAt: '2026-04-13T09:00:00.000Z',
      entries: [
        { marker: 'apob', value: 90, unit: 'mg/dL' },
        { marker: 'ldl', value: 105, unit: 'mg/dL' },
        { marker: 'hba1c', value: 5.1, unit: '%' },
        { marker: 'glucose', value: 82, unit: 'mg/dL', fastingContext: true },
      ],
    },
    FIXTURE_NOW,
  );

  assert(
    apobClampGoodPanel.priorityScore.pillarScores.cardiovascular.bucket === 0,
    'When ApoB is primary and still optimal/good, the cardiovascular pillar should clamp LDL-good down to 0.',
  );

  const apobClampBorderlineInput = {
    biomarkerValues: {
      apob: 90,
      ldl: 120,
      hba1c: 5.1,
      glucose: 82,
    },
    pillarByBiomarker,
    ruleIds: ['LIP-001', 'LIP-002', 'MET-001', 'MET-002'],
    lipidHierarchyDecision: 'apob_primary' as const,
  };
  const apobClampBorderline = aggregateTotalPriorityScoreWithEvidence(apobClampBorderlineInput);
  const ldlDefinition = getBiomarkerDefinition('ldl');

  assert(ldlDefinition, 'LDL biomarker definition should be available for clamp verification.');
  if (!ldlDefinition) {
    throw new Error('LDL biomarker definition should be available for clamp verification.');
  }
  const expectedBorderlineClamp = Math.max(
    0,
    mapPriorityScore(calculateWeightedScore(ldlDefinition, apobClampBorderlineInput.biomarkerValues.ldl)) - 1,
  );
  assert(
    apobClampBorderline.pillarScores.cardiovascular.bucket === expectedBorderlineClamp,
    'ApoB-primary clamping should follow max(0, LDL bucket - 1) for higher LDL tiers as well.',
  );

  const unanchoredPanel = aggregateTotalPriorityScoreWithEvidence({
    biomarkerValues: {
      ferritin: 10,
      vitamin_d: 15,
    },
    pillarByBiomarker,
    ruleIds: [],
    lipidHierarchyDecision: 'none',
  });

  assert(unanchoredPanel.bucket === 0, 'Panels with no anchors should emit bucket 0.');
  assert(
    unanchoredPanel.pillarScores.nutrientContext.reason === 'NOT_EVIDENCE_ANCHORED',
    'Panels with no anchors should surface NOT_EVIDENCE_ANCHORED on the pillar breakdown.',
  );
}
