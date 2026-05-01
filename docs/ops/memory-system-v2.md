---
status: current
canonical_for: memory system operations
owner: repo
last_verified: 2026-05-01
supersedes: [memory/README.md]
superseded_by: null
scope: all-agents
---

# Memory System — Operating Rules v2

## Purpose

Keep repo continuity clear without forcing every session into an 8-step ritual.

## Truth layers

| File | Role | Load at startup? |
|---|---|---|
| `CHECKPOINT.md` | Current execution state, active path, blockers, next steps | Yes |
| `CONTEXT.md` | Rolling summary of the last 2–3 useful sessions | Yes |
| `MEMORY.md` | Durable assumptions, product boundaries, architecture rules | Only when needed |
| `docs/` | Deep reference by topic | Only when directly relevant |
| `memory/YYYY-MM-DD.md` | Optional scratch notes | No |
| `docs/archive/` | Historical material | No |

## Startup order

1. Read `CHECKPOINT.md`.
2. Read `CONTEXT.md`.
3. Read `MEMORY.md` only for durable boundaries or architecture rules.
4. Read one relevant `docs/...` file only when the task needs it.

Never load `memory/` or `docs/archive/` during startup.

## CONTEXT.md rules

- Newest entry first.
- Keep 2–3 useful session entries.
- Max 5 bullets per entry.
- Hard cap: 60 lines.
- Narrative only; exact current truth belongs in `CHECKPOINT.md`.

## Daily notes

Daily notes are optional scratch.

Create `memory/YYYY-MM-DD.md` only for complex sessions where raw findings need temporary staging.

If a daily note is created, resolve it before closeout:

1. Promote current truth to `CHECKPOINT.md` when relevant.
2. Promote durable decisions to `MEMORY.md` when relevant.
3. Preserve useful handoff context in `CONTEXT.md` when relevant.
4. Move resolved notes to `docs/archive/memory/YYYY-MM-DD.md`.

A daily note must not remain unarchived for more than 14 days.

## MEMORY.md policy

`MEMORY.md` has a hard cap of 120 lines.

Add to `MEMORY.md` only when a rule or decision should remain true for months.

Archive or compress before adding if the file would exceed 120 lines.

## Closeout minimum

For any meaningful session:

1. Update `CHECKPOINT.md` if current state, active path, next steps, or blockers changed.
2. Update `CONTEXT.md` if the session produced useful handoff context.

## Extended closeout

Only when needed:

3. Update `MEMORY.md` for durable decisions.
4. Archive resolved daily notes.
5. Commit related changes together.
6. Push directly or open a PR depending on review needs.

Do not perform extra closeout steps when nothing changed.

## Universal session-end command

```text
SESSION CLOSEOUT:
1. Update CHECKPOINT.md if execution truth changed.
2. Update CONTEXT.md if useful handoff context exists.
3. Update MEMORY.md only for durable decisions.
4. Archive resolved memory/YYYY-MM-DD.md notes.
5. Commit related changes together and push or open a PR.
Reference: docs/ops/memory-system-v2.md
```

## Token budget guidance

| Startup type | Files to load |
|---|---|
| Quick task | `CHECKPOINT.md` |
| Standard session | `CHECKPOINT.md` + `CONTEXT.md` |
| Architecture work | + `MEMORY.md` |
| Deep reference | + one relevant `docs/` file |

## Superseded file

`memory/README.md` is superseded by this document and should not be kept as a second rule source.
