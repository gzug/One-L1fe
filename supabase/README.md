# Supabase backend operating model

This directory is the canonical backend surface for One L1fe.

## Source of truth

- `supabase/migrations/` is the authoritative schema history.
- Structural seed or reference data belongs in versioned migrations when it must exist consistently across environments.
- Dashboard-only schema changes are not acceptable as a normal workflow.
- The repo should be the operational truth, not memory or manual convention.

## Current backend posture

Current baseline includes:
- schema for profiles, lab results, entries, interpretation runs, interpreted entries, derived insights, recommendations, evidence sources, and rule-evidence links
- row-level security policies
- seed-backed evidence registry data
- local Supabase config
- backend function code under `supabase/functions/`

## Canonical workflow

### Schema changes
1. Create a migration locally.
2. Rebuild the local database from scratch.
3. Verify the migration chain applies cleanly.
4. Commit the migration on a focused branch.
5. Merge to `main` through a PR.
6. Apply to the live project intentionally.

### Seed and reference data
- Put structural, static backend reference data in migrations.
- Do not hide product logic in ad hoc dashboard edits.
- Do not treat runtime-mutable app config like schema seed.
- Keep optional local development seed files under `supabase/seed/` and wire them through `supabase/config.toml` when they are intentionally part of `supabase db reset`.

### Local validation

```bash
supabase start
supabase db reset
supabase stop --no-backup
```

Use this to confirm the full migration chain can replay from scratch.

## CI strategy

### Add now
- TypeScript typecheck and domain tests
- local Supabase boot plus migration replay from scratch

### Add when GitHub secrets are configured
- Supabase migration lint
- schema drift detection against the linked project

Suggested next commands:

```bash
supabase db lint --project-ref $SUPABASE_PROJECT_REF
supabase db diff --schema public --project-ref $SUPABASE_PROJECT_REF
```

Or run the repo helper:

```bash
SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=... scripts/check-supabase-hosted-baseline.sh
```

Required GitHub Actions secrets for that path:
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`

## Deployment recommendation

For now, prefer intentional manual database deploys until backend validation is stable across multiple cycles.

Recommended short-term posture:
- validate locally
- merge reviewed migration
- run intentional deploy
- only then consider automating deploy on merge

## Risks to keep visible

- schema drift between dashboard state and committed migrations
- permissive or inefficient RLS policies
- unindexed foreign keys on growing tables
- mutable `search_path` in SQL functions
- backend and repo process diverging under fast iteration

## Rule of thumb

If the live project and `supabase/migrations/` ever disagree, treat that as an operations problem that must be resolved immediately.
