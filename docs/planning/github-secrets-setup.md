---
status: current
canonical_for: GitHub Actions secrets setup
owner: repo
last_verified: 2026-04-13
supersedes: []
superseded_by: null
scope: planning
---

# GitHub Actions secrets setup

## For future Supabase CI steps

Add these repository secrets in GitHub:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`

Path:
- GitHub -> Settings -> Secrets and variables -> Actions -> New repository secret

## Intended use

These secrets are for:
- migration lint against the linked Supabase project
- schema drift detection against the linked Supabase project

Once they exist, the current `supabase-validate.yml` workflow will automatically start running the lint step before local replay validation.

## Not needed yet

Do not add these unless a later workflow truly needs them:
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

## Safety note

Treat `SUPABASE_SERVICE_ROLE_KEY` like a root credential. Avoid introducing it unless there is a clear admin-level CI need.

## After setup

Current state:
- `SUPABASE_ACCESS_TOKEN` is present
- `SUPABASE_PROJECT_REF` is present

Next checks:
1. confirm `Lint linked Supabase project` passes in normal CI usage
2. keep replay validation active for a few runs
3. then add automated drift detection only after lint and replay are stable
