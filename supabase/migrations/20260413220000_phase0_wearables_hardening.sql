-- =============================================================================
-- phase0_wearables_hardening.sql
-- Hardens the wearables extension from 20260413214000_phase0_wearables_context.sql
-- All changes are ADDITIVE — no drops, no breaking changes, db reset stays green.
--
-- Fixes:
--   1. wearable_daily_summaries: explicit source ownership (wearable_source_id)
--   2. wearable_daily_summaries: summary_timezone for local-day semantics
--   3. profile_baselines: baseline_class scope guard
--   4. context_notes: tags + structured_factors + GIN index
--   5. evidence_class: COMMENT as single-source-of-truth anchor (taxonomy drift guard)
-- =============================================================================


-- -----------------------------------------------------------------------------
-- FIX 1a — wearable_daily_summaries: source ownership
--
-- Problem: unique (profile_id, summary_date, summary_key, computation_version)
-- allows silent multi-source overwrites when Apple Health and Health Connect
-- both write for the same profile/date/key.
-- Solution: partition summaries by source. Each source owns its own row.
-- -----------------------------------------------------------------------------

ALTER TABLE wearable_daily_summaries
  ADD COLUMN IF NOT EXISTS wearable_source_id uuid REFERENCES wearable_sources(id);

COMMENT ON COLUMN wearable_daily_summaries.wearable_source_id IS
  'The source that produced this summary row. NULL = legacy / pre-ownership-model rows.
   For all new writes: always set. Summaries are source-partitioned, not source-merged.
   If a merged/cross-source summary is needed later, use computation_version to signal that
   and set wearable_source_id = NULL explicitly with a documented merge policy.';

-- Replace the old unique constraint with source-aware version.
-- The old constraint name is the Postgres auto-generated default; drop by convention name.
ALTER TABLE wearable_daily_summaries
  DROP CONSTRAINT IF EXISTS wearable_daily_summaries_profile_id_summary_date_summary_key_computation_version_key;

ALTER TABLE wearable_daily_summaries
  ADD CONSTRAINT wearable_daily_summaries_unique
  UNIQUE (profile_id, wearable_source_id, summary_date, summary_key, computation_version);


-- -----------------------------------------------------------------------------
-- FIX 1b — wearable_daily_summaries: summary_timezone
--
-- Problem: summary_date has no explicit timezone semantics.
-- Sleep-across-midnight, travel, and DST transitions produce wrong day boundaries
-- if the "local day" definition is left implicit.
-- -----------------------------------------------------------------------------

ALTER TABLE wearable_daily_summaries
  ADD COLUMN IF NOT EXISTS summary_timezone text NOT NULL DEFAULT 'UTC';

COMMENT ON COLUMN wearable_daily_summaries.summary_timezone IS
  'IANA timezone used to define the "local day" boundary for summary_date.
   MUST reflect the profile home timezone at time of computation, NOT source_timezone.
   Examples: "Europe/Berlin", "America/New_York".
   Critical for correctness of sleep sessions, travel days, and DST transitions.
   Default UTC is a safe fallback only — all production writes should set this explicitly.';


-- -----------------------------------------------------------------------------
-- FIX 2 — profile_baselines: baseline_class scope guard
--
-- Problem: no structural guard against storing drifting physiological values
-- in a effectively one-row-per-key table that has no history.
-- Solution: explicit class column that signals intent and documents the boundary.
-- -----------------------------------------------------------------------------

ALTER TABLE profile_baselines
  ADD COLUMN IF NOT EXISTS baseline_class text NOT NULL DEFAULT 'preference'
  CHECK (baseline_class IN ('preference', 'narrative', 'goal', 'physiological_snapshot'));

COMMENT ON COLUMN profile_baselines.baseline_class IS
  'Scope classification for this baseline entry:
   - preference         : stable user preferences (e.g. "I prefer metric units")
   - narrative          : free-text personal context (e.g. "I am a shift worker")
   - goal               : explicit user-set targets (e.g. "sleep goal: 8h")
   - physiological_snapshot : one-time physiological anchor (e.g. "my HRV baseline at onboarding").
     Use physiological_snapshot sparingly and only for explicit one-time anchors.
     Rolling / updating physiological baselines belong in wearable_daily_summaries
     with a dedicated computation_version, NOT here.';


-- -----------------------------------------------------------------------------
-- FIX 3 — context_notes: tags + structured_factors + GIN index
--
-- Problem: context_type + summary + details is UI-friendly but not queryable.
-- The rule engine and future analytics cannot filter on note content without NLP.
-- Solution: parallel structured fields alongside the existing free-text columns.
-- -----------------------------------------------------------------------------

ALTER TABLE context_notes
  ADD COLUMN IF NOT EXISTS tags jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE context_notes
  ADD COLUMN IF NOT EXISTS structured_factors jsonb;

COMMENT ON COLUMN context_notes.tags IS
  'Array of string tags for rule-engine filtering and analytics queries.
   Examples: ["stress", "travel", "alcohol", "poor_sleep", "illness", "late_meal"].
   Vocabulary is NOT enforced at DB level — keep it controlled in the application layer.
   Always populate alongside free-text summary for any note that should be queryable.';

COMMENT ON COLUMN context_notes.structured_factors IS
  'Optional machine-readable key/value context for future rule or correlation use.
   Examples: {"alcohol_units": 2, "travel_timezone": "America/New_York", "caffeine_mg": 300}.
   Nullable. Do not use as primary storage — tags covers the common filtering case.
   Intended for cases where scalar values matter for quantitative rule evaluation.';

-- GIN index required for performant jsonb array containment queries (@> operator).
-- Without this, ANY tags query on large note sets is a full table scan.
CREATE INDEX IF NOT EXISTS idx_context_notes_tags
  ON context_notes USING GIN (tags);


-- -----------------------------------------------------------------------------
-- FIX 4 — evidence_class: taxonomy single-source-of-truth anchor
--
-- Problem: wearable-metric-keys-v1.md used "product_compatible" which does not
-- exist in the enum. Doc/SQL drift of this kind silently breaks import code
-- and seed data that reads documentation as reference.
-- Solution: COMMENT declares this type as the canonical reference.
-- The doc must be updated to replace "product_compatible" → "product_derived".
-- -----------------------------------------------------------------------------

COMMENT ON TYPE evidence_class IS
  'Canonical taxonomy for wearable data provenance.
   SINGLE SOURCE OF TRUTH: this type definition.
   All documentation, seed data, and application code MUST match this enum exactly.

   Values:
   - device_observed    : raw sensor reading directly from hardware
   - vendor_derived     : calculated by the device vendor from raw data (algorithm disclosed)
   - vendor_black_box   : vendor-calculated, algorithm not disclosed (e.g. readiness scores)
   - self_report        : user-entered data
   - product_derived    : calculated by One-L1fe from raw observations

   IMPORTANT: "product_compatible" is NOT a valid value — use "product_derived".
   See: docs/architecture/wearable-metric-keys-v1.md (update required).';
