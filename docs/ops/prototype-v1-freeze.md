---
status: current
canonical_for: prototype-v1 freeze and release operations
owner: repo
last_verified: 2026-04-23
supersedes: []
superseded_by: null
scope: repo
---

# Prototype v1 freeze

Use this checklist to freeze a usable prototype that can run independently while the main project keeps evolving.

## 1) Expo startup baseline

Run from repo root:

```bash
npm --prefix apps/mobile ci
npm --prefix apps/mobile run start
```

Required environment (`apps/mobile/.env`):
- `EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL`
- `EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_ONE_L1FE_FUNCTION_PATH`
- optional: `EXPO_PUBLIC_SENTRY_DSN`

## 2) Supabase migration baseline

The freeze expects migrations up to:
- `20260420190000_phase0_seed_crp_apob_ldl_rule_links.sql`

Local replay check:

```bash
supabase start
supabase db reset
supabase stop --no-backup
```

## 3) Tag + release

Create an annotated tag on the freeze commit:

```bash
git tag -a prototype-v1 -m "Prototype v1 freeze"
git push origin prototype-v1
```

If GitHub CLI is configured, publish release notes:

```bash
gh release create prototype-v1 \
  --title "prototype-v1" \
  --notes-file docs/ops/prototype-v1-freeze.md
```

## 4) Fork into a new repo for next iteration

Option A (GitHub import from tag):
1. Create new empty repo.
2. Import this repo and checkout `prototype-v1`.

Option B (local copy from tag):

```bash
git clone --branch prototype-v1 --single-branch https://github.com/gzug/One-L1fe.git one-l1fe-next
cd one-l1fe-next
git remote rename origin upstream
git remote add origin <new-repo-url>
git push -u origin prototype-v1:main
```

## 5) Post-freeze guardrails

- Keep bugfixes for the frozen prototype as cherry-picks onto `prototype-v1` or a dedicated maintenance branch.
- Keep feature work in the new repo or a separate branch line.
- Do not change Supabase schema in maintenance mode without a migration replay check.
