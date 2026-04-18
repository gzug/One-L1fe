---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-04-18
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Verdict

Minimum-slice mobile seam proven live end to end. Field-state contract complete through `stale` derived-policy layer. Wearable backend seam hosted-proof complete, first app-side wearable sync UI merged on `main`.

Remaining gaps: native Android Health Connect wiring, replacement of `MOCK_APP_INSTALL_ID`, first real device-backed ingest proof.

## Current state

- Branch: `main` at `243a116`, aligned with `origin/main`
- PRs #48–#64 merged (provisioning, ingest guardrails, field-state, docs, wearable mobile hooks/UI, Health Connect permission gate, cleanup)
- Active seam: real device-backed wearable ingest proof + native Android completion
- Repo: `gzug/One-L1fe`

### Blockers
- No physical Garmin / Health Connect data source proof yet
- Android native Health Connect requires manual `MainActivity.kt` + `AndroidManifest.xml` changes outside repo
- `WearableSyncScreen.tsx` uses temporary `MOCK_APP_INSTALL_ID` — switch once real device identity available
- Branch protection for `main` needs explicit verification/enforcement

### Key confirmed facts
- Migrations applied through `20260417093000_wearable_source_identity_guards.sql`
- RLS and policies live
- `wearable-source-resolve` v1 deployed, `verify_jwt: false`, smoke tests green
- `wearables-sync` v2 deployed, `verify_jwt: false`, smoke tests green
- All edge functions: `verify_jwt: false` + in-function `getUser()` auth (see `supabase/README.md`)
- `save-minimum-slice-interpretation` works for real authenticated mobile submit
- Expo Go login via QR confirmed live on iPhone for `g.zugang@hotmail.com`
- Smoke-test user: `g.zugang@hotmail.com` (UID `523b48a4-2aa2-4e4c-97f2-8fa95141ac8b`)
- `mobileSupabaseAuth.ts`: AsyncStorage-backed session, normalizes signed-out vs auth errors
- `react-native-url-polyfill/auto` must load before `@supabase/supabase-js`
- Wearable mobile auth through `apps/mobile/mobileSupabaseAuth.ts` only
- Provisioning path: `supabase/functions/wearable-source-resolve/` only
- Mobile wearable helpers on `main`: `wearableSourceProvisioning.ts`, `useWearableSource.ts`, `wearableSyncClient.ts`, `useWearableSync.ts`, `WearableSyncScreen.tsx`, `wearablePermissions.ts`, `useWearablePermissions.ts`, `HealthConnectPermissionGate.tsx`
- Native setup docs: `apps/mobile/docs/health-connect-native-setup.md`
- Platform: Android-first via `react-native-health-connect`; iOS explicit stub until HealthKit adapter added
- Identity: `app_install_id` first, `device_hardware_id` later; `source_app_id` is connector metadata only
- Identity-guard migration: unique index for `(profile_id, source_kind, app_install_id)` + `(profile_id, source_kind, device_hardware_id)`
- Garmin-first priority: `resting_heart_rate`, `sleep_duration`, `steps_total`, `hrv` with explicit method tagging
- HRV V1: always store method metadata, never aggregate SDNN + RMSSD, `unknown` rejected at `validate.ts`
- `wearable_metric_definitions` seeded; `subjective_energy` stays self-report-first
- Field-state: `isDerivedStale()` + `getDerivedDisplayState()` in `packages/domain/fieldValueState.ts`; `stale` derived-only, never persisted
- Field-state QA: `docs/architecture/field-status-qa-checklist-v1.md` — P0 #9, P0 #15, P1 #1 enforced
- Domain files vendored into `_lib/domain` via `scripts/prepare-supabase-function-domain.sh`

## Next steps

1. **Native Android Health Connect** — apply `MainActivity.kt` + `AndroidManifest.xml` from `apps/mobile/docs/health-connect-native-setup.md`
2. **Replace `MOCK_APP_INSTALL_ID`** — switch to real identity in `WearableSyncScreen.tsx`
3. **First real Health Connect ingest proof** — provision real identity, request permissions, pass real observations
4. **Verify physical Garmin path** — confirm end-to-end once hardware available
5. **Clean follow-ups** — resolve `memory/2026-04-17.md`, verify branch protection, address `as any` typed cleanup

### Keep
- `declined` out of V1 unless real settings/preferences flow exists
- `provided` as display-layer umbrella, not required persisted state
- HRV render guard explicit in reusable component contract
- `isDerivedStale()` 30-day default as lab-field starting policy

## Startup rule

Start with `CHECKPOINT.md`. `README.md` only for broad orientation. Deeper docs only when the task touches them.

## Read-on-demand

- `docs/compliance/intended-use.md` — health copy, recommendation wording, compliance
- `docs/architecture/evidence-registry-and-rule-governance-v1.md` — provenance/evidence logic
- `docs/roadmap/v1-checkpoint-and-next-agent-brief.md` — planning next seam
- `docs/architecture/wearables-and-context-schema-draft.md` — wearable seam work
- `docs/architecture/field-value-state-and-missingness-v1.md` — overrides, disabled/not-provided fields
- `docs/architecture/field-status-qa-checklist-v1.md` — QA priorities, release-blocking failures
- `README.md` — broad repo orientation
- `supabase/README.md` — workflow, CI, secrets, deploy, edge function conventions
- `supabase/functions/wearable-source-resolve/README.md` — provisioning detail

## Guardrails

- Keep product boundary explicit; normative detail in `docs/compliance/intended-use.md`
- Keep ApoB primary, LDL fallback/secondary; severity separate from coverage
- Keep Notion out of hidden runtime logic; Priority Score not a clinical risk score
- Keep raw personal health data out of repo
- Wearable work: route mobile auth through `apps/mobile/mobileSupabaseAuth.ts` only
