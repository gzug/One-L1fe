# One L1fe

One L1fe (OL) is a personal health-tracking project focused on wellness, self-tracking, and pattern detection, with a long-term goal of building a useful Digital Avatar from longitudinal data.

## Repo Overview

| Repo / Workspace | Role | Notes |
| --- | --- | --- |
| `One-L1fe` | Product repo | Product docs, compliance baseline, app implementation, schemas, and user-facing logic. |
| `One-L1fe-Ops` | Agent ops workspace | Operational memory, automations, runbooks, prompts, and agent workflow infrastructure. |

## Tech Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Mobile App | React Native | Primary application client. |
| Backend | Supabase | Database, auth, storage, and backend services. |
| AI Layer | OpenAI API | Model access for assistant and reasoning features. |
| Agent Runtime | OpenClaw 4.9 | Local development and operational agent workflows. |
| Source Control | GitHub | Remote hosting and collaboration. |

## Core Project Docs

- [MEMORY.md](./MEMORY.md)
- [GLOSSARY.md](./GLOSSARY.md)
- [AGENTS.md](./AGENTS.md)
- [docs/compliance/intended-use.md](./docs/compliance/intended-use.md)

## Phase 0 Status Checklist

- [x] Core repo memory established
- [x] Project glossary established
- [x] Agent operating guide established
- [x] Intended-use and compliance baseline documented
- [ ] Product architecture skeleton defined
- [ ] Supabase schema drafted
- [ ] React Native scaffold prepared
- [ ] Recommendation pipeline and evidence model defined
- [ ] Data governance and consent flow specified

## Working Constraint

Until the data-governance layer is explicit, do not place real personal health data in this repo.
