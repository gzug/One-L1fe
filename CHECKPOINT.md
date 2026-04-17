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

The minimum-slice mobile seam is now proven live end to end in the real app: login, authenticated submit, wrong-password handling, hosted-function error handling, and sign-out were all verified on device, and the next active seam is now **wearable ingestion proof** with `wearable_source_id` ownership and provisioning as the first real design and implementation question.

## Current state

- Branch: `main`, currently aligned with `origin/main` as the clean base for the next cycle
- Active seam: minimum-slice proof complete, wearable ingestion proof opened as the only active next seam
- Source of truth repo: `gzug/One-L1fe`
- Current blockers:
  - no product blocker remains on the minimum-slice seam
  - PR #47 (`checkpoint: minimum-slice proof complete, wearable ingestion next`) was opened to close the previous cycle, but should only be merged if it is clearly non-regressive against the current local checkpoint state; otherwise carry its intent forward into new focused PRs
  - hosted verification for the new wearable provisioning + `wearables-sync` sequence is still pending (current proof is local code/test level)
  - no physical wearable/device/app is available locally yet, so the current Garmin-first workstream should stay device-free: schema, auth, functions, mobile seams, mocks, and docs first
- Key confirmed facts:
  - hosted migrations match repo
  - RLS and policies are live
  - `save-minimum-slice-interpretation` works for real authenticated mobile submit after disabling gateway JWT verification and relying on explicit in-function auth via `supabase.auth.getUser()`
  - the minimum-slice proof now includes all four smoke checks as live-confirmed behavior: wrong password, hosted function error path, successful sign-out, and successful authenticated submit
  - Expo Go login via QR was confirmed live on iPhone for `g.zugang@hotmail.com`
  - the current controllable confirmed smoke-test user is `g.zugang@hotmail.com` (UID `523b48a4-2aa2-4e4c-97f2-8fa95141ac8b`) and a matching `public.profiles` row exists
  - `mobileSupabaseAuth.ts` uses AsyncStorage-backed Supabase session persistence for Expo/RN and now normalizes true signed-out cases distinctly from operational auth errors
  - `react-native-url-polyfill/auto` must load before `@supabase/supabase-js` in the mobile auth seam
  - mobile auth assertions now cover no-session, `user === null`, `getUser` error, `getSession` error, and valid-session cases
  - minimum-slice HTTP transport assertions now cover both `apikey` inclusion when provided and omission when no anon key is provided
  - current mobile diagnostics surface hosted function URL plus Supabase gateway error codes on failure instead of only a generic 401
  - `apps/mobile/.gitignore` now protects `.env` and `.env.*`
  - `apps/mobile/metro.config.js` is present to make the Expo app resolve the workspace layout cleanly under the monorepo
  - for the wearable seam, mobile auth must continue to flow through `apps/mobile/mobileSupabaseAuth.ts`; do not introduce a parallel mobile Supabase client
  - thin wearable provisioning work is in progress at local-prep level:
    - the chosen provisioning path is now `supabase/functions/wearable-source-resolve/`; the parallel `provision-wearable-source/` draft should stay removed
    - local mobile helpers exist at `apps/mobile/wearableSourceProvisioning.ts` and `apps/mobile/src/hooks/useWearableSource.ts`, and wearable calls must continue to reuse `apps/mobile/mobileSupabaseAuth.ts`
    - provisioning identity should be anchored to instance-level identifiers only: `app_install_id` first for device-free prep, `device_hardware_id` later when real Garmin hardware exists
    - `source_app_id` should be treated as connector metadata, not as a sole ownership key
    - local migration prep should keep only the identity-guard path (`20260417093000_wearable_source_identity_guards.sql`); the earlier composite uniqueness draft should stay discarded because it collapses multiple legitimate sources too aggressively
    - Garmin smartwatch is the first intended wearable target for the seam, but only at planning/preparation level for now because no physical device or Garmin app access is available yet
    - current Garmin-first field priority should be `resting_heart_rate`, `sleep_duration`, `steps_total`, and `hrv` with explicit method tagging
    - HRV V1 policy should stay strict: always store/display method metadata, never compare or aggregate SDNN and RMSSD together, and keep `unknown` method out of engine input
    - `wearable_metric_definitions` is already seeded for the first real device metrics, so the first slice does not need new metric-definition rows for `resting_heart_rate`, `sleep_duration`, `steps_total`, or `hrv`
    - `subjective_energy` is worth treating as an early self-report calibrator, but should not be forced into wearable ingest just for symmetry; it fits better in `weekly_checkins` or a later adjacent self-report surface
    - Garmin-first example payloads now exist under `supabase/functions/wearables-sync/examples/` in the current contract shape, using `platform = health_connect` as the temporary near-term path instead of inventing a premature `platform = garmin` contract
    - `wearables-sync` now rejects inactive `wearable_sources`; ownership alone is not sufficient
  - field-state work has moved from pure planning into implementation at local code/test level:
    - a shared field-state contract now exists in `packages/domain/fieldValueState.ts`
    - minimum-slice function parsing now accepts field-state metadata (`field_state`, `value_source`, `state_reason`) with early guardrails
    - minimum-slice mobile draft/model/UI now support the first explicit optional-field states for `lpa` and `crp`
    - minimum-slice recommendation logic now distinguishes `disabled` from generic `missing`, so intentionally excluded fields do not trigger false collect-more-data prompts
    - current V1 simplification is to treat `provided` as a display-layer umbrella concept rather than a required persisted canonical state
    - app UX should not block on smartwatch sync readiness: wearable-backed fields need a manual fallback so empty, partial, or clearly wrong smartwatch values can be corrected in-app before the real integration is fully live and trustworthy
    - fields across the app should support an explicit disabled/not-provided state when a user does not have, does not know, or does not want to enter a value; calculation paths must treat that as intentional missingness, not as an error
    - `declined` should stay out of V1 unless a real settings/preferences flow exists
    - "reset to device value" should stay later unless the product explicitly retains parallel synced + manual candidate values
  - verification status for this seam:
    - field-state and Garmin-first prep are now verified at local code/typecheck/assertion/documentation level
    - no real Garmin/device proof exists yet
    - hosted/device: still pending for the wearable provisioning flow
