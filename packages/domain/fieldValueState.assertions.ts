import {
  ACTIVE_FIELD_STATES,
  isActiveFieldState,
  requiresNullValueForFieldState,
} from './fieldValueState.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runFieldValueStateAssertions(): void {
  assert(ACTIVE_FIELD_STATES.length === 3, 'Expected three active field states.');
  assert(isActiveFieldState('provided') === true, 'provided should be active.');
  assert(isActiveFieldState('synced') === true, 'synced should be active.');
  assert(isActiveFieldState('manual_override') === true, 'manual_override should be active.');
  assert(isActiveFieldState('missing') === false, 'missing should not be active.');
  assert(isActiveFieldState('disabled') === false, 'disabled should not be active.');
  assert(requiresNullValueForFieldState('missing') === true, 'missing should require a null value.');
  assert(requiresNullValueForFieldState('disabled') === true, 'disabled should require a null value.');
  assert(requiresNullValueForFieldState('provided') === false, 'provided should not require a null value.');
}

