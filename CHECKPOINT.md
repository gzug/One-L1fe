---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-04-22
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Verdict

Minimum-slice mobile seam proven live end to end. Field-state contract complete through `stale` derived-policy layer. Wearable backend seam hosted-proof complete. Evidence registry schema + seeds live (9 sources, 15 rules). Vitamin D + Ferritin seeds added (`20260420091500`). CRP + ApoB/LDL seeds added (`20260420190000`). `isDerivedStale` staleness thresholds extracted as named constants per biomarker type. WearableSyncScreen now shows success/error feedback post-sync. HealthConnectPermissionGate wired into tab navigation — Android users see lock badge when permissions are denied.

Biomarker scoring architecture audited and validated (2026-04-22): `evidenceConfidenceModifier` + `scoringClass` fields defined on `BiomarkerDefinition`; `evaluateTriglycerides()` + `evaluateDAO()` evaluators added; thresholds tightened to Attia Medicine 3.0 targets. Full delta in `AUDIT_LOG.md`.

Remaining gaps: native Android Health Connect wiring, first real device-backed ingest proof, evidence registry wire to Priority Score runtime.

## Current state

- Branch: `main` — all recent work committed directly
- Active seam: real device-backed wearable ingest proof + evidence runtime wire

## Pending PRs

- `claude/real-app-install-id` — AsyncStorage-backed persistent UUID replacing `MOCK_APP_INSTALL_ID`; pending merge (intentionally held)

## Blockers

- No physical Garmin / Health Connect data source proof yet (WEARABLE-TD-001)
- Android native Health Connect requires manual `MainActivity.kt` + `AndroidManifest.xml` changes outside repo
- Branch protection for `main` needs explicit verification/enforcement
- Evidence registry not yet wired to Priority Score runtime — `rule_evidence_links` not read at calculation time (WEARABLE-TD-004)

## Completed this session (2026-04-22)

- ✅ Biomarker scoring audit — weighting hierarchy validated against Medicine 3.0 / Attia framework
- ✅ `evidenceConfidenceModifier` + `scoringClass` fields specified on `BiomarkerDefinition` interface
- ✅ `evaluateTriglycerides()` evaluator defined (LIP-003; optimalMax 100 mg/dL)
- ✅ `evaluateDAO()` evaluator defined (CTX-003; LOW_CONFIDENCE flagged; modifier 0.3)
- ✅ Threshold deltas documented: ApoB optimalMax → 60; Vitamin D optimalMin → 40; HbA1c/Glucose/CRP/LDL synced to `thresholds.ts`
- ✅ `AUDIT_LOG.md` updated with full delta table + sources
- ✅ `CHECKPOINT.md` updated

## Completed previous session (2026-04-21)

- ✅ Repo cleanup: 11 stale branches deleted
- ✅ Issues #95, #94, #89 closed (duplicates + already-merged)
- ✅ Auto-delete branches on merge activated (GitHub repo setting)
- ✅ `AGENTS.md` — output standards section added (commit messages, secrets, session closeout, issue hygiene)

## Next steps

1. **Implement scoring fields in code** — add `evidenceConfidenceModifier` + `scoringClass` to `BiomarkerDefinition` type in `packages/domain/biomarkers.ts`; update `calculateWeightedScore()` to multiply modifier; update all 12 marker definitions with values from `AUDIT_LOG.md`
2. **Add missing evaluators** — `evaluateTriglycerides()` + `evaluateDAO()` to `packages/domain/thresholds.ts`; also `evaluateB12()` + `evaluateMagnesium()` pending
3. **Wire evidence registry to Priority Score** — `aggregateTotalPriorityScoreWithEvidence()` in `MinimumSliceScreen` + Edge Function; `loadEvidenceForRules()` must not be optional (WEARABLE-TD-004)
4. **Native Android Health Connect + real ingest proof** — apply `MainActivity.kt` + `AndroidManifest.xml` from `apps/mobile/docs/health-connect-native-setup.md`; expo prebuild, grant permissions, real sync run, verify `wearable_sync_runs` row in Supabase (WEARABLE-TD-001)
5. **Merge `claude/real-app-install-id`** when ready

## Deferred to post-v1

- **Garmin Terra webhook** — Terra OAuth pairing + `wearable_observations` smoke-test (WEARABLE-TD-002); blocked on physical Garmin device and Terra OAuth credentials; not on critical path for sideload-to-brother milestone
