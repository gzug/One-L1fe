import { CanonicalStatus } from './biomarkers.ts';
import { fixtureExpectations, runFixtureSet } from './fixtures.v1.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runMinimumSliceAssertions(): void {
  const results = runFixtureSet();

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
}
