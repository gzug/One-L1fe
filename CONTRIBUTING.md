# Contributing

This repo is currently run with a solo-founder workflow. The goal is speed with guardrails, not process theatre.

## Default branch strategy

- `main` is the stable branch.
- Do not stack unrelated work in one change.
- Prefer short-lived branches such as `feat/...`, `fix/...`, or `chore/...`.
- Merge only after checks pass and the change description is clear.

Example branch names:
- `feat/mobile-client-wrapper`
- `fix/minimum-slice-contract`
- `chore/repo-hygiene`

## Source of truth

Use the repo layers on purpose:

- `README.md` = project entry point
- `CHECKPOINT.md` = current state and next step
- `MEMORY.md` = durable project assumptions and decisions
- `docs/architecture/` = technical decisions that should stay true over time
- `docs/planning/` = next work and backlog
- `docs/research/` = evidence gathering and unresolved questions
- `docs/compliance/` = intended-use and boundary docs

If a durable rule changes, update the source-of-truth file in the same workstream.

## AI-assisted development rules

AI is welcome here, but repo trust matters more than speed.

- Do not make broad generated changes without checking each touched file.
- Do not let generated docs drift away from the actual code path.
- Do not merge large AI-produced changes without a human-readable summary.
- Prefer one focused change at a time.
- Keep architecture tied to the next implementable step.
- If AI proposes stronger health claims than the current boundary allows, reject them.

## Minimum review checklist

Before merging a meaningful change:

1. Can I explain what changed in plain language?
2. Does `npm run typecheck` pass?
3. Does `npm run test:domain` pass?
4. If behavior changed, did I update the right source-of-truth doc?
5. Did I avoid adding raw personal health data or unsafe health claims?

## Pull requests and issues

- Use the pull request template for changes that should be reviewed or documented.
- Use issues for bugs, scoped features, and cleanup tasks.
- Keep each issue small enough that future-you can finish it without re-reading the whole repo.
