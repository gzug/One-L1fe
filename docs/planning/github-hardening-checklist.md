---
status: current
canonical_for: GitHub hardening checklist
owner: repo
last_verified: 2026-04-14
supersedes: []
superseded_by: null
scope: planning
---

# GitHub hardening checklist

This file tracks GitHub-side settings that should exist even in a solo-founder repo.

## Current status

Verified on GitHub as of 2026-04-14:
- branch protection on `main` exists
- force pushes to `main` are blocked
- required check `validate` is configured
- admins are also subject to branch protection
- `SUPABASE_ACCESS_TOKEN` exists
- `SUPABASE_PROJECT_REF` exists

## ❌ Open: Required check to add manually

`replay-migrations` must be added as a required status check on `main`.

Path: GitHub → Settings → Branches → `main` → Edit → Require status checks → search `replay-migrations` → Add.

This check runs in `.github/workflows/supabase-validate.yml` as job `replay-migrations`. It verifies all migrations apply cleanly before any PR can merge to main.

## Branch protection settings for `main`

- Require pull request before merging
- Require status checks to pass before merging
  - `validate` ✅ configured
  - `replay-migrations` ❌ pending manual addition
- Block force pushes ✅ configured
- Block branch deletion
- Auto-delete head branches after merge (recommended)

## Later, when collaborators join
- tighten CODEOWNERS coverage
- add labels and milestones
- add environment protections for production secrets
- split permissions by team
