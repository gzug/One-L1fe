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

Long-term operating memory for **One L1fe (OL)**.

> No raw user health data, lab reports, or personal identifiers here.

---

## Durable product boundary

- Not a diagnostic or treatment system
- Frame as a health data, biomarker, and interpretation product — not "wellness"
- Recommendations: bounded, uncertainty-aware, within `docs/compliance/intended-use.md`
- Severity, coverage, freshness, and recommendation eligibility must stay distinct

## Durable architecture posture

- Keep Notion out of hidden runtime logic
- Keep core health/domain logic in shared domain/backend code
- ApoB primary, LDL fallback/secondary; weak markers out of hard core score unless clearly justified
- Priority Score: bounded prioritization aid, not a clinical risk score
- Keep shared domain imports cross-runtime safe (Node tests + Supabase Edge Functions)
- Mobile: Expo first, avoid `expo-router` until concrete navigation need
- `apps/mobile/` auth via `mobileSupabaseAuth.ts` with real Expo env keys
- Mobile auth: `useAuthSession.ts` owns auth-state, `LoginScreen.tsx` sign-in, `MinimumSliceScreen.tsx` signed-in form, `App.tsx` auth-gate shell
- Load `react-native-url-polyfill/auto` before `@supabase/supabase-js`
- Signed-out states vs operational auth errors treated separately in `getFreshAccessToken()`
- Wearable work: reuse `apps/mobile/mobileSupabaseAuth.ts`, no second Supabase client
- Mobile wearable path on `main`: `useWearableSource`, `useWearableSync`, `WearableSyncScreen`, Android-first Health Connect permission gate
- Android: `react-native-health-connect`; iOS explicit stub until HealthKit adapter added
- Early seams: device-free + mockable; readiness docs must distinguish hosted-proof from real device proof
- Garmin: first provisioning target; still device-free/hosted
- Garmin-first: `resting_heart_rate`, `sleep_duration`, `steps_total`, `hrv` with explicit method metadata
- `subjective_energy`: self-report-first, not forced into wearable ingest
- Provisioning: `supabase/functions/wearable-source-resolve/` only
- Source ownership: `app_install_id` now, `device_hardware_id` later; `source_app_id` is metadata only
- `wearables-sync` must reject inactive sources; ownership alone is not sufficient
- Wearable-backed fields: keep manual-entry fallback when sync unavailable, partial, delayed, or wrong
- Fields support explicit intentional-missingness; must not trigger calculation or validation errors
- V1: `provided` is display-layer umbrella, not required persisted state
- `declined` out of V1 unless real settings/preferences flow exists
- `stale`: derived from `isDerivedStale()` in `packages/domain/fieldValueState.ts`; never persisted as `field_state`
- HRV no-method render guard: explicit impossible-state WARN path in reusable component contract
- Canonical ref: `docs/architecture/field-value-state-and-missingness-v1.md`
- Field-state QA: `docs/architecture/field-status-qa-checklist-v1.md`
- Wearable daily summaries: explicit `single_source` vs `merged` scope; timezone semantics explicit; tags over free text

## Durable repo operations posture

- `README.md`: project entry point
- `CHECKPOINT.md`: current execution state and next step
- `MEMORY.md`: durable assumptions and decisions only
- `memory/`: short-term working notes, not durable truth
- `main`: stable; short-lived branches for focused changes
- Prefer fresh focused PRs over reviving stale broad ones
- GitHub hygiene: templates, CODEOWNERS, CI typecheck + domain tests
- No generated docs drifting from actual code path
- Local Supabase replay + authenticated smoke-test = required backend baseline
- Hosted security-advisor clean + ordered migration confirmation = sufficient hosted hardening baseline
- Local-only function ≠ hosted-ready; hosted deploy + one authenticated hosted smoke call required
- Minimum-slice hosted seam green when: hosted migrations match repo, RLS/policies live, function deployed, authenticated 200 with writes
- Minimum-slice mobile seam proven when: login, submit, wrong-password, error handling, sign-out all verified in real app
- `docs/compliance/data-handling-and-redaction.md`: canonical policy for fixtures, screenshots, logs, smoke tests
- `docs/ops/openclaw.md`: canonical OpenClaw operating guide

## Startup rule

Use `CHECKPOINT.md` for fresh-session startup. Durable truth only here.
History: `docs/roadmap/checkpoints/2026-04-13-pre-compact-memory.md`
