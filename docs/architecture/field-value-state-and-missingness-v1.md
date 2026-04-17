---
status: draft
canonical_for: field state, manual override, and intentional missingness handling
owner: repo
last_verified: 2026-04-17
supersedes: []
superseded_by: null
scope: architecture
---

# Field value state and missingness policy v1

## Verdict

App fields that influence calculations, recommendations, summaries, or validation must not be modeled as a raw value alone.
They need an explicit field state that distinguishes:
1. present values,
2. synced values,
3. manual overrides,
4. temporarily missing values,
5. intentionally disabled values.

This applies to wearable-backed fields and to other relevant app fields.

## Why

A blank field is ambiguous.
It can mean:
- the integration failed,
- the user has not entered the value yet,
- the value is not available,
- the user does not know it,
- the user does not want to provide it,
- or the app intentionally should not use it.

Those are not the same product or calculation state.
If they are collapsed into `null`, the app will eventually produce:
- broken validation,
- misleading coverage,
- accidental zero-like behavior,
- incorrect scoring,
- or dishonest result confidence.

## Core rule

Every calculation-relevant field should be represented by:
- `value`
- `field_state`
- `value_source`
- optional `state_reason`
- optional provenance metadata

The system must reason on `field_state`, not just on `value`.

## Recommended state model

### `field_state`

Use one of these canonical states in the current implementation baseline:
- `synced`
- `manual_override`
- `missing`
- `disabled`

Implementation simplification for V1:
- treat `provided` as a display-layer umbrella concept, not as a separately stored canonical state
- store concrete active states like `synced` and `manual_override` instead of maintaining a second redundant `provided` value in persistence

Likely next additions after the first slice stabilizes:
- `stale` as a display/recommendation-layer state derived from timestamps and per-metric freshness windows
- `declined` as a UX-distinct form of intentional non-provision, if the product needs to distinguish "not available" from "prefer not to share"

Current V1.5 direction for `stale`:
- derive it, do not store it as a DB column
- compute it from one shared typed domain-layer policy instead of scattering thresholds per feature
- never silently present a stale value as current
- never silently collapse `stale` into `missing`

### Meaning of each state

#### `provided`
Meaning:
- a user-entered or app-entered value is present and currently active.

Use when:
- the field is filled manually and there is no competing synced source.

V1 note:
- in current repo language this remains useful as a UI/app-facing concept, but it should not force a redundant persisted state if `manual_override` or another concrete active state already explains the value.

#### `synced`
Meaning:
- the active value currently comes from an external source such as Apple Health, Health Connect, or Garmin.

Use when:
- the value was imported and is being used as the current app value.

#### `manual_override`
Meaning:
- a synced or defaulted value exists, but the user intentionally replaced or corrected it.

Use when:
- sync is wrong,
- sync is partial,
- sync is stale,
- or the user wants to trust a manually known value instead.

#### `missing`
Meaning:
- no usable value is currently present, but the field is still conceptually applicable.

Use when:
- sync has not completed,
- the user has not entered anything yet,
- or the source is temporarily unavailable.

Important:
- `missing` is not an error by itself.
- `missing` is not the same as `disabled`.

#### `disabled`
Meaning:
- the field should be intentionally excluded from normal use and from calculations that depend on it.

Use when:
- the source was deactivated,
- permissions were revoked,
- the product flow intentionally excludes it,
- or the user chose not to keep that source active.

Important:
- `disabled` must never be interpreted as zero.
- `disabled` must never silently fall back to a guessed value.
- `disabled` should reduce coverage or confidence when relevant, but must not throw validation/runtime errors.
- `disabled` should invalidate reuse of the last known value unless a later product rule explicitly says otherwise.

## `value_source`

Recommended canonical values:
- `manual`
- `wearable_sync`
- `vendor_import`
- `lab`
- `derived`
- `unknown`

Notes:
- `field_state` and `value_source` are not interchangeable.
- Example: a field can have `field_state = manual_override` and `value_source = manual`.
- Example: a field can have `field_state = synced` and `value_source = wearable_sync`.

