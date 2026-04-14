-- ============================================================
-- MIGRATION: fix_rls_initplan_perf
-- Fixes auth_rls_initplan performance warnings on:
--   - public.lab_result_entries (4 policies)
--   - public.interpreted_entries (4 policies)
-- Pattern: auth.uid() -> (select auth.uid()) to prevent
-- per-row re-evaluation of auth functions.
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan
-- ============================================================

-- lab_result_entries: drop and recreate all 4 policies

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

-- interpreted_entries: drop and recreate all 4 policies

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
