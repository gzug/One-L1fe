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

The minimum-slice mobile seam is proven live end to end. Field-state contract is now complete through the `stale` derived-policy layer. Wearable ingestion proof (provisioning + first ingest) is the only remaining active seam — all local code, migration, and doc prep is done; hosted function deployment and smoke-test are the remaining blockers.

## Current state

- Branch: `main`, currently aligned with `origin/main` as the clean base for the next cycle
- Active seam: wearable ingestion proof — local prep complete, hosted deployment + smoke-test still pending
- Source of truth repo: `gzug/One-L1fe`
- Current blockers:
  - **PR #52** (`pr-e-field-state-stale-and-validate-guardrails`) — open, awaiting CI + review
  - **PR #53** (`pr-f-memory-stale-policy-live`) — open, merge after #52
  - **PR #54** (`pr-g-checkpoint-post-ef`) — this PR, merge after #53
  - hosted deployment of `wearable-source-resolve` and `wearables-sync` still pending — no physical device/Garmin app available yet
  - no product blocker remains on the minimum-slice seam
- Key confirmed facts:
  - hosted migrations match repo (all 8 migrations including `20260417093000_wearable_source_identity_guards.sql`)
  - RLS and policies are live
  - `save-minimum-slice-interpretation` works for real authenticated mobile submit
  - Expo Go login via QR confirmed live on iPhone for `g.zugang@hotmail.com`
  - the current controllable confirmed smoke-test user is `g.zugang@hotmail.com` (UID `523b48a4-2aa2-4e4c-97f2-8fa95141ac8b`)
  - `mobileSupabaseAuth.ts` uses AsyncStorage-backed Supabase session persistence, normalizes true signed-out cases distinctly from operational auth errors
  - `react-native-url-polyfill/auto` must load before `@supabase/supabase-js` in the mobile auth seam
  - `apps/mobile/.gitignore` protects `.env` and `.env.*`
  - `apps/mobile/metro.config.js` present for monorepo layout resolution
  - for the wearable seam, mobile auth must continue to flow through `apps/mobile/mobileSupabaseAuth.ts`
  - wearable provisioning path is `supabase/functions/wearable-source-resolve/` only; the parallel `provision-wearable-source/` draft is removed
  - local mobile helpers exist at `apps/mobile/wearableSourceProvisioning.ts` and `apps/mobile/src/hooks/useWearableSource.ts`
  - provisioning identity anchored to instance-level identifiers: `app_install_id` first, `device_hardware_id` later
  - `source_app_id` is connector metadata, not a sole ownership key
  - identity-guard migration (`20260417093000_wearable_source_identity_guards.sql`) is on `main` and applies unique index guards for `(profile_id, source_kind, app_install_id)` and `(profile_id, source_kind, device_hardware_id)`
  - `wearables-sync` rejects inactive `wearable_sources` and now also rejects empty observations arrays (enforced in `validate.ts` as of PR #52)
  - Garmin smartwatch is the first intended wearable target, but only at planning/preparation level; no physical device or Garmin app access yet
  - Garmin-first field priority: `resting_heart_rate`, `sleep_duration`, `steps_total`, `hrv` with explicit method tagging
  - HRV V1 policy: always store/display method metadata, never compare or aggregate SDNN and RMSSD together, `unknown` method rejected at `validate.ts` layer
  - `wearable_metric_definitions` already seeded for first real device metrics
  - `subjective_energy` stays self-report-first, not forced into wearable ingest
  - Garmin-first example payloads exist under `supabase/functions/wearables-sync/examples/` using `platform = health_connect` as the near-term path
  - field-state contract is now complete:
    - `packages/domain/fieldValueState.ts` defines `FieldState`, `FieldValueSource`, `FieldStateReason`, `AppFieldValue<T>`, `ACTIVE_FIELD_STATES`, `isActiveFieldState()`, `requiresNullValueForFieldState()`, `DerivedDisplayState`, `isDerivedStale()`, `getDerivedDisplayState()`
    - `stale` is a derived display/recommendation concept only — never persisted as a `field_state` column value; derived at read/render time via `isDerivedStale()` (default 30-day window, configurable)
    - minimum-slice function parsing accepts field-state metadata (`field_state`, `value_source`, `state_reason`) with early guardrails
    - minimum-slice mobile draft/model/UI support explicit optional-field states for `lpa` and `crp`
    - minimum-slice recommendation logic distinguishes `disabled` from generic `missing` — intentionally excluded fields do not trigger false collect-more-data prompts
    - `declined` stays out of V1 unless a real settings/preferences flow exists
    - `provided` is a display-layer umbrella concept, not a required persisted canonical state
    - "reset to device value" stays later unless the product starts retaining parallel synced + manual candidate values explicitly
  - field-state QA checklist (`docs/architecture/field-status-qa-checklist-v1.md`) is now `status: current`:
    - P0 #9 (HRV-without-method) marked enforced
    - P0 #15 (empty observations) marked enforced
    - P1 #1 (stale) updated with implementation pointer
  - deployment note: domain files are vendored into `_lib/domain` at deploy time via `scripts/prepare-supabase-function-domain.sh`; source of truth stays in `packages/domain/`
  - local cleanup on 2026-04-16 removed disposable AI-generated repo/project clutter

## Current next step

In order:
1. **Merge open PRs in order**: #52 (field-state+validate) → #53 (memory) → #54 (this checkpoint)
2. **Deploy `wearable-source-resolve` to hosted Supabase** and run one authenticated smoke call to verify `wearable_source_id` ownership for `g.zugang@hotmail.com`
3. **Deploy `wearables-sync` to hosted Supabase** and run one minimal ingest request using the resolved `wearable_source_id`; verify `wearable_sync_runs` + `wearable_observations` writes
4. **Verify negative paths explicitly**: inactive source on `wearables-sync`, unknown source id, missing/invalid auth on `wearable-source-resolve`, missing instance-level identity on provisioning
5. **Then open CHECKPOINT for wearable seam proven** — once steps 2–4 are green

Near-term simplifications to keep:
- keep `declined` out of V1 unless a real settings/preferences flow exists
- keep "reset to device value" as later work
- treat `provided` as a display-layer umbrella, not a required persisted state
- keep the HRV render guard explicit in the reusable component contract as a WARN-level impossible-state fallback
- keep `isDerivedStale()` default 30-day window as the lab-field starting policy; tighten for wearable-freshness at callsite when real sync data exists

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
- `supabase/README.md` for Supabase workflow, CI commands, secrets, and deploy procedure.
- `supabase/functions/wearable-source-resolve/README.md` only when working directly on wearable source resolution/provisioning.

## Guardrails

- Keep the product boundary explicit, with normative detail in `docs/compliance/intended-use.md`.
- Keep ApoB primary and LDL fallback/secondary.
- Keep severity separate from coverage.
- Keep Notion out of hidden runtime logic.
- Do not treat the Priority Score as a clinical risk score.
- Keep raw personal health data, direct identifiers, and unsafe artifacts out of the repo. Use `docs/compliance/data-handling-and-redaction.md` as the canonical operational policy.
- For wearable work, route mobile auth through `apps/mobile/mobileSupabaseAuth.ts` and do not create a second mobile Supabase client.
