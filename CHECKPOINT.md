---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-04-24
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Verdict

Increment 7 of the Dot/Score refactor is implemented on `claude/opus-refactor-one-l1fe-BjSjj` (PR #108): the mobile home includes sourced Ask One L1fe, synthetic 90-day presentation data, context-only Habit links, field-status controls for every biomarker value, and a skipable first-run guided overlay. This sits on top of the pushed refactor/stability slice that hardens the Source-of-Truth between `dots.ts` (domain/score catalog) and `dotStructure.ts` (UI view model). Mobile typecheck, domain assertions, and Expo web export passed locally before push.

## Active Refactor

- **Branch:** `claude/opus-refactor-one-l1fe-BjSjj`
- **PR:** [#108](https://github.com/gzug/One-L1fe/pull/108) — Draft, CI in progress
- **Base Commit:** `70759b5` — meta: update CHECKPOINT after Increment 1 (Dot/Score domain foundation)
- **Remote baseline before guided demo:** `d7878ef` — refactor(domain): harden UI/domain Dot boundary
- **Working tree:** Increment 7 guided demo onboarding commit being pushed on the same branch

## Completed Increments

### Increment 1 — Domain Foundation ✅
- `packages/domain/dots.ts` — DotStatus (incl. `planned_locked`), DotScore, DotDefinition, full static Dot catalog. Mind & Sleep folded as sub-group under Lifestyle (5-tab constraint). Doctor Prep and Symptoms carry `scoreContribution: 'output'` — never enter aggregate formula.
- `packages/domain/scoreAggregation.ts` — `aggregateOneL1feScore()` using `effectiveWeight = baseWeight × coverage × freshness × confidence`. Only `ready`/`needs_update` leaf Dots count. `planned_locked`, `excluded`, `missing` never penalized.
- `packages/domain/scoreDisplay.ts` — `no_data`/`starter`/`usable`/`strong` mapping with named coverage thresholds. Never renders raw 0 for missing data.
- Assertion tests wired into `runMinimumSliceAssertions.ts`
- `tsc --noEmit` green, test suite green

### Increment 2 — 5-Tab Navigation ✅
- `apps/mobile/App.tsx` now uses the Dot catalog `TAB_ORDER` as the 5 main tab order: One L1fe / Doctor Prep / Health Data / Lifestyle / Activity.
- Existing screens are migrated without changing their internals:
  - `WeeklyCheckinScreen` lives under One L1fe
  - `MinimumSliceScreen` lives under Health Data
  - `WearableSyncScreen` lives under Activity behind the existing Health Connect permission gate
  - `DevInsightScreen` remains available only for `is_dev=true`
- Added `apps/mobile/FirstCheckinCard.tsx` on the One L1fe tab.
- Added reusable `apps/mobile/LockedFeatureCard.tsx` and render planned-locked Dots from the static catalog.
- Added static Menu card with Settings entry.
- Verified locally:
  - `npm --prefix apps/mobile run typecheck`
  - `npm run test:domain`
  - `npm --prefix apps/mobile run export:web`

### Increment 3 — Visible Dot/Sub-Dot Prototype ✅
- `apps/mobile/App.tsx` now renders the full visible Dot/Sub-Dot structure for all five main dots.
- Sub-dots are visible, tappable, and status-aware with `ready`, `needs_update`, `missing`, `excluded`, and `planned_locked` labels.
- The following sub-dot paths now open visible detail panes:
  - One L1fe Score
  - Current Update
  - Blood / Biomarkers
  - Nutrition
  - Wearable Sync
- Added `packages/domain/dotStructure.ts` and assertions so the structure is centralized and testable.
- Added `packages/domain/nutritionEstimate.ts` plus assertions for bounded confidence and uncertainty-aware mock nutrition output.
- Added web-safe stubs for wearable permission gating so Expo web no longer trips on native-only imports.
- Verified locally:
  - `npm --prefix apps/mobile run typecheck`
  - `npm run test:domain`
  - `npm --prefix apps/mobile run export:web`

### Increment 4 — One L1fe Home Orbit Simplification ✅
- `apps/mobile/App.tsx` now treats One L1fe as the Home surface instead of a peer tab.
- The Home Orbit renders only `Health`, `Nutrition`, `Mind & Sleep`, and `Activity`; `Lifestyle`, `Doctor Prep`, `Habits`, and Dev Insight are not orbit dots.
- `Doctor Prep` and `Menu` are Home actions. Menu contains `One L1fe`, `Health`, `Nutrition`, `Mind & Sleep`, `Activity`, `Doctor Prep`, `Profile`, and `How the One L1fe Score Works`.
- Non-Home screens include a small Home/Menu affordance so users are not trapped in detail views.
- `Profile` is visible as a structured placeholder containing basic information, health context, preferences, connected sources, data choices, and app settings.
- `Nutrition` is visible and tappable but displays `Coming Soon` on the orbit; its detail path keeps the approximate photo/text nutrition prototype and states that it does not affect score yet.
- `packages/domain/dotStructure.ts` now exposes `ORBIT_DOTS`, `MENU_ENTRIES`, score-display labels, and score-effect helpers for testable navigation structure.
- `apps/mobile/MinimumSliceScreen.tsx` includes the shared field-status helper copy for Active / Missing / Not provided.
- Verified locally:
  - `npm --prefix apps/mobile run typecheck`
  - `npm run test:domain`
  - `npm --prefix apps/mobile run export:web`

### Increment 5 — Ask One L1fe Source-Gated Prototype 🚧
- `apps/mobile/App.tsx` now shows an Ask One L1fe question entry directly on the One L1fe Home surface.
- `apps/mobile/AskOneL1feScreen.tsx` shows the submitted question, answer, estimate confidence, sources used, missing data, and safety boundaries.
- `packages/domain/askOneL1fe.ts` defines the shared source/fact context and deterministic answer builder for future backend use.
- Current V1 behavior is intentionally conservative: without sourced user facts, Ask One L1fe explains that it cannot answer yet and does not invent values.
- Domain assertions cover no-data refusal, source overview behavior, bounded confidence, excluded source handling, and no fake score-0 behavior.
- Verified locally:
  - `npm --prefix apps/mobile run typecheck`
  - `npm run test:domain`

### Increment 6 — Synthetic 90-Day Presentation Data + Habits Context 🚧
- `packages/domain/syntheticDemoData.ts` adds explicitly synthetic 90-day presentation data with plausible biomarker, wearable, sleep, HRV, and activity summaries.
- The One L1fe Home now renders synthetic demo score values for `Health`, `Mind & Sleep`, and `Activity`; `Nutrition` stays `Coming Soon` and has no score effect.
- Ask One L1fe now uses the synthetic demo context so demo questions can return sourced answers with confidence, sources, missing data, and safety boundaries.
- `Mind & Sleep > Habits & Context` now explains habit links such as late caffeine, walking consistency, and alcohol near bedtime as awareness context only.
- `MinimumSliceScreen` now shows the Active / Missing / Not provided selector on every biomarker value, including ApoB, LDL-C, HbA1c, and Glucose.
- Assertions cover synthetic source citation, Nutrition remaining unscored, habit links staying context-only, and core biomarker Missing mapping to null instead of crashing.
- Verified locally:
  - `npm --prefix apps/mobile run typecheck`
  - `npm run test:domain`

### Increment 7 — First-Run Guided Overlay 🚧
- Added `apps/mobile/FirstRunGuideOverlay.tsx` with a 7-step first-run guide for Score, Confidence/Coverage, Dots, Ask One L1fe, Doctor Prep, Menu, and first data source CTA.
- Added `apps/mobile/firstRunGuideStorage.ts` for persistent completed state via AsyncStorage on native and localStorage on web.
- The guide is skipable, appears on first signed-in run, and can be reopened from the Home `i` button.
- Step 6 opens the Menu screen behind the overlay so the user sees where backup navigation lives.
- Step 7 can route to `Activity > Wearable Sync`; Android copy calls out Health Connect, while web/iOS stays honest that Health Connect is Android-only in this prototype.
- Verified locally:
  - `npm --prefix apps/mobile run typecheck`
  - `npm run test:domain`

## Next Step

**Next — real source integration + route polish**
- Replace synthetic Ask facts with real latest biomarker evaluation, wearable summaries, and profile/source settings when those flows are proven.
- Live-check whether the guided overlay feels too long on mobile; 7 steps is the current upper limit.
- Live-test the new Ask/Home flow in Expo Web and on Android when available.
- Split `App.tsx` into focused screen files before adding more Home behavior.

## Completed follow-up — Refactor/Stability slice

- `packages/domain/dotStructure.ts` is now marked as UI view model; domain binding is explicit via optional `SubDotDefinition.domainDotKeys` and checked by an assertion against `packages/domain/dots.ts`. No more silent drift between UI and domain catalogs.
- `deriveOrbitDisplayState(userDotScores)` added as the runtime API the Home surface reads from. V1 returns a "no data" snapshot; future score pipeline feeds user Dot scores without changing the UI call site.
- Orbit key renamed `mind_sleep` → `mind_and_sleep` across UI code to match the canonical domain DotKey.
- `SubDotDefinition.kind = 'planned'` variant removed together with its dead branches in `App.tsx`.
- Verified locally:
  - `npm --prefix apps/mobile run typecheck`
  - `npm run test:domain`
  - `npm --prefix apps/mobile run export:web`

## Pending PRs

- `#108` — Dot/Score domain foundation (active, Draft)
- `claude/real-app-install-id` — AsyncStorage-backed persistent UUID; intentionally held
- `#99 feat: user-configurable panel preferences` — open, draft
- `#101 feat: mobile scoring and build tooling` — open, draft

## Blockers

- No physical Garmin / Health Connect data source proof yet (WEARABLE-TD-001)
- End-to-end Supabase ingest still needs an Android device run
- Wearable sync request still uses placeholder payload (`as any`) — not blocking Increment 2

## Decisions Made (Increment 1)

- `planned_locked` replaces `planned` as sole DotStatus value for future features — forces locked UI
- Only leaf Dots aggregate into `oneLIfeScore` — top-level groups are display rollups only
- `WeeklyCheckinScreen` stays untouched — `FirstCheckinCard` wrapper added alongside it
- Doctor Prep is read-only output Dot — no score input, no own data entry
- Dot catalog lives as static array in `packages/domain/dots.ts` (not Supabase table) — V1.5 can migrate
- Symptoms: stored as free text, not scored in V1 — Doctor Prep context only
- Score display thresholds: coverage < 0.3 = starter, < 0.7 = usable, ≥ 0.7 = strong
- One L1fe Score calculated at render time, not persisted

## Deferred to post-v1

- **Garmin Terra webhook** — Terra OAuth pairing + `wearable_observations` smoke-test (WEARABLE-TD-002)
- Orbit animation (V1.5)
- Ask One L1fe real LLM backend — V1 = UI stub + mocked response only
- Server-side Dot score aggregation (V1 = client-side)
- Supabase table for Dot catalog (V1 = static domain array)
