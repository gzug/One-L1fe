# Supabase worker next batch, 2026-04-13

## Verdict

The hosted database baseline is clean. The next Supabase work should focus on deploying and proving the hosted edge-function path, then finishing GitHub enforcement, not inventing more backend surface.

## What is already done

- `supabase/config.toml` now uses `./seed/*.sql`
- local `supabase db reset` replays cleanly
- local authenticated smoke test passes
- the edge-function boot path works with the shared domain package

## Immediate tasks

### 1. Deploy the hosted edge function
Command:

```bash
supabase functions deploy save-minimum-slice-interpretation --project-ref "$SUPABASE_PROJECT_REF"
```

Report:
- deployed or failed
- exact deploy error if it fails
- deploy timestamp if it succeeds

### 2. Run one hosted authenticated smoke call
After deploy, call the hosted function with an authenticated user token and the example payload from:

`supabase/functions/save-minimum-slice-interpretation/example-request.json`

Report:
- HTTP status
- whether rows were created or upserted successfully
- exact runtime error if it fails

### 3. Run one hosted lint pass
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

### 4. Run one hosted drift-baseline check
Command:

```bash
supabase db diff --schema public --project-ref "$SUPABASE_PROJECT_REF"
```

Report only:
- clean or not clean
- if not clean, the concrete drift categories
- whether drift is safe, risky, or blocking

### 5. Confirm GitHub secrets exist
Repository secrets to verify:
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`

Report:
- both present or not
- if missing, which one is missing

### 6. Confirm live GitHub protections
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
- no app claim that the hosted endpoint exists until the function is actually deployed
- no drift automation until one clean manual hosted diff is confirmed
- no mixing feature work into the same PR

## Next recommendation threshold

Only recommend automated drift detection after all are true:
1. hosted function is deployed
2. hosted authenticated smoke call passes
3. hosted lint passes
4. hosted diff is clean or clearly understood
5. replay workflow is stable
6. GitHub protections are live
