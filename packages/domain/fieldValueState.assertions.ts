import {
  ACTIVE_FIELD_STATES,
  isActiveFieldState,
  requiresNullValueForFieldState,
  isDerivedStale,
  getDerivedDisplayState,
} from './fieldValueState.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runFieldValueStateAssertions(): void {
  // Core active state checks
  assert(ACTIVE_FIELD_STATES.length === 3, 'Expected three active field states.');
  assert(isActiveFieldState('provided') === true, 'provided should be active.');
  assert(isActiveFieldState('synced') === true, 'synced should be active.');
  assert(isActiveFieldState('manual_override') === true, 'manual_override should be active.');
  assert(isActiveFieldState('missing') === false, 'missing should not be active.');
  assert(isActiveFieldState('disabled') === false, 'disabled should not be active.');
  assert(requiresNullValueForFieldState('missing') === true, 'missing should require a null value.');
  assert(requiresNullValueForFieldState('disabled') === true, 'disabled should require a null value.');
  assert(requiresNullValueForFieldState('provided') === false, 'provided should not require a null value.');

  // isDerivedStale — null/undefined input is never stale
  assert(isDerivedStale(null) === false, 'null sourceUpdatedAt should not be stale.');
  assert(isDerivedStale(undefined) === false, 'undefined sourceUpdatedAt should not be stale.');

  // isDerivedStale — recent timestamp is not stale
  const recentIso = new Date(Date.now() - 1000).toISOString();
  assert(isDerivedStale(recentIso) === false, 'A timestamp 1 second ago should not be stale at 30-day default.');

  // isDerivedStale — old timestamp beyond default window is stale
  const thirtyOneDaysAgoMs = Date.now() - 31 * 24 * 60 * 60 * 1000;
  const oldIso = new Date(thirtyOneDaysAgoMs).toISOString();
  assert(isDerivedStale(oldIso) === true, 'A timestamp 31 days ago should be stale at 30-day default.');

  // isDerivedStale — custom maxAgeMs is respected
  const tenMinutesAgoMs = Date.now() - 10 * 60 * 1000;
  const tenMinutesAgoIso = new Date(tenMinutesAgoMs).toISOString();
  const fiveMinutesMs = 5 * 60 * 1000;
  assert(
    isDerivedStale(tenMinutesAgoIso, fiveMinutesMs) === true,
    'A timestamp 10 minutes ago should be stale with a 5-minute maxAgeMs.',
  );
  assert(
    isDerivedStale(tenMinutesAgoIso, 60 * 60 * 1000) === false,
    'A timestamp 10 minutes ago should not be stale with a 1-hour maxAgeMs.',
  );

  // getDerivedDisplayState — returns stale when stale
  assert(
    getDerivedDisplayState(oldIso) === 'stale',
    'getDerivedDisplayState should return stale for an old timestamp.',
  );

  // getDerivedDisplayState — returns null when fresh
  assert(
    getDerivedDisplayState(recentIso) === null,
    'getDerivedDisplayState should return null for a recent timestamp.',
  );

  // getDerivedDisplayState — returns null for missing timestamp
  assert(
    getDerivedDisplayState(null) === null,
    'getDerivedDisplayState should return null when sourceUpdatedAt is null.',
  );
}
