---
status: current
canonical_for: human-friendly session workflow
owner: repo
last_verified: 2026-04-13
supersedes: []
superseded_by: null
scope: ops
---

# Session workflow

## Verdict

Before a reset or a new chat, save the important current state into the repo truth layers.
Do not rely on the chat transcript alone to preserve what matters.

## The simple mental model

There are now three places for memory:

1. `CHECKPOINT.md`
   - what is true right now
   - what the current seam is
   - what the next best step is
   - what the current blockers are

2. `MEMORY.md`
   - what should stay true for a long time
   - stable product boundaries
   - stable architecture and repo rules

3. `memory/YYYY-MM-DD.md`
   - temporary findings
   - handoff notes
   - in-progress thoughts
   - things you want the next session to remember soon, but not forever

## Before resetting a session

Use this checklist:

1. Ask: what changed that future-me must not lose?
2. Put current project truth into `CHECKPOINT.md`.
3. Put durable decisions into `MEMORY.md`.
4. Put short-lived notes into `memory/YYYY-MM-DD.md`.
5. If files changed, save them before resetting.

## Before starting a new chat

The best first message is simple and practical.
Examples:

- "Run session startup for One L1fe, then continue from CHECKPOINT.md."
- "Run session startup, read CHECKPOINT.md, and work on the current next step."
- "Run startup, then use memory/2026-04-13.md only as short-term context, not as durable truth."

## When to update which file

### Update `CHECKPOINT.md` when
- the active seam changed,
- the next best step changed,
- a blocker appeared or was removed,
- the repo state moved in a way the next session must know immediately.

### Update `MEMORY.md` when
- a durable rule changed,
- a durable boundary changed,
- a long-lived architecture decision became settled.

### Update `memory/YYYY-MM-DD.md` when
- something is useful soon,
- something is still provisional,
- you want a handoff note,
- you want to keep a session closeout snapshot.

## What not to do

- do not put everything into `CHECKPOINT.md`
- do not turn `MEMORY.md` into a diary
- do not assume the next session will infer the right truth from old chat messages
- do not store raw personal health data in any of these files

## Recommended habit

At the end of meaningful work, do a short closeout:
- current seam,
- next best step,
- blockers,
- any durable decision,
- any short-term notes worth keeping.

If those are written down in the right place, resets and new chats become much safer.
