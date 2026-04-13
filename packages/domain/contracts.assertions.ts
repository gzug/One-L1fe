import { fixturePrimaryLipidWithBoundedModifiers } from './fixtures.v1.ts';
import { evaluateMinimumSlice } from './minimumSlice.ts';
import { DOMAIN_ENGINE_MODE, PRIORITY_SCORE_VERSION, toInterpretationPersistencePayload } from './contracts.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runContractAssertions(): void {
  const evaluation = evaluateMinimumSlice(
    fixturePrimaryLipidWithBoundedModifiers,
    new Date('2026-04-12T21:50:00.000Z'),
  );
  const payload = toInterpretationPersistencePayload(evaluation, fixturePrimaryLipidWithBoundedModifiers);

  assert(payload.run.scoreVersion === PRIORITY_SCORE_VERSION, 'Persistence payload should expose the minimum-slice score version.');
  assert(payload.run.engineMode === DOMAIN_ENGINE_MODE, 'Persistence payload should expose the minimum-slice engine mode.');
  assert(payload.run.coverageState === evaluation.coverage.state, 'Coverage state should persist unchanged.');
  assert(payload.entries.length === evaluation.entries.length, 'All evaluated entries should be persisted.');
  assert(
    payload.entries.some((entry) => entry.markerKey === 'apob' && entry.scoreEligible),
    'Persistence payload should include score-eligible ApoB entry data.',
  );
  assert(
    payload.recommendations.every((recommendation) => recommendation.interpretationRunId === payload.run.interpretationRunId),
    'All recommendations should be linked back to the interpretation run.',
  );
  assert(
    payload.recommendations.some((recommendation) => recommendation.ruleOrigin != null),
    'At least one recommendation should carry rule-origin provenance.',
  );
  assert(
    payload.recommendations.some((recommendation) => recommendation.anchorSourceId != null),
    'At least one recommendation should carry a real anchor source id from the evidence registry.',
  );
}
