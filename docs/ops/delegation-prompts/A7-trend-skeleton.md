# A7 — Trend Skeleton (Read-Only, Score-Decoupled)

**Target agent:** ChatGPT Codex
**Workstream:** A (Metrics & Logic)
**Depends on:** A3 (TrendSkeleton type exists)
**Blocks:** none — infra for post-v1, shipped now to avoid future rewrite

---

## Context

Design 2.5 includes a `TrendSkeleton` type emitted by
`PriorityScoreResult.trendSkeleton` but populated as `null` in v1.
The user explicitly requested the infrastructure be built now so later
use does not require a rewrite: "build it with flagging so it ships
but does not couple to the score."

Hard rule: **trend data must not feed into Priority Score** in v1.
It is a display-only preview.

## Goal

Stand up the persistence + read path for per-marker time series, and
wire it into `evaluateMinimumSlice()` so `trendSkeleton` is populated
when data exists — without touching the score calculation.

## Deliverables

### 1. Supabase migration

- New table `biomarker_observations`:
  - `id uuid primary key`
  - `app_install_id uuid not null`
  - `marker_key text not null`
  - `value numeric not null`
  - `unit text not null`
  - `recorded_at timestamptz not null`
  - `source text not null`  (e.g. `manual`, `lab_upload`, `healthconnect`)
  - `created_at timestamptz default now()`
  - Index on `(app_install_id, marker_key, recorded_at desc)`.
- RLS: app_install_id scoping same pattern as `wearable_sync_runs`.
- Down-migration included.

### 2. Read-side domain

- `packages/domain/trends.ts` — new file.
- Function `buildTrendSkeleton(observations, windowDays) → TrendSkeleton | null`:
  - Returns null if 0 observations.
  - `sparse = observations.length < 3 || spanDays < windowDays`.
  - Pure function; no I/O.

### 3. Data access layer (apps/mobile)

- `apps/mobile/src/data/biomarkerObservations.ts` — fetch helper.
- One function: `fetchObservationsForPanel(appInstallId, markerKeys, windowDays)`.
- Returns `Record<markerKey, Observation[]>`.

### 4. Wiring in `evaluateMinimumSlice`

- `evaluateMinimumSlice` takes an **optional** `observations` parameter.
- When provided, per-marker `buildTrendSkeleton` runs and the result is
  attached to `PriorityScoreResult.trendSkeleton`. For v1 we populate
  the skeleton for the primary-focus marker only.
- When not provided, `trendSkeleton = null` (current behavior).
- The score calculation must not branch on presence of observations.

### 5. Flag

- `FEATURE_FLAG_TREND_SKELETON_READONLY = true` constant exported
  from `packages/domain/flags.ts`. When false, `evaluateMinimumSlice`
  returns `trendSkeleton = null` regardless of observations.

## Constraints

- Score calculation **untouched**. The test suite from A5 must stay
  green without modification.
- No score-coupling. If a reviewer (Opus) finds `trendSkeleton` read
  anywhere inside the scoring functions, the PR is rejected.
- No Edge Function changes. Mobile-side fetch + domain-side shaping.
- Observations are read-only in v1. No write path. Insertion
  happens later via manual lab upload or Health Connect ingest —
  those paths are out of scope here.

## Acceptance criteria

- Migration applies cleanly on a fresh Supabase branch.
- Down-migration reverses cleanly.
- `pnpm -C packages/domain test` green — no score-related fixture
  changes needed.
- New test: `evaluateMinimumSlice` with observations set →
  `trendSkeleton` populated but `bucket` and `rawScore` identical to
  the no-observations call.
- New test: flag off → `trendSkeleton = null` even with observations.

## Hand-back checklist for Opus review

- [ ] `biomarker_observations` RLS tested.
- [ ] Down-migration tested.
- [ ] Score invariance test proves no coupling.
- [ ] Flag gating tested.
- [ ] No Edge Function edits.
- [ ] `TrendSkeleton.note` field set to `READ_ONLY_V1_NOT_COUPLED_TO_SCORE`.
