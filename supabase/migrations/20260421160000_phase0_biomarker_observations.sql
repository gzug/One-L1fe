create table if not exists public.biomarker_observations (
  id uuid primary key default gen_random_uuid(),
  app_install_id uuid not null,
  marker_key text not null,
  value numeric not null,
  unit text not null,
  recorded_at timestamptz not null,
  source text not null,
  created_at timestamptz not null default now()
);

create index if not exists biomarker_observations_app_install_marker_recorded_idx
  on public.biomarker_observations (app_install_id, marker_key, recorded_at desc);

alter table public.biomarker_observations enable row level security;

drop policy if exists "biomarker_observations_owner_all" on public.biomarker_observations;
create policy "biomarker_observations_owner_all"
  on public.biomarker_observations
  for all
  using (
    exists (
      select 1
      from public.wearable_sources ws
      where ws.app_install_id = biomarker_observations.app_install_id::text
        and ws.profile_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.wearable_sources ws
      where ws.app_install_id = biomarker_observations.app_install_id::text
        and ws.profile_id = (select auth.uid())
    )
  );

-- down
drop policy if exists "biomarker_observations_owner_all" on public.biomarker_observations;
drop index if exists biomarker_observations_app_install_marker_recorded_idx;
drop table if exists public.biomarker_observations;
