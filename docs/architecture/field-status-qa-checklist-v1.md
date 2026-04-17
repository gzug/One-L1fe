---
status: current
canonical_for: field-status QA targets for minimum-slice and early wearable seams
owner: repo
last_verified: 2026-04-17
supersedes: []
superseded_by: null
scope: qa
---

# Field status QA checklist v1

## Verdict

Before any serious app-facing rollout of field-state logic, the repo should explicitly test:
- core state behavior,
- HRV method safety,
- calculation/recommendation suppression rules,
- and wearable ingest safety rails.

The highest-risk failures are:
1. HRV reaching storage without a usable method,
2. cross-user `wearable_source_id` access,
3. treating `disabled` like generic `missing`,
4. and silent state conflicts between synced and manual values.

## P0 release blockers

### Core field-state behavior

1. `synced` with value present
- Expected UI: value + source label
- Expected calculation: value is eligible input
- Expected recommendation behavior: normal path when prerequisites are met

2. `manual_override` with value present
- Expected UI: user-owned value label
- Expected calculation: manual value wins over synced candidate
- Expected recommendation behavior: based on manual value only

3. `missing`
- Expected UI: not-yet-recorded placeholder
- Expected calculation: blocked
- Expected recommendation behavior: no false positive recommendation from that field

4. `disabled`
- Expected UI: disconnected / intentionally excluded posture
- Expected calculation: blocked
- Expected recommendation behavior: suppress collect-more-data style prompts for that field

5. synced + manual value both available
- Expected UI: manual value stays primary
- Expected calculation: manual value wins
- Expected recommendation behavior: recomputed from manual value

6. edit transition from `synced` -> `manual_override`
- Expected UI: state updates immediately
- Expected calculation: recalculates immediately from manual value

### HRV-specific blockers

7. HRV with `rmssd`
- Expected UI: method label visible
- Expected calculation: allowed

8. HRV with `sdnn`
- Expected UI: method label visible
- Expected calculation: allowed, but never mixed with RMSSD

9. HRV without method
- Expected ingest behavior: rejected before storage
- Expected downstream behavior: unavailable, not partially accepted
- **Status: enforced** — `validate.ts` rejects `measurement_method` missing or `'unknown'` for all HRV observations.

10. HRV method changes between syncs
- Expected UI: method-change warning
- Expected calculation: no cross-method trend or merge

11. two active HRV sources with different methods
- Expected UI: per-source display only
- Expected calculation: no merged trend

### Wearable ingest blockers

12. duplicate `source_record_id`
- Expected behavior: upsert, no duplicate row creation

13. unknown `metric_key`
- Expected behavior: reject request item / fail validation path clearly

14. foreign `wearable_source_id`
- Expected behavior: reject, no writes

15. empty observations array
- Expected behavior: reject with clear error message.
- **Status: enforced** — `validate.ts` now rejects empty observations arrays with an explicit error before any downstream processing.

## P1 next-layer tests

1. `stale` display-layer state
- Value shown with explicit freshness label
- never silently treated as current
- **Note:** `stale` is a derived display/recommendation concept only. `isDerivedStale()` and `getDerivedDisplayState()` in `packages/domain/fieldValueState.ts` are the shared policy. Do not persist `stale` as a `field_state` column value.

2. `declined` state, if later adopted
- blocked like missing for engine purposes
- UX-distinct from ordinary missingness

3. reset from `manual_override` back to synced
- only visible when a synced candidate still exists
- recomputes from synced value

4. manual HRV entry requires method selection
- no method, no submit

5. lab-field stale handling (`lpa`, `crp`)
- date labeled
- interpretation bounded by age

6. source deactivated mid-session
- later syncs rejected until reactivation path is explicit

7. timezone/day-boundary handling for sleep-derived metrics
- `source_timezone` must be preserved and used in day assignment logic

## P2 capacity-allowing tests

1. rapid state transitions in one session
- final state wins
- no stale intermediate UI state persists

2. oversized payload behavior
- confirm practical failure mode and whether partial success semantics are ever introduced
- Current repo note: current implementation chunks by 500 but validation caps requests at 5000; true 10k handling is not a current contract guarantee.

3. future timestamps / clock skew
- current behavior should be made explicit before relying on it

4. multiple same-field lab results on different dates
- most recent should win in UI unless a historical comparison surface is explicitly built

## Repo-specific highest-risk targets to keep explicit

### 1. HRV method enforcement

Current repo posture already rejects `unknown` for new HRV observations in:
- `supabase/functions/wearables-sync/_lib/validate.ts`

That should remain explicitly asserted before broadening any wearable work.

### 2. Cross-user wearable source access

Ownership check currently lives in:
- `supabase/functions/wearables-sync/_lib/sync.ts`

That path should keep explicit tests because it is a true security boundary, not just UX logic.

### 3. Disabled vs missing semantics

Current repo posture now distinguishes `disabled` from generic `missing` in the minimum-slice domain flow.
That distinction should remain covered so later refactors do not reintroduce false collect-more-data prompts.

## Recommended next assertion additions

1. add explicit assertion coverage for cross-user `wearable_source_id` rejection
2. ~~add explicit assertion coverage for HRV-without-method rejection at the wearable validate layer~~ — **already enforced in `validate.ts`; add integration-level assertion once hosted proof is in place**
3. add assertion coverage for disabled-vs-missing recommendation suppression beyond the current minimum-slice slice
4. add a small UI/model-level test matrix once field-state rendering is centralized further
