---
status: current
canonical_for: OpenClaw repo operations
owner: repo
last_verified: 2026-04-18
supersedes: []
superseded_by: null
scope: ops
---

# OpenClaw operations guide

## Verdict

Use OpenClaw as a thin layer over clean repo truth. Do not rely on OpenClaw memory to compensate for unclear or drifting project artifacts.

## Startup order

1. `CHECKPOINT.md`
2. `README.md` — only when broad repo orientation is needed
3. Only the most relevant deeper file for the task

- `MEMORY.md` only for durable truth or old decisions
- Do not read broad parts of `docs/` by default
- Use the read-on-demand map in `CHECKPOINT.md`

## Truth layers

| Layer | File | Use for |
|---|---|---|
| Current execution truth | `CHECKPOINT.md` | Current state, active seam, next step, blockers, startup map |
| Durable truth | `MEMORY.md` | Stable assumptions, durable architecture + repo rules |
| Short-term working memory | `memory/YYYY-MM-DD.md` | Daily notes, temporary findings, handoff context |
| Deep reference | `docs/` | Architecture, planning, compliance, research — on demand only |

## Promotion rules

Promote into `CHECKPOINT.md` when it becomes:
- the real current state, active seam, next best step, current blocker, or startup-critical guardrail

Promote into `MEMORY.md` when it becomes:
- a durable product boundary, architecture decision, or repo operations rule

Keep in `memory/YYYY-MM-DD.md` when it is:
- recent, provisional, still being validated, or useful near-term but not yet durable

## OpenClaw feature posture

**Good fit now:**
- Startup on `CHECKPOINT.md`
- Durable recall against `MEMORY.md`
- Session continuity via daily notes in `memory/`

**Good fit later (after source cleanup):**
- Richer compiled memory over canonical docs
- Contradiction and freshness workflows
- Machine-readable digests for current state and policy ownership

**Avoid as substitute for repo hygiene:**
- Do not use memory features to resolve doc drift
- Do not let multiple files compete as current truth
- Do not put volatile local machine details in canonical startup docs

## Session guidance

- **Founder/operator chat:** persistent sessions appropriate; still write important outcomes into repo files
- **One-shot tasks / narrow workers:** minimal context; do not treat as durable memory surface
- **Multiple user conversations:** keep sessions isolated when conversations should not share working memory

## Heartbeat guidance

Keep heartbeat behavior minimal. Repo files are the durable layer — not status chatter.

## Safety and privacy

Do not store raw personal health data in `MEMORY.md`, `memory/`, planning docs, screenshots, or example artifacts. Use synthetic examples. Defer boundary questions to `docs/compliance/intended-use.md`.

## Practical rule

If a future OpenClaw feature seems useful but repo truth is still ambiguous, clean the repo artifact first. Then operationalize the tooling.
