---
status: current
canonical_for: durable project assumptions
owner: repo
last_verified: 2026-04-17
supersedes: []
superseded_by: null
scope: repo
---

# MEMORY.md

Project long-term operating memory for **One L1fe (OL)**.

Important: this file stores project memory, not personal health records. Do not place raw user health data, lab reports, or personally identifiable medical information here.

---

## Durable product boundary

- One L1fe is not a diagnostic or treatment system.
- It should be framed as a health data, biomarker, and interpretation product, not as a "wellness" product.
- Recommendations must stay bounded, uncertainty-aware, and within the intended-use boundary defined canonically in `docs/compliance/intended-use.md`.
- Severity, coverage, freshness, and recommendation eligibility must stay distinct.

## Durable architecture posture

- Keep Notion out of hidden runtime logic.
- Keep core health/domain logic in shared domain/backend code.
- Keep ApoB primary and LDL fallback/secondary.
- Keep weak/contextual markers out of the hard core score unless clearly justified.
- Keep the Priority Score framed as a bounded prioritization aid, not a clinical risk score.
- Keep shared domain imports cross-runtime safe when the same files must run under both Node-based tests and Supabase Edge Functions.
- For the first real mobile app seam, use Expo scaffolding first and avoid `expo-router` until there is a concrete navigation need.
- The Expo scaffold under `apps/mobile/` uses a real Supabase auth session through `mobileSupabaseAuth.ts`, with real Expo env keys for Supabase URL and anon key instead of auth placeholders.
- Keep the mobile auth/session architecture thin and explicit: `useAuthSession.ts` owns auth-state subscription, `LoginScreen.tsx` owns sign-in UI, `MinimumSliceScreen.tsx` owns the signed-in minimum-slice form, and `App.tsx` stays a small auth-gate shell that wires those pieces together.
- In the mobile auth seam, load `react-native-url-polyfill/auto` before `@supabase/supabase-js`.
- Treat true signed-out auth states separately from operational auth errors in `getFreshAccessToken()` and adjacent mobile flows.
- For wearable work, reuse `apps/mobile/mobileSupabaseAuth.ts` and do not introduce a second mobile Supabase client.
- The current mobile wearable path on `main` includes `useWearableSource`, `useWearableSync`, `WearableSyncScreen`, and an Android-first Health Connect permission gate.
- Android wearable permissions currently use `react-native-health-connect`; iOS remains an explicit stub until a separate HealthKit adapter slice is added.
- Early wearable seams should be prepared in a device-free, mockable way when no physical device/app access is available yet, but reset/readiness docs must clearly distinguish hosted-proof from real device proof.
- Garmin smartwatch is the current first target for wearable source provisioning and eventual real-device verification, but current proof is still device-free / hosted until physical hardware access exists.
- The first tight Garmin-first field slice should prioritize `resting_heart_rate`, `sleep_duration`, `steps_total`, and `hrv` with explicit method metadata.
- `subjective_energy` is useful as an early calibrator, but should stay self-report-first rather than being forced into wearable ingest.
- The chosen pre-ingest provisioning seam is `supabase/functions/wearable-source-resolve/`.
- Wearable source ownership should be anchored to instance-level identifiers (`app_install_id` now, `device_hardware_id` when real hardware exists), while `source_app_id` stays metadata and not the sole identity key.
- `wearables-sync` must reject inactive `wearable_sources`; ownership alone is not sufficient.
- Wearable-backed app fields must keep a manual-entry or manual-correction fallback so the product remains usable when smartwatch sync is unavailable, partial, delayed, or wrong.
- App fields should support explicit intentional-missingness states when a user does not have, does not know, or does not want to provide a value. That state must be visible to the product logic and must not trigger calculation or validation errors.
- In V1, treat `provided` as a display-layer umbrella concept rather than a required persisted canonical state.
- Keep `declined` out of V1 unless a real settings/preferences flow exists.
- If `stale` is added, derive it from one shared typed domain policy, preferably from metric-level freshness/observation timestamps rather than a coarse source timestamp.
- **`stale` policy is live.** `isDerivedStale()` and `getDerivedDisplayState()` in `packages/domain/fieldValueState.ts` are the canonical shared policy. `stale` must never be persisted as a `field_state` column value — derive it at read/render time only.
- Keep the HRV no-method render guard explicit in the reusable component contract as an impossible-state WARN path, not as a normal product path.
- The canonical architecture note for this is `docs/architecture/field-value-state-and-missingness-v1.md`.
- Field-state QA priorities and release blockers live in `docs/architecture/field-status-qa-checklist-v1.md`.
- For wearables, keep daily summaries explicit about source scope (`single_source` vs `merged`) and timezone semantics, and keep context notes minimally structured with tags instead of free text only.

## Durable repo operations posture

- `README.md` is the project entry point.
- `CHECKPOINT.md` is the current execution state and next-step source of truth.
- `MEMORY.md` stores only durable assumptions and decisions.
- `memory/` stores short-term working notes and daily continuity, not durable truth.
- `main` should stay the stable branch, with short-lived branches for focused changes.
- When the local baseline has moved materially, prefer fresh focused PR slices over reviving stale broad/meta PRs unchanged.
- Keep lightweight GitHub hygiene in place: templates, CODEOWNERS, and CI for typecheck plus domain tests.
- Do not let generated docs or AI-assisted code drift away from the actual implemented path.
- Treat local Supabase replay plus authenticated smoke-test success as the required backend baseline before claiming the edge-function seam works.
- Treat hosted Supabase security-advisor clean status plus ordered migration confirmation as sufficient evidence that the hardening baseline is live, even if GitHub-side enforcement still needs separate verification.
- Do not treat a local-only Supabase function as a hosted-ready backend seam. Hosted deployment and one authenticated hosted smoke call are required before claiming the mobile path is production-ready.
- The minimum-slice hosted backend seam is green only when all are true: hosted migrations match repo, RLS/policies are live, the function is deployed, and an authenticated hosted smoke call returns 200 with writes succeeding.
- The minimum-slice mobile seam should be treated as proven only when login, authenticated submit, wrong-password handling, hosted-function error handling, and sign-out have all been verified in the real app.
- Use `docs/compliance/data-handling-and-redaction.md` as the canonical operational policy for fixtures, screenshots, logs, smoke tests, and copied examples.
- Use `docs/ops/openclaw.md` as the canonical OpenClaw operating guide for startup order, promotion rules, and short-term memory usage.

## Startup rule

This file stores durable project memory only.
Use `CHECKPOINT.md` for fresh-session startup and current execution state.
Store detailed chronological history under `docs/roadmap/checkpoints/`, not here.

## History archive

Older detailed memory was archived to:
- `docs/roadmap/checkpoints/2026-04-13-pre-compact-memory.md`
