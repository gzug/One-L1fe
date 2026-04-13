---
status: current
canonical_for: repo memory and OpenClaw operations improvement plan
owner: repo
last_verified: 2026-04-13
supersedes: []
superseded_by: null
scope: planning
---

# Repo memory and OpenClaw operations PRD

## Verdict

One L1fe already has strong information architecture and guardrails.
The next improvement is not more product invention. It is a stronger lifecycle for truth, drift control, short-term working memory, and explicit OpenClaw operating rules.

## Why this exists

The repo already separates:
- current execution state,
- durable memory,
- working rules,
- deeper architecture and compliance material.

That is a strong base.

The remaining weakness is operational:
- some rules are repeated across multiple files,
- some deeper docs still read as if earlier implementation phases are current,
- there is no explicit short-term raw memory layer,
- there is no repo-local OpenClaw operations playbook,
- most truth is still prose-first rather than machine-readable.

## Problem statement

The repo solves the memory problem well as an order system.
It does not yet solve it equally well as a continuously maintained operating system for human-plus-agent work.

If left alone, the likely failure modes are:
1. drift between `CHECKPOINT.md` and deeper docs,
2. accidental duplication of policy across files,
3. overloading `CHECKPOINT.md` and `MEMORY.md` with short-lived notes,
4. weak handoff behavior across new sessions and resets,
5. harder future adoption of structured memory compilation.

## Goals

1. Make the truth hierarchy easier for both humans and agents to follow.
2. Reduce document drift without flattening useful context.
3. Introduce an explicit short-term memory layer for daily work.
4. Add an OpenClaw-native operations guide for repeatable agent usage.
5. Prepare the repo for later machine-readable metadata and compiled memory.

## Non-goals

- Do not redesign the product architecture.
- Do not introduce broad process overhead.
- Do not move active implementation work into documentation theater.
- Do not add complex memory infrastructure before the repo artifacts are clean.

## Current truth hierarchy

### Current effective behavior
- `README.md` = project entry point
- `CHECKPOINT.md` = current execution state and next-step truth
- `MEMORY.md` = durable assumptions and decisions
- `AGENTS.md` = working rules for agents
- `docs/` = deeper supporting material by topic

### Current weakness
This hierarchy exists in practice, but lifecycle rules are still under-specified.
The repo says "prefer one canonical location" without yet giving every important topic a strict canonical home and status model.

## Target operating model

### 1. Truth layers

#### Layer A: startup truth
File: `CHECKPOINT.md`

Purpose:
- current repo state,
- current seam,
- next best step,
- active blockers,
- read-on-demand map,
- project guardrails needed for active work.

Rules:
- portable only,
- no machine-local absolute paths,
- no ephemeral closeout markers,
- no environment-specific secrets or unstable endpoints unless explicitly necessary.

#### Layer B: durable truth
File: `MEMORY.md`

Purpose:
- stable project assumptions,
- durable product boundaries,
- durable architecture posture,
- durable repo operations posture.

Rules:
- no chronological logs,
- no short-lived tactical notes,
- no repeated policy prose when a canonical policy doc exists.

#### Layer C: short-term working memory
Path: `memory/`

Purpose:
- daily notes,
- short-lived working findings,
- unresolved questions,
- temporary execution snapshots,
- session closeout material that is useful for the next few days but not yet durable.

Initial format:
- `memory/YYYY-MM-DD.md`

Rules:
- compact,
- date-scoped,
- safe for agent recall,
- no raw personal health data,
- promotion into `CHECKPOINT.md` or `MEMORY.md` only when the content becomes current truth or durable truth.

#### Layer D: canonical policy and architecture docs
Paths:
- `docs/compliance/`
- `docs/architecture/`
- `docs/planning/`
- `docs/roadmap/`

Rules:
- each file should have a clear purpose,
- each topic should have one canonical home,
- superseded docs should move to `docs/archive/` when still worth keeping.

### 2. Canonical policy hierarchy

Recommended hierarchy:
- health and product boundary, canonical in `docs/compliance/intended-use.md`
- current execution rules, canonical in `CHECKPOINT.md`
- durable operating assumptions, canonical in `MEMORY.md`
- agent work style, canonical in `AGENTS.md`

Policy duplication should be reduced to short references when possible.
Example:
- `MEMORY.md` should state that the intended-use boundary is durable and refer to `docs/compliance/intended-use.md` for the normative detail.
- `CHECKPOINT.md` should carry only the minimum live guardrails needed during active implementation.

### 3. Document status metadata

Important docs should gain lightweight front matter.

Suggested fields:
```yaml
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-04-13
supersedes: []
superseded_by: null
scope: repo
```

Minimum status vocabulary:
- `current`
- `reference`
- `draft`
- `superseded`
- `archived`

This is not for bureaucracy.
It is to make it obvious whether a document is still driving implementation.

### 4. OpenClaw operations guide

Add `docs/ops/openclaw.md`.

It should define:
- which files are startup truth,
- how new sessions should bootstrap,
- how `memory/` daily notes should be used,
- when to promote notes into `CHECKPOINT.md` or `MEMORY.md`,
- which OpenClaw memory features fit this repo,
- which ones should wait until the source artifacts are cleaner,
- session isolation guidance for founder chat versus automation.

### 5. Machine-readable layer

Add a small structured layer after the truth hierarchy is cleaned.

Suggested artifacts:
- `checkpoint.yaml` or `checkpoint.json`
- `docs/policy-index.yaml`
- optional doc front matter across high-value docs

This structured layer should be generated by discipline first, not by premature tooling.

## Phased plan

### Phase 1, now
1. trim drift in active docs,
2. create this PRD,
3. add `docs/ops/openclaw.md`,
4. add `memory/README.md` and the first daily note template,
5. remove clearly non-portable details from `CHECKPOINT.md`.

### Phase 2, next
1. add lightweight front matter to high-value docs,
2. define canonical ownership for repeated policy topics,
3. archive or mark clearly superseded planning and architecture notes.

### Phase 3, later
1. add a machine-readable checkpoint artifact,
2. add a policy index,
3. evaluate compiled memory only after the source layer is stable.

## Acceptance criteria

This PRD is complete when the repo has:
- a visible `memory/` layer,
- an OpenClaw operations guide,
- a more portable `CHECKPOINT.md`,
- at least one corrected drift point in the deeper docs,
- a documented plan for metadata and canonical ownership.

## Proposed file additions

- `docs/ops/openclaw.md`
- `memory/README.md`
- `memory/2026-04-13.md`
- optional later: `docs/policy-index.yaml`
- optional later: `checkpoint.yaml`

## Risks

### Risk
Adding too much process too early.

### Mitigation
Keep the first pass minimal and operational.
Only add files that change daily behavior.

### Risk
Creating a second documentation layer that also drifts.

### Mitigation
Make canonical ownership explicit.
Keep references short.
Archive aggressively when a document stops guiding work.

## Implementation status

Completed locally in this workstream:
1. `docs/ops/openclaw.md`
2. `memory/README.md`
3. `memory/2026-04-13.md`
4. `CHECKPOINT.md` portability cleanup
5. one drift cleanup pass across the most-read docs
6. lightweight front matter on core files
7. initial `checkpoint.yaml` and `docs/policy-index.yaml`

## Recommended next step after this PRD

1. keep the new truth hierarchy stable in normal work,
2. add a simple human-facing session workflow guide,
3. archive or mark clearly superseded docs over time,
4. only expand machine-readable artifacts when the source docs stay clean.
