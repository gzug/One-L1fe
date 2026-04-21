import { CanonicalStatus } from './biomarkers.ts';
import { fixtureExpectations, FIXTURE_NOW, runFixtureSet } from './fixtures.v1.ts';
import { evaluateMinimumSlice } from './minimumSlice.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runMinimumSliceAssertions(): void {
  const results = runFixtureSet(FIXTURE_NOW);

  const primary = results.primaryLipidWithBoundedModifiers;
  assert(
    primary.lipidDecision.primaryDriver === fixtureExpectations.primaryLipidWithBoundedModifiers.expectedPrimaryDriver,
    'Primary fixture should keep ApoB as the primary lipid driver.',
  );
  assert(
    primary.entries.find((entry) => entry.marker === 'ldl')?.scoreEligible ===
      fixtureExpectations.primaryLipidWithBoundedModifiers.expectedLDLScoreInclusion,
    'LDL should not be co-scored when ApoB is already driving the lipid story.',
  );
  assert(
    Boolean(primary.priorityScore.boundedModifierNote) ===
      fixtureExpectations.primaryLipidWithBoundedModifiers.expectedHasBoundedModifierNote,
    'Primary fixture should expose a bounded modifier note when Lp(a) or CRP is present.',
  );

  const fallback = results.fallbackLipidAndAssayBlockedCRP;
  assert(
    fallback.lipidDecision.primaryDriver === fixtureExpectations.fallbackLipidAndAssayBlockedCRP.expectedPrimaryDriver,
    'Fallback fixture should promote LDL only when ApoB is missing.',
  );
  assert(
    fallback.coverage.state === fixtureExpectations.fallbackLipidAndAssayBlockedCRP.expectedCoverageState,
    'Fallback fixture should remain a partial coverage state because ApoB is missing.',
  );
  assert(
    fallback.recommendations.some(
      (recommendation) => recommendation.ruleId === 'COV-003' && recommendation.type === 'collect_more_data',
    ),
    'Fallback fixture should emit a collect-more-data recommendation for assay-blocked CRP.',
  );

  const stale = results.ambiguousHbA1cAndStalePanel;
  assert(
    stale.coverage.state === fixtureExpectations.ambiguousHbA1cAndStalePanel.expectedCoverageState,
    'Stale fixture should report stale coverage state.',
  );
  assert(
    stale.entries.some((entry) => entry.blockingReason === 'stale_panel'),
    'Stale fixture should block at least one entry because the panel is stale.',
  );
  assert(
    stale.entries.some((entry) => entry.marker === 'hba1c' && entry.interpretableState !== 'interpretable'),
    'Stale fixture should keep ambiguous-unit HbA1c out of the interpretable path.',
  );

  const apobEntry = primary.entries.find((entry) => entry.marker === 'apob');
  assert(apobEntry?.canonicalStatus === CanonicalStatus.High, 'Primary fixture should map ApoB 118 mg/dL to high.');

  const disabledOptional = evaluateMinimumSlice({
    profileId: 'profile_disabled_optional_1',
    panelId: 'panel_disabled_optional_1',
    collectedAt: '2026-04-13T09:00:00.000Z',
    entries: [
      { marker: 'apob', value: 118, unit: 'mg/dL' },
      { marker: 'ldl', value: 152, unit: 'mg/dL' },
      { marker: 'hba1c', value: 5.8, unit: '%' },
      { marker: 'glucose', value: 104, unit: 'mg/dL', fastingContext: true },
      { marker: 'lpa', value: null, field_state: 'disabled', value_source: 'manual', state_reason: 'user_disabled' },
    ],
  });

  assert(
    disabledOptional.coverage.notes.some((note) => note.includes('intentionally not provided')),
    'Disabled optional entries should appear as intentionally not provided in coverage notes.',
  );
  assert(
    !disabledOptional.recommendations.some((recommendation) => recommendation.verdict.includes('Lp(a) is missing')),
    'Disabled optional entries should not emit collect-more-data recommendations.',
  );

  assert(
    (() => {
      try {
        evaluateMinimumSlice(
          {
            profileId: 'profile_anchor_gate_1',
            panelId: 'panel_anchor_gate_1',
            collectedAt: '2026-04-13T09:00:00.000Z',
            entries: [
              { marker: 'apob', value: 118, unit: 'mg/dL' },
              { marker: 'ldl', value: 152, unit: 'mg/dL' },
              { marker: 'hba1c', value: 5.8, unit: '%' },
              { marker: 'glucose', value: 104, unit: 'mg/dL', fastingContext: true },
            ],
          },
          new Date('2026-04-13T10:00:00.000Z'),
          [],
        );
      } catch (error) {
        return error instanceof Error && error.message.includes('UnanchoredScoreError');
      }

      return false;
    })(),
    'Empty evidence anchors should trigger the hard gate.',
  );
}
