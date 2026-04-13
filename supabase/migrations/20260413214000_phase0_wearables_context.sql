-- ============================================================
-- MIGRATION: phase0_wearables_context
-- Adds the first non-lab data lane for:
--   1. wearable sources and sync audit runs
--   2. canonical wearable metric definitions
--   3. raw wearable observations
--   4. app-facing daily summaries
--   5. weekly self-report check-ins
--   6. structured context notes
--   7. optional profile baselines
-- ============================================================

create table if not exists public.wearable_sources (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  source_kind text not null check (source_kind in ('apple_health', 'health_connect', 'vendor_api', 'manual_import')),
  vendor_name text not null,
  source_app_name text,
  source_app_id text,
  device_label text,
  device_hardware_id text,
  app_install_id text,
  is_active boolean not null default true,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wearable_sync_runs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  wearable_source_id uuid not null references public.wearable_sources(id) on delete cascade,
  sync_mode text not null check (sync_mode in ('manual', 'app_launch', 'foreground_refresh', 'background', 'backfill')),
  started_at timestamptz not null,
  completed_at timestamptz,
  status text not null check (status in ('running', 'success', 'partial', 'failed')),
  records_seen integer not null default 0 check (records_seen >= 0),
  records_inserted integer not null default 0 check (records_inserted >= 0),
  records_updated integer not null default 0 check (records_updated >= 0),
  error_summary text,
  source_cursor text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wearable_metric_definitions (
  key text primary key,
  display_name text not null,
  domain text not null check (domain in ('sleep', 'activity', 'cardiovascular', 'recovery', 'body', 'respiration', 'other')),
  value_type text not null check (value_type in ('numeric', 'boolean', 'enum', 'json')),
  default_unit text,
  aggregation_hint text check (aggregation_hint in ('sample', 'session', 'day', 'week')),
  evidence_class text not null check (evidence_class in ('device_observed', 'vendor_derived', 'vendor_black_box', 'self_report', 'product_derived')),
  confidence_class text not null check (confidence_class in ('high', 'medium', 'low', 'variable')),
  is_v1_enabled boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wearable_observations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  wearable_source_id uuid not null references public.wearable_sources(id) on delete cascade,
  metric_key text not null references public.wearable_metric_definitions(key),
  source_record_id text not null,
  raw_type text,
  aggregation_level text not null check (aggregation_level in ('sample', 'session', 'day')),
  observed_at timestamptz not null,
  observation_end_at timestamptz,
  source_timezone text,
  value_numeric numeric(12,4),
  value_text text,
  value_json jsonb,
  unit text,
  measurement_method text,
  source_confidence text not null default 'unknown' check (source_confidence in ('high', 'medium', 'low', 'unknown')),
  vendor_signal_class text not null default 'raw_observed' check (vendor_signal_class in ('raw_observed', 'vendor_derived', 'vendor_black_box')),
  is_deleted_at_source boolean not null default false,
  recorded_at_source timestamptz,
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (wearable_source_id, metric_key, source_record_id)
);

create table if not exists public.wearable_daily_summaries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  summary_source_scope text not null check (summary_source_scope in ('single_source', 'merged')),
  wearable_source_id uuid references public.wearable_sources(id) on delete cascade,
  summary_date date not null,
  summary_timezone text not null,
  summary_key text not null,
  value_numeric numeric(12,4),
  value_text text,
  unit text,
  computation_version text not null,
  derived_from jsonb not null default '[]'::jsonb,
  quality_flag text not null default 'good' check (quality_flag in ('good', 'partial', 'uncertain', 'insufficient')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (summary_source_scope = 'single_source' and wearable_source_id is not null)
    or (summary_source_scope = 'merged' and wearable_source_id is null)
  )
);

create table if not exists public.weekly_checkins (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  week_date date not null,
  exercise_score smallint check (exercise_score between 0 and 10),
  sleep_score smallint check (sleep_score between 0 and 10),
  nutrition_score smallint check (nutrition_score between 0 and 10),
  emotional_health_score smallint check (emotional_health_score between 0 and 10),
  bottleneck text,
  biggest_risk text,
  intended_action text,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, week_date)
);

