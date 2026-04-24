---
status: current
canonical_for: durable project assumptions
owner: repo
last_verified: 2026-04-23
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
- Evidence registry: schema + seed live (`evidence_sources`, `rule_evidence_links`; 9 sources, 15 rules, migrations `20260413021500` + `20260420091500` + `20260420190000`). Covered: Vitamin D, Ferritin, CRP, ApoB/LDL. Runtime consumer not yet wired to the active execution path — Priority Score still does not read from `rule_evidence_links` at calculation time in the current app/backend seam. Acceptable for private-use V1; must be wired before any external claim or distribution scope change. Active tracker: Issue #104 (WEARABLE-TD-004).
- Keep shared domain imports cross-runtime safe (Node tests + Supabase Edge Functions)
- Mobile: Expo first, avoid `expo-router` until concrete navigation need
- `apps/mobile/` auth via `mobileSupabaseAuth.ts` with real Expo env keys
- Mobile auth: `useAuthSession.ts` owns auth-state and `LoginScreen.tsx` owns sign-in.
- Mobile signed-in shell: `App.tsx` owns the One L1fe Home surface. The Home Orbit is user-facing and must only show score-capable domains: `Health`, `Nutrition`, `Mind & Sleep`, and `Activity`.
- Mobile navigation placement: `Doctor Prep` is an output/preparation action, not an Orbit Dot. `Menu` is backup navigation. `Profile` contains Settings/App Settings. Dev Insight is not user-facing in the current prototype shell.
- Mobile screen placement: `MinimumSliceScreen` lives under `Health > Blood / Biomarkers`, `WeeklyCheckinScreen` under `Mind & Sleep`, `NutritionScreen` under `Nutrition`, and `WearableSyncScreen` under `Activity` behind the Health Connect permission gate.
- Visible dot structure: `packages/domain/dotStructure.ts` is the canonical UI hierarchy for visible Orbit Dots, menu entries, and sub-dot detail structure.
- Habits are context under `Mind & Sleep`; they may explain data changes but must not directly affect One L1fe Score, Dot Scores, or biomarker priority score.
- Nutrition prototype: `packages/domain/nutritionEstimate.ts` is the canonical mock nutrition estimate helper; estimates must stay approximate and confidence-based, not exact or medical.
- Load `react-native-url-polyfill/auto` before `@supabase/supabase-js`
- Signed-out states vs operational auth errors treated separately in `getFreshAccessToken()`
- Wearable work: reuse `apps/mobile/mobileSupabaseAuth.ts`, no second Supabase client
- Mobile wearable path on `main`: `useWearableSource`, `useWearableSync`, `WearableSyncScreen`, Android-first Health Connect permission gate
- `HealthConnectPermissionGate` wired into tab navigation: `useWearablePermissions()` lifted to `App` level; Wearable Sync tab shows lock badge + reduced opacity when `hcStatus` is `denied` or `unavailable`. Gate still renders inline when tab is opened.
- `WearableSyncScreen` shows `SyncStatus` feedback after sync: success banner (timestamp + `records_inserted`), error banner, disabled button during run. `SyncStatus` type: `idle | running | success | error`.
- Shared wearable sync contract lives in `src/lib/wearables/syncContract.ts`; mobile sync helpers must build from that shared type instead of drifting to a second contract.
- Health Connect permission coverage for Garmin sync includes `Steps`, `HeartRate`, `RestingHeartRate`, `HeartRateVariabilityRmssd`, `ActiveCaloriesBurned`, `Distance`, and `SleepSession`.
- Canonical wearable metric keys are the shared contract for mobile, docs, and ingest fixtures: `steps_total`, `resting_heart_rate`, `hrv`, `sleep_session`, `sleep_duration`, `active_energy_burned`, `distance_total`.
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
- `isDerivedStale()` staleness thresholds extracted as named constants in `packages/domain/v1.ts`: `STALE_THRESHOLD_DAYS_LAB` (30), `STALE_THRESHOLD_DAYS_WEARABLE` (1), `STALE_THRESHOLD_DAYS_SUBJECTIVE` (1). Per-biomarker override via `StalenessConfig` type. Lab fields and wearable fields intentionally have different windows.
- HRV no-method render guard: explicit impossible-state WARN path in reusable component contract
- Canonical ref: `docs/architecture/field-value-state-and-missingness-v1.md`
- Field-state QA: `docs/architecture/field-status-qa-checklist-v1.md`
- Wearable daily summaries: explicit `single_source` vs `merged` scope; timezone semantics explicit; tags over free text
- All edge functions: `verify_jwt: false` + in-function `getUser()` auth (canonical ref: `supabase/README.md`)
- Identity-guard migration: unique index `(profile_id, source_kind, app_install_id)` + `(profile_id, source_kind, device_hardware_id)`
- HRV V1: store method metadata; never aggregate SDNN + RMSSD; `unknown` method rejected at `supabase/functions/wearables-sync/validate.ts`
- Domain code vendored into `_lib/domain` via `scripts/prepare-supabase-function-domain.sh` (cross-runtime Node + Edge)
- Severity separate from coverage

