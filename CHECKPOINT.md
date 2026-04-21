---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-04-17
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Verdict

The minimum-slice mobile seam is proven live end to end. Field-state contract is complete through the `stale` derived-policy layer. The wearable backend seam is hosted-proof complete, and the first app-side wearable sync UI path is now merged on `main`. The remaining gaps are native Android Health Connect wiring outside the current repo, replacement of the temporary dev install identifier, and first real device-backed ingest proof.

## Current state

- Domain biomarker thresholds and scoring metadata were recently tightened:
  - ApoB, HbA1c, glucose, CRP, and vitamin D reference ranges are synced to the new ground-truth values
  - new threshold evaluators exist for triglycerides, B12, magnesium, DAO, and ferritin
  - biomarker scoring metadata now carries `evidenceConfidenceModifier` and `scoringClass`
- Domain assertions now cover the revised thresholds and the new marker dispatch paths
- Branch: `main` at `243a116`, aligned with `origin/main`
- PRs #48 through #64 merged, including provisioning, ingest guardrails, field-state, docs, wearable mobile hooks/UI, Health Connect permission gate, and follow-up cleanup/fixes
- Active seam: real device-backed wearable ingest proof and native Android completion
- Source of truth repo: `gzug/One-L1fe`
- Current blockers:
  - no physical Garmin device / Health Connect data source proof yet
  - Android native Health Connect setup is documented but still requires manual `MainActivity.kt` and `AndroidManifest.xml` changes outside the current repo state
  - `WearableSyncScreen.tsx` still uses a temporary `MOCK_APP_INSTALL_ID` and should switch to a real install/device identity once the device seam is available
  - branch protection for `main` still needs explicit verification/enforcement
- Key confirmed facts:
  - hosted migrations applied and local chain aligned (all migrations through `20260417093000_wearable_source_identity_guards.sql`)
  - RLS and policies live
  - `wearable-source-resolve` v1 deployed, `verify_jwt: false`, smoke tests green:
    - create: `wearable_source_id` provisioned for `g.zugang@hotmail.com`
    - idempotency: second call returns same ID, `created: false`
    - missing instance identity: 400 with correct error
    - missing auth: 401
  - `wearables-sync` v2 deployed, `verify_jwt: false`, smoke tests green:
    - hosted ingest writes succeed
    - inactive source is rejected
    - empty observations arrays are rejected
  - all edge functions use `verify_jwt: false` + in-function `getUser()` auth, documented in `supabase/README.md`
  - `save-minimum-slice-interpretation` works for real authenticated mobile submit
  - Expo Go login via QR confirmed live on iPhone for `g.zugang@hotmail.com`
  - the current controllable confirmed smoke-test user is `g.zugang@hotmail.com` (UID `523b48a4-2aa2-4e4c-97f2-8fa95141ac8b`)
  - `mobileSupabaseAuth.ts` uses AsyncStorage-backed Supabase session persistence, normalizes true signed-out cases distinctly from operational auth errors
  - `react-native-url-polyfill/auto` must load before `@supabase/supabase-js` in the mobile auth seam
  - `apps/mobile/.gitignore` protects `.env` and `.env.*`
  - `apps/mobile/metro.config.js` is present for monorepo layout resolution
  - wearable mobile auth continues to flow through `apps/mobile/mobileSupabaseAuth.ts`
  - wearable provisioning path is `supabase/functions/wearable-source-resolve/` only
  - mobile wearable helpers now exist on `main` at:
    - `apps/mobile/wearableSourceProvisioning.ts`
    - `apps/mobile/useWearableSource.ts`
    - `apps/mobile/wearableSyncClient.ts`
    - `apps/mobile/useWearableSync.ts`
    - `apps/mobile/WearableSyncScreen.tsx`
    - `apps/mobile/wearablePermissions.ts`
    - `apps/mobile/useWearablePermissions.ts`
    - `apps/mobile/HealthConnectPermissionGate.tsx`
  - Health Connect native setup steps are documented in `apps/mobile/docs/health-connect-native-setup.md`
  - current platform posture is Android-first via `react-native-health-connect`; iOS remains an explicit stub until a separate HealthKit adapter slice is added
  - provisioning identity stays anchored to instance-level identifiers: `app_install_id` first, `device_hardware_id` later
  - `source_app_id` is connector metadata, not a sole ownership key
  - identity-guard migration (`20260417093000_wearable_source_identity_guards.sql`) applies unique index guards for `(profile_id, source_kind, app_install_id)` and `(profile_id, source_kind, device_hardware_id)`
  - `wearables-sync` rejects inactive `wearable_sources` and empty observations arrays
  - Garmin smartwatch is the first intended wearable target, but no physical device proof exists yet
  - Garmin-first field priority remains `resting_heart_rate`, `sleep_duration`, `steps_total`, `hrv` with explicit method tagging
  - HRV V1 policy: always store/display method metadata, never compare or aggregate SDNN and RMSSD together, `unknown` method rejected at `validate.ts` layer
  - `wearable_metric_definitions` is seeded for first real device metrics
  - `subjective_energy` stays self-report-first, not forced into wearable ingest
  - Garmin-first example payloads exist under `supabase/functions/wearables-sync/examples/` using `platform = health_connect`
  - field-state contract is complete:
    - `packages/domain/fieldValueState.ts` defines the shared contract including `isDerivedStale()` and `getDerivedDisplayState()`
    - `stale` is derived-only, never persisted
    - minimum-slice function parsing accepts field-state metadata with early guardrails
    - minimum-slice recommendation logic distinguishes `disabled` from `missing`
  - field-state QA checklist (`docs/architecture/field-status-qa-checklist-v1.md`) is `status: current`:
    - P0 #9 (HRV-without-method) enforced
    - P0 #15 (empty observations) enforced
    - P1 #1 (stale) implemented
  - deployment note: domain files are vendored into `_lib/domain` at deploy time via `scripts/prepare-supabase-function-domain.sh`

