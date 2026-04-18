---
status: current
canonical_for: human-friendly session workflow
owner: repo
last_verified: 2026-04-18
supersedes: []
superseded_by: null
scope: ops
---

# Session workflow

## Verdict

Before a reset or new chat, save the important current state into the repo truth layers. Do not rely on chat transcript alone.

## Memory model

| File | Stores |
|---|---|
| `CHECKPOINT.md` | Current truth, active seam, next step, blockers |
| `MEMORY.md` | What should stay true long-term: boundaries, architecture, repo rules |
| `memory/YYYY-MM-DD.md` | Temporary findings, handoff notes, in-progress thoughts |

## Before resetting a session

1. What changed that future-me must not lose?
2. Put current project truth into `CHECKPOINT.md`
3. Put durable decisions into `MEMORY.md`
4. Put short-lived notes into `memory/YYYY-MM-DD.md`
5. If files changed, save them before resetting

## Before starting a new chat

Examples:
- "Run session startup for One L1fe, then continue from CHECKPOINT.md."
- "Run startup, read CHECKPOINT.md, and work on the current next step."
- "Run startup, then use memory/2026-04-13.md only as short-term context, not as durable truth."

## When to update which file

**Update `CHECKPOINT.md` when:**
- Active seam changed
- Next best step changed
- Blocker appeared or was removed
- Repo state moved in a way the next session must know immediately

**Update `MEMORY.md` when:**
- A durable rule, boundary, or long-lived architecture decision became settled

**Update `memory/YYYY-MM-DD.md` when:**
- Something is useful soon but not yet durable
- Handoff note or session closeout snapshot needed

## What not to do

- Do not put everything into `CHECKPOINT.md`
- Do not turn `MEMORY.md` into a diary
- Do not assume the next session will infer truth from old chat messages
- Do not store raw personal health data in any of these files

## Recommended closeout habit

At the end of meaningful work, note:
- Current seam
- Next best step
- Blockers
- Any durable decision
- Any short-term notes worth keeping

If written into the right file, resets and new chats become safe.
