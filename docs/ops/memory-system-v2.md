---
status: current
canonical_for: memory system operations
owner: repo
last_verified: 2026-04-20
supersedes: [memory/README.md]
superseded_by: null
scope: all-agents
---

# Memory System — Operating Rules v2

## What changed and why

v1 had no explicit promotion cadence and no lightweight quick-context layer.
Agents either loaded too much (full MEMORY.md) or too little (CHECKPOINT.md only).
This caused token waste and drift when daily notes aged without being resolved.

v2 adds one file: `CONTEXT.md` — a rolling 2–3 session summary that gives
agents a fast startup path without loading full durable memory.

Daily notes (`memory/YYYY-MM-DD.md`) are now scratch-only. No agent loads
them at startup. They exist solely as short-lived working memory and are
archived after each session's relevant content is promoted.

---

## File map

| File | Purpose | Who writes | When |
|---|---|---|---|
| `CHECKPOINT.md` | Active execution state, blockers, next steps | Any agent | End of every session |
| `MEMORY.md` | Durable decisions, architecture invariants, product boundaries | Any agent | Only when clearly durable |
| `CONTEXT.md` | Rolling 2–3 session summary for fast agent startup | Any agent | End of every session — replaces oldest entry when >3 sessions |
| `memory/YYYY-MM-DD.md` | Raw session scratch notes | Any agent | During/after session — archived same session or next |
| `docs/archive/memory/` | Archived daily notes | Any agent | After daily note is resolved |

---

## Startup order — all agents

**Default (fast path — use for most tasks):**
1. `CHECKPOINT.md` — current state, next step, blockers
2. `CONTEXT.md` — what happened in the last 2–3 sessions
3. Execute task

**Only if the task explicitly touches durable rules or architecture:**
4. `MEMORY.md` — on demand only

**Only if the task requires deep reference:**
5. Relevant file from `docs/` — on demand only, never by default

Never load `memory/YYYY-MM-DD.md` or `docs/archive/` at startup.
Those are scratch archives — not active memory.

---

## CONTEXT.md — rules

- Always contains exactly the last 2–3 sessions, compressed
- One entry per session: date + max 5 bullets
- Hard cap: 60 lines total
- When a new session ends: prepend new entry, drop oldest if >3 sessions present
- CONTEXT.md is narrative — it does NOT replace CHECKPOINT.md which holds exact execution state

### Entry template

```
## YYYY-MM-DD — [agent or human label]
- What was accomplished
- What changed in code / schema / docs
- Open questions or unresolved items
- What was explicitly deferred
```

---

## Daily notes (`memory/YYYY-MM-DD.md`) — full lifecycle

### When to create
- At the start or during any session involving meaningful work
- Named exactly `YYYY-MM-DD.md` using the session date
- Written directly to `memory/` in the repo — no local-only copies

### What goes in
- Raw findings and decisions not yet confirmed durable
- Unresolved questions
- Handoff context for the next session
- Provisional items still being validated

### What does NOT go in
- Raw personal health data, lab reports, screenshots with sensitive info
- Durable decisions — those go directly to `MEMORY.md`
- Current execution truth — that goes directly to `CHECKPOINT.md`

### End-of-session: what happens to the daily note
1. Review the note
2. Promote anything durable → `MEMORY.md`
3. Promote anything that is current execution truth → `CHECKPOINT.md`
4. Add session summary entry → `CONTEXT.md`
5. Move file to `docs/archive/memory/YYYY-MM-DD.md`
6. Commit and push all changes together

A daily note must not remain unarchived for more than 14 days.
If older than 14 days: promote what is relevant, discard the rest, archive immediately.

### Local files
No local memory files outside the repo. There is no local memory layer.
If content was written locally during a session: push to `memory/YYYY-MM-DD.md` before the session ends.
If local scratch content is stale or irrelevant: discard.
The repo is the only source of truth.

---

## Promotion rules

**Promote to `CHECKPOINT.md` when the item is:**
- The real current execution state
- The active seam or next best step
- A current blocker
- A startup-critical guardrail

**Promote to `MEMORY.md` when the item is:**
- A durable product boundary
- A confirmed architecture decision
- A repo operations rule that will still be true in 3+ months

**Keep in `memory/YYYY-MM-DD.md` until end of session when the item is:**
- Recent, provisional, still being validated
- Session-specific, not needed beyond the next 1–2 sessions

