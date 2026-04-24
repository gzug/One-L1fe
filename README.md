---
status: current
canonical_for: project entry point
owner: repo
last_verified: 2026-04-24
supersedes: []
superseded_by: null
scope: repo
---

# One L1fe

One L1fe is a private-first personal health intelligence project focused on evidence-based self-tracking and bounded interpretation, with a long-term goal of building a useful Digital Avatar from longitudinal data.

## Current status

The repo already contains a documented product boundary, a shared domain layer, the first authenticated Supabase edge-function seam for the minimum slice, a thin app-facing client wrapper around the shared function contract, a small HTTP transport adapter, a mobile form-to-panel adapter, a minimal mobile submission wrapper, a compact result-summary helper ready for integration, and a verified local replay plus authenticated smoke-test path.

Current execution status lives in [CHECKPOINT.md](./CHECKPOINT.md).

## Start here

This file is for broad human orientation only — not required for agent startup.

For **agentic repo work**, use this startup order:

1. [CHECKPOINT.md](./CHECKPOINT.md) — current state, active seam, next steps, blockers
2. [CONTEXT.md](./CONTEXT.md) — rolling summary of the last 2–3 sessions
3. [MEMORY.md](./MEMORY.md) — only if you need durable boundaries or architecture rules
4. [docs/README.md](./docs/README.md) — only when you need deeper docs navigation

Full session and memory rules: [docs/ops/memory-system-v2.md](./docs/ops/memory-system-v2.md)  
Agent working rules: [AGENTS.md](./AGENTS.md)

## Repo structure

```text
One-L1fe/
├── apps/
│   └── mobile/                # React Native client app
├── packages/
│   └── domain/                # Biomarker models, units, contracts, shared domain logic
├── supabase/
│   ├── migrations/            # Database migrations
│   ├── functions/             # Server-side functions and AI-facing endpoints
│   └── seed/                  # Seed and local dev data helpers
├── docs/
│   ├── architecture/          # System shape and technical decisions
│   ├── planning/              # Backlog and next-step execution docs
│   ├── research/              # Evidence gathering and unresolved questions
│   ├── compliance/            # Intended-use and boundary-sensitive material
│   ├── ops/                   # Session workflow, memory system, and operating guidance
│   ├── notion/                # Notion-specific design and migration notes
│   ├── roadmap/               # Phased progress and checkpoints
│   └── archive/               # Superseded docs kept for context
├── memory/                    # Session scratch — daily notes only, never startup context
├── .github/                   # Repo hygiene, templates, CODEOWNERS, CI
├── MEMORY.md
├── CONTEXT.md
├── AGENTS.md
└── CONTRIBUTING.md
```

## Source of truth

Use each file layer for one job:

- [README.md](./README.md) = broad project entry point and orientation (human, not agent startup)
- [CHECKPOINT.md](./CHECKPOINT.md) = current state and next step for active work
- [CONTEXT.md](./CONTEXT.md) = rolling 2–3 session summary for fast agent startup
- [MEMORY.md](./MEMORY.md) = durable assumptions and long-lived decisions (on demand)
- [`memory/`](./memory/) = session scratch — daily notes only, archived at closeout
- [`docs/ops/memory-system-v2.md`](./docs/ops/memory-system-v2.md) = canonical session and memory rules
- [`docs/ops/`](./docs/ops/) = operating guidance (session workflow, OpenClaw)
- [`docs/architecture/`](./docs/architecture/) = technical decisions that should stay true over time
- [`docs/planning/`](./docs/planning/) = backlog and next work
- [`docs/research/`](./docs/research/) = evidence gathering and unresolved questions
- [`docs/compliance/`](./docs/compliance/) = intended-use, data-handling, and boundary docs

## Local development

### Prerequisites
- Node.js 24
- npm
- Supabase CLI for local backend work

### Install

```bash
npm ci
```

### Useful commands

```bash
npm run typecheck
npm run test:domain
npm run generate:evidence-sql
npm run smoke:function:minimum-slice
SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=... scripts/check-supabase-hosted-baseline.sh
```

## Working workflow

This repo uses a lightweight solo-founder workflow:

