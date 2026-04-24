import { getSubDotsForTab, MAIN_DOT_STRUCTURE } from './dotStructure.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runDotStructureAssertions(): void {
  assert(MAIN_DOT_STRUCTURE.length === 5, 'There must be exactly 5 main dots.');

  const lifestyle = getSubDotsForTab('lifestyle');
  assert(
    lifestyle.some((dot) => dot.title === 'Nutrition'),
    'Lifestyle must expose Nutrition as a visible sub-dot.',
  );
  assert(
    lifestyle.some((dot) => dot.title === 'Mind & Sleep'),
    'Lifestyle must expose Mind & Sleep as a visible sub-dot.',
  );

  const activity = getSubDotsForTab('activity');
  assert(
    activity.some((dot) => dot.title === 'Wearable Sync'),
    'Activity must expose Wearable Sync as a visible sub-dot.',
  );
}

