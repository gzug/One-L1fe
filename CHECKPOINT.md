---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-04-20
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Verdict

Minimum-slice mobile seam proven live end to end. Field-state contract complete through `stale` derived-policy layer. Wearable backend seam hosted-proof complete. Evidence registry schema + seeds live (9 sources, 15 rules). Vitamin D + Ferritin seeds added (`20260420091500`). CRP + ApoB/LDL seeds added (`20260420190000`). `isDerivedStale` staleness thresholds extracted as named constants per biomarker type. WearableSyncScreen now shows success/error feedback post-sync. HealthConnectPermissionGate wired into tab navigation — Android users see lock badge when permissions are denied.

Remaining gaps: native Android Health Connect wiring, first real device-backed ingest proof, evidence registry wire to Priority Score runtime.

## Current state

- Branch: `main` — all recent work committed directly
- Active seam: real device-backed wearable ingest proof + evidence runtime wire

## Pending PRs

_None. All recent branches merged._

## Blockers

- No physical Garmin / Health Connect data source proof yet (WEARABLE-TD-001–003)
- Android native Health Connect requires manual `MainActivity.kt` + `AndroidManifest.xml` changes outside repo
- Branch protection for `main` needs explicit verification/enforcement
- Evidence registry not yet wired to Priority Score runtime — `rule_evidence_links` not read at calculation time (WEARABLE-TD-004)

## Completed this session (2026-04-20)

- ✅ **Task 5** — CRP + ApoB/LDL evidence seeds (`20260420190000`): `evidence_sources` + `rule_evidence_links` for CRP rules and ApoB/LDL rules added
- ✅ **Task 6** — `isDerivedStale()` threshold extracted: `STALE_THRESHOLD_DAYS_LAB`, `STALE_THRESHOLD_DAYS_WEARABLE`, `StalenessConfig` type, per-biomarker override pattern
- ✅ **Task 7** — `WearableSyncScreen` feedback UI: `SyncStatus` state, success banner (timestamp + `records_inserted`), error banner, disabled button during run (`commit: 3fc06f3`)
- ✅ **Task 8** — `HealthConnectPermissionGate` in tab navigation: `useWearablePermissions` lifted to `App` level, lock badge on Wearable Sync tab when `hcStatus` is `denied` / `unavailable` (`commit: c279bb7`)

## Next steps

1. **Wire evidence registry to Priority Score** — `aggregateTotalPriorityScoreWithEvidence()` in `MinimumSliceScreen` + Edge Function; `loadEvidenceForRules()` must not be optional (WEARABLE-TD-004)
2. **Native Android Health Connect** — apply `MainActivity.kt` + `AndroidManifest.xml` from `apps/mobile/docs/health-connect-native-setup.md`
3. **First real Health Connect ingest proof** — expo prebuild, grant permissions, real sync run, verify `wearable_sync_runs` row in Supabase (WEARABLE-TD-001)
4. **Garmin Terra webhook smoke-test** — Terra OAuth pairing, verify webhook delivery + `wearable_observations` row (WEARABLE-TD-002)
5. **useWearableSync return type** — verify `run()` return shape matches `SyncStatus` success path (`records_inserted` field); typed as `void` currently — may need edge function response type propagated
6. **Clean follow-ups** — branch protection, `as any` typed cleanup
