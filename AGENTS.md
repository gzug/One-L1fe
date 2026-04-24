---
status: current
canonical_for: agent working rules
owner: repo
last_verified: 2026-04-24
supersedes: []
superseded_by: null
scope: repo
---

# AGENTS.md

Agent operating rules for this repository.

## Default startup (all agents)

1. Load and read `CHECKPOINT.md` — current state, active seam, next steps, blockers.
2. Load and read `CONTEXT.md` — rolling summary of the last 2–3 sessions.
3. Load `MEMORY.md` **only if needed** for durable boundaries, architecture invariants, or repo rules.
4. Load a specific `docs/...` file **only if directly relevant** to the task.
5. **Never load** `memory/` or `docs/archive/` at startup.

Full session rules (startup order, closeout checklist, promotion rules): `docs/ops/memory-system-v2.md`  
OpenClaw-specific differences: `docs/ops/openclaw.md`

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

- Commit messages: `type(scope): description` — conventional commits
- Never commit: raw health data, secrets, local scratch files
- After any meaningful session: run the end-of-session checklist in `docs/ops/memory-system-v2.md`. At minimum, update `CHECKPOINT.md` + `CONTEXT.md` before closing.
- Issues/PRs: close duplicates immediately, do not let them accumulate

## Supabase work

- For any larger Supabase task or change (schema, migrations, RLS, Realtime, Edge Functions, Auth, Storage, project settings), follow `docs/ops/supabase-agent-workflow.md`.
- If the task touches Supabase Realtime, include `docs/prompts/supabase-realtime-ai-assistant-guide.md` in the working context before proposing or implementing changes.
