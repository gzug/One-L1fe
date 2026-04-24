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

Increment 2 of the Dot/Score refactor is implemented locally on `claude/opus-refactor-one-l1fe-BjSjj`: the signed-in mobile shell now exposes the 5 main tabs, migrates the existing screens into their target tabs, and renders planned-locked Dot affordances from the static Dot catalog. Mobile typecheck, domain assertions, and Expo web export pass locally.

## Active Refactor

- **Branch:** `claude/opus-refactor-one-l1fe-BjSjj`
- **PR:** [#108](https://github.com/gzug/One-L1fe/pull/108) — Draft, CI in progress
- **Base Commit:** `70759b5` — meta: update CHECKPOINT after Increment 1 (Dot/Score domain foundation)
- **Working tree:** Increment 2 changes are uncommitted

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

## Next Step

**Increment 3 — visual/runtime polish decision**
- Run the signed-in Expo app on web or device and verify the 5-tab shell visually, especially the fixed top card + embedded `WeeklyCheckinScreen` layout on small screens.
- Decide whether the 5-tab shell should stay as a custom React Native tab bar for V1 or move to a navigation library after more screens exist.
- Then wire the first read-only One L1fe score display from Increment 1 domain helpers, without persisting score state.

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
