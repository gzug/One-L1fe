---
status: current
canonical_for: human-friendly session workflow
owner: repo
last_verified: 2026-05-01
supersedes: []
superseded_by: null
scope: ops
note: This file is a human-readable summary. Full rules live in docs/ops/memory-system-v2.md.
---

# Session workflow

> Human-friendly summary only. Authoritative startup and closeout rules live in [`docs/ops/memory-system-v2.md`](./memory-system-v2.md).

## Verdict

Save important state into the repo truth layers. Do not rely on chat transcript alone.

## Memory model

| File | Role |
|---|---|
| `CHECKPOINT.md` | Current truth: active path, active seam, next step, blockers |
| `CONTEXT.md` | Rolling 2–3 useful session summary |
| `MEMORY.md` | Durable boundaries, architecture, repo rules |
| `memory/YYYY-MM-DD.md` | Optional scratch note, never startup context |
| `docs/archive/` | Historical material, never startup context |

## Before starting a new chat

1. Load `CHECKPOINT.md`.
2. Load `CONTEXT.md`.
3. Load `MEMORY.md` only if the task requires durable rules or architecture context.
4. Load one relevant `docs/...` file only if directly needed.

Do not load `memory/` or `docs/archive/` at startup.

Example prompts:

- "Run startup for One L1fe — read CHECKPOINT.md and CONTEXT.md, then continue."
- "Run startup, read CHECKPOINT.md + CONTEXT.md, then work on the current next step."

## Before resetting or closing a session

Minimum closeout:

1. Update `CHECKPOINT.md` if current state, active path, next steps, or blockers changed.
2. Update `CONTEXT.md` if the session produced useful handoff context.

Extended closeout only when needed:

3. Promote durable decisions into `MEMORY.md`.
4. Create or finalize `memory/YYYY-MM-DD.md` only for complex scratch findings.
5. Archive resolved daily notes to `docs/archive/memory/`.

## When to update which file

**Update `CHECKPOINT.md` when:**

- active path or active seam changed,
- next best step changed,
- blocker appeared or was removed.

**Update `CONTEXT.md` when:**

- closing or resetting a meaningful session,
- a compact handoff would help the next agent.

**Update `MEMORY.md` when:**

- a durable rule, boundary, or long-lived architecture decision became settled.

**Update `memory/YYYY-MM-DD.md` when:**

- temporary raw findings are useful during complex work but not durable.

## What not to do

- Do not load `memory/YYYY-MM-DD.md` as startup context.
- Do not put everything into `CHECKPOINT.md`.
- Do not turn `MEMORY.md` into a diary or implementation inventory.
- Do not keep old scratch notes in `memory/` after they are resolved.
- Do not assume the next session will infer truth from old chat messages.
- Do not store sensitive personal health artifacts in repo docs.
