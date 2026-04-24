import {
  affectsScoreForStatus,
  getOrbitDotDisplayLabel,
  MENU_ENTRIES,
  ORBIT_DOTS,
} from './dotStructure.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runDotStructureAssertions(): void {
  const orbitTitles = ORBIT_DOTS.map((dot) => dot.title);

  assert(
    JSON.stringify(orbitTitles) === JSON.stringify(['Health', 'Nutrition', 'Mind & Sleep', 'Activity']),
    'Orbit must render only Health, Nutrition, Mind & Sleep, and Activity.',
  );

  assert(!orbitTitles.includes('Doctor Prep'), 'Doctor Prep must not render as an orbit dot.');
  assert(!orbitTitles.includes('Habits'), 'Habits must not render as a separate orbit dot.');
  assert(!orbitTitles.includes('Lifestyle'), 'Lifestyle must not render as an orbit dot.');

  const nutrition = ORBIT_DOTS.find((dot) => dot.key === 'nutrition');
  if (nutrition === undefined) {
    throw new Error('Nutrition orbit dot must exist.');
  }
  assert(nutrition.displayState === 'coming_soon', 'Nutrition should be visible but Coming Soon.');
  assert(getOrbitDotDisplayLabel(nutrition) === 'Coming Soon', 'Nutrition should not show a fake score.');

  const health = ORBIT_DOTS.find((dot) => dot.key === 'health');
  if (health === undefined) {
    throw new Error('Health orbit dot must exist.');
  }
  assert(
    getOrbitDotDisplayLabel(health) === 'No Score available',
    'No Score available must not render as 0.',
  );

  const mindSleep = ORBIT_DOTS.find((dot) => dot.key === 'mind_sleep');
  assert(
    mindSleep?.subDots.some((dot) => dot.title === 'Habits & Context' && dot.affectsScore === false),
    'Habits must be context under Mind & Sleep and must not directly affect score.',
  );

  const menuTitles = MENU_ENTRIES.map((entry) => entry.title);
  for (const required of [
    'One L1fe',
    'Health',
    'Nutrition',
    'Mind & Sleep',
    'Activity',
    'Doctor Prep',
    'Profile',
    'How the One L1fe Score Works',
  ]) {
    assert(menuTitles.includes(required), `Menu must contain ${required}.`);
  }

  assert(!affectsScoreForStatus('planned_locked'), 'Coming Soon/planned_locked must not affect score.');
  assert(!affectsScoreForStatus('excluded'), 'Excluded must not affect score.');
}
