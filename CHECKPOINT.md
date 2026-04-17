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

The minimum-slice mobile seam is proven live end to end. Field-state contract is complete through the `stale` derived-policy layer. Wearable ingestion proof is now **hosted-proof complete** at the function/smoke-test level — provisioning, idempotency, ingest, and all negative paths verified against hosted Supabase. No physical Garmin device or app yet; that is the only remaining gap before real data flows.

## Current state

- Branch: `main` at `c61e44f`, fully aligned with `origin/main`
- PRs #52, #53, #54, #55 merged
- Active seam: app-side wearable sync integration — backend is proven, mobile trigger is next
- Source of truth repo: `gzug/One-L1fe`
- Current blockers:
  - no physical Garmin device / Health Connect app access yet
  - no product blocker remains on minimum-slice or wearable backend seams
- Key confirmed facts:
  - hosted migrations applied and local chain aligned (all migrations through `20260417093000_wearable_source_identity_guards.sql`)
  - RLS and policies live
  - `wearable-source-resolve` v1 deployed, `verify_jwt: false`, smoke tests green:
    - create: `wearable_source_id` provisioned for `g.zugang@hotmail.com`
    - idempotency: second call returns same ID, `created: false`
    - missing instance identity: 400 with correct error
    - missing auth: 401
  - `wearables-sync` v2 deployed, `verify_jwt: false`, smoke test green:
    - 1 `resting_heart_rate` observation, `records_inserted: 1`, `status: success`
  - all edge functions use `verify_jwt: false` + in-function `getUser()` auth — documented in `supabase/README.md`
  - `save-minimum-slice-interpretation` works for real authenticated mobile submit
  - Expo Go login via QR confirmed live on iPhone for `g.zugang@hotmail.com`
  - the current controllable confirmed smoke-test user is `g.zugang@hotmail.com` (UID `523b48a4-2aa2-4e4c-97f2-8fa95141ac8b`)
  - `mobileSupabaseAuth.ts` uses AsyncStorage-backed Supabase session persistence, normalizes true signed-out cases distinctly from operational auth errors
  - `react-native-url-polyfill/auto` must load before `@supabase/supabase-js` in the mobile auth seam
  - `apps/mobile/.gitignore` protects `.env` and `.env.*`
  - `apps/mobile/metro.config.js` present for monorepo layout resolution
  - for the wearable seam, mobile auth must continue to flow through `apps/mobile/mobileSupabaseAuth.ts`
  - wearable provisioning path is `supabase/functions/wearable-source-resolve/` only
  - local mobile helpers exist at `apps/mobile/wearableSourceProvisioning.ts` and `apps/mobile/src/hooks/useWearableSource.ts`
  - provisioning identity anchored to instance-level identifiers: `app_install_id` first, `device_hardware_id` later
  - `source_app_id` is connector metadata, not a sole ownership key
  - identity-guard migration (`20260417093000_wearable_source_identity_guards.sql`) applies unique index guards for `(profile_id, source_kind, app_install_id)` and `(profile_id, source_kind, device_hardware_id)`
  - `wearables-sync` rejects inactive `wearable_sources` and empty observations arrays
  - Garmin smartwatch is the first intended wearable target — at planning level only, no physical device yet
  - Garmin-first field priority: `resting_heart_rate`, `sleep_duration`, `steps_total`, `hrv` with explicit method tagging
  - HRV V1 policy: always store/display method metadata, never compare or aggregate SDNN and RMSSD together, `unknown` method rejected at `validate.ts` layer
  - `wearable_metric_definitions` seeded for first real device metrics
  - `subjective_energy` stays self-report-first, not forced into wearable ingest
  - Garmin-first example payloads exist under `supabase/functions/wearables-sync/examples/` using `platform = health_connect`
  - field-state contract is complete:
    - `packages/domain/fieldValueState.ts` defines full contract including `isDerivedStale()`, `getDerivedDisplayState()`
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
1. **App-side sync trigger** — wire `useWearableSource.ts` and `wearableSourceProvisioning.ts` into the mobile app flow; call `wearable-source-resolve` on first launch
2. **First real Health Connect / Apple Health ingest** — pass real observations from device to `wearables-sync`
3. **Daily summaries computation** — derive `resting_heart_rate`, `sleep_duration`, `steps_total` from raw observations
4. **Physical Garmin device** — when available, verify real data flow end to end

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
