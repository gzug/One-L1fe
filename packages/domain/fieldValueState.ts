export type FieldState =
  | 'provided'
  | 'synced'
  | 'manual_override'
  | 'missing'
  | 'disabled';

export type FieldValueSource =
  | 'manual'
  | 'wearable_sync'
  | 'vendor_import'
  | 'lab'
  | 'derived'
  | 'unknown';

export type FieldStateReason =
  | 'not_available'
  | 'not_known'
  | 'prefer_not_to_answer'
  | 'sync_failed'
  | 'sync_partial'
  | 'sync_suspect'
  | 'user_corrected'
  | 'user_disabled'
  | 'out_of_scope';

export interface AppFieldValue<T> {
  value: T | null;
  field_state: FieldState;
  value_source: FieldValueSource;
  state_reason?: FieldStateReason | null;
  updated_at?: string | null;
  source_updated_at?: string | null;
}

export const ACTIVE_FIELD_STATES: FieldState[] = ['provided', 'synced', 'manual_override'];

export function isActiveFieldState(state: FieldState): boolean {
  return ACTIVE_FIELD_STATES.includes(state);
}

export function requiresNullValueForFieldState(state: FieldState): boolean {
  return state === 'missing' || state === 'disabled';
}

