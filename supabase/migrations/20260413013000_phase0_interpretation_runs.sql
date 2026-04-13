create table if not exists public.interpretation_runs (
  id uuid primary key default gen_random_uuid(),
  external_run_id text unique,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  lab_result_id uuid references public.lab_results(id) on delete set null,
  rule_version text not null,
  score_version text not null,
  engine_name text not null,
  engine_mode text not null,
  input_snapshot jsonb not null default '{}'::jsonb,
  coverage_state text not null check (coverage_state in ('complete', 'partial', 'missing', 'interpretation_limited', 'stale')),
  coverage_notes jsonb not null default '[]'::jsonb,
  priority_score_value smallint not null check (priority_score_value between 0 and 4),
  priority_score_raw_value numeric(12,4) not null default 0,
  priority_score_metadata jsonb not null default '{}'::jsonb,
  lipid_decision jsonb not null default '{}'::jsonb,
  audit_trace_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interpreted_entries (
  id uuid primary key default gen_random_uuid(),
  external_entry_id text unique,
  interpretation_run_id uuid not null references public.interpretation_runs(id) on delete cascade,
  lab_result_entry_id uuid references public.lab_result_entries(id) on delete set null,
  marker_key text not null references public.biomarker_definitions(key),
  display_name text not null,
  raw_value numeric(12,4),
  raw_unit text,
  interpretable_state text not null check (interpretable_state in ('interpretable', 'interpretation_limited', 'missing')),
  blocking_reason text,
  freshness_state text not null check (freshness_state in ('current', 'recent', 'aging', 'stale', 'unknown')),
  canonical_status text not null check (canonical_status in ('optimal', 'good', 'borderline', 'high', 'critical', 'unknown')),
  severity smallint check (severity between 0 and 4),
  score_eligible boolean not null default false,
  score_contribution numeric(12,4) not null default 0,
  rule_ids jsonb not null default '[]'::jsonb,
  notes_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (interpretation_run_id, marker_key)
);

alter table public.recommendations
  add column if not exists interpretation_run_id uuid references public.interpretation_runs(id) on delete set null,
  add column if not exists external_recommendation_id text unique,
  add column if not exists recommendation_type text check (recommendation_type in ('inform', 'monitor', 'collect_more_data', 'behavior_adjustment', 'clinician_clarification')),
  add column if not exists actionability text check (actionability in ('high', 'medium', 'low')),
  add column if not exists rule_id text,
  add column if not exists anchor_source_id text,
  add column if not exists rule_origin text check (rule_origin in ('guideline_adopted', 'evidence_extrapolated', 'policy_choice', 'heuristic')),
  add column if not exists product_evidence_class text check (product_evidence_class in ('P0', 'P1', 'P2', 'P3')),
  add column if not exists evidence_summary text,
  add column if not exists status text not null default 'open' check (status in ('open', 'done', 'deferred'));

create index if not exists interpretation_runs_profile_id_created_at_idx
  on public.interpretation_runs (profile_id, created_at desc);

create index if not exists interpretation_runs_lab_result_id_idx
  on public.interpretation_runs (lab_result_id);

create index if not exists interpreted_entries_interpretation_run_id_idx
  on public.interpreted_entries (interpretation_run_id);

create index if not exists interpreted_entries_marker_key_idx
  on public.interpreted_entries (marker_key);

create index if not exists recommendations_interpretation_run_id_idx
  on public.recommendations (interpretation_run_id);

create or replace trigger interpretation_runs_set_updated_at
before update on public.interpretation_runs
for each row execute function public.set_updated_at();

create or replace trigger interpreted_entries_set_updated_at
before update on public.interpreted_entries
for each row execute function public.set_updated_at();

alter table public.interpretation_runs enable row level security;
alter table public.interpreted_entries enable row level security;

create policy "interpretation runs are readable by owner"
on public.interpretation_runs
for select
using (auth.uid() = profile_id);

create policy "interpretation runs are writable by owner"
on public.interpretation_runs
for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

create policy "interpreted entries are readable by owner"
on public.interpreted_entries
for select
using (
  exists (
    select 1
    from public.interpretation_runs ir
    where ir.id = interpreted_entries.interpretation_run_id
      and ir.profile_id = auth.uid()
  )
);

create policy "interpreted entries are writable by owner"
on public.interpreted_entries
for all
using (
  exists (
    select 1
    from public.interpretation_runs ir
    where ir.id = interpreted_entries.interpretation_run_id
      and ir.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.interpretation_runs ir
    where ir.id = interpreted_entries.interpretation_run_id
      and ir.profile_id = auth.uid()
  )
);
