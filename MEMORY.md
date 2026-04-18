---
status: current
canonical_for: durable project assumptions
owner: repo
last_verified: 2026-04-18
supersedes: []
superseded_by: null
scope: repo
---

# MEMORY.md

Project long-term operating memory for **One L1fe (OL)**.

> This file stores project memory only. No raw user health data, lab reports, or personal identifiers.

---

## Durable product boundary

- Not a diagnostic or treatment system
- Frame as a health data, biomarker, and interpretation product — not "wellness"
- Recommendations: bounded, uncertainty-aware, within `docs/compliance/intended-use.md`
- Severity, coverage, freshness, and recommendation eligibility must stay distinct

## Durable architecture posture

- Keep Notion out of hidden runtime logic
- Keep core health/domain logic in shared domain/backend code
- Keep ApoB primary, LDL fallback/secondary
- Keep weak/contextual markers out of hard core score unless clearly justified
- Priority Score: bounded prioritization aid, not a clinical risk score
- Keep shared domain imports cross-runtime safe (Node tests + Supabase Edge Functions)
- Mobile: use Expo scaffolding first, avoid `expo-router` until concrete navigation need
- `apps/mobile/` uses real Supabase auth via `mobileSupabaseAuth.ts` with real Expo env keys
- Mobile auth/session architecture: `useAuthSession.ts` owns auth-state, `LoginScreen.tsx` owns sign-in UI, `MinimumSliceScreen.tsx` owns signed-in form, `App.tsx` is auth-gate shell
- Load `react-native-url-polyfill/auto` before `@supabase/supabase-js`
- Treat true signed-out auth states separately from operational auth errors in `getFreshAccessToken()`
- Wearable work: reuse `apps/mobile/mobileSupabaseAuth.ts`, do not create a second Supabase client
- Mobile wearable path on `main`: `useWearableSource`, `useWearableSync`, `WearableSyncScreen`, Android-first Health Connect permission gate
- Android wearable permissions: `react-native-health-connect`; iOS explicit stub until HealthKit adapter added
- Early wearable seams: device-free and mockable; reset/readiness docs must distinguish hosted-proof from real device proof
- Garmin smartwatch: first provisioning target; current proof still device-free/hosted
- Garmin-first field priority: `resting_heart_rate`, `sleep_duration`, `steps_total`, `hrv` with explicit method metadata
- `subjective_energy`: self-report-first, not forced into wearable ingest
- Provisioning seam: `supabase/functions/wearable-source-resolve/` only
- Wearable source ownership: `app_install_id` now, `device_hardware_id` when real hardware exists; `source_app_id` is metadata, not sole ownership key
- `wearables-sync` must reject inactive `wearable_sources`; ownership alone is not sufficient
- Wearable-backed fields: keep manual-entry/correction fallback for when sync is unavailable, partial, delayed, or wrong
- Fields support explicit intentional-missingness states (user doesn't have / doesn't know / doesn't want to provide); must not trigger calculation or validation errors
- V1: treat `provided` as display-layer umbrella, not required persisted state
- Keep `declined` out of V1 unless real settings/preferences flow exists
- `stale`: derive from one shared typed domain policy (metric-level freshness timestamps), never persist as `field_state` column value
- **`stale` policy is live.** `isDerivedStale()` + `getDerivedDisplayState()` in `packages/domain/fieldValueState.ts` are canonical
- Keep HRV no-method render guard explicit in reusable component contract as impossible-state WARN path
- Canonical architecture note: `docs/architecture/field-value-state-and-missingness-v1.md`
- Field-state QA priorities: `docs/architecture/field-status-qa-checklist-v1.md`
- For wearables: keep daily summaries explicit about source scope (`single_source` vs `merged`) and timezone semantics; context notes minimally structured with tags

## Durable repo operations posture

- `README.md`: project entry point
- `CHECKPOINT.md`: current execution state and next-step source of truth
- `MEMORY.md`: durable assumptions and decisions only
- `memory/`: short-term working notes and daily continuity, not durable truth
- `main`: stable branch; short-lived branches for focused changes
- When local baseline has moved materially: prefer fresh focused PR slices over reviving stale broad PRs
- Keep lightweight GitHub hygiene: templates, CODEOWNERS, CI for typecheck + domain tests
- Do not let generated docs or AI-assisted code drift from actual implemented path
- Local Supabase replay + authenticated smoke-test = required backend baseline before claiming edge-function seam works
- Hosted Supabase security-advisor clean + ordered migration confirmation = sufficient hosted hardening baseline
- Do not treat local-only function as hosted-ready; hosted deployment + one authenticated hosted smoke call required
- Minimum-slice hosted backend seam is green only when: hosted migrations match repo, RLS/policies live, function deployed, authenticated hosted smoke call returns 200 with writes succeeding
- Minimum-slice mobile seam proven only when: login, authenticated submit, wrong-password handling, hosted-function error handling, and sign-out all verified in real app
- Use `docs/compliance/data-handling-and-redaction.md` as canonical operational policy for fixtures, screenshots, logs, smoke tests, examples
- Use `docs/ops/openclaw.md` as canonical OpenClaw operating guide

## Startup rule

Use `CHECKPOINT.md` for fresh-session startup. This file is for durable truth only.
Detailed history: `docs/roadmap/checkpoints/2026-04-13-pre-compact-memory.md`
