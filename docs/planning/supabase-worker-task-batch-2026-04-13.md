# Supabase worker task batch, 2026-04-13

## Goal

Keep backend work tightly aligned with the repo-first operating model while the app-facing seam starts to form.

## Immediate tasks

### 1. Confirm clean post-hardening drift baseline
Run one manual drift check against the linked project and report only the result:
- clean / not clean
- if not clean, what differs

This is the final trust check after the hardening correction.

### 2. Keep PR #1 narrow and merge-ready
Make sure the hardening PR stays operational only:
- no feature logic
- no extra docs beyond the backend operating note
- no unrelated cleanup mixed in

### 3. Prepare CI-readiness notes for the replay workflow
Confirm any practical caveats for these commands in GitHub Actions:

```bash
supabase start
supabase db reset
supabase stop --no-backup
```

Only report what is actionable, for example cold-start timing, image size, or flaky steps if any appear.

## Next tasks after secrets are set

### 4. Observe the first lint run
Once `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` exist in GitHub, watch the first backend lint run and report:
- pass / fail
- exact failing rule if any
- whether it is a real backend issue or a workflow/config issue

### 5. Recommend when to add automated drift detection
Do not add it yourself yet.
Instead, recommend yes or no after:
- one clean manual diff
- successful lint
- successful replay validation

## What to avoid

- no production-first changes
- no dashboard-only schema edits
- no mixed feature + infra PRs
- no parallel backend source-of-truth document outside `supabase/README.md`

## What helps most right now

Backend work that increases:
- replayability
- drift resistance
- CI clarity
- confidence that `supabase/migrations/` is the canonical backend history