create table if not exists public.context_notes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  context_type text not null check (context_type in ('work_stress', 'sleep_disruption', 'illness', 'travel', 'training_load', 'nutrition_disruption', 'medication_change', 'supplement_change', 'other')),
  started_at timestamptz,
  ended_at timestamptz,
  summary text not null,
  details text,
  tags jsonb not null default '[]'::jsonb,
  relevance_level text not null default 'medium' check (relevance_level in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_baselines (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  exercise_baseline text,
  sleep_baseline text,
  nutrition_baseline text,
  emotional_baseline text,
  health_goal text,
  priority_horizon text,
  constraints_json jsonb not null default '[]'::jsonb,
  family_history_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wearable_sources_profile_id_idx
  on public.wearable_sources (profile_id);

create index if not exists wearable_sync_runs_profile_id_started_at_idx
  on public.wearable_sync_runs (profile_id, started_at desc);

create index if not exists wearable_sync_runs_wearable_source_id_idx
  on public.wearable_sync_runs (wearable_source_id);

create index if not exists wearable_observations_profile_id_metric_key_observed_at_idx
  on public.wearable_observations (profile_id, metric_key, observed_at desc);

create index if not exists wearable_observations_profile_id_observed_at_idx
  on public.wearable_observations (profile_id, observed_at desc);

create index if not exists wearable_daily_summaries_profile_id_summary_date_key_idx
  on public.wearable_daily_summaries (profile_id, summary_date desc, summary_key);

create unique index if not exists wearable_daily_summaries_single_source_unique_idx
  on public.wearable_daily_summaries (profile_id, wearable_source_id, summary_date, summary_key, computation_version)
  where summary_source_scope = 'single_source';

create unique index if not exists wearable_daily_summaries_merged_unique_idx
  on public.wearable_daily_summaries (profile_id, summary_date, summary_key, computation_version)
  where summary_source_scope = 'merged';

create index if not exists weekly_checkins_profile_id_week_date_idx
  on public.weekly_checkins (profile_id, week_date desc);

create index if not exists context_notes_profile_id_started_at_idx
  on public.context_notes (profile_id, started_at desc);

create or replace trigger wearable_sources_set_updated_at
before update on public.wearable_sources
for each row execute function public.set_updated_at();

create or replace trigger wearable_sync_runs_set_updated_at
before update on public.wearable_sync_runs
for each row execute function public.set_updated_at();

create or replace trigger wearable_metric_definitions_set_updated_at
before update on public.wearable_metric_definitions
for each row execute function public.set_updated_at();

create or replace trigger wearable_observations_set_updated_at
before update on public.wearable_observations
for each row execute function public.set_updated_at();

create or replace trigger wearable_daily_summaries_set_updated_at
before update on public.wearable_daily_summaries
for each row execute function public.set_updated_at();

create or replace trigger weekly_checkins_set_updated_at
before update on public.weekly_checkins
for each row execute function public.set_updated_at();

create or replace trigger context_notes_set_updated_at
before update on public.context_notes
for each row execute function public.set_updated_at();

create or replace trigger profile_baselines_set_updated_at
before update on public.profile_baselines
for each row execute function public.set_updated_at();

alter table public.wearable_sources enable row level security;
alter table public.wearable_sync_runs enable row level security;
alter table public.wearable_metric_definitions enable row level security;
alter table public.wearable_observations enable row level security;
alter table public.wearable_daily_summaries enable row level security;
alter table public.weekly_checkins enable row level security;
alter table public.context_notes enable row level security;
alter table public.profile_baselines enable row level security;

drop policy if exists "wearable_sources_owner_all" on public.wearable_sources;
create policy "wearable_sources_owner_all"
  on public.wearable_sources
  for all
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

drop policy if exists "wearable_sync_runs_owner_all" on public.wearable_sync_runs;
create policy "wearable_sync_runs_owner_all"
  on public.wearable_sync_runs
  for all
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

drop policy if exists "wearable_metric_definitions_authenticated_read" on public.wearable_metric_definitions;
create policy "wearable_metric_definitions_authenticated_read"
  on public.wearable_metric_definitions
  for select
  using ((select auth.role()) = 'authenticated');

drop policy if exists "wearable_observations_owner_all" on public.wearable_observations;
create policy "wearable_observations_owner_all"
  on public.wearable_observations
  for all
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

drop policy if exists "wearable_daily_summaries_owner_all" on public.wearable_daily_summaries;
create policy "wearable_daily_summaries_owner_all"
  on public.wearable_daily_summaries
  for all
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

drop policy if exists "weekly_checkins_owner_all" on public.weekly_checkins;
create policy "weekly_checkins_owner_all"
  on public.weekly_checkins
  for all
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

drop policy if exists "context_notes_owner_all" on public.context_notes;
create policy "context_notes_owner_all"
  on public.context_notes
  for all
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

drop policy if exists "profile_baselines_owner_all" on public.profile_baselines;
create policy "profile_baselines_owner_all"
  on public.profile_baselines
  for all
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

insert into public.wearable_metric_definitions (
  key,
  display_name,
  domain,
  value_type,
  default_unit,
  aggregation_hint,
  evidence_class,
  confidence_class,
  notes
)
values
  ('sleep_session', 'Sleep session', 'sleep', 'json', null, 'session', 'device_observed', 'medium', 'Session-shaped sleep interval with start and end timestamps.'),
  ('sleep_duration', 'Sleep duration', 'sleep', 'numeric', 'min', 'session', 'device_observed', 'medium', 'Total detected sleep duration for a session.'),
  ('awake_duration', 'Awake duration during sleep', 'sleep', 'numeric', 'min', 'session', 'vendor_derived', 'low', 'Awake time during sleep session. Useful but less robust across platforms.'),
  ('steps_total', 'Steps total', 'activity', 'numeric', 'count', 'day', 'device_observed', 'high', 'Daily step total from platform health store or vendor feed.'),
  ('active_minutes', 'Active minutes', 'activity', 'numeric', 'min', 'day', 'product_derived', 'medium', 'Activity duration with platform-specific semantics. Use cautiously.'),
  ('workout_session', 'Workout session', 'activity', 'json', null, 'session', 'device_observed', 'medium', 'Structured workout session with type and timing.'),
  ('heart_rate', 'Heart rate', 'cardiovascular', 'numeric', 'bpm', 'sample', 'device_observed', 'medium', 'Point heart rate sample.'),
  ('resting_heart_rate', 'Resting heart rate', 'cardiovascular', 'numeric', 'bpm', 'day', 'vendor_derived', 'medium', 'Daily or sampled resting heart rate as provided by the source platform.'),
  ('hrv', 'Heart rate variability', 'recovery', 'numeric', 'ms', 'sample', 'device_observed', 'variable', 'HRV signal with required method metadata, for example SDNN or RMSSD. Do not compare across methods as if they were identical.'),
  ('respiratory_rate', 'Respiratory rate', 'respiration', 'numeric', 'breaths/min', 'sample', 'vendor_derived', 'variable', 'Respiratory rate where exposed by the platform.'),
  ('spo2', 'Blood oxygen saturation', 'recovery', 'numeric', '%', 'sample', 'vendor_derived', 'variable', 'Blood oxygen saturation from wearable-capable sources.'),
  ('temperature_deviation', 'Temperature deviation', 'recovery', 'numeric', 'delta_c', 'day', 'vendor_derived', 'variable', 'Deviation-from-baseline skin or body-adjacent temperature where available.'),
  ('distance_total', 'Distance total', 'activity', 'numeric', 'm', 'day', 'device_observed', 'high', 'Daily distance summary.'),
  ('active_energy_burned', 'Active energy burned', 'activity', 'numeric', 'kcal', 'day', 'vendor_derived', 'low', 'Active calories. Useful operationally but weak as engine truth.')
on conflict (key) do update set
  display_name = excluded.display_name,
  domain = excluded.domain,
  value_type = excluded.value_type,
  default_unit = excluded.default_unit,
  aggregation_hint = excluded.aggregation_hint,
  evidence_class = excluded.evidence_class,
  confidence_class = excluded.confidence_class,
  notes = excluded.notes,
  updated_at = now();