## Optional `state_reason`

Use small explicit reasons instead of freeform text where possible.

Suggested values:
- `not_available`
- `not_known`
- `prefer_not_to_answer`
- `sync_failed`
- `sync_partial`
- `sync_suspect`
- `user_corrected`
- `user_disabled`
- `out_of_scope`

If the product later promotes `declined` into its own explicit state, prefer using that for UX semantics rather than overloading `state_reason` alone.

## Product behavior rules

## 1. Validation

Validation must distinguish between:
- invalid value shape,
- missing active value,
- intentionally disabled field.

Required behavior:
- `disabled` should not trigger required-field errors.
- `missing` may trigger completeness warnings when the field matters.
- malformed provided values should still fail validation.

## 2. Calculations and scoring

Calculation paths must never use naive truthiness checks.
They must branch on field state.

Required behavior:
- `provided`, `synced`, and `manual_override` are eligible active inputs.
- `missing` is excluded from direct calculation input.
- `disabled` is excluded from direct calculation input.
- if `stale` is introduced later, it should be handled as conditionally usable with explicit freshness labeling rather than silently collapsing into `missing`.
- stale windows should live in one typed domain-layer policy shared by display and recommendation paths.
- if a result depends materially on a `missing` or `disabled` field, coverage/confidence must reflect that.
- no path should crash because a field is `disabled`.

## 3. Recommendations

Recommendations must treat unavailable inputs honestly.

Required behavior:
- do not invent certainty when a prerequisite field is `missing` or `disabled`.
- when a recommendation depends on a disabled field, either:
  - omit that recommendation path, or
  - surface reduced confidence / insufficient data explicitly.

## 4. UI behavior

The UI should make source and state visible without becoming noisy.

Each relevant field should support:
- enter manually,
- sync/import when available,
- edit/correct manually,
- disable / mark as not provided.

Suggested UI labels:
- `From your device`
- `Your value`
- `Adjusted by you`
- `Not yet recorded`
- `Source disconnected`
- `Not provided`

Suggested field-level action posture:
- `synced`: view detail, manual edit
- `manual_override`: edit, optionally reset to device value when a synced candidate still exists
- `missing`: enter manually, connect device
- `disabled`: reconnect source, enter manually
- later `stale`: edit, reconnect source
- later `declined`: change preference

Copy guidance:
- keep labels short,
- avoid apologetic wording,
- show longer help text on demand instead of permanently,
- prefer relative freshness text like `2 days ago` if a stale state is surfaced,
- keep state rendering centralized in a reusable field component instead of duplicating it per metric.

## 5. Sync conflict behavior

When a synced value and a user correction conflict:
- do not silently overwrite the manual correction.
- keep the user-selected active state explicit.
- later syncs may refresh the underlying synced candidate, but should not automatically replace `manual_override`.

## Wearable-first application

For wearable-backed fields, the UI and state model should assume sync can be:
- absent,
- delayed,
- partially populated,
- stale,
- or wrong.

So the product should support this progression cleanly:
1. field starts as `missing`
2. user enters a temporary manual value, state becomes `provided`
3. Garmin sync later arrives, state can become `synced`
4. user distrusts synced value and corrects it, state becomes `manual_override`
5. user does not want this field considered at all, state becomes `disabled`

## Recommended app-facing shape

A minimal generic shape:

```ts
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
```

## Guardrails

- Do not conflate `missing` with `disabled`.
- Do not use `0`, empty string, or `false` as a proxy for disabled.
- Do not hide provenance after manual override.
- Do not silently downgrade manual corrections on the next sync.
- Do not let disabled fields throw runtime or calculation errors.

## Recommended next implementation steps

1. define a shared TypeScript field-state contract in app/domain code,
2. decide which current app fields need the full state model first,
3. add UI affordances for manual edit and disable/not-provided,
4. thread field-state awareness into calculation and summary paths,
5. add tests for `missing` vs `disabled` vs `manual_override`.
