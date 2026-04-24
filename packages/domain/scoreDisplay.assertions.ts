import type { OneL1feAggregateResult } from './scoreAggregation.ts';
import {
  COVERAGE_THRESHOLD_STARTER,
  COVERAGE_THRESHOLD_USABLE,
  MESSAGE_NO_DATA,
  deriveScoreDisplayState,
} from './scoreDisplay.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function makeAggregate(partial: Partial<OneL1feAggregateResult>): OneL1feAggregateResult {
  return {
    score: null,
    totalEffectiveWeight: 0,
    eligibleDotCount: 0,
    coverageRatio: 0,
    activeLeafTotal: 0,
    activeLeafWithData: 0,
    ...partial,
  };
}

export function runScoreDisplayAssertions(): void {
  // --- no_data: never show raw 0 ------------------------------------------
  const empty = deriveScoreDisplayState(makeAggregate({}));
  assert(empty.state === 'no_data', 'Empty aggregate should be state: no_data.');
  assert(empty.score === null, 'no_data must never display a numeric score.');
  assert(empty.message === MESSAGE_NO_DATA, 'no_data should surface the check-in prompt.');

  const scoreWithoutDots = deriveScoreDisplayState(
    makeAggregate({ score: 50, eligibleDotCount: 0 }),
  );
  assert(
    scoreWithoutDots.state === 'no_data',
    'eligibleDotCount === 0 should force no_data even if score is numeric.',
  );
  assert(scoreWithoutDots.score === null, 'no_data must mask numeric score.');

  // --- starter bucket ------------------------------------------------------
  const starter = deriveScoreDisplayState(
    makeAggregate({
      score: 72,
      eligibleDotCount: 2,
      coverageRatio: COVERAGE_THRESHOLD_STARTER - 0.05,
    }),
  );
  assert(starter.state === 'starter', 'Below starter threshold should be state: starter.');
  assert(starter.confidence === 'low', 'starter confidence must be low.');
  assert(starter.score === 72, 'starter should round and display the score.');

  // --- usable bucket -------------------------------------------------------
  const usable = deriveScoreDisplayState(
    makeAggregate({
      score: 72.4,
      eligibleDotCount: 4,
      coverageRatio: (COVERAGE_THRESHOLD_STARTER + COVERAGE_THRESHOLD_USABLE) / 2,
    }),
  );
  assert(usable.state === 'usable', 'Mid-range coverage should be state: usable.');
  assert(usable.confidence === 'medium', 'usable confidence must be medium.');
  assert(usable.score === 72, 'usable must round score to integer.');

  // --- strong bucket -------------------------------------------------------
  const strong = deriveScoreDisplayState(
    makeAggregate({
      score: 81.6,
      eligibleDotCount: 6,
      coverageRatio: COVERAGE_THRESHOLD_USABLE + 0.05,
    }),
  );
  assert(strong.state === 'strong', 'Above usable threshold should be state: strong.');
  assert(strong.confidence === 'high', 'strong confidence must be high.');
  assert(strong.score === 82, 'strong must round score to integer.');

  // --- Threshold boundaries are exclusive lower / inclusive upper ---------
  // At exactly COVERAGE_THRESHOLD_STARTER we cross from starter → usable.
  const atStarterBoundary = deriveScoreDisplayState(
    makeAggregate({
      score: 70,
      eligibleDotCount: 3,
      coverageRatio: COVERAGE_THRESHOLD_STARTER,
    }),
  );
  assert(
    atStarterBoundary.state === 'usable',
    'coverage === starter threshold should fall into usable.',
  );

  const atUsableBoundary = deriveScoreDisplayState(
    makeAggregate({
      score: 70,
      eligibleDotCount: 5,
      coverageRatio: COVERAGE_THRESHOLD_USABLE,
    }),
  );
  assert(
    atUsableBoundary.state === 'strong',
    'coverage === usable threshold should fall into strong.',
  );

  // --- coveragePct is rounded ---------------------------------------------
  const ratios: Array<[number, number]> = [
    [0, 0],
    [0.333333, 33],
    [0.666667, 67],
    [1, 100],
  ];
  for (const [ratio, expected] of ratios) {
    const view = deriveScoreDisplayState(
      makeAggregate({
        score: 70,
        eligibleDotCount: 1,
        coverageRatio: ratio,
      }),
    );
    assert(
      view.coveragePct === expected,
      `coveragePct for ${ratio} should be ${expected}, got ${view.coveragePct}.`,
    );
  }
}