- Deployment note: domain files are vendored into `_lib/domain` at deploy time via `scripts/prepare-supabase-function-domain.sh`, while source of truth stays in `packages/domain/`
- Local cleanup on 2026-04-16 removed disposable AI-generated repo/project clutter, deleted the stale local sandbox, removed the generated local `_lib/` copy under the function tree, and stashed the pre-cleanup local working tree as `local-sync-before-cleanup-2026-04-16`

## Current next step

The next best steps are, in order:
1. **Cut the current local diff into focused PRs instead of reviving stale broad PRs**: prefer four slices, A = provisioning seam, B = ingest guardrails/examples, C = field-state contract plus first implementation, D = checkpoint/docs/QA,
2. **Keep the single provisioning seam clean**: stay on `wearable-source-resolve` only, with mobile helpers and docs aligned to that path,
3. **Keep field-state implementation coherent**: continue centralizing state rendering/behavior so the current `lpa`/`crp` slice becomes a reusable pattern instead of one-off UI logic,
4. **Prepare Garmin-first, device-free inputs**: use `source_kind = vendor_api`, `vendor_name = garmin`, and an instance-level identifier (`app_install_id` now, `device_hardware_id` later) while treating `source_app_id` as metadata only,
5. **Design the manual fallback path before trusting sync UX**: wearable-backed app fields must remain manually editable when sync is unavailable, partial, delayed, or obviously wrong,
6. **Design explicit field disable semantics**: wearable and non-wearable fields must support a user-chosen disabled/not-provided state that is visible in the app and handled safely in scoring, recommendations, and validation,
7. **Refine next-layer field semantics**: add `stale` only as a derived display/recommendation-layer freshness state backed by one shared typed domain policy, preferably from metric-level observation freshness rather than a coarse source timestamp, and keep `declined` out of V1 unless a real preference flow exists,
8. **Keep the first wearable field slice tight**: target `resting_heart_rate`, `sleep_duration`, `steps_total`, and `hrv` first, while treating `subjective_energy` as self-report instead of device ingest,
9. **Run hosted provisioning proof when credentials/runtime are ready**: call `wearable-source-resolve` with real auth and verify returned `wearable_source_id` ownership for the signed-in profile,
10. **Then run one immediate ingest proof**: pass that id into one minimal `wearables-sync` request and verify `wearable_sync_runs` + `wearable_observations` writes,
11. **Verify negative paths explicitly**: inactive source on `wearables-sync`, unknown source id on `wearables-sync`, missing/invalid auth on `wearable-source-resolve`, and missing instance-level identity on provisioning must return clear failures.

Near-term simplifications to keep:
- keep `declined` out of V1 unless a real settings/preferences flow exists
- keep "reset to device value" as later work unless the product starts retaining parallel synced + manual candidate values explicitly
- treat `provided` as a display-layer umbrella, not a required persisted state
- keep the HRV render guard explicit in the reusable component contract as a WARN-level impossible-state fallback, not as a normal product path

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
