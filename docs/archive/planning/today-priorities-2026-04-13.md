---
status: archived
archived_from: docs/planning/today-priorities-2026-04-13.md
archived_on: 2026-04-22
reason: stale date-specific execution note; no longer active backlog
---

# Today priorities, 2026-04-13

## Goal

By end of day, One L1fe should feel like a trustworthy working repo, not just a smart early repo.

## Priority 1, must do

### GitHub enforcement
- add `SUPABASE_ACCESS_TOKEN`
- add `SUPABASE_PROJECT_REF`
- enable branch protection on `main`
- require the available CI checks before merge

### Why
This is the biggest jump in trust per minute spent.

## Priority 2, should do

### Backend validation path
- keep `supabase-validate.yml`
- Supabase lint is already scaffolded and will activate once secrets are present
- confirm replay-from-scratch works in CI
- only add automated drift detection after one clean manual post-hardening diff

### Why
This turns backend correctness from a promise into a repeatable check.

## Priority 3, should do

### Docs cleanup
- archive only clearly superseded docs
- do not rewrite active source-of-truth docs unless necessary
- preserve architecture and compliance material that still guides implementation

### Why
The problem is not too much thinking, it is too much equal-weight surface area.

## Priority 4, nice if possible today

### Define the next implementation seam
- thin app-facing client wrapper for the shared function contract
- keep it narrow
- avoid broad app scaffolding unless it directly serves this seam

## Stop conditions

If time gets tight, stop after Priority 2. That already gives the repo a much stronger operating backbone.
