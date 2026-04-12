# One L1fe

One L1fe is a private-first personal health intelligence project focused on evidence-based self-tracking and pattern detection, with a long-term goal of building a useful Digital Avatar from longitudinal data.

## Repo Overview

This project lives in a single active repository: `One-L1fe`.

| Workspace | Role | Notes |
| --- | --- | --- |
| `One-L1fe` | Product repo | Product docs, compliance baseline, app implementation, schemas, and user-facing logic. |
| `One-L1fe-Ops` | Future option — not active | Reserved for agent ops, runbooks, and automation infrastructure if/when the project scales. |

## Architecture Skeleton

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
│   ├── architecture/          # System shape and repo structure docs
│   ├── compliance/            # Parked boundary docs, not a Phase 0 blocker
│   └── roadmap/               # Build order and project phases
├── MEMORY.md
├── GLOSSARY.md
└── AGENTS.md
```

## Tech Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Mobile App | React Native | Primary application client. |
| Backend | Supabase | Database, auth, storage, and backend services. |
| AI Layer | OpenRouter | Accessed server-side, not directly from the mobile client. |
| Agent Runtime | OpenClaw 2026.4.9 | Local development and operational agent workflows. |
| Source Control | GitHub | Remote hosting and collaboration. |

## Core Project Docs

- [MEMORY.md](./MEMORY.md)
- [GLOSSARY.md](./GLOSSARY.md)
- [AGENTS.md](./AGENTS.md)
- [docs/architecture/overview.md](./docs/architecture/overview.md)
- [docs/architecture/repo-structure.md](./docs/architecture/repo-structure.md)
- [docs/architecture/supabase-schema.md](./docs/architecture/supabase-schema.md)
- [docs/architecture/measurement-interpretation-policy.md](./docs/architecture/measurement-interpretation-policy.md)
- [docs/architecture/recommendation-contract-v1.md](./docs/architecture/recommendation-contract-v1.md)
- [docs/architecture/v1-rule-matrix.md](./docs/architecture/v1-rule-matrix.md)
- [docs/architecture/priority-score-v1.md](./docs/architecture/priority-score-v1.md)
- [docs/architecture/data-freshness-and-coverage-policy-v1.md](./docs/architecture/data-freshness-and-coverage-policy-v1.md)
- [docs/architecture/weekly-self-report-anchors-v1.md](./docs/architecture/weekly-self-report-anchors-v1.md)
- [docs/notion/final-first-automation-structure.md](./docs/notion/final-first-automation-structure.md)
- [docs/notion/v1-database-property-spec.md](./docs/notion/v1-database-property-spec.md)
- [docs/notion/old-to-v1-migration-map.md](./docs/notion/old-to-v1-migration-map.md)
- [docs/notion/notion-vs-backend-calculation-boundary.md](./docs/notion/notion-vs-backend-calculation-boundary.md)
- [docs/notion/v1-implementation-sequence.md](./docs/notion/v1-implementation-sequence.md)
- [docs/research/v1-research-gaps-and-targeted-followups.md](./docs/research/v1-research-gaps-and-targeted-followups.md)
- [docs/roadmap/phase-0.md](./docs/roadmap/phase-0.md)
- [docs/compliance/intended-use.md](./docs/compliance/intended-use.md)

## Phase 0 Status Checklist

- [x] Core repo memory established
- [x] Project glossary established
- [x] Agent operating guide established
- [x] Intended-use and compliance baseline documented
- [x] Architecture skeleton defined
- [x] Biomarker canonical schema drafted
- [x] Supabase schema drafted
- [ ] React Native scaffold prepared
- [ ] Auth flow defined
- [x] Recommendation pipeline and evidence model drafted
- [x] Data governance and interpretation guardrails drafted

## Current Build State

The canonical biomarker registry now exists in `packages/domain/biomarkers.ts` and is documented in `docs/architecture/biomarker-model.md`.
The Supabase Phase 0 baseline is drafted.
The first serious V1 interpretation and Notion-automation architecture is now also documented across the architecture, notion, and research docs.

The next clean implementation step is:
1. keep the new rule and data-shape decisions stable,
2. build the React Native scaffold,
3. implement one narrow end-to-end flow against the shared domain and database baseline.

## Working Constraint

- Treat compliance and business topics as **parked but not deleted** during the private MVP phase.
- Do not let them block core product shaping right now.
- Do not put real personal health data into this repo anyway.
