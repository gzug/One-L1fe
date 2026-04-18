---
status: current
canonical_for: repo layout
owner: repo
last_verified: 2026-04-18
scope: architecture
---

# Repo Structure

## Actual Structure (as of April 2026)

Real directory tree on `main`.

```text
One-L1fe/
├── apps/
│   └── mobile/                     # React Native / Expo app
├── packages/
│   └── domain/                     # Shared domain logic, types, schemas
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
├── src/
│   └── lib/
│       └── wearables/              # Wearables contracts, registry, sync client
├── docs/
│   ├── architecture/
│   ├── compliance/
│   ├── roadmap/
│   ├── ops/                        # Operational docs (openclaw, session workflow)
│   ├── planning/
│   ├── research/
│   ├── archive/
│   └── notion/
├── memory/                         # Short-term / daily agent memory files
├── scripts/                        # Build, deploy, smoke-test shell scripts
├── CHECKPOINT.md                   # Current state — source of truth for agent resets
├── MEMORY.md                       # Durable project truth
├── AGENTS.md                       # Agent operating rules
├── CONTRIBUTING.md
└── checkpoint.yaml
```

## Folder Roles

### `apps/mobile`
React Native application.
- Screens, navigation, app state
- UI components (app-specific)
- Platform configuration
- Mobile auth adapter (`mobileSupabaseAuth.ts`)

Do not put core biomarker rules here if they are needed elsewhere.

### `packages/domain`
Product-domain logic.
- Biomarker definitions, units, validation schemas
- Derived-metric helpers, recommendation contracts
- Shared TypeScript types

### `src/lib/wearables`
Wearables-layer contracts and clients (shared, not mobile-specific).
- Metric registry, sync contracts, sync client
- Types shared between mobile and edge functions

### `supabase`
Backend state and server-side execution.
- SQL migrations, edge functions, local seed helpers
- Backend configuration notes

### `memory/`
Short-term agent memory. Daily/session notes. Not durable truth — use `MEMORY.md` for that.

### `docs/`
All deeper reference docs. Read on demand only — do not load by default.
- `architecture/` — system shape and technical decisions
- `ops/` — OpenClaw and session workflow
- `planning/` — backlog and next work
- `compliance/` — intended-use and boundary docs
- `research/` — evidence and unresolved questions
- `archive/` — superseded docs kept for context