When in doubt: keep in daily note, do not promote prematurely.
Premature promotion to MEMORY.md causes drift.

---

## MEMORY.md — size and archival policy

### Size limit

`MEMORY.md` has a **hard cap of 120 lines**.

When a proposed addition would push MEMORY.md above 120 lines,
the agent must archive at least one existing section before adding the new content.
Never exceed the cap — compress or archive first, then add.

### Archival trigger

Archive a MEMORY.md section when **any** of the following are true:
- The section describes a decision that is fully implemented and stable in `main`
- The section has not changed in 3+ months
- The content is better captured in a `docs/` reference file

### Archival process

1. Copy the section to `docs/archive/memory/memory-YYYY-MM-DD-[topic].md`
2. Replace the section in MEMORY.md with a one-line pointer:
   `<!-- archived: docs/archive/memory/memory-YYYY-MM-DD-[topic].md -->`
3. Commit together with any new content being added

### What must never be archived

- Active product boundaries (what this is / is not)
- Architecture invariants that an agent would violate if unaware
- The Priority Score bounded-aid constraint
- Any item tagged `# DO NOT ARCHIVE` by the owner

### Candidate sections for next archival pass

Review these when MEMORY.md next approaches 120 lines:
- `## Durable architecture posture` bullets for fully-shipped features
- Field-state decisions already reflected in schema migrations
- Early infrastructure decisions superseded by current setup

---

## End-of-session checklist — all agents

Execute in this order before ending or resetting any session:

1. **Update `CHECKPOINT.md`** — current branch + HEAD SHA, last confirmed state, next steps, resolved/new blockers
2. **Update `CONTEXT.md`** — prepend session entry (max 5 bullets), drop oldest if >3 entries, enforce 60-line cap
3. **Promote to `MEMORY.md`** if anything durable was decided this session
4. **Check MEMORY.md line count** — if >120 lines, archive before adding
5. **Write or finalise `memory/YYYY-MM-DD.md`** — raw session notes
6. **Archive daily note** — move to `docs/archive/memory/YYYY-MM-DD.md`
7. **Single commit** — all changed files together, message: `memory: session closeout YYYY-MM-DD`
8. **Push to `main`** (via PR if branch protection requires it)

Steps 1 and 2 are mandatory every session.
Steps 3–6 required unless the session produced no meaningful work.
Never push partial closeouts — all steps in one commit.

---

## Universal session-end command

Paste at the end of any session with any agent (Claude, OpenClaw, Perplexity, Hermes):

```
SESSION CLOSEOUT — execute memory-system-v2 end-of-session checklist:
1. Update CHECKPOINT.md with current state, next steps, resolved/new blockers
2. Prepend session entry to CONTEXT.md (max 5 bullets), drop oldest if >3, enforce 60-line cap
3. Promote anything durable to MEMORY.md
4. Check MEMORY.md line count — if >120 lines, archive before adding (see archival policy)
5. Write memory/YYYY-MM-DD.md with raw session notes
6. Archive memory/YYYY-MM-DD.md to docs/archive/memory/YYYY-MM-DD.md
7. Commit all changes: "memory: session closeout YYYY-MM-DD"
8. Push to main (via PR if branch protection is active)
Reference: docs/ops/memory-system-v2.md
```

---

## Token budget guidance

| Startup type | Files to load | Est. tokens |
|---|---|---|
| Quick task | `CHECKPOINT.md` only | ~600 |
| Standard session | `CHECKPOINT.md` + `CONTEXT.md` | ~900 |
| Architecture work | + `MEMORY.md` | ~1.800 |
| Deep reference | + relevant `docs/` file | ~2.500+ |

Load the minimum that allows the task to be executed correctly.
Start minimal — load more only if the task explicitly requires it.

---

## What this replaces

| Before | After |
|---|---|
| No quick-context layer — agents loaded full MEMORY.md | `CONTEXT.md` as fast startup layer |
| Daily notes unresolved indefinitely | Archived within 14 days, same-session preferred |
| No end-of-session checklist | Explicit 8-step checklist (added archival check) |
| No universal session-end command | Single paste command works across all agents |
| No max-length rule for MEMORY.md | Hard cap: 120 lines with archival process |
| Local files undefined | No local memory layer — repo only |

`MEMORY.md`, `CHECKPOINT.md`, and `docs/` structure are unchanged.
`memory/README.md` is superseded by this document.