## Current next step

In order:
1. **Complete native Android Health Connect wiring** — apply the documented `MainActivity.kt` and `AndroidManifest.xml` changes from `apps/mobile/docs/health-connect-native-setup.md`
2. **Replace the temporary dev identity path** — remove `MOCK_APP_INSTALL_ID` in `apps/mobile/WearableSyncScreen.tsx` once a real install/device identity source is available
3. **Run first real Health Connect ingest proof** — provision with a real app/device identity, request permissions, and pass real observations into `wearables-sync`
4. **Verify physical Garmin path** — once hardware/app access exists, confirm real end-to-end Garmin-backed flow
5. **Clean small follow-ups** — resolve `memory/2026-04-17.md`, verify branch protection on `main`, and address remaining typed cleanup like the `as any` follow-up when the result type stabilizes

Near-term simplifications to keep:
- keep `declined` out of V1 unless a real settings/preferences flow exists
- keep "reset to device value" as later work
- treat `provided` as a display-layer umbrella, not a required persisted state
- keep the HRV render guard explicit in the reusable component contract
- keep `isDerivedStale()` default 30-day window as the lab-field starting policy

## Startup rule

For meaningful repo work, start with `CHECKPOINT.md`.
Read `README.md` first only when a person or agent needs broad repo orientation.
Only read deeper docs when the task actually touches them.

## Read-on-demand map

- `docs/compliance/intended-use.md` only for health-adjacent copy, recommendation wording, or compliance boundaries.
- `docs/architecture/evidence-registry-and-rule-governance-v1.md` only for provenance / evidence logic work.
- `docs/roadmap/v1-checkpoint-and-next-agent-brief.md` only when planning the next implementation seam.
- `docs/architecture/wearables-and-context-schema-draft.md` only when the task is specifically about the new wearable seam.
- `docs/architecture/field-value-state-and-missingness-v1.md` when the task touches manual overrides, disabled/not-provided fields, or calculation behavior under missingness.
- `docs/architecture/field-status-qa-checklist-v1.md` when the task is about test coverage, QA priorities, or release-blocking field-state failures.
- `GLOSSARY.md` only when abbreviations or term meanings are unclear.
- `README.md` only for broad repo orientation.
- `supabase/README.md` for Supabase workflow, CI commands, secrets, deploy procedure, and edge function conventions.
- `supabase/functions/wearable-source-resolve/README.md` only when working directly on wearable source resolution/provisioning.

## Guardrails

- Keep the product boundary explicit, with normative detail in `docs/compliance/intended-use.md`.
- Keep ApoB primary and LDL fallback/secondary.
- Keep severity separate from coverage.
- Keep Notion out of hidden runtime logic.
- Do not treat the Priority Score as a clinical risk score.
- Keep raw personal health data, direct identifiers, and unsafe artifacts out of the repo. Use `docs/compliance/data-handling-and-redaction.md` as the canonical operational policy.
- For wearable work, route mobile auth through `apps/mobile/mobileSupabaseAuth.ts` and do not create a second mobile Supabase client.
