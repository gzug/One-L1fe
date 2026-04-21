# A8 — User-Configurable Panel & Data Sources

**Target agent:** ChatGPT Codex
**Workstream:** A (Metrics & Logic) — extends Design 2.5
**Depends on:** A3 (PriorityScoreResult contract), C2 (evidence wire)
**Blocks:** none — orthogonal layer above the score

---

## Context

Design 2.5 (see A3) emits an evidence-anchored Priority Score over a
fixed biomarker panel. The operator wants the end user to be able to
(a) see every data point the app holds, (b) add or hide specific data
sources, (c) have these toggles affect what the score is computed from
— without silently breaking the evidence-anchored guarantee.

The chosen model is **Variante C (Hybrid)**:

- **Mandatory biomarkers (locked):** ApoB, HbA1c, Glucose, LDL. Cannot
  be deactivated. Excluding any of these = score is suppressed with a
  visible lock, never a silently-zero score.
- **Optional biomarkers (toggleable):** Lp(a), CRP, Triglycerides,
  Vitamin D, Ferritin, B12, Magnesium, DAO. User can exclude any of
  these; score result labels itself `reduced_confidence` + names the
  missing marker(s).
- **Wearable data sources (separate layer):** Steps, HeartRate,
  RestingHeartRate, HeartRateVariabilityRms, SleepSession,
  ActiveCaloriesBurned, TotalCaloriesBurned, ExerciseSession, Vo2Max,
  OxygenSaturation, Distance, Weight. Toggles here do **not** change
  the score. They drive Trend (A7), Freshness, and Recommendations.

Defaults are the **recommended set**: all 13 biomarkers on, the 8 HC
types from B2 on. Extra HC types (BloodPressure, BodyFat,
BasalMetabolicRate, Hydration, Nutrition, etc.) are off by default
and discoverable in "Advanced data sources".

## Goal

Ship an end-to-end configurable panel layer: persistence, domain
enforcement, UI settings surface, and score-behavior contract.

## Deliverables

### 1. Supabase migrations

Two new tables, both scoped by `app_install_id` via RLS (same pattern
as `wearable_sync_runs`):

**`user_marker_preferences`**
- `id uuid pk`
- `app_install_id uuid not null`
- `marker_key text not null` — must be a key from `biomarkers.ts`
- `enabled boolean not null default true`
- `updated_at timestamptz default now()`
- `unique(app_install_id, marker_key)`

**`user_wearable_preferences`**
- `id uuid pk`
- `app_install_id uuid not null`
- `hc_record_type text not null` — exact HealthConnect record type
- `enabled boolean not null default true`
- `updated_at timestamptz default now()`
- `unique(app_install_id, hc_record_type)`

Seed on first app launch: insert recommended defaults (13 biomarkers
enabled, 8 HC types enabled) per new `app_install_id`. Idempotent —
never overwrite existing user rows.

Both tables ship with a down-migration.

### 2. Domain layer

New file `packages/domain/userPreferences.ts`:

```
const MANDATORY_MARKER_KEYS = ['apob', 'ldl', 'hba1c', 'glucose'] as const;
const OPTIONAL_MARKER_KEYS  = ['lpa','triglycerides','crp','vitamin_d','ferritin','b12','magnesium','dao'] as const;

type MarkerPreference = { markerKey: string; enabled: boolean };

type PanelConfiguration = {
  enabledMarkerKeys: Set<string>;
  excludedMandatoryKeys: Set<string>;   // non-empty ⇒ score locked
  excludedOptionalKeys: Set<string>;    // non-empty ⇒ reduced_confidence
};

function resolvePanelConfiguration(
  preferences: MarkerPreference[]
): PanelConfiguration
```

Update `evaluateMinimumSlice`:

- Add a required `panelConfiguration: PanelConfiguration` parameter.
- If `excludedMandatoryKeys.size > 0`, return a new result variant:
  ```
  { kind: 'score_locked',
    reason: 'MANDATORY_MARKER_EXCLUDED',
    missingKeys: string[],
    userAction: 'RE_ENABLE_IN_SETTINGS' }
  ```
  No score, no bucket, no partial result. UI must treat this as a
  hard lock with a call-to-action.
- If `excludedMandatoryKeys.size === 0` but
  `excludedOptionalKeys.size > 0`, attach
  `PriorityScoreResult.reducedConfidence = { excludedOptionalKeys }`
  and downgrade `evidenceClass` one step (strong → moderate, moderate
  → limited).
- Wearable preferences must **never** be read by the scoring path.
  Enforced by code review: no import of `user_wearable_preferences`
  or `hc_record_type` inside `biomarkers.ts`, `scoring.ts`,
  `minimumSlice.ts`. Add an eslint rule if feasible.

