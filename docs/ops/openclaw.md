---
status: current
canonical_for: OpenClaw repo operations
owner: repo
last_verified: 2026-04-24
supersedes: []
superseded_by: null
scope: ops
note: OpenClaw-specific addendum only. General session and memory rules are in docs/ops/memory-system-v2.md and AGENTS.md.
---

# OpenClaw operations guide

> Addendum for OpenClaw-specific behaviour only. Default startup order, memory model, and session rules are defined in [`AGENTS.md`](../../AGENTS.md) and [`docs/ops/memory-system-v2.md`](./memory-system-v2.md).

## Verdict

Use OpenClaw as a thin layer over clean repo truth. Do not rely on OpenClaw memory to compensate for unclear or drifting project artifacts.

## Startup order

Follow the default startup defined in `AGENTS.md`:
1. `CHECKPOINT.md`
2. `CONTEXT.md`
3. `MEMORY.md` — only if the task requires durable rules or architecture context
4. One specific `docs/...` file — only if directly relevant

Do **not** use `memory/YYYY-MM-DD.md` as startup context or for session continuity.

## Truth layers

| Layer | File | Use for |
|---|---|---|
| Current execution truth | `CHECKPOINT.md` | Current state, active seam, next step, blockers |
| Fast session context | `CONTEXT.md` | Rolling 2–3 session summary for quick startup |
| Durable truth | `MEMORY.md` | Stable assumptions, durable architecture + repo rules |
| Session scratch | `memory/YYYY-MM-DD.md` | Temporary findings — archive at closeout, never load at startup |
| Deep reference | `docs/` | Architecture, planning, compliance, research — on demand only |

## Promotion rules

Promote into `CHECKPOINT.md` when it becomes the real current state, active seam, next best step, current blocker, or startup-critical guardrail.

Promote into `MEMORY.md` when it becomes a durable product boundary, architecture decision, or repo operations rule.

Keep in `memory/YYYY-MM-DD.md` when it is recent, provisional, or useful near-term but not yet durable.

## OpenClaw feature posture

**Good fit now:**
- Startup on `CHECKPOINT.md` + `CONTEXT.md`
- Durable recall against `MEMORY.md`
- Session closeout via daily notes (scratch only, then archive)

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

## Safety and privacy

Do not store raw personal health data in `MEMORY.md`, `memory/`, planning docs, screenshots, or example artifacts. Use synthetic examples. Defer boundary questions to `docs/compliance/intended-use.md`.

## Practical rule

If a future OpenClaw feature seems useful but repo truth is still ambiguous, clean the repo artifact first. Then operationalize the tooling.
