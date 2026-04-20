-- ============================================================
-- MIGRATION: dev_insight_interface
-- Adds:
--   1. is_dev column on profiles
--   2. dev_error_log table for client-side error logging
--   3. dev_feedback table for user feedback & feature ideas
--   4. RLS policies gating access by is_dev flag
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Add is_dev column to profiles
-- ----------------------------------------------------------------
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_dev boolean DEFAULT false;

-- ----------------------------------------------------------------
-- 2. dev_error_log table
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dev_error_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  error_message text NOT NULL,
  error_stack text,
  screen text,
  app_version text,
  platform text CHECK (platform IN ('android', 'ios')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dev_error_log_profile_id_created_at_idx
  ON public.dev_error_log (profile_id, created_at DESC);

-- Enable RLS on dev_error_log
ALTER TABLE public.dev_error_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dev_error_log_dev_user_access"
  ON public.dev_error_log
  FOR ALL
  USING (
    (SELECT auth.uid()) = profile_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND is_dev = true
    )
  )
  WITH CHECK (
    (SELECT auth.uid()) = profile_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND is_dev = true
    )
  );

-- ----------------------------------------------------------------
-- 3. dev_feedback table
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dev_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('bug', 'idea', 'question')),
  body text NOT NULL,
  screen text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dev_feedback_profile_id_created_at_idx
  ON public.dev_feedback (profile_id, created_at DESC);

-- Enable RLS on dev_feedback
ALTER TABLE public.dev_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dev_feedback_dev_user_access"
  ON public.dev_feedback
  FOR ALL
  USING (
    (SELECT auth.uid()) = profile_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND is_dev = true
    )
  )
  WITH CHECK (
    (SELECT auth.uid()) = profile_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND is_dev = true
    )
  );

-- ----------------------------------------------------------------
-- 4. RLS for wearable_sync_runs (dev user read-only)
-- ================================================================
-- Create a policy allowing dev users to read all sync runs for metrics
-- ================================================================
ALTER TABLE public.wearable_sync_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "wearable_sync_runs_dev_metrics_read"
  ON public.wearable_sync_runs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND is_dev = true
    )
  );

-- Keep existing owner policy for normal users
CREATE POLICY IF NOT EXISTS "wearable_sync_runs_owner_all"
  ON public.wearable_sync_runs
  FOR ALL
  USING ((SELECT auth.uid()) = profile_id)
  WITH CHECK ((SELECT auth.uid()) = profile_id);
