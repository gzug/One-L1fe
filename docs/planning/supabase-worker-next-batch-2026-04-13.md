# Supabase worker next batch, 2026-04-13

## Verdict

The local backend seam is now verified. The next Supabase work should focus only on hosted confirmation and GitHub enforcement, not more local backend invention.

## What is already done

- `supabase/config.toml` now uses `./seed/*.sql`
- local `supabase db reset` replays cleanly
- local authenticated smoke test passes
- the edge-function boot path works with the shared domain package

## Immediate tasks

### 1. Run one hosted lint pass
Prerequisite:
- valid `SUPABASE_ACCESS_TOKEN`
- valid project ref

Command:

```bash
supabase db lint --project-ref "$SUPABASE_PROJECT_REF"
```

Report:
- pass or fail
- exact failing rule if any
- backend issue vs config/workflow issue

### 2. Run one hosted drift-baseline check
Command:

```bash
supabase db diff --schema public --project-ref "$SUPABASE_PROJECT_REF"
```

Report only:
- clean or not clean
- if not clean, the concrete drift categories
- whether drift is safe, risky, or blocking

### 3. Confirm GitHub secrets exist
Repository secrets to verify:
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`

Report:
- both present or not
- if missing, which one is missing

### 4. Confirm live GitHub protections
Check whether GitHub now enforces:
- branch protection on `main`
- required status checks before merge
- required check includes `validate`
- after stable rollout, whether `replay-migrations` should also be required

Report:
- confirmed / not confirmed for each

## What not to do

- no new schema changes
- no dashboard-first edits
- no new seed strategy
- no drift automation until one clean manual hosted diff is confirmed
- no mixing feature work into the same PR

## Next recommendation threshold

Only recommend automated drift detection after all are true:
1. hosted lint passes
2. hosted diff is clean or clearly understood
3. replay workflow is stable
4. GitHub protections are live
