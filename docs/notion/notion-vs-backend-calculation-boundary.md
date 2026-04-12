# Notion vs Backend Calculation Boundary

## Verdict

Notion can calculate light helper logic.
It should not become the hidden source of domain truth.

## What Notion Is Good For in V1

Use Notion for:
- manual entry,
- relations,
- rollups,
- simple baseline deviations,
- lowest-pillar comparisons,
- filtered views,
- human-readable summaries,
- operator review.

## What Notion Should Not Own Long-Term

Do not make Notion the only place for:
- canonical threshold policy,
- unit conversion rules,
- assay gating,
- score weighting policy,
- evidence class policy,
- recommendation contract logic,
- advanced trend or risk calculations.

## Safe V1 Notion Calculations

### Profiles / Weekly
- baseline rollups
- simple deviations
- lowest pillar
- secondary pillar
- simple summary assembly

### Panels / Entries
- simple freshness labels
- basic visibility helpers
- display formatting

### Dashboard
- filtered latest rows
- compact summaries
- progress views
- coverage summaries

## Better in Backend / Shared Domain

### Domain layer
- marker classes
- threshold policies
- score eligibility rules
- evidence classes
- recommendation type boundaries
- unit policies
- assay interpretation rules

### Backend / Supabase later
- normalized ingestion
- scoring over many rows
- historical re-scoring
- score versioning
- freshness logic at scale
- insight generation
- recommendation generation
- source mapping

## Beginner Explanation

Old system:
- Notion was doing too many jobs.

New system:
- Notion stays the friendly front desk.
- deeper logic belongs in the engine room.

Why this is better:
- easier to keep correct,
- easier to version,
- easier to reuse in app and backend,
- and much less likely to break when tables change.
