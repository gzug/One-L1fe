---
status: current
canonical_for: human-friendly session workflow
owner: repo
last_verified: 2026-04-24
supersedes: []
superseded_by: null
scope: ops
note: This file is a human-readable summary. Full rules and checklists live in docs/ops/memory-system-v2.md.
---

# Session workflow

> Human-friendly summary only. Authoritative session rules, startup order, and closeout checklist are in [`docs/ops/memory-system-v2.md`](./memory-system-v2.md).

## Verdict

Before a reset or new chat, save the important current state into the repo truth layers. Do not rely on chat transcript alone.

## Memory model (v2)

| File | Role |
|---|---|
| `CHECKPOINT.md` | Current truth: active seam, next step, blockers — load every session |
| `CONTEXT.md` | Rolling 2–3 session summary — load every session |
| `MEMORY.md` | Durable boundaries, architecture, repo rules — load on demand only |
| `memory/YYYY-MM-DD.md` | Session scratch — never load at startup; archive at closeout |

## Before starting a new chat

1. Load `CHECKPOINT.md`.
2. Load `CONTEXT.md`.
3. Load `MEMORY.md` only if the task requires durable rules or architecture context.
4. Do **not** load `memory/YYYY-MM-DD.md` at startup — it is scratch, not context.

Example prompts:
- "Run session startup for One L1fe — read CHECKPOINT.md and CONTEXT.md, then continue."
- "Run startup, read CHECKPOINT.md + CONTEXT.md, then work on the current next step."

## Before resetting or closing a session

1. What changed that future-me must not lose?
2. Update `CHECKPOINT.md` with current state, seam, next steps, blockers.
3. Prepend a compact entry to `CONTEXT.md` (date + max 5 bullets; drop oldest if >3 entries).
4. Promote durable decisions into `MEMORY.md` if needed.
5. Write session scratch to `memory/YYYY-MM-DD.md`, then archive it to `docs/archive/memory/`.

Full closeout checklist: `docs/ops/memory-system-v2.md`

## When to update which file

**Update `CHECKPOINT.md` when:**
- Active seam changed
- Next best step changed
- Blocker appeared or was removed

**Update `CONTEXT.md` when:**
- Closing or resetting a session (one compact entry per session)

**Update `MEMORY.md` when:**
- A durable rule, boundary, or long-lived architecture decision became settled

**Update `memory/YYYY-MM-DD.md` when:**
- Something is useful now but not yet durable (scratch only)

## What not to do

- Do not load `memory/YYYY-MM-DD.md` as startup context
- Do not put everything into `CHECKPOINT.md`
- Do not turn `MEMORY.md` into a diary or implementation inventory
- Do not assume the next session will infer truth from old chat messages
- Do not store raw personal health data in any of these files
