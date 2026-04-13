# GitHub hardening checklist

This file tracks GitHub-side settings that should exist even in a solo-founder repo.

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

These settings must be applied in GitHub itself. They were not verified or changed from this session because the active GitHub CLI path is not authenticated.
