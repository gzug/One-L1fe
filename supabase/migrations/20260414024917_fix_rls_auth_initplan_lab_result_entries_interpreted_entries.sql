-- ============================================================
-- MIGRATION: fix_rls_auth_initplan_lab_result_entries_interpreted_entries
-- Applied on hosted Supabase: 2026-04-14 (version 20260414024917)
-- Committed to repo: 2026-04-14 (was missing, causing schema drift)
--
-- This migration is a no-op if 20260413225404 was already applied.
-- It is committed to repo to ensure supabase db reset reproduces
-- the full hosted migration history without drift.
--
-- The policies it references were already replaced by
-- 20260413225404_fix_fk_ownership_cross_ownership_rls_guards.sql
-- with the correct (select auth.uid()) pattern and cross-ownership guards.
--
-- Idempotent: all drop+create statements are safe to re-run.
-- ============================================================

-- Verified on 2026-04-14: all policies on lab_result_entries and
-- interpreted_entries already use (select auth.uid()) with correct
-- cross-ownership FK guards. This file serves as the migration
-- history anchor for version 20260414024917 on the hosted project.

-- No additional SQL required. State is correct per 20260413225404.
SELECT 1; -- no-op anchor
