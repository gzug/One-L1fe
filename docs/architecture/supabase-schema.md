# Supabase Schema Draft

## Verdict

This is the first clean database baseline for One L1fe.
It follows the product domain model instead of inventing the database shape first.

## Design goals

The schema is built to support one bounded end-to-end workflow:
1. a user has a profile,
2. biomarker definitions are known centrally,
3. a lab result is recorded,
4. individual biomarker entries are stored,
5. derived insights can be generated,
6. bounded recommendations can be stored with evidence, confidence, and scope.

## Tables

### `profiles`
User-owned profile rows keyed to `auth.users(id)`.

Purpose:
- keep product-facing profile metadata separate from raw auth,
- provide a stable ownership anchor for all health-tracking records.

### `biomarker_definitions`
Canonical biomarker registry persisted in the database.

Purpose:
- mirror the shared domain layer,
- keep unit, category, evidence level, and starter ranges queryable server-side,
- avoid hard-coding biomarker metadata in SQL, UI, and prompts separately.

Important note:
The TypeScript domain registry is still the conceptual source of truth. This table is the database projection of that registry.

### `lab_results`
A single collection event, import, or manual entry session.

Purpose:
- group biomarker values by collection time,
- preserve source information,
- allow later imports and trend analysis.

### `lab_result_entries`
The individual biomarker values belonging to a `lab_results` row.

Purpose:
- store normalized numeric values,
- attach canonical status and weighted scoring,
- support per-biomarker trend views.

### `derived_insights`
Server-side summaries or pattern detections based on stored biomarker data.

Purpose:
- separate raw health data from generated interpretation,
- keep insight artifacts explicit and auditable.

### `interpretation_runs`
A stored execution of the interpretation engine against a specific panel snapshot.

Purpose:
- persist rule version, score version, and engine mode,
- preserve coverage state separately from severity,
- store score metadata and input snapshot,
- and create an auditable bridge between raw rows and derived outputs.

### `interpreted_entries`
The per-marker evaluated rows produced by one interpretation run.

Purpose:
- store interpretability state,
- preserve blocking reasons and freshness state,
- keep score eligibility and contribution explicit,
- and tie rule ids to each evaluated marker row.

### `recommendations`
Bounded interpretation-oriented suggestions tied to a profile and optionally to an insight or interpretation run.

Purpose:
- encode the intended-use contract directly in storage,
- require evidence, confidence, and scope fields,
- carry provenance fields like rule id and anchor source,
- and leave room for clinician handoff markers.

## Privacy and ownership

All user-specific tables use row-level security.
Ownership is anchored to `auth.uid()` via `profile_id` or, for profiles, the row id itself.

This matches the private-first posture and keeps health-related records scoped to the owning user.

## What the schema intentionally does not do yet

Not included yet:
- file imports,
- attachment storage,
- trend materializations,
- full evidence citation tables,
- clinician-sharing workflows,
- diagnosis logic,
- treatment planning.

That is deliberate. The schema is trying to be a stable Phase 0 base, not an overbuilt health platform.

A separate wearables and context expansion lane is now drafted in:
- `docs/architecture/wearables-and-context-schema-draft.md`
- `docs/architecture/wearable-metric-keys-v1.md`

That next lane should stay separate from the lab schema rather than stretching `lab_results` into a generic health-events table.

## Current phase update

A second migration now extends the baseline with:
- `interpretation_runs`,
- `interpreted_entries`,
- and richer recommendation provenance fields.

This brings the database closer to the current domain evaluator and persistence payload shape.

## Recommended next implementation step

Build the next layer for:
- database functions or views for trend summaries,
- sync tooling that projects the TypeScript biomarker registry and evidence registry into the database automatically,
- and storage wiring from the current domain evaluator into these new interpretation tables.
