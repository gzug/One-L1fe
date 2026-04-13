-- ============================================================
-- MIGRATION: phase0_backend_hardening
-- Fixes:
--   1. set_updated_at: fixed search_path (security)
--   2. RLS policies: auth.uid() → (select auth.uid()) (performance)
--   3. Multiple permissive policies: consolidate to FOR ALL (performance)
--   4. Missing FK indexes on derived_insights, interpreted_entries, recommendations (performance)
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Fix set_updated_at search_path
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------
-- 2 & 3. profiles — consolidate to single FOR ALL policy
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "profiles are readable by owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles are writable by owner" ON public.profiles;

CREATE POLICY "profiles_owner_all"
  ON public.profiles
  FOR ALL
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ----------------------------------------------------------------
-- 2 & 3. lab_results — consolidate to single FOR ALL policy
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "lab results are readable by owner" ON public.lab_results;
DROP POLICY IF EXISTS "lab results are writable by owner" ON public.lab_results;

CREATE POLICY "lab_results_owner_all"
  ON public.lab_results
  FOR ALL
  USING ((select auth.uid()) = profile_id)
  WITH CHECK ((select auth.uid()) = profile_id);

-- ----------------------------------------------------------------
-- 2 & 3. lab_result_entries — consolidate to single FOR ALL policy
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "lab result entries are readable by owner" ON public.lab_result_entries;
DROP POLICY IF EXISTS "lab result entries are writable by owner" ON public.lab_result_entries;

CREATE POLICY "lab_result_entries_owner_all"
  ON public.lab_result_entries
  FOR ALL
  USING (
    (select auth.uid()) IN (
      SELECT lr.profile_id FROM public.lab_results lr WHERE lr.id = lab_result_id
    )
  )
  WITH CHECK (
    (select auth.uid()) IN (
      SELECT lr.profile_id FROM public.lab_results lr WHERE lr.id = lab_result_id
    )
  );

-- ----------------------------------------------------------------
-- 2 & 3. interpretation_runs — consolidate to single FOR ALL policy
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "interpretation runs are readable by owner" ON public.interpretation_runs;
DROP POLICY IF EXISTS "interpretation runs are writable by owner" ON public.interpretation_runs;

CREATE POLICY "interpretation_runs_owner_all"
  ON public.interpretation_runs
  FOR ALL
  USING ((select auth.uid()) = profile_id)
  WITH CHECK ((select auth.uid()) = profile_id);

-- ----------------------------------------------------------------
-- 2 & 3. interpreted_entries — consolidate to single FOR ALL policy
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "interpreted entries are readable by owner" ON public.interpreted_entries;
DROP POLICY IF EXISTS "interpreted entries are writable by owner" ON public.interpreted_entries;

CREATE POLICY "interpreted_entries_owner_all"
  ON public.interpreted_entries
  FOR ALL
  USING (
    (select auth.uid()) IN (
      SELECT ir.profile_id FROM public.interpretation_runs ir WHERE ir.id = interpretation_run_id
    )
  )
  WITH CHECK (
    (select auth.uid()) IN (
      SELECT ir.profile_id FROM public.interpretation_runs ir WHERE ir.id = interpretation_run_id
    )
  );

-- ----------------------------------------------------------------
-- 2 & 3. derived_insights — consolidate to single FOR ALL policy
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "derived insights are readable by owner" ON public.derived_insights;
DROP POLICY IF EXISTS "derived insights are writable by owner" ON public.derived_insights;

CREATE POLICY "derived_insights_owner_all"
  ON public.derived_insights
  FOR ALL
  USING ((select auth.uid()) = profile_id)
  WITH CHECK ((select auth.uid()) = profile_id);

-- ----------------------------------------------------------------
-- 2 & 3. recommendations — consolidate to single FOR ALL policy
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "recommendations are readable by owner" ON public.recommendations;
DROP POLICY IF EXISTS "recommendations are writable by owner" ON public.recommendations;

CREATE POLICY "recommendations_owner_all"
  ON public.recommendations
  FOR ALL
  USING ((select auth.uid()) = profile_id)
  WITH CHECK ((select auth.uid()) = profile_id);

-- ----------------------------------------------------------------
-- 2. biomarker_definitions — fix auth in read-only policy
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "biomarker definitions are readable by authenticated users" ON public.biomarker_definitions;

CREATE POLICY "biomarker_definitions_authenticated_read"
  ON public.biomarker_definitions
  FOR SELECT
  USING ((select auth.role()) = 'authenticated');

-- ----------------------------------------------------------------
-- 2. evidence_sources — fix auth in read-only policy
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "evidence sources are readable by authenticated users" ON public.evidence_sources;

CREATE POLICY "evidence_sources_authenticated_read"
  ON public.evidence_sources
  FOR SELECT
  USING ((select auth.role()) = 'authenticated');

-- ----------------------------------------------------------------
-- 2. rule_evidence_links — fix auth in read-only policy
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "rule evidence links are readable by authenticated users" ON public.rule_evidence_links;

CREATE POLICY "rule_evidence_links_authenticated_read"
  ON public.rule_evidence_links
  FOR SELECT
  USING ((select auth.role()) = 'authenticated');

-- ----------------------------------------------------------------
-- 4. Missing FK indexes
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS derived_insights_lab_result_id_idx
  ON public.derived_insights (lab_result_id);

CREATE INDEX IF NOT EXISTS interpreted_entries_lab_result_entry_id_idx
  ON public.interpreted_entries (lab_result_entry_id);

CREATE INDEX IF NOT EXISTS recommendations_derived_insight_id_idx
  ON public.recommendations (derived_insight_id);
