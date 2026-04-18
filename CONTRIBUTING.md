---
status: current
canonical_for: contribution workflow
owner: repo
last_verified: 2026-04-18
supersedes: []
superseded_by: null
scope: repo
---

# Contributing

Solo-founder workflow. Goal: speed with guardrails, not process theatre.

## Branch strategy

- `main` is the stable branch
- Short-lived branches: `feat/...`, `fix/...`, `chore/...`
- Do not stack unrelated work in one change
- Merge only after checks pass and description is clear

Examples: `feat/mobile-client-wrapper`, `fix/minimum-slice-contract`, `chore/repo-hygiene`

## Source of truth

| File/Folder | Purpose |
|---|---|
| `README.md` | Project entry point |
| `CHECKPOINT.md` | Current state and next step |
| `MEMORY.md` | Durable assumptions and decisions |
| `memory/` | Short-term working notes and daily continuity |
| `docs/architecture/` | Technical decisions that should stay true over time |
| `docs/planning/` | Next work and backlog |
| `docs/research/` | Evidence gathering and unresolved questions |
| `docs/compliance/` | Intended-use, data-handling, and boundary docs |
| `docs/ops/` | OpenClaw and session workflow guidance |

If a durable rule changes, update the source-of-truth file in the same workstream.

## AI-assisted development rules

AI is welcome here, but repo trust matters more than speed.

- Do not make broad generated changes without checking each touched file
- Do not let generated docs drift from the actual code path
- Do not merge large AI-produced changes without a human-readable summary
- Prefer one focused change at a time
- Keep architecture tied to the next implementable step
- If AI proposes stronger health claims than the boundary allows, reject them

## MD editing rules

Applies to all `.md` files, especially the most-read ones (`CHECKPOINT.md`, `AGENTS.md`, `MEMORY.md`, `docs/ops/`):

- Prefer bullet points over prose paragraphs
- Cut sentences that don’t add new information
- Remove content that is no longer current or active
- Same meaning, fewer words
- Do not invent new content — only condense existing
- Start with the most-read files first

## Minimum review checklist

Before merging a meaningful change:

1. Can I explain what changed in plain language?
2. Does `npm run typecheck` pass?
3. Does `npm run test:domain` pass?
4. If behavior changed, did I update the right source-of-truth doc?
5. Did I avoid adding raw personal health data or unsafe health claims?

## Pull requests and issues

- Use the PR template for changes that should be reviewed or documented
- Use issues for bugs, scoped features, and cleanup tasks
- Keep each issue small enough that future-you can finish it without re-reading the whole repo
