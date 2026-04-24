import {
  createSyntheticDemoAskOneL1feContext,
  SYNTHETIC_DEMO_SNAPSHOT,
} from './syntheticDemoData.ts';
import { buildAskOneL1feAnswer } from './askOneL1fe.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runSyntheticDemoDataAssertions(): void {
  assert(SYNTHETIC_DEMO_SNAPSHOT.isSynthetic === true, 'Demo data must be explicitly synthetic.');
  assert(SYNTHETIC_DEMO_SNAPSHOT.periodLabel.includes('90-day'), 'Demo data must describe the 90-day window.');
  assert(SYNTHETIC_DEMO_SNAPSHOT.orbitScores.nutrition === null, 'Nutrition demo score must stay null.');
  assert(
    SYNTHETIC_DEMO_SNAPSHOT.habitLinks.every((link) => link.scoreEffect === 'context_only'),
    'Habit links must be context only.',
  );

  const context = createSyntheticDemoAskOneL1feContext();
  assert(context.sources.some((source) => source.status === 'available'), 'Synthetic Ask context needs available sources.');
  assert(context.sources.some((source) => source.id === 'nutrition_prototype' && source.status === 'planned_locked'), 'Nutrition must remain planned locked in demo context.');
  assert(context.facts.length >= SYNTHETIC_DEMO_SNAPSHOT.metrics.length, 'Synthetic Ask context should expose demo facts.');
  assert(
    context.facts.every((fact) => context.sources.some((source) => source.id === fact.sourceId)),
    'Every synthetic fact must cite an existing source.',
  );

  const answer = buildAskOneL1feAnswer('What changed in the last 3 months?', context);
  assert(answer.canAnswerWithAvailableData === true, 'Synthetic Ask context should support sourced demo answers.');
  assert(answer.sourcesUsed.length > 0, 'Synthetic Ask answer must cite sources.');
  assert(answer.answer.includes('ApoB'), 'Synthetic Ask answer should include realistic demo facts.');
}
