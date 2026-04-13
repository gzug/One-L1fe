---
status: current
canonical_for: GitHub hardening checklist
owner: repo
last_verified: 2026-04-13
supersedes: []
superseded_by: null
scope: planning
---

# GitHub hardening checklist

This file tracks GitHub-side settings that should exist even in a solo-founder repo.

## Current status

Verified on GitHub as of 2026-04-13:
- branch protection on `main` exists
- force pushes to `main` are blocked
- required check `validate` is configured
- admins are also subject to branch protection
- `SUPABASE_ACCESS_TOKEN` exists
- `SUPABASE_PROJECT_REF` exists

## Recommended now

### Branch protection for `main`
- Require pull request before merging
- Require at least 1 approval if you want a forced pause before merge
- Require status checks to pass before merging
- Require branches to be up to date before merging, optional for solo speed
- Block force pushes
- Block branch deletion

### Required checks
- `validate`

### Repository settings
- Auto-delete head branches after merge
- Enable issues if you want lightweight work tracking
- Enable Actions for CI

## Later, when collaborators join
- tighten CODEOWNERS coverage
- add labels and milestones
- add environment protections for production secrets
- split permissions by team

## Current blocker

The next real hardening step is not more documentation.
It is tightening the actual GitHub enforcement behavior so bypass paths and required checks behave exactly as intended in normal daily work.
