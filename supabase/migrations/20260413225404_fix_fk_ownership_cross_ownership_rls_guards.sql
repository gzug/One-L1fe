-- ============================================================
-- MIGRATION: fix_fk_ownership_cross_ownership_rls_guards
-- Applied on hosted Supabase: 2026-04-13 (version 20260413225404)
-- Committed to repo: 2026-04-14 (was missing, causing schema drift)
--
-- Upgrades RLS policies on all core lab lane tables to use
-- (select auth.uid()) instead of auth.uid() for performance,
-- and fixes cross-ownership FK guard patterns on
-- lab_result_entries and interpreted_entries.
-- ============================================================

-- lab_results
drop policy if exists "lab_results_owner_all" on public.lab_results;
create policy "lab_results_owner_all"
  on public.lab_results
  for all
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

-- derived_insights
drop policy if exists "derived_insights_owner_all" on public.derived_insights;
create policy "derived_insights_owner_all"
  on public.derived_insights
  for all
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

-- interpretation_runs
drop policy if exists "interpretation_runs_owner_all" on public.interpretation_runs;
create policy "interpretation_runs_owner_all"
  on public.interpretation_runs
  for all
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

-- recommendations
drop policy if exists "recommendations_owner_all" on public.recommendations;
create policy "recommendations_owner_all"
  on public.recommendations
  for all
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

-- lab_result_entries: cross-ownership guard via parent lab_results
drop policy if exists "lab_result_entries_select" on public.lab_result_entries;
create policy "lab_result_entries_select"
  on public.lab_result_entries
  for select
  using (
    exists (
      select 1 from public.lab_results lr
      where lr.id = lab_result_entries.lab_result_id
        and lr.profile_id = (select auth.uid())
    )
  );

drop policy if exists "lab_result_entries_insert" on public.lab_result_entries;
create policy "lab_result_entries_insert"
  on public.lab_result_entries
  for insert
  with check (
    exists (
      select 1 from public.lab_results lr
      where lr.id = lab_result_entries.lab_result_id
        and lr.profile_id = (select auth.uid())
    )
  );

drop policy if exists "lab_result_entries_update" on public.lab_result_entries;
create policy "lab_result_entries_update"
  on public.lab_result_entries
  for update
  using (
    exists (
      select 1 from public.lab_results lr
      where lr.id = lab_result_entries.lab_result_id
        and lr.profile_id = (select auth.uid())
    )
  );

drop policy if exists "lab_result_entries_delete" on public.lab_result_entries;
create policy "lab_result_entries_delete"
  on public.lab_result_entries
  for delete
  using (
    exists (
      select 1 from public.lab_results lr
      where lr.id = lab_result_entries.lab_result_id
        and lr.profile_id = (select auth.uid())
    )
  );

-- interpreted_entries: cross-ownership guard via parent interpretation_runs
drop policy if exists "interpreted_entries_select" on public.interpreted_entries;
create policy "interpreted_entries_select"
  on public.interpreted_entries
  for select
  using (
    exists (
      select 1 from public.interpretation_runs ir
      where ir.id = interpreted_entries.interpretation_run_id
        and ir.profile_id = (select auth.uid())
    )
  );

drop policy if exists "interpreted_entries_insert" on public.interpreted_entries;
create policy "interpreted_entries_insert"
  on public.interpreted_entries
  for insert
  with check (
    exists (
      select 1 from public.interpretation_runs ir
      where ir.id = interpreted_entries.interpretation_run_id
        and ir.profile_id = (select auth.uid())
    )
  );

drop policy if exists "interpreted_entries_update" on public.interpreted_entries;
create policy "interpreted_entries_update"
  on public.interpreted_entries
  for update
  using (
    exists (
      select 1 from public.interpretation_runs ir
      where ir.id = interpreted_entries.interpretation_run_id
        and ir.profile_id = (select auth.uid())
    )
  );

drop policy if exists "interpreted_entries_delete" on public.interpreted_entries;
create policy "interpreted_entries_delete"
  on public.interpreted_entries
  for delete
  using (
    exists (
      select 1 from public.interpretation_runs ir
      where ir.id = interpreted_entries.interpretation_run_id
        and ir.profile_id = (select auth.uid())
    )
  );
