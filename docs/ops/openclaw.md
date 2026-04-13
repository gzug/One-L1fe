---
status: current
canonical_for: OpenClaw repo operations
owner: repo
last_verified: 2026-04-13
supersedes: []
superseded_by: null
scope: ops
---

# OpenClaw operations guide

## Verdict

Use OpenClaw as a thin operating layer over clean repo truth.
Do not ask OpenClaw memory features to compensate for unclear or drifting project artifacts.

## Startup order

For meaningful repo work:
1. `CHECKPOINT.md`
2. `README.md` only when broad repo orientation is needed
3. only the most relevant deeper file for the task

Use `MEMORY.md` only for durable truth or old decisions.
Do not read broad parts of `docs/` by default.
Use the read-on-demand map in `CHECKPOINT.md`.

## Truth layers

### Current execution truth
- `CHECKPOINT.md`

Use for:
- current state,
- active seam,
- next best step,
- current blockers,
- startup map.

### Durable truth
- `MEMORY.md`

Use for:
- stable assumptions,
- durable architecture posture,
- durable repo operating rules.

### Short-term working memory
- `memory/YYYY-MM-DD.md`

Use for:
- daily notes,
- temporary findings,
- unresolved questions,
- short-lived handoff context.

### Deep reference
- `docs/`

Use only when the task needs deeper architecture, planning, compliance, or research context.

## Promotion rules

Promote content into `CHECKPOINT.md` when it becomes:
- the real current state,
- the active seam,
- the next best step,
- a current blocker,
- a startup-critical guardrail.

Promote content into `MEMORY.md` when it becomes:
- a durable product boundary,
- a durable architecture decision,
- a durable repo operations rule.

Keep content in `memory/YYYY-MM-DD.md` when it is:
- recent,
- provisional,
- still being validated,
- useful for near-term continuity but not yet durable.

## OpenClaw feature posture

### Good fit now
- startup on `CHECKPOINT.md`
- durable recall against `MEMORY.md`
- session continuity supported by daily notes in `memory/`

### Good fit later, after source cleanup
- richer compiled memory over canonical docs
- contradiction and freshness workflows over structured metadata
- machine-readable digests for current state and policy ownership

### Avoid as a substitute for repo hygiene
- do not rely on memory features to resolve doc drift,
- do not let multiple files compete as current truth,
- do not put volatile local machine details in canonical startup docs.

## Session guidance

For a simpler human-facing checklist, see `docs/ops/session-workflow.md`.


### Founder or operator chat
Persistent sessions are appropriate.
Use memory features for recall and continuity, but still write important outcomes into repo files.

### One-shot tasks or narrow workers
Prefer minimal context.
Do not treat short-lived automation as a durable memory surface.

### Multiple user conversations
Keep sessions isolated when conversations should not share working memory.

## Heartbeat guidance

Keep heartbeat behavior minimal.
Do not let status chatter become a second operating log.
The repo files are the durable layer.

## Safety and privacy

Do not store raw personal health data in:
- `MEMORY.md`
- `memory/`
- planning docs,
- screenshots or example artifacts committed to the repo.

Use synthetic examples by default.
Defer normative product boundary questions to `docs/compliance/intended-use.md`.

## Practical rule

If a future OpenClaw feature seems useful but the repo truth is still ambiguous, clean the repo artifact first.
Then operationalize the tooling.
