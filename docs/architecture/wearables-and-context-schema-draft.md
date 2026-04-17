---
status: current
canonical_for: wearables, self-report, and context schema direction
owner: repo
last_verified: 2026-04-13
supersedes: []
superseded_by: null
scope: architecture
---

# Wearables and context schema draft

## Verdict

The next health-data layer after labs should be split into four distinct storage classes:
1. device and platform sources,
2. raw wearable observations,
3. app-facing summaries,
4. self-report and context.

Do not fold smartwatch data into the lab schema.
Do not mix subjective check-ins with raw device observations.
Do not treat opaque vendor scores as first-class clinical truth.

## Why this shape is the right one

The old Notion workspace already implied four different kinds of information:
- stable profile baselines,
- weekly self-report pillars,
- contextual notes,
- and measurable activity and sleep-related facts.

The current backend, by contrast, is optimized for labs and interpretation runs.
That is correct for V1, but it leaves a clear expansion lane for wearables.

The clean bridge is not one giant generic health-events table.
It is a small set of tables with explicit evidence class and provenance.

## Data classes

### 1. Lab facts
Examples:
- ApoB
- LDL-C
- HbA1c
- glucose

Storage posture:
- keep in the existing lab tables.

### 2. Device-observed wearable signals
Examples:
- steps
- heart rate
- HRV with explicit method metadata
- resting heart rate
- sleep session timing
- workout sessions

Storage posture:
- raw observation tables with explicit source and confidence.

### 3. Product-derived summaries
Examples:
- daily steps total
- 7-day HRV average
- sleep regularity
- workout consistency

Storage posture:
- separate derived summary tables with computation versioning.

### 4. Self-report and context
Examples:
- weekly sleep rating
- stress this week
- travel
- illness
- unusual training load
- sleep disruption reason

Storage posture:
- separate self-report and context tables.

## Recommended tables

## `wearable_sources`

Purpose:
- track which platform or device produced wearable data for a profile.

Examples:
- Apple Health
- Health Connect
- Garmin direct import later
- Oura direct import later

Suggested columns:
- `id uuid primary key default gen_random_uuid()`
- `profile_id uuid not null references public.profiles(id) on delete cascade`
- `source_kind text not null check (source_kind in ('apple_health', 'health_connect', 'vendor_api', 'manual_import'))`
- `vendor_name text not null`
- `source_app_name text`
- `source_app_id text`
- `device_label text`
- `device_hardware_id text`
- `app_install_id text`
- `is_active boolean not null default true`
- `last_synced_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Notes:
- `vendor_name` can be `apple`, `garmin`, `oura`, `whoop`, `fitbit`, `google`, etc.
- keep multiple active sources possible, but do not assume they are interchangeable.

## `wearable_sync_runs`

Purpose:
- audit ingestion attempts from mobile or later vendor integrations.

Suggested columns:
- `id uuid primary key default gen_random_uuid()`
- `profile_id uuid not null references public.profiles(id) on delete cascade`
- `wearable_source_id uuid not null references public.wearable_sources(id) on delete cascade`
- `sync_mode text not null check (sync_mode in ('manual', 'app_launch', 'foreground_refresh', 'background', 'backfill'))`
- `started_at timestamptz not null`
- `completed_at timestamptz`
- `status text not null check (status in ('running', 'success', 'partial', 'failed'))`
- `records_seen integer not null default 0`
- `records_inserted integer not null default 0`
- `records_updated integer not null default 0`
- `error_summary text`
- `source_cursor text`
- `created_at timestamptz not null default now()`

Notes:
- useful for debugging permissions, duplicates, partial syncs, and device/API instability.

## `wearable_metric_definitions`

Purpose:
- canonical registry for wearable metric keys, units, and confidence posture.

Suggested columns:
- `key text primary key`
- `display_name text not null`
- `domain text not null check (domain in ('sleep', 'activity', 'cardiovascular', 'recovery', 'body', 'respiration', 'other'))`
- `value_type text not null check (value_type in ('numeric', 'boolean', 'enum', 'json'))`
- `default_unit text`
- `aggregation_hint text check (aggregation_hint in ('sample', 'session', 'day', 'week'))`
- `evidence_class text not null check (evidence_class in ('device_observed', 'vendor_derived', 'vendor_black_box', 'self_report', 'product_derived'))`
- `confidence_class text not null check (confidence_class in ('high', 'medium', 'low', 'variable'))`
- `is_v1_enabled boolean not null default true`
- `notes text`

Notes:
- this is the wearable equivalent of `biomarker_definitions`, but should stay explicitly weaker in evidence semantics.

## `wearable_observations`

Purpose:
- store raw or near-raw time-series observations from platform health stores or vendor imports.

Suggested columns:
- `id uuid primary key default gen_random_uuid()`
- `profile_id uuid not null references public.profiles(id) on delete cascade`
- `wearable_source_id uuid not null references public.wearable_sources(id) on delete cascade`
- `metric_key text not null references public.wearable_metric_definitions(key)`
- `source_record_id text not null`
- `raw_type text`
- `aggregation_level text not null check (aggregation_level in ('sample', 'session', 'day'))`
- `observed_at timestamptz not null`
- `observation_end_at timestamptz`
- `source_timezone text`
- `value_numeric numeric(12,4)`
- `value_text text`
- `value_json jsonb`
- `unit text`
- `measurement_method text`
- `source_confidence text not null check (source_confidence in ('high', 'medium', 'low', 'unknown')) default 'unknown'`
- `vendor_signal_class text not null check (vendor_signal_class in ('raw_observed', 'vendor_derived', 'vendor_black_box')) default 'raw_observed'`
- `is_deleted_at_source boolean not null default false`
- `recorded_at_source timestamptz`
- `source_payload jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `unique (wearable_source_id, metric_key, source_record_id)`

