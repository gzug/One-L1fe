create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.biomarker_definitions (
  key text primary key,
  display_name text not null,
  category text not null check (category in ('core', 'supporting', 'contextual')),
  unit text not null,
  priority_weight numeric(6,2) not null check (priority_weight >= 0),
  evidence_level text not null check (evidence_level in ('primary', 'secondary', 'experimental')),
  description text not null,
  reference_range_kind text not null check (reference_range_kind in ('upper_bound', 'lower_bound', 'range')),
  optimal_min numeric(12,4),
  optimal_max numeric(12,4),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lab_results (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  source text not null default 'manual' check (source in ('manual', 'import', 'api', 'other')),
  collected_at timestamptz not null,
  panel_name text,
  source_label text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lab_result_entries (
  id uuid primary key default gen_random_uuid(),
  lab_result_id uuid not null references public.lab_results(id) on delete cascade,
  biomarker_key text not null references public.biomarker_definitions(key),
  value_numeric numeric(12,4) not null,
  unit text not null,
  canonical_status text check (canonical_status in ('optimal', 'good', 'borderline', 'high', 'critical', 'missing')),
  priority_score smallint check (priority_score between 0 and 4),
  weighted_score numeric(8,2),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lab_result_id, biomarker_key)
);

create table if not exists public.derived_insights (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  lab_result_id uuid references public.lab_results(id) on delete set null,
  kind text not null check (kind in ('trend', 'pattern', 'summary', 'focus')),
  title text not null,
  summary text not null,
  evidence jsonb not null default '[]'::jsonb,
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  scope text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  derived_insight_id uuid references public.derived_insights(id) on delete set null,
  verdict text not null,
  recommendation_text text not null,
  evidence jsonb not null default '[]'::jsonb,
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  scope text not null,
  follow_up_questions jsonb not null default '[]'::jsonb,
  handoff_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lab_results_profile_id_collected_at_idx
  on public.lab_results (profile_id, collected_at desc);

create index if not exists lab_result_entries_lab_result_id_idx
  on public.lab_result_entries (lab_result_id);

create index if not exists lab_result_entries_biomarker_key_idx
  on public.lab_result_entries (biomarker_key);

create index if not exists derived_insights_profile_id_created_at_idx
  on public.derived_insights (profile_id, created_at desc);

create index if not exists recommendations_profile_id_created_at_idx
  on public.recommendations (profile_id, created_at desc);

create or replace trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace trigger biomarker_definitions_set_updated_at
before update on public.biomarker_definitions
for each row execute function public.set_updated_at();

create or replace trigger lab_results_set_updated_at
before update on public.lab_results
for each row execute function public.set_updated_at();

create or replace trigger lab_result_entries_set_updated_at
before update on public.lab_result_entries
for each row execute function public.set_updated_at();

create or replace trigger derived_insights_set_updated_at
before update on public.derived_insights
for each row execute function public.set_updated_at();

create or replace trigger recommendations_set_updated_at
before update on public.recommendations
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.biomarker_definitions enable row level security;
alter table public.lab_results enable row level security;
alter table public.lab_result_entries enable row level security;
alter table public.derived_insights enable row level security;
alter table public.recommendations enable row level security;

create policy "profiles are readable by owner"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles are writable by owner"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "biomarker definitions are readable by authenticated users"
on public.biomarker_definitions
for select
using (auth.role() = 'authenticated');

create policy "lab results are readable by owner"
on public.lab_results
for select
using (auth.uid() = profile_id);

create policy "lab results are writable by owner"
on public.lab_results
for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

create policy "lab result entries are readable by owner"
on public.lab_result_entries
for select
using (
  exists (
    select 1
    from public.lab_results lr
    where lr.id = lab_result_entries.lab_result_id
      and lr.profile_id = auth.uid()
  )
);

create policy "lab result entries are writable by owner"
on public.lab_result_entries
for all
using (
  exists (
    select 1
    from public.lab_results lr
    where lr.id = lab_result_entries.lab_result_id
      and lr.profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.lab_results lr
    where lr.id = lab_result_entries.lab_result_id
      and lr.profile_id = auth.uid()
  )
);

create policy "derived insights are readable by owner"
on public.derived_insights
for select
using (auth.uid() = profile_id);

create policy "derived insights are writable by owner"
on public.derived_insights
for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

create policy "recommendations are readable by owner"
on public.recommendations
for select
using (auth.uid() = profile_id);

create policy "recommendations are writable by owner"
on public.recommendations
for all
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

insert into public.biomarker_definitions (
  key, display_name, category, unit, priority_weight, evidence_level, description, reference_range_kind, optimal_min, optimal_max, notes
)
values
  ('apob', 'ApoB', 'core', 'mg/dL', 3, 'primary', 'Primary lipid-risk marker used as a top-level cardiovascular signal in the MVP.', 'upper_bound', null, 130, null),
  ('ldl', 'LDL', 'core', 'mg/dL', 1, 'primary', 'Core lipid marker tracked alongside ApoB and triglycerides.', 'upper_bound', null, 100, null),
  ('triglycerides', 'Triglycerides', 'core', 'mg/dL', 1, 'secondary', 'Core metabolic and lipid-context marker in the MVP panel.', 'upper_bound', null, 150, null),
  ('lpa', 'Lp(a)', 'core', 'mg/dL', 1, 'secondary', 'Inherited cardiovascular-risk marker tracked as part of the core set.', 'upper_bound', null, 30, null),
  ('hba1c', 'HbA1c', 'core', '%', 2, 'primary', 'Long-range glucose marker used as a primary metabolic trend signal.', 'upper_bound', null, 5.7, null),
  ('glucose', 'Glucose', 'core', 'mg/dL', 1, 'primary', 'Core glucose marker for the initial biomarker workflow.', 'upper_bound', null, 100, null),
  ('crp', 'CRP', 'core', 'mg/L', 1.5, 'secondary', 'Inflammation-related marker included in the MVP set.', 'upper_bound', null, 3, null),
  ('vitamin_d', 'Vitamin D', 'supporting', 'ng/mL', 1, 'secondary', 'Supporting nutrient-status marker used for broader context.', 'lower_bound', 20, null, null),
  ('ferritin', 'Ferritin', 'supporting', 'ng/mL', 1, 'primary', 'Supporting iron-status context marker.', 'lower_bound', 30, null, null),
  ('b12', 'B12', 'supporting', 'pg/mL', 1, 'primary', 'Supporting nutrient marker used for context, not as a diagnostic endpoint.', 'lower_bound', 400, null, null),
  ('magnesium', 'Magnesium', 'supporting', 'mg/dL', 1, 'secondary', 'Supporting mineral-status marker.', 'lower_bound', 1.8, null, null),
  ('dao', 'DAO', 'contextual', 'U/mL', 1, 'experimental', 'Interpretation-sensitive contextual marker. Keep optional and bounded.', 'lower_bound', 10, null, 'Optional and interpretation-sensitive')
on conflict (key) do update set
  display_name = excluded.display_name,
  category = excluded.category,
  unit = excluded.unit,
  priority_weight = excluded.priority_weight,
  evidence_level = excluded.evidence_level,
  description = excluded.description,
  reference_range_kind = excluded.reference_range_kind,
  optimal_min = excluded.optimal_min,
  optimal_max = excluded.optimal_max,
  notes = excluded.notes,
  updated_at = now();
