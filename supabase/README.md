# Supabase — Backend Operating Document

> **Status:** Active | **Last updated:** 2026-04-13 | **Owner:** Supabase Specialist
>
> This document is the canonical reference for all backend operations on the One-L1fe Supabase project.
> It is part of the repo operating model. Keep it updated when workflow, CI, or environment strategy changes.

---

## Project

| Field | Value |
|---|---|
| Project name | `one-l1fe` |
| Project ID | `lbqgjourpsodqglputkj` |
| Region | `eu-central-1` |
| Postgres version | 17 |
| Status | ACTIVE_HEALTHY |
| Created | 2026-04-12 |

---

## Source of Truth

**`supabase/` is the canonical backend source of truth.**

- All schema state must be represented in `supabase/migrations/` — no dashboard-only changes
- All seed/reference data (biomarker definitions, evidence sources, rule evidence links) is captured in versioned migration files
- The live project is considered in-sync with the repo unless a drift check reports otherwise
- Never apply schema changes via the Supabase dashboard without immediately creating a corresponding migration

### Migration History

| Version | Name | Description |
|---|---|---|
| 20260412163000 | phase0_initial_schema | Core tables: profiles, lab_results, lab_result_entries, biomarker_definitions |
| 20260413013000 | phase0_interpretation_runs | interpretation_runs, interpreted_entries, derived_insights, recommendations |
| 20260413021500 | phase0_evidence_registry | evidence_sources, rule_evidence_links |
| 20260413023000 | phase0_seed_evidence_registry | Seed data for evidence_sources, rule_evidence_links, biomarker_definitions |
| 20260413093000 | phase0_backend_hardening | RLS consolidation, auth.uid() fix, search_path fix, FK indexes |

---

## Canonical Workflow

### Schema Changes

```bash
# 1. Create a new migration file
supabase migration new <descriptive_name>

# 2. Write the SQL in the generated file under supabase/migrations/

# 3. Test locally — wipes and replays all migrations from scratch
supabase db reset

# 4. Commit the migration file to a feature branch
git add supabase/migrations/<new_file>.sql
git commit -m "db: <description>"

# 5. Open PR → review → merge to main

# 6. Apply to production (manual for now — see Environment Strategy)
supabase db push
```

**Rules:**
- Never edit an existing migration file that has been applied to production
- If you need to fix a mistake, create a new migration that corrects it
- Migration filenames must be prefixed with a timestamp: `YYYYMMDDHHmmss_name.sql`

### Seed / Reference Data Updates

Static reference data (biomarkers, evidence sources, rules) belongs in versioned migration files — not a separate seed script. The pattern is `phase0_seed_*` or a versioned migration if data changes post-launch.

Runtime-mutable data (future user-configurable content) belongs in the app, not migrations.

### Local Testing

```bash
supabase start           # Boot local Postgres + Auth + API stack
supabase db reset        # Wipe and replay all migrations from scratch
supabase db diff         # Show any schema differences vs migration history
supabase stop            # Shut down local stack
```