Notes:
- one table is acceptable here because provenance, metric definition, and aggregation level make the row interpretable.
- do not force every metric into numeric-only shape.
- prefer raw source timestamps over import timestamps when available.
- keep `raw_type`, `source_timezone`, and `measurement_method` explicit for tricky signals like sleep sessions and HRV.

## `wearable_daily_summaries`

Purpose:
- store stable app-facing daily rollups and trend inputs.

Suggested columns:
- `id uuid primary key default gen_random_uuid()`
- `profile_id uuid not null references public.profiles(id) on delete cascade`
- `summary_source_scope text not null check (summary_source_scope in ('single_source', 'merged'))`
- `wearable_source_id uuid references public.wearable_sources(id) on delete cascade`
- `summary_date date not null`
- `summary_timezone text not null`
- `summary_key text not null`
- `value_numeric numeric(12,4)`
- `value_text text`
- `unit text`
- `computation_version text not null`
- `derived_from jsonb not null default '[]'::jsonb`
- `quality_flag text not null check (quality_flag in ('good', 'partial', 'uncertain', 'insufficient')) default 'good'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- partial unique index for source-specific summaries: `unique (profile_id, wearable_source_id, summary_date, summary_key, computation_version)` when `summary_source_scope = 'single_source'`
- partial unique index for merged summaries: `unique (profile_id, summary_date, summary_key, computation_version)` when `summary_source_scope = 'merged'`

Examples:
- `steps_total`
- `sleep_duration_total`
- `sleep_midpoint`
- `resting_hr_daily`
- `hrv_overnight_avg`
- `workout_minutes_total`
- `activity_consistency_7d`

Notes:
- keep these derived summaries auditable and versioned.
- do not assume one permanent formula forever.
- do not allow silent writer-wins collisions between Apple Health and Health Connect.
- `summary_timezone` must encode which local day the summary belongs to. Do not leave day-boundary semantics implicit.
- use `single_source` first if merge logic is not yet trustworthy; add `merged` only once source precedence is explicit.

## `weekly_checkins`

Purpose:
- preserve the old weekly self-report layer in a first-class, queryable form.

Suggested columns:
- `id uuid primary key default gen_random_uuid()`
- `profile_id uuid not null references public.profiles(id) on delete cascade`
- `week_date date not null`
- `exercise_score smallint check (exercise_score between 0 and 10)`
- `sleep_score smallint check (sleep_score between 0 and 10)`
- `nutrition_score smallint check (nutrition_score between 0 and 10)`
- `emotional_health_score smallint check (emotional_health_score between 0 and 10)`
- `bottleneck text`
- `biggest_risk text`
- `intended_action text`
- `summary text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `unique (profile_id, week_date)`

Notes:
- anchored semantics should follow `weekly-self-report-anchors-v1.md`.
- this table is intentionally self-report, not wearable import.

## `context_notes`

Purpose:
- store interpretation-relevant explanatory context that should not be faked as measurements.