### 3. Mobile data layer

- `apps/mobile/src/data/userPreferences.ts`:
  - `fetchMarkerPreferences(appInstallId)` → `MarkerPreference[]`
  - `fetchWearablePreferences(appInstallId)` → `WearablePreference[]`
  - `setMarkerPreference(appInstallId, markerKey, enabled)`
  - `setWearablePreference(appInstallId, recordType, enabled)`
  - Local cache with single-source-of-truth on Supabase. Optimistic
    update + rollback on server error.
- Seeding logic runs on first app launch (detect via absence of any
  rows for this `app_install_id`).

### 4. Settings UI

New screen `apps/mobile/src/screens/DataSourcesSettingsScreen.tsx`:

- **Section 1 — Biomarkers**
  - Mandatory subsection: 4 rows, all with a small lock icon,
    toggle disabled, caption "Required for Priority Score".
  - Optional subsection: 8 rows with functional toggles. Each toggle
    shows the marker's `displayName`, a one-line description, and
    the current `evidenceLevel` (primary / secondary / experimental).
- **Section 2 — Wearable data (Health Connect)**
  - Recommended subsection: 8 default-on rows. Each shows the
    Health Connect record type name, a one-line description, and
    a status indicator (data received in last 7d / not received).
  - Advanced subsection: collapsible, contains the remaining HC
    types. Each defaults off. Same status indicator.
- Changing any toggle → optimistic update → `setMarkerPreference` /
  `setWearablePreference` → on failure, revert + toast.

Banners / notices:
- If the user disables an optional biomarker, show a banner above the
  score on `MinimumSliceScreen`: "Reduced confidence — N markers
  excluded. Review in Data sources."
- If the user tries to disable a mandatory marker, an `AlertDialog`
  fires first: "Disabling ApoB / LDL / HbA1c / Glucose locks your
  Priority Score. Continue?" Default action: cancel. If confirmed,
  `MinimumSliceScreen` switches to the **score-locked** state per the
  `score_locked` result variant.

### 5. Score-locked state in MinimumSliceScreen

- Big padlock icon.
- Text: "Priority Score is locked because required markers are
  excluded: `<missingKeys>`. Re-enable in Data sources."
- Button: "Open Data sources" → navigates to
  `DataSourcesSettingsScreen`.
- No numeric score. No bucket. No per-pillar chips.
- Trend section (A7) still renders if observations exist — trend is
  orthogonal.

### 6. Tests

- Domain fixtures:
  - All mandatory enabled + all optional enabled → full score, normal
    evidenceClass.
  - ApoB disabled → `score_locked` result, no score computation runs.
  - CRP + VitD disabled → score computed, `reducedConfidence` set,
    `evidenceClass` downgraded one step.
  - Wearable prefs changed → score invariant (identical result).
- Integration test (mobile): toggling an optional marker off → score
  re-renders with banner. Toggling it back on → banner clears.
- RLS test on both preference tables: user A cannot read user B rows.

## Constraints

- No schema changes to `biomarkers.ts` definitions themselves —
  preferences are a **separate layer**.
- Never mutate evidence anchors based on user preferences. Anchors
  stay evidence-anchored; user preferences only toggle inclusion.
- No preference data in the domain layer's pure functions beyond the
  `PanelConfiguration` input. Domain stays side-effect-free.
- Wearable preferences **must not** leak into the scoring path. This
  is a hard architectural line — document it in the PR description.
- Default-seed logic must be idempotent. Running app twice on the
  same `app_install_id` must not re-seed.

## Acceptance criteria

- Fresh install on the OnePlus 13R → DataSourcesSettingsScreen opens,
  all recommended defaults visible, toggles work.
- Disabling ApoB → AlertDialog → confirm → score-locked screen.
- Re-enabling ApoB → score returns, banner clears.
- Disabling CRP → score still computed, `reducedConfidence` banner
  visible, `evidenceClass` downgraded.
- Disabling a wearable type → no score change, just stops that type
  from feeding trend/context.
- RLS prevents cross-user reads.
- All tests green.

## Hand-back checklist for Opus review

- [ ] Two migrations with down-migrations.
- [ ] Seed logic idempotent.
- [ ] `MANDATORY_MARKER_KEYS` hardcoded; any attempt to weaken this
      (e.g., make it user-configurable) is rejected.
- [ ] `score_locked` is its own result variant, not a zero score.
- [ ] `reducedConfidence` downgrades `evidenceClass`.
- [ ] Wearable toggles proven to not affect score (invariant test).
- [ ] No wearable imports in scoring code paths.
- [ ] Settings screen covers mandatory/optional/recommended/advanced
      sections.
- [ ] AlertDialog fires before disabling a mandatory marker.
- [ ] RLS test present for both preference tables.