- keep `main` stable
- prefer short-lived branches for focused changes
- let CI validate typecheck and domain tests
- update the real source-of-truth file when behavior or rules change

Agent working rules: [AGENTS.md](./AGENTS.md)  
Contributing guidelines: [CONTRIBUTING.md](./CONTRIBUTING.md)

## Core project docs

### Orientation
- [CHECKPOINT.md](./CHECKPOINT.md)
- [CONTEXT.md](./CONTEXT.md)
- [MEMORY.md](./MEMORY.md)
- [AGENTS.md](./AGENTS.md)
- [docs/README.md](./docs/README.md)

### Session & memory ops
- [docs/ops/memory-system-v2.md](./docs/ops/memory-system-v2.md)
- [docs/ops/session-workflow.md](./docs/ops/session-workflow.md)
- [docs/ops/openclaw.md](./docs/ops/openclaw.md)

### Architecture
- [docs/architecture/overview.md](./docs/architecture/overview.md)
- [docs/architecture/repo-structure.md](./docs/architecture/repo-structure.md)
- [docs/architecture/supabase-schema.md](./docs/architecture/supabase-schema.md)
- [docs/architecture/measurement-interpretation-policy.md](./docs/architecture/measurement-interpretation-policy.md)
- [docs/architecture/recommendation-contract-v1.md](./docs/architecture/recommendation-contract-v1.md)
- [docs/architecture/v1-rule-matrix.md](./docs/architecture/v1-rule-matrix.md)
- [docs/architecture/priority-score-v1.md](./docs/architecture/priority-score-v1.md)
- [docs/architecture/data-freshness-and-coverage-policy-v1.md](./docs/architecture/data-freshness-and-coverage-policy-v1.md)
- [docs/architecture/weekly-self-report-anchors-v1.md](./docs/architecture/weekly-self-report-anchors-v1.md)
- [docs/architecture/evidence-registry-and-rule-governance-v1.md](./docs/architecture/evidence-registry-and-rule-governance-v1.md)
- [docs/architecture/v1-implementation-rule-inventory.md](./docs/architecture/v1-implementation-rule-inventory.md)
- [docs/architecture/v1-decision-tables.md](./docs/architecture/v1-decision-tables.md)
- [docs/architecture/v1-backend-interpretation-contract.md](./docs/architecture/v1-backend-interpretation-contract.md)
- [docs/architecture/wearables-and-context-schema-draft.md](./docs/architecture/wearables-and-context-schema-draft.md)
- [docs/architecture/wearable-metric-keys-v1.md](./docs/architecture/wearable-metric-keys-v1.md)

### Planning and roadmap
- [docs/planning/V1-backlog.md](./docs/planning/V1-backlog.md)
- [docs/planning/V1-minimum-slice.md](./docs/planning/V1-minimum-slice.md)
- [docs/planning/github-hardening-checklist.md](./docs/planning/github-hardening-checklist.md)
- [docs/planning/mobile-minimum-slice-first-seam.md](./docs/planning/mobile-minimum-slice-first-seam.md)
- [docs/planning/wearables-hard-facts-and-automation.md](./docs/planning/wearables-hard-facts-and-automation.md)
- [docs/archive/roadmap/phase-0.md](./docs/archive/roadmap/phase-0.md) (historical)
- [docs/roadmap/v1-checkpoint-and-next-agent-brief.md](./docs/roadmap/v1-checkpoint-and-next-agent-brief.md)

### Research and boundary docs
- [docs/research/v1-research-gaps-and-targeted-followups.md](./docs/research/v1-research-gaps-and-targeted-followups.md)
- [docs/research/v1-targeted-research-reconciliation-2026-04-12.md](./docs/research/v1-targeted-research-reconciliation-2026-04-12.md)
- [docs/compliance/intended-use.md](./docs/compliance/intended-use.md)
- [docs/compliance/data-handling-and-redaction.md](./docs/compliance/data-handling-and-redaction.md)

## Working constraints

- Treat compliance and business topics as parked, not deleted, during the private MVP phase.
- Do not describe the product as a generic consumer wellness product.
- Do not put real personal health data into this repo.