## Durable biomarker scoring posture

- `BiomarkerDefinition` carries two scoring-class fields: `evidenceConfidenceModifier` (0.3–1.0) and `scoringClass` (`causal-primary` | `supporting-actionable` | `contextual-low-certainty`)
- Effective weight = `priorityWeight × evidenceConfidenceModifier` — suppresses low-certainty markers without removing them from the system
- Tier 1 causal-primary (modifier 1.0): ApoB (weight 3.0), HbA1c (weight 2.0) — Mendelian randomization + large RCT evidence
- Tier 2 supporting-actionable (modifier 0.8–1.0): hsCRP (1.5 × 0.8), LDL, Triglycerides, Glucose (all 1.0 × 1.0), Vitamin D (1.0 × 0.8), Ferritin (1.0 × 0.8), B12 (1.0 × 0.8)
- Tier 3 contextual-low-certainty (modifier 0.3–0.7): Lp(a) (0.7), Magnesium (0.7), DAO (0.3)
- Optimal thresholds follow Attia Medicine 3.0 targets — tighter than standard lab reference ranges; full delta table in `AUDIT_LOG.md`
- Key tightened values: ApoB optimalMax 60 mg/dL; HbA1c optimalMax 5.3%; Glucose optimalMax 85 mg/dL; hsCRP optimalMax 1 mg/L; LDL optimalMax 70 mg/dL; Vitamin D optimalMin 40 ng/mL
- `evaluateTriglycerides()` (LIP-003) and `evaluateDAO()` (CTX-003, LOW_CONFIDENCE) defined — implementation pending in `packages/domain/thresholds.ts`
- `evaluateB12()` and `evaluateMagnesium()` also pending
- `thresholds.ts` is source of truth for threshold values; `biomarkers.ts` referenceRange must stay in sync

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
- `docs/ops/memory-system-v2.md`: canonical memory-system operating rules
- Bigger Supabase work follows `docs/ops/supabase-agent-workflow.md`; any Realtime task must also load `docs/prompts/supabase-realtime-ai-assistant-guide.md`
- Keep raw personal health data out of repo
- Smoke-test user: `g.zugang@hotmail.com` (UID `523b48a4-2aa2-4e4c-97f2-8fa95141ac8b`)

## Startup rule

Use `CHECKPOINT.md` for fresh-session startup. Durable truth only here.
History: `docs/roadmap/checkpoints/2026-04-13-pre-compact-memory.md`

## Durable scope and distribution decisions

- Private use only — two users (owner + brother). No store release planned. No GDPR obligation at current scale.
- Distribution: no EAS/TestFlight/Play Store pipeline. Target: sideloadable APK for Android or minimal-step guide for brother to install without physical device present here.
- iOS: personal dev-check device only. Not a target platform for brother. HealthKit prototype broken (package bundle issue) — must fix before next iOS check. No timeline for full iOS feature parity. Android is primary.
- Observability: optional Sentry crash reporting is supported behind `EXPO_PUBLIC_SENTRY_DSN`; default behavior is no-op without a DSN. In-app developer/insight interface via separate dev-login still shows error logs, user feedback, feature ideas, and basic Supabase metrics (active users, session counts). Not blocking V1.
- E2E tests: no dedicated mobile E2E layer (Detox/Maestro) planned at this stage. Manual device checks on iPhone as needed. Android + Garmin focus.
- GDPR: explicit decision — private only, no public release, no GDPR obligation until distribution scope changes.
History: `docs/roadmap/checkpoints/2026-04-13-pre-compact-memory.md`
