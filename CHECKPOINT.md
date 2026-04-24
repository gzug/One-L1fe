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

Increment 1 of the Dot/Score refactor is complete. The domain foundation (dots, score aggregation, score display) is built, typecheck and assertions pass locally, and PR #108 is open as Draft. The app's existing screens (login, minimum-slice, weekly check-in, wearable sync, dev-insight) remain untouched and working.

## Active Refactor

- **Branch:** `claude/opus-refactor-one-l1fe-BjSjj`
- **PR:** [#108](https://github.com/gzug/One-L1fe/pull/108) — Draft, CI in progress
- **Commit:** `0360e79` — feat(domain): add Dot/Score architecture foundation

## Completed Increments

### Increment 1 — Domain Foundation ✅
- `packages/domain/dots.ts` — DotStatus (incl. `planned_locked`), DotScore, DotDefinition, full static Dot catalog. Mind & Sleep folded as sub-group under Lifestyle (5-tab constraint). Doctor Prep and Symptoms carry `scoreContribution: 'output'` — never enter aggregate formula.
- `packages/domain/scoreAggregation.ts` — `aggregateOneL1feScore()` using `effectiveWeight = baseWeight × coverage × freshness × confidence`. Only `ready`/`needs_update` leaf Dots count. `planned_locked`, `excluded`, `missing` never penalized.
- `packages/domain/scoreDisplay.ts` — `no_data`/`starter`/`usable`/`strong` mapping with named coverage thresholds. Never renders raw 0 for missing data.
- Assertion tests wired into `runMinimumSliceAssertions.ts`
- `tsc --noEmit` green, test suite green

## Next Step

**Increment 2 — 5-Tab Navigation** (`apps/mobile/App.tsx`)
- Replace current 2-3 tab bar with 5 main tabs: One L1fe / Doctor Prep / Health Data / Lifestyle / Activity
- Dev tab remains hidden for `is_dev=true`
- Static menu entry including Settings
- `LockedFeatureCard` reusable component for all `planned_locked` Dots
- `FirstCheckinCard` on Tab 1 alongside existing `WeeklyCheckinScreen` (untouched)
- Screen migration: `MinimumSliceScreen` → Health Data, `WearableSyncScreen` → Activity, `WeeklyCheckinScreen` → One L1fe Tab

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
