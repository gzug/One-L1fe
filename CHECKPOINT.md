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

Biomarker scoring architecture audited and implemented (verified 2026-04-22): `evidenceConfidenceModifier` + `scoringClass` are present on `BiomarkerDefinition`; `calculateWeightedScore()` multiplies the confidence modifier; `aggregateTotalPriorityScoreWithEvidence()` exists and enforces non-empty evidence anchors. Full delta in `AUDIT_LOG.md`.

Remaining gaps: native Android Health Connect wiring, first real device-backed ingest proof, runtime call-site for Priority Score / evidence registry.

## Current state

- Branch: `main` — all recent work committed directly
- Active seam: real device-backed wearable ingest proof + Priority Score runtime wire

## Pending PRs

- `claude/real-app-install-id` — AsyncStorage-backed persistent UUID replacing `MOCK_APP_INSTALL_ID`; pending merge (intentionally held)

## Blockers

- No physical Garmin / Health Connect data source proof yet (WEARABLE-TD-001)
- Android native Health Connect requires manual `MainActivity.kt` + `AndroidManifest.xml` changes outside repo
- Branch protection for `main` needs explicit verification/enforcement
- Evidence registry not yet wired to Priority Score runtime — `rule_evidence_links` not read at calculation time (WEARABLE-TD-004 / Issue #104)

## Completed this session (2026-04-22)

- ✅ Repo access verified: GitHub account `gzug`; repo `gzug/One-L1fe`; write/admin confirmed
- ✅ Open-task triage completed: active blockers are Issue #104, #103, #102 (all ADR-heavy)
- ✅ `CHECKPOINT.md` corrected: removed stale instruction claiming scoring-field implementation was still pending although code already contains it
- ✅ Prioritized next execution target: WEARABLE-TD-004 runtime call-site via dedicated edge function ADR path

## Completed previous session (2026-04-22)

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

1. **Resolve WEARABLE-TD-004 with explicit ADR choice** — choose Option A (`compute-priority-score` edge function). Avoid client-only call-site; it breaks auditability and weakens reuse by `compute-health-index`.
2. **Scaffold runtime call-site** — add `supabase/functions/compute-priority-score/index.ts`, require evidence loading, call `aggregateTotalPriorityScoreWithEvidence()`, and return score + recommendations + evidence links.
3. **Add thin caller seam** — trigger the new function from `MinimumSliceScreen` or from the existing interpretation flow only after the dedicated edge function exists.
4. **Add integration proof** — one real rule + one evidence row should produce a non-zero score and non-empty anchors.
5. **Then unblock wearable domain ADRs** — Issues #102 and #103 remain decision work for `compute-health-index`; do not overbuild before #104 runtime seam is live.

## Deferred to post-v1

- **Garmin Terra webhook** — Terra OAuth pairing + `wearable_observations` smoke-test (WEARABLE-TD-002); blocked on physical Garmin device and Terra OAuth credentials; not on critical path for sideload-to-brother milestone
