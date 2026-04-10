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
- [docs/roadmap/phase-0.md](./docs/roadmap/phase-0.md)
- [docs/compliance/intended-use.md](./docs/compliance/intended-use.md)

## Phase 0 Status Checklist

- [x] Core repo memory established
- [x] Project glossary established
- [x] Agent operating guide established
- [x] Intended-use and compliance baseline documented
- [x] Architecture skeleton defined
- [ ] Biomarker canonical schema drafted
- [ ] Supabase schema drafted
- [ ] React Native scaffold prepared
- [ ] Auth flow defined
- [ ] Recommendation pipeline and evidence model defined
- [ ] Data governance details specified

## Working Constraint

- Treat compliance and business topics as **parked but not deleted** during the private MVP phase.
- Do not let them block core product shaping right now.
- Do not put real personal health data into this repo anyway.
