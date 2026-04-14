# Supabase Schema

## Verdict

This is the active database baseline for One L1fe.
It follows the product domain model instead of inventing the database shape first.

## Applied migrations (verified 2026-04-14)

The following migrations are applied on the hosted Supabase project (`lbqgjourpsodqglputkj`):

| version | name | repo file |
|---|---|---|
| 20260412163000 | phase0_initial_schema | ✅ committed |
| 20260413013000 | phase0_interpretation_runs | ✅ committed |
| 20260413021500 | phase0_evidence_registry | ✅ committed |
| 20260413023000 | phase0_seed_evidence_registry | ✅ committed |
| 20260413072607 | phase0_backend_hardening | ⚠️ timestamp drift — repo has `20260413093000` |
| 20260413225404 | fix_fk_ownership_cross_ownership_rls_guards | ❌ NOT in repo — applied manually |
| 20260414024917 | fix_rls_auth_initplan_lab_result_entries_interpreted_entries | ❌ NOT in repo — applied manually |

**⚠️ Action required:** The two Supabase-only migrations (225404, 024917) must be committed to `supabase/migrations/` to close the drift. Until then, `supabase db reset` will NOT reproduce the full hosted schema.

## Pending (in repo, not yet applied)

| version | name | status |
|---|---|---|
| 20260413214000 | phase0_wearables_context | ❌ not applied — 8 tables missing on hosted |
| 20260413220000 | phase0_wearables_hardening | ❌ not applied — depends on wearables_context |

Run `supabase db push --linked` to apply.

## Tables — core lab lane

### `profiles`
User-owned profile rows keyed to `auth.users(id)`.

Purpose:
- keep product-facing profile metadata separate from raw auth,
- provide a stable ownership anchor for all health-tracking records.

**Note:** No `on auth.user created` trigger exists. Profile rows must be inserted explicitly. A seed row for `test@one-l1fe.dev` was inserted on 2026-04-14.

### `biomarker_definitions`
Canonical biomarker registry.

### `lab_results`
A single collection event, import, or manual entry session.

### `lab_result_entries`
Individual biomarker values belonging to a `lab_results` row.

### `derived_insights`
Server-side summaries or pattern detections.

### `interpretation_runs`
A stored execution of the interpretation engine.

### `interpreted_entries`
Per-marker evaluated rows from one interpretation run.

### `recommendations`
Bounded interpretation-oriented suggestions.

## Tables — wearables + context lane (pending apply)

Defined in migrations 20260413214000 + 20260413220000. Not yet applied to hosted project.

### `wearable_sources`
Per-profile wearable data source registration.

### `wearable_sync_runs`
Audit log of each sync operation against a source.

### `wearable_metric_definitions`
Canonical wearable metric taxonomy. Seeded with 14 v1 metrics.

### `wearable_observations`
Raw wearable observations — one row per source record per metric.

### `wearable_daily_summaries`
App-facing daily aggregates. Source-partitioned (no silent multi-source overwrites).

### `weekly_checkins`
User self-report scores per week.

### `context_notes`
Structured context events (stress, travel, illness, etc.). Queryable via `tags` + GIN index.

### `profile_baselines`
One-row-per-profile stable preferences, goals, and snapshot anchors.

## Privacy and ownership

All user-specific tables use row-level security.
Ownership is anchored to `(select auth.uid())` via `profile_id` or the row id itself.

RLS policies use `(select auth.uid())` rather than `auth.uid()` to prevent per-row re-evaluation.

## What the schema intentionally does not do yet

- file imports,
- attachment storage,
- trend materializations,
- full evidence citation tables,
- clinician-sharing workflows,
- diagnosis logic,
- treatment planning,
- `on auth.user created` profile auto-creation trigger.