Suggested columns:
- `id uuid primary key default gen_random_uuid()`
- `profile_id uuid not null references public.profiles(id) on delete cascade`
- `context_type text not null check (context_type in ('work_stress', 'sleep_disruption', 'illness', 'travel', 'training_load', 'nutrition_disruption', 'medication_change', 'supplement_change', 'other'))`
- `started_at timestamptz`
- `ended_at timestamptz`
- `summary text not null`
- `details text`
- `tags jsonb not null default '[]'::jsonb`
- `relevance_level text not null check (relevance_level in ('low', 'medium', 'high')) default 'medium'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Notes:
- this is the right place for jet lag, infection week, bad sleep due to travel, and unusual workload.
- keep it simple and queryable.
- do not make free text the only machine-usable structure. Keep lightweight tags for later rules, filtering, and UI chips.

## `profile_baselines`

Purpose:
- keep stable or slowly changing baseline context out of raw observation tables.

Suggested columns:
- `profile_id uuid primary key references public.profiles(id) on delete cascade`
- `exercise_baseline text`
- `sleep_baseline text`
- `nutrition_baseline text`
- `emotional_baseline text`
- `health_goal text`
- `priority_horizon text`
- `constraints_json jsonb not null default '[]'::jsonb`
- `family_history_summary text`
- `updated_at timestamptz not null default now()`

Notes:
- this can be a separate table or absorbed into `profiles` later.
- separating it keeps `profiles` lean if the base product profile stays minimal.
- keep this table for narrative and preference-like baselines, not drifting physiologic baselines that need history.

## What smartwatch data should map where

### Sleep-related
Use `wearable_observations` for:
- sleep session start and end
- sleep duration
- awake time
- HRV sample or overnight HRV aggregate with method metadata
- overnight heart rate
- respiratory rate if available
- SpO2 if available
- temperature deviation if available

Use `wearable_daily_summaries` for:
- total sleep duration per day
- sleep regularity metrics
- overnight resting heart rate summary
- rolling sleep trend metrics

Use `weekly_checkins` and `context_notes` for:
- "sleep felt poor this week"
- "travel disrupted sleep"
- "new baby / stress / late workload"

### Activity-related
Use `wearable_observations` for:
- steps sample or total
- workout session
- heart-rate trace during workout
- active minutes
- distance
- cadence or pace when useful

Use `wearable_daily_summaries` for:
- daily steps total
- workout minutes total
- weekly activity consistency
- training load proxy

Use `context_notes` for:
- unusual training block
- injury-limited week
- travel week with low movement

## What should not become hard engine truth early

Avoid early rule dependence on:
- vendor readiness scores
- body battery style scores
- stress scores from closed algorithms
- sleep stage percentages from consumer devices
- opaque recovery scores

If ingested at all, store them with:
- original vendor label,
- low or variable confidence,
- explicit `vendor_black_box` classification.

## Recommended first V1 metric keys

Best first candidates already present in seeded `wearable_metric_definitions`:
- `steps_total`
- `active_minutes`
- `workout_session`
- `heart_rate`
- `resting_heart_rate`
- `hrv`
- `sleep_session`
- `sleep_duration`
- `awake_duration`
- `respiratory_rate`
- `spo2`
- `temperature_deviation`

Not all need to be supported on day one.
The best first Garmin-first cut is:
- `resting_heart_rate`
- `sleep_duration`
- `steps_total`
- `hrv` with explicit stored method metadata
- `subjective_energy` as a parallel self-report anchor, not as a Garmin metric

### V1 must-have field priority

1. `resting_heart_rate`
   - strong cardiovascular baseline
   - low error risk because trends matter more than one absolute reading
   - manually estimable if sync is absent
   - native Garmin fit

2. `sleep_duration`
   - core recovery signal and directly actionable
   - medium risk if wrong because recovery logic can drift
   - manually estimable
   - reliable Garmin fit

3. `steps_total`
   - stable activity baseline and strong engagement anchor
   - low error risk because directional value still helps
   - easy manual fallback
   - reliable Garmin fit

4. `hrv`
   - recovery-critical but method-sensitive
   - high misuse risk if SDNN / RMSSD are conflated
   - poor manual fallback
   - usable from Garmin only when method stays explicit

5. `subjective_energy`
   - valuable calibrator for device data and user trust
   - should be modeled as self-report first, not as wearable ingest
   - no Garmin dependency

### V1.5 candidates

- `active_minutes`
- `sleep_session` / sleep onset timing
- `weight` (better manual-first unless a scale integration exists)
- vendor `stress score` only with clear black-box posture and no early hard-engine dependence

### Later / cautious metrics

Keep these later unless there is a strong reason and an explicit confidence downgrade:
- `spo2`
- `temperature_deviation`
- `respiratory_rate`

These are useful context signals, but early over-trust would be risky.

### HRV method policy for V1

Verdict:
- store HRV with explicit method metadata,
- never merge or trend RMSSD and SDNN together,
- always display the method label,
- keep `unknown` method out of engine input.

Working rules:
- `measurement_method` is application-required for `metric_key = 'hrv'`
- allowed methods remain `sdnn` and `rmssd` for active use
- `unknown` may be retained only as a reference-only bucket if a later ingest path explicitly decides to keep it, but it must not feed engine logic or cross-method trend views
- same method + same source: normal trend path allowed
- same method + different source: only with explicit source labeling
- different methods: store separately, display separately, never aggregate together

Implementation posture:
- `wearable_observations.measurement_method` already exists and should be treated as mandatory in application validation for HRV even though the column itself is nullable
- nightly Garmin HRV should not be assumed to be raw-sample equivalent until the real payload shape is verified
- if Garmin or another source only yields nightly derived HRV, preserve that provenance via `vendor_signal_class`
- UI should always render the HRV method label when a value is shown
- if the active HRV source/method changes, trend comparison should pause rather than silently stitching lines together
- if multiple HRV sources are active, show them per source and never merged

Important repo-specific note:
- current `wearables-sync` validation already rejects `unknown` for new HRV observations. That is stricter than a "store but engine-exclude" fallback and is the safer current default until a deliberate exception path is designed.
- because of that current repo posture, UI should not offer an `unknown` HRV method path for active V1 entry flows unless backend policy is deliberately loosened later.

### Modeling note: subjective energy

`subjective_energy` should not be introduced as a fake Garmin-style metric just to keep one table shape.
Prefer one of these paths:
- add it to `weekly_checkins` / adjacent self-report surfaces first, or
- add a later dedicated self-report field if product cadence needs it more often than weekly.

Do not pretend it is device-observed.

Recommended rollout:
- V1: extend `weekly_checkins` with an `energy_score`-style self-report field if/when the weekly check-in flow is activated
- V1.5: add a daily or on-demand self-report surface only if finer recovery/context resolution becomes product-critical
- Never derive `subjective_energy` from HRV, steps, or sleep and then present it as if the user reported it

## RLS posture

All user-owned rows should follow the same rule as the current health tables:
- ownership anchored by `profile_id = auth.uid()`
- strict row-level security on every user data table
- no shared wearable tables without explicit future sharing design

## Recommended indexes

At minimum:
- `wearable_observations (profile_id, metric_key, observed_at desc)`
- `wearable_observations (wearable_source_id, source_record_id)` unique already implied by constraint
- `wearable_daily_summaries (profile_id, summary_date desc, summary_key)`
- `weekly_checkins (profile_id, week_date desc)`
- `context_notes (profile_id, started_at desc)`
- `wearable_sync_runs (profile_id, started_at desc)`

## Suggested build order

1. add `wearable_metric_definitions`
2. add `wearable_sources`
3. add `wearable_sync_runs`
4. add `wearable_observations`
5. add `wearable_daily_summaries`
6. add `weekly_checkins`
7. add `context_notes`
8. only then add import logic in mobile app

## Confidence and uncertainty

Known:
- the old system shape clearly needs weekly and context layers in addition to labs
- smartwatch and phone-platform data can realistically automate part of this
- labs and wearables are different evidence classes and should stay separate

Inferred:
- Apple Health and Health Connect are the right first ingestion path
- a normalized raw observation table plus daily summaries is the best first schema split

Still uncertain:
- exact metric key taxonomy beyond the first small subset
- whether `profile_baselines` should be separate from `profiles`
- which wearable metrics deserve rule-level use in V1 versus dashboard-only use
- how aggressively Apple SDNN and Android RMSSD should be normalized versus kept as method-tagged HRV variants

Resolved for this draft:
- daily summaries must declare whether they are `single_source` or `merged`
- daily summaries must carry explicit timezone semantics
- context notes need lightweight structured tags in addition to free text
- `profile_baselines` is scoped to narrative or preference-like baseline context, not longitudinal physiologic baselines

## Recommended next action

The next concrete step after this doc should be:
1. define canonical wearable metric keys in code and docs,
2. choose the first Apple Health / Health Connect metric subset,
3. write the first Supabase migration for the wearable tables,
4. build mobile sync only for that narrow subset.
