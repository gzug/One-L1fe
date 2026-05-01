---
status: current
canonical_for: project entry point
owner: repo
last_verified: 2026-05-01
supersedes: []
superseded_by: null
scope: repo
---

# One L1fe

One L1fe is a private-first personal health intelligence project focused on evidence-based self-tracking and bounded interpretation, with a long-term goal of building a useful Digital Avatar from longitudinal data.

## Current status

The stable implementation path is `main`.

The active mobile app is the **One L1fe v2 prototype**.

Current app entry:

```text
apps/mobile/App.tsx -> apps/mobile/prototypes/v2/src/OneL1feV2Screen.tsx
```

`apps/mobile/prototypes/v1-marathon/` is the previous Marathon-focused snapshot. It remains in the repo for reference and temporary shared imports, but it is not the active runtime entry.

The previous authenticated minimum-slice/full-app shell remains as historical context and may be reused later. It is not the active app surface.

Current execution status lives in [CHECKPOINT.md](./CHECKPOINT.md).

## Start here

This file is broad human orientation only. It is not required for agent startup.

For **agentic repo work**, use this startup order:

1. [CHECKPOINT.md](./CHECKPOINT.md) — current state, active seam, next steps, blockers
2. [CONTEXT.md](./CONTEXT.md) — rolling summary of the last 2–3 sessions
3. [MEMORY.md](./MEMORY.md) — only if durable boundaries or architecture rules are needed
4. [docs/README.md](./docs/README.md) — only when deeper docs navigation is needed

Full session and memory rules: [docs/ops/memory-system-v2.md](./docs/ops/memory-system-v2.md)  
Agent working rules: [AGENTS.md](./AGENTS.md)

## Repo structure

```text
One-L1fe/
├── apps/
│   └── mobile/                # React Native / Expo client app
│       └── prototypes/        # Focused prototype versions
├── packages/
│   └── domain/                # Biomarker models, units, contracts, shared domain logic
├── supabase/
│   ├── migrations/            # Database migrations
│   ├── functions/             # Server-side functions and AI-facing endpoints
│   └── seed/                  # Seed and local dev data helpers
├── docs/
│   ├── architecture/          # System shape and technical decisions
│   ├── planning/              # Active backlog and execution docs
│   ├── research/              # Evidence gathering and unresolved questions
│   ├── compliance/            # Intended-use and boundary-sensitive material
│   ├── ops/                   # Session workflow, memory system, and operating guidance
│   ├── notion/                # Notion-specific design and migration notes
│   ├── roadmap/               # Phased progress and checkpoints
│   └── archive/               # Superseded or historical docs kept for context
├── CHECKPOINT.md              # Current execution state
├── CONTEXT.md                 # Rolling recent-session context
├── MEMORY.md                  # Durable project assumptions and decisions
├── AGENTS.md                  # Agent operating rules
└── CONTRIBUTING.md
```

## Mobile prototype workspace

Prototype versions live under:

```text
apps/mobile/prototypes/
```

Current active prototype:

```text
apps/mobile/prototypes/v2/
```

Previous snapshot:

```text
apps/mobile/prototypes/v1-marathon/
```

Rules:

- Keep current product work in `apps/mobile/prototypes/v2/` unless app-shell wiring is explicitly needed.
- Keep `v1-marathon/` stable unless explicitly fixing that snapshot.
- v2 may temporarily import unchanged modules from `v1-marathon/`.
- Fork a component into `v2/` before changing v2-specific behavior.
- Keep old/full-app surfaces out of the active path unless a later task explicitly restores them.

## Source of truth

Use each file layer for one job:

- [README.md](./README.md) = broad project entry point and orientation
- [CHECKPOINT.md](./CHECKPOINT.md) = current state and next step for active work
- [CONTEXT.md](./CONTEXT.md) = rolling 2–3 session summary for fast startup
- [MEMORY.md](./MEMORY.md) = durable assumptions and long-lived decisions
- [`docs/ops/memory-system-v2.md`](./docs/ops/memory-system-v2.md) = canonical session and memory rules
- [`docs/`](./docs/) = deeper architecture, planning, research, compliance, and ops references
- [`docs/archive/`](./docs/archive/) = historical material; never startup context

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
npm run typecheck:mobile
npm run test:domain
npm run generate:evidence-sql
npm run smoke:function:minimum-slice
SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=... scripts/check-supabase-hosted-baseline.sh
```

Mobile app:

```bash
cd apps/mobile
npm install
npx expo start --clear
# or: npx expo run:android
```

## Working workflow

- Keep `main` stable.
- Use short-lived focused branches or PRs for non-trivial/reviewable changes.
- Let CI validate repo hygiene, typecheck, mobile export, and domain tests.
- Update the real source-of-truth file when behavior or rules change.
- Do not use stale branches or broad draft PRs as backlog.

Agent working rules: [AGENTS.md](./AGENTS.md)  
Contributing guidelines: [CONTRIBUTING.md](./CONTRIBUTING.md)

## Core project docs

### Orientation

- [CHECKPOINT.md](./CHECKPOINT.md)
- [CONTEXT.md](./CONTEXT.md)
- [MEMORY.md](./MEMORY.md)
- [AGENTS.md](./AGENTS.md)
- [docs/README.md](./docs/README.md)

### Session and memory ops

- [docs/ops/memory-system-v2.md](./docs/ops/memory-system-v2.md)
- [docs/ops/session-workflow.md](./docs/ops/session-workflow.md)
- [docs/ops/openclaw.md](./docs/ops/openclaw.md)

### Architecture

- [docs/architecture/overview.md](./docs/architecture/overview.md)
- [docs/architecture/repo-structure.md](./docs/architecture/repo-structure.md)
- [docs/architecture/supabase-schema.md](./docs/architecture/supabase-schema.md)
- [docs/architecture/measurement-interpretation-policy.md](./docs/architecture/measurement-interpretation-policy.md)
- [docs/architecture/recommendation-contract-v1.md](./docs/architecture/recommendation-contract-v1.md)
- [docs/architecture/priority-score-v1.md](./docs/architecture/priority-score-v1.md)
- [docs/architecture/data-freshness-and-coverage-policy-v1.md](./docs/architecture/data-freshness-and-coverage-policy-v1.md)
- [docs/architecture/evidence-registry-and-rule-governance-v1.md](./docs/architecture/evidence-registry-and-rule-governance-v1.md)
- [docs/architecture/wearable-metric-keys-v1.md](./docs/architecture/wearable-metric-keys-v1.md)

### Planning, research, and boundaries

- [docs/planning/V1-backlog.md](./docs/planning/V1-backlog.md)
- [docs/planning/V1-minimum-slice.md](./docs/planning/V1-minimum-slice.md)
- [docs/planning/mobile-minimum-slice-first-seam.md](./docs/planning/mobile-minimum-slice-first-seam.md)
- [docs/planning/wearables-hard-facts-and-automation.md](./docs/planning/wearables-hard-facts-and-automation.md)
- [docs/roadmap/v1-checkpoint-and-next-agent-brief.md](./docs/roadmap/v1-checkpoint-and-next-agent-brief.md)
- [docs/research/v1-research-gaps-and-targeted-followups.md](./docs/research/v1-research-gaps-and-targeted-followups.md)
- [docs/compliance/intended-use.md](./docs/compliance/intended-use.md)
- [docs/compliance/data-handling-and-redaction.md](./docs/compliance/data-handling-and-redaction.md)

## Working constraints

- Treat compliance and business topics as parked, not deleted, during the private MVP phase.
- Do not describe the product as a generic consumer wellness product.
- Keep product framing bounded: no diagnosis, treatment, emergency triage, or clinical-risk-score claim.
- Do not put real personal health data into this repo.
