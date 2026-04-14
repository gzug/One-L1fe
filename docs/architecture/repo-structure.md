# Repo Structure

## Actual Structure (as of April 2026)

This is the real directory tree on `main`. Kept in sync with actual repo state.

```text
One-L1fe/
├── apps/
│   └── mobile/                    # React Native / Expo app
├── packages/
│   └── domain/                    # Shared domain logic, types, schemas
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
├── src/
│   └── lib/
│       └── wearables/             # Wearables contracts, registry (syncClient pending PR #26)
├── docs/
│   ├── architecture/
│   ├── compliance/
│   ├── roadmap/
│   ├── ops/                       # Operational docs (openclaw, agent setup)
│   ├── planning/
│   ├── research/
│   ├── archive/
│   └── notion/
├── memory/                        # Short-term / daily agent memory files
├── scripts/                       # Build, deploy, smoke-test shell scripts
├── CHECKPOINT.md                  # Current state — source of truth for agent resets
├── MEMORY.md                      # Durable project truth
├── AGENTS.md                      # Agent operating rules
├── GLOSSARY.md
├── CONTRIBUTING.md
└── checkpoint.yaml
```

## Target Structure (aspirational)

The structure above is already close to the target. The main pending addition is:
- `apps/mobile/src/` — once the mobile codebase grows beyond flat-file layout

## Folder Roles

### `apps/mobile`
Home of the React Native application.

Put here:
- screens, navigation, app state
- UI components that are app-specific
- platform configuration
- mobile auth adapter (`mobileSupabaseAuth.ts`)

Do not put core biomarker rules here if they are needed elsewhere.

### `packages/domain`
Home of product-domain logic.

Put here:
- biomarker definitions, units, validation schemas
- derived-metric helpers, recommendation contracts
- shared TypeScript types

### `src/lib/wearables`
Home of wearables-layer contracts and clients (shared, not mobile-specific).

Put here:
- metric registry, sync contracts, sync client
- types shared between mobile and edge functions

### `supabase`
Home of backend state and server-side execution.

Put here:
- SQL migrations, edge functions, local seed helpers
- backend configuration notes

### `memory/`
Short-term agent memory. Daily/session notes. Not durable truth — use `MEMORY.md` for that.

### `scripts/`
Shell scripts for build, deploy, smoke-test, hygiene checks.

### `docs/ops/`
Operational docs: agent setup, OpenClaw config, deployment runbooks.

### `docs/architecture`
System shape and engineering decisions.

### `docs/compliance`
Boundary docs. Should exist, should not dominate early build velocity.

### `docs/roadmap`
Phased execution order and delivery sequencing.

## Working Rule

If a concept is:
- UI-only → `apps/mobile`
- domain-critical → `packages/domain`
- wearables contract/client → `src/lib/wearables`
- persistence or secret-bearing → `supabase`
- explanatory or planning-oriented → `docs/`
- current state / agent truth → `CHECKPOINT.md` + `MEMORY.md`
- short-term / daily notes → `memory/`
