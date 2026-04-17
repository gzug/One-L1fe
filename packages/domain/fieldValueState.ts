export type FieldState =
  | 'provided'
  | 'synced'
  | 'manual_override'
  | 'missing'
  | 'disabled';

/**
 * 'stale' is intentionally NOT a persisted FieldState variant.
 * It is a derived display/recommendation-layer concept backed by
 * observation freshness policy. Do not store 'stale' as a field_state
 * column value — derive it at read time from metric-level timestamps.
 */
export type DerivedDisplayState = 'stale';

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

/**
 * Returns true when a field value should be treated as stale at the
 * display/recommendation layer, based on how long ago it was last updated.
 *
 * This function operates on timestamps only — it does NOT read or write
 * any persisted field_state. Call it at render/recommendation time.
 *
 * @param sourceUpdatedAt  ISO 8601 string of when the value was last set.
 * @param maxAgeMs         Maximum acceptable age in milliseconds.
 *                         Defaults to 30 days.
 * @param now              Reference timestamp (defaults to Date.now()).
 */
export function isDerivedStale(
  sourceUpdatedAt: string | null | undefined,
  maxAgeMs: number = 30 * 24 * 60 * 60 * 1000,
  now: number = Date.now(),
): boolean {
  if (!sourceUpdatedAt) return false;
  const age = now - new Date(sourceUpdatedAt).getTime();
  return age > maxAgeMs;
}

/**
 * Returns the derived display state for a field value, or null when
 * the field is not stale and no additional display decoration is needed.
 *
 * Intended for use in UI rendering and recommendation suppression logic only.
 */
export function getDerivedDisplayState(
  sourceUpdatedAt: string | null | undefined,
  maxAgeMs?: number,
  now?: number,
): DerivedDisplayState | null {
  return isDerivedStale(sourceUpdatedAt, maxAgeMs, now) ? 'stale' : null;
}
