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

Increment 4 of the Dot/Score refactor is implemented locally on `claude/opus-refactor-one-l1fe-BjSjj`: the mobile home now uses One L1fe as the central surface, renders only score-capable Orbit Dots (`Health`, `Nutrition`, `Mind & Sleep`, `Activity`), and moves Doctor Prep/Menu/Profile/Score education out of the orbit. Mobile typecheck, domain assertions, and Expo web export pass locally.

## Active Refactor

- **Branch:** `claude/opus-refactor-one-l1fe-BjSjj`
- **PR:** [#108](https://github.com/gzug/One-L1fe/pull/108) — Draft, CI in progress
- **Base Commit:** `70759b5` — meta: update CHECKPOINT after Increment 1 (Dot/Score domain foundation)
- **Working tree:** Increment 4 changes are uncommitted

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

## Next Step

**Increment 5 — route polish and device validation**
- Live-test whether the Home/Menu affordance is enough or whether the app needs persistent bottom navigation.
- Decide whether Nutrition should stay UI-only or add a real image picker on Android/web.
- Live-test the new orbit/menu flow in Expo Web and on Android when available.

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
