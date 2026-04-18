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
- Migrations applied and local chain aligned (through `20260417093000_wearable_source_identity_guards.sql`)
- RLS and policies live
- `wearable-source-resolve` v1 deployed, `verify_jwt: false`, smoke tests green:
  - `wearable_source_id` provisioned for `g.zugang@hotmail.com`
  - idempotency confirmed, missing instance identity → 400, missing auth → 401
- `wearables-sync` v2 deployed, `verify_jwt: false`, smoke tests green:
  - hosted ingest writes succeed, inactive source rejected, empty observations rejected
- All edge functions use `verify_jwt: false` + in-function `getUser()` auth (documented in `supabase/README.md`)
- `save-minimum-slice-interpretation` works for real authenticated mobile submit
- Expo Go login via QR confirmed live on iPhone for `g.zugang@hotmail.com`
- Smoke-test user: `g.zugang@hotmail.com` (UID `523b48a4-2aa2-4e4c-97f2-8fa95141ac8b`)
- `mobileSupabaseAuth.ts`: AsyncStorage-backed session persistence, normalizes signed-out vs auth errors
- `react-native-url-polyfill/auto` must load before `@supabase/supabase-js`
- `apps/mobile/.gitignore` protects `.env` and `.env.*`
- `apps/mobile/metro.config.js` present for monorepo layout resolution
- Wearable mobile auth flows through `apps/mobile/mobileSupabaseAuth.ts` only
- Provisioning path: `supabase/functions/wearable-source-resolve/` only
- Mobile wearable helpers on `main`: `wearableSourceProvisioning.ts`, `useWearableSource.ts`, `wearableSyncClient.ts`, `useWearableSync.ts`, `WearableSyncScreen.tsx`, `wearablePermissions.ts`, `useWearablePermissions.ts`, `HealthConnectPermissionGate.tsx`
- Health Connect native setup: `apps/mobile/docs/health-connect-native-setup.md`
- Platform posture: Android-first via `react-native-health-connect`; iOS explicit stub until HealthKit adapter added
- Identity: `app_install_id` first, `device_hardware_id` later; `source_app_id` is connector metadata only
- Identity-guard migration applies unique index guards for `(profile_id, source_kind, app_install_id)` and `(profile_id, source_kind, device_hardware_id)`
- Garmin-first field priority: `resting_heart_rate`, `sleep_duration`, `steps_total`, `hrv` with explicit method tagging
- HRV V1 policy: always store method metadata, never aggregate SDNN + RMSSD, `unknown` method rejected at `validate.ts`
- `wearable_metric_definitions` seeded for first real device metrics
- `subjective_energy` stays self-report-first, not forced into wearable ingest
- Field-state contract complete: `packages/domain/fieldValueState.ts` defines `isDerivedStale()` + `getDerivedDisplayState()`; `stale` derived-only, never persisted
- Field-state QA checklist (`docs/architecture/field-status-qa-checklist-v1.md`) current: P0 #9, P0 #15, P1 #1 enforced
- Domain files vendored into `_lib/domain` at deploy via `scripts/prepare-supabase-function-domain.sh`

## Next steps

1. **Native Android Health Connect** — apply `MainActivity.kt` + `AndroidManifest.xml` from `apps/mobile/docs/health-connect-native-setup.md`
2. **Replace `MOCK_APP_INSTALL_ID`** — switch to real install/device identity in `WearableSyncScreen.tsx`
3. **First real Health Connect ingest proof** — provision real identity, request permissions, pass real observations
4. **Verify physical Garmin path** — confirm real end-to-end Garmin-backed flow once hardware available
5. **Clean follow-ups** — resolve `memory/2026-04-17.md`, verify branch protection, address `as any` typed cleanup

### Near-term simplifications to keep
- Keep `declined` out of V1 unless real settings/preferences flow exists
- Keep "reset to device value" as later work
- Treat `provided` as display-layer umbrella, not required persisted state
- Keep HRV render guard explicit in reusable component contract
- Keep `isDerivedStale()` 30-day default as lab-field starting policy

## Startup rule

Start with `CHECKPOINT.md`. Read `README.md` only for broad repo orientation. Read deeper docs only when the task touches them.

## Read-on-demand map

- `docs/compliance/intended-use.md` — health copy, recommendation wording, compliance
- `docs/architecture/evidence-registry-and-rule-governance-v1.md` — provenance/evidence logic
- `docs/roadmap/v1-checkpoint-and-next-agent-brief.md` — planning next implementation seam
- `docs/architecture/wearables-and-context-schema-draft.md` — wearable seam work
- `docs/architecture/field-value-state-and-missingness-v1.md` — manual overrides, disabled/not-provided fields
- `docs/architecture/field-status-qa-checklist-v1.md` — QA priorities, release-blocking field-state failures
- `GLOSSARY.md` — abbreviations/term meanings
- `README.md` — broad repo orientation
- `supabase/README.md` — Supabase workflow, CI, secrets, deploy, edge function conventions
- `supabase/functions/wearable-source-resolve/README.md` — wearable source resolution/provisioning

## Guardrails

- Keep product boundary explicit; normative detail in `docs/compliance/intended-use.md`
- Keep ApoB primary, LDL fallback/secondary
- Keep severity separate from coverage
- Keep Notion out of hidden runtime logic
- Do not treat Priority Score as a clinical risk score
- Keep raw personal health data, direct identifiers, and unsafe artifacts out of repo
- For wearable work: route mobile auth through `apps/mobile/mobileSupabaseAuth.ts`, do not create a second mobile Supabase client
