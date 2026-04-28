---
status: current
canonical_for: durable project assumptions
owner: repo
last_verified: 2026-04-28
supersedes: []
superseded_by: null
scope: repo
---

# MEMORY.md

Durable operating memory for **One L1fe (OL)**.

> No raw user health data, lab reports, or personal identifiers here.

## Product boundary

- Not diagnostic.
- Not treatment.
- Not emergency triage.
- Priority Score is a bounded prioritization aid, not a clinical risk score.
- Recommendations stay bounded, uncertainty-aware, and aligned with `docs/compliance/intended-use.md`.
- Severity, coverage, freshness, and recommendation eligibility stay distinct.

## Active mobile posture

- Active mobile root: `apps/mobile/App.tsx -> apps/mobile/prototypes/v1-marathon/src/PrototypeV1MarathonScreen.tsx`.
- Active app label: `Prototype V1 - Marathon` / UI string `V1 — Marathon`.
- Previous authenticated minimum-slice/full-app shell is historical, not active root path.
- Historical auth/backend mobile files may be reused later: `LoginScreen.tsx`, `SessionBar.tsx`, `mobileSupabaseAuth.ts`, `minimumSliceScreenController.ts`, `minimumSliceScreenModel.ts`, `minimumSliceHostedConfig.ts`.
- Do not delete historical mobile auth/backend files without import/reference audit.
- No `.env.local` prototype gate is required.
- `.env.prototype` is obsolete and scheduled for deletion.
- Health Connect in Marathon prototype is foreground display-only: no background sync, no Supabase write, no score recomputation.

## Architecture posture

- Keep Notion out of hidden runtime logic.
- Keep core health/domain logic in shared domain/backend code.
- Keep shared domain imports cross-runtime safe: Node tests + Supabase Edge Functions.
- Mobile: Expo first; avoid `expo-router` until concrete navigation need.
- Load `react-native-url-polyfill/auto` before `@supabase/supabase-js` when Supabase client path is active.
- Wearable work should reuse `apps/mobile/mobileSupabaseAuth.ts`; no second Supabase client.
- Android: `react-native-health-connect`; iOS explicit stub until HealthKit adapter exists.
- Wearable-backed fields keep manual-entry fallback when sync is unavailable, partial, delayed, or wrong.
- Fields support intentional missingness; missingness must not trigger calculation or validation errors.
- V1 `provided` is display-layer umbrella, not required persisted state.
- `declined` stays out of V1 unless a real preferences flow exists.
- `stale` is derived from `isDerivedStale()` in `packages/domain/fieldValueState.ts`; never persist as `field_state`.
- Canonical field-state ref: `docs/architecture/field-value-state-and-missingness-v1.md`.
- Field-state QA ref: `docs/architecture/field-status-qa-checklist-v1.md`.
- All edge functions: `verify_jwt: false` + in-function `getUser()` auth. Canonical ref: `supabase/README.md`.
- Domain code is vendored into `_lib/domain` via `scripts/prepare-supabase-function-domain.sh`.

## Biomarker scoring posture

- ApoB primary; LDL fallback/secondary.
- Weak markers stay out of hard core score unless justified.
- `BiomarkerDefinition` scoring fields: `evidenceConfidenceModifier` and `scoringClass`.
- Effective weight = `priorityWeight × evidenceConfidenceModifier`.
- Tier 1 causal-primary: ApoB, HbA1c.
- Tier 2 supporting-actionable: hsCRP, LDL, Triglycerides, Glucose, Vitamin D, Ferritin, B12.
- Tier 3 contextual-low-certainty: Lp(a), Magnesium, DAO.
- `thresholds.ts` is source of truth for threshold values; `biomarkers.ts` reference ranges must stay in sync.
- Evidence registry exists: `evidence_sources`, `rule_evidence_links`. Runtime consumer is not yet wired to active calculation path.

## Wearable posture

- Canonical wearable metric keys: `steps_total`, `resting_heart_rate`, `hrv`, `sleep_session`, `sleep_duration`, `active_energy_burned`, `distance_total`.
- Garmin-first target: `resting_heart_rate`, `sleep_duration`, `steps_total`, `hrv` with method metadata.
- `subjective_energy` is self-report-first, not forced into wearable ingest.
- Provisioning path: `supabase/functions/wearable-source-resolve/` only.
- Source ownership: `app_install_id` now, `device_hardware_id` later; `source_app_id` is metadata only.
- `wearables-sync` must reject inactive sources; ownership alone is not sufficient.
- HRV V1 stores method metadata; never aggregate SDNN and RMSSD; `unknown` method is rejected in `supabase/functions/wearables-sync/validate.ts`.

## Repo operations posture

- `README.md`: project entry point.
- `CHECKPOINT.md`: current execution state and next step.
- `CONTEXT.md`: project overview and architecture map.
- `MEMORY.md`: durable assumptions and decisions only.
- `memory/`: short-term working notes, not durable truth.
- `main`: stable; use short-lived branches for focused changes.
- Prefer fresh focused PRs over reviving stale broad ones.
- No generated docs drifting from actual code path.
- Keep raw personal health data out of repo.
- `docs/compliance/data-handling-and-redaction.md`: canonical policy for fixtures, screenshots, logs, smoke tests.
- `docs/ops/openclaw.md`: canonical OpenClaw guide.
- `docs/ops/memory-system-v2.md`: canonical memory-system rules.
- Bigger Supabase work follows `docs/ops/supabase-agent-workflow.md`.
- Realtime tasks must also load `docs/prompts/supabase-realtime-ai-assistant-guide.md`.

## Startup rule

Start with `CHECKPOINT.md`, then `CONTEXT.md`, then this file only for durable boundaries.
Do not load `memory/` or `docs/archive/` unless directly relevant.

## Scope and distribution decisions

- Private use only: owner + brother.
- No public store release planned.
- Android is primary.
- iOS is secondary/dev-check only until HealthKit path is fixed.
- No dedicated mobile E2E layer planned at this stage.
- Optional Sentry crash reporting behind `EXPO_PUBLIC_SENTRY_DSN`; default no-op without DSN.
