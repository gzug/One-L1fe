# Repo Structure

## Target Structure

This tree shows the intended long-term layout. The actual repo also contains paths listed in the Folder Roles section below.

```text
One-L1fe/
├── apps/
│   └── mobile/
├── packages/
│   └── domain/
├── src/
│   └── lib/
│       └── wearables/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
├── docs/
│   ├── architecture/
│   ├── compliance/
│   ├── planning/
│   ├── roadmap/
│   ├── research/
│   └── ops/
├── scripts/
├── memory/
├── CHECKPOINT.md
├── MEMORY.md
├── GLOSSARY.md
└── AGENTS.md
```

## Folder Roles

### `apps/mobile`
Home of the React Native / Expo application.

Put here:
- screens, navigation, app state
- UI components that are app-specific
- platform configuration (`app.json`, `.env.example`)

Do not put core biomarker rules here if they are needed elsewhere.

### `packages/domain`
Home of product-domain logic.

Put here:
- biomarker definitions, units, validation schemas
- derived-metric helpers, recommendation contracts
- shared TypeScript types

### `src/lib`
Home of shared client-side library code not tied to a specific app or platform.

Currently contains:
- `wearables/` — `metricRegistry`, `syncContract`, `syncClient`

### `supabase`
Home of backend state and server-side execution.

Put here:
- SQL migrations, edge functions
- local seed helpers, backend configuration

### `docs/`
Home of all documentation.

- `architecture/` — system shape and engineering decisions
- `compliance/` — health-adjacent boundary docs
- `planning/` — active task lists, PR sequences, backlogs
- `roadmap/` — phased execution order
- `research/` — evidence and source analysis
- `ops/` — operational runbooks

### `scripts/`
Home of build, deploy, and maintenance scripts.

### `memory/`
Home of short-term agent context files (daily notes, session state).

### Root files
- `CHECKPOINT.md` — canonical current state; read first before any repo work
- `MEMORY.md` — durable decisions and invariants
- `GLOSSARY.md` — term meanings
- `AGENTS.md` — agent operating rules

## Working Rule

If a concept is:
- UI-only → `apps/mobile`
- domain-critical → `packages/domain`
- shared client library → `src/lib`
- persistence or secret-bearing → `supabase`
- explanatory or planning-oriented → `docs/`
- build or deploy tooling → `scripts/`
