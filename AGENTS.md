---
status: current
canonical_for: agent working rules
owner: repo
last_verified: 2026-05-01
supersedes: []
superseded_by: null
scope: repo
---

# AGENTS.md

Agent operating rules for this repository.

## Default startup

1. Read `CHECKPOINT.md` — current state, active path, next steps, blockers.
2. Read `CONTEXT.md` — rolling summary of the last 2–3 useful sessions.
3. Read `MEMORY.md` only if the task needs durable boundaries, architecture invariants, or repo rules.
4. Read one specific `docs/...` file only if directly relevant.
5. Never load `memory/` or `docs/archive/` at startup.

`AGENTS.md` is the rule source. `CHECKPOINT.md` is the current execution truth.

## Task routing

Use the narrowest path that fits the task.

| Task mentions | Start in | Optional context |
|---|---|---|
| v2 UI, screen, copy, design | `apps/mobile/prototypes/v2/` | `apps/mobile/prototypes/v2/README.md` |
| mobile shell, Expo, native Android, Health Connect | `apps/mobile/` | `apps/mobile/README.md` |
| biomarker, score, thresholds, field state | `packages/domain/` | relevant `docs/architecture/...` file |
| Supabase DB, migrations, RLS, Edge Functions, Auth, Storage | `supabase/` | `supabase/README.md`, `docs/ops/supabase-agent-workflow.md` |
| Realtime | `supabase/` | also load `docs/prompts/supabase-realtime-ai-assistant-guide.md` |
| planning, repo process, memory, OpenClaw | `docs/ops/` | `docs/ops/memory-system-v2.md` |
| compliance, product claims, intended use | `docs/compliance/` | `docs/compliance/intended-use.md` |
| historical context | `docs/archive/` | only when explicitly needed |

## Working rules

- Agents are allowed to work across the full repository.
- Agents may read, create, edit, move, rename, and delete files.
- Agents may make multi-file changes, refactors, and architectural updates.
- Agents may update docs, code, tests, scripts, CI, and configuration.
- Agents should act autonomously by default.
- Do not pause for approval unless the action is destructive, irreversible, or requires credentials/secrets not already available.
- Prefer brief summaries over long process documentation.
- Be explicit about uncertainty, risks, and assumptions.

## Output standards

- Commit messages: `type(scope): description`.
- Never commit raw health data, secrets, or local scratch files.
- After any meaningful session, run closeout from `docs/ops/memory-system-v2.md`.
- Minimum closeout: update `CHECKPOINT.md` and `CONTEXT.md` when current state or handoff context changed.
- Issues/PRs: close duplicates immediately; do not let stale broad PRs accumulate.

## Supabase work

- For larger Supabase tasks, follow `docs/ops/supabase-agent-workflow.md`.
- For Supabase Realtime, also load `docs/prompts/supabase-realtime-ai-assistant-guide.md` before proposing or implementing changes.