Prerequisites: [Supabase CLI](https://supabase.com/docs/guides/cli) installed, Docker running.

### Deployment to Production

Currently: **manual `supabase db push` after merge to `main`**.

Trigger to automate: once CI validation path (lint → boot → reset) is stable. See CI section below.

```bash
# Requires SUPABASE_ACCESS_TOKEN and project reference
supabase db push --project-ref lbqgjourpsodqglputkj
```

---

## CI Recommendations

Apply in order. Do not skip steps.

### Add Now (Safe, No Dependencies)

```yaml
# .github/workflows/backend-validate.yml
- name: Supabase CLI setup
  uses: supabase/setup-cli@v1
  with:
    version: latest

- name: Lint migrations
  run: supabase db lint --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

What it catches: SQL syntax errors, RLS policy issues, security warnings (mutable search_path, etc.).

### Add After Baseline Verification

```yaml
- name: Start local Supabase
  run: supabase start

- name: Reset database (replay all migrations)
  run: supabase db reset

- name: Stop local Supabase
  run: supabase stop --no-backup
```

What it catches: Migration order errors, destructive changes, SQL that works in isolation but breaks on full replay.

Caveat: requires Docker in the CI runner. Use `runs-on: ubuntu-latest` and confirm Docker is available. Add `timeout-minutes: 10` — local Supabase cold start can be slow.

### Add After Boot Validation Is Stable

```yaml
- name: Check schema drift
  run: |
    supabase db diff --schema public --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

What it catches: Dashboard-only schema changes that were never committed as migrations. Fails the build if live and repo have diverged.

**Important:** Run this manually once first to confirm zero diff before automating. See Drift Verification section below.

### Later / Optional

```yaml
# Edge function deployment dry-run — add when functions exist
- name: Validate edge functions
  run: supabase functions deploy --dry-run
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

Not relevant yet — no edge functions are deployed.

---

## Drift Verification Baseline

**Verified: 2026-04-13**

Manual drift check result:
- All live schema state is represented in `supabase/migrations/`
- 5 migrations in history, all applied in order, no gaps
- No dashboard-only schema changes were made outside the migration chain
- Seed data for `evidence_sources` (7 rows), `rule_evidence_links` (11 rows), and `biomarker_definitions` (12 rows) is fully reproducible from migration `phase0_seed_evidence_registry`
- The hardening migration `phase0_backend_hardening` was applied to production before being committed to this branch — repo and live are now re-aligned

**Conclusion: drift detection is safe to automate.**
Next step: add `supabase db diff` to CI after boot validation step is stable.

---

## Environment Strategy

**Current: single environment + disciplined migrations.**

This is the right posture at the current stage. The overhead of preview/staging environments is not justified until:
- There is at least one external user with data that cannot be destroyed during testing, OR
- Two or more contributors are writing migrations simultaneously

**Trigger to add a dev/staging environment:** first external user onboarded, or second contributor writing schema changes — whichever comes first.

When that trigger is hit, the path is:
1. Create a Supabase branch (`supabase branches create dev`) — requires Pro plan
2. Add a `staging` deploy step to CI that runs `supabase db push` against the branch ref
3. Production deploy remains manual-then-automated on `main` merge

---

## Secrets (GitHub Actions)

### Required Now

| Secret name | What it is | Where to get it |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | Personal access token for CLI auth | [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_PROJECT_REF` | Project reference ID | `lbqgjourpsodqglputkj` |

Set at: **GitHub → Settings → Secrets and variables → Actions → New repository secret**

These two secrets unlock: `supabase db lint`, `supabase db push`, and `supabase db diff` in CI.

### Required Later (Not Now)

| Secret name | When needed |
|---|---|
| `SUPABASE_DB_PASSWORD` | Only if using direct Postgres connection in CI (not needed for CLI-based workflows) |
| `SUPABASE_SERVICE_ROLE_KEY` | Only if CI needs to run admin-level data operations (seed scripts, test fixtures via API) |
| `SUPABASE_ANON_KEY` | Only if CI runs integration/e2e tests against the API layer |

**Warning:** Never commit `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_DB_PASSWORD` to the repo in any form, including `.env` files. The service role key bypasses all RLS — treat it like a root password.

---

## Deployment Recommendation

**Current: manual `supabase db push` after merge to `main`.**

Rationale: the validation CI path (lint → boot → reset) is not yet in place. Automating deployment before validation is in place means a bad migration could auto-deploy to production with no gate. Manual deploy for this short phase is the right call — it adds one intentional confirmation step.

Automate when:
1. `supabase db lint` is passing consistently in CI
2. `supabase db reset` local boot is passing consistently in CI
3. You have run at least 2-3 deploy cycles manually with no issues

Automation pattern when ready:
```yaml
- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  run: supabase db push --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

---

## Schema Overview

| Table | RLS | Purpose |
|---|---|---|
| `profiles` | ✅ | User identity, linked to `auth.users` |
| `lab_results` | ✅ | Lab result sessions per profile |
| `lab_result_entries` | ✅ | Individual biomarker readings per result |
| `biomarker_definitions` | ✅ (read-only, authenticated) | Reference: biomarker catalog |
| `interpretation_runs` | ✅ | Engine run records per lab result |
| `interpreted_entries` | ✅ | Per-marker interpretation output |
| `derived_insights` | ✅ | Trend/pattern/summary insights per profile |
| `recommendations` | ✅ | Actionable recommendations per profile |
| `evidence_sources` | ✅ (read-only, authenticated) | Reference: evidence/study catalog |
| `rule_evidence_links` | ✅ (read-only, authenticated) | Reference: rule-to-evidence mapping |

---

## Open Decisions

- [ ] Confirm: is `supabase db push` the deploy command in CI, or stay manual through Phase 1?
- [ ] Confirm: secrets `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` added to GitHub Actions?
- [ ] Decide: timing to add `supabase db diff` drift detection to CI
- [ ] Decide: threshold to move to dev/staging environment separation
