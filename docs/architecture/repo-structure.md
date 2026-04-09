# Repo Structure

## Target Structure

```text
One-L1fe/
├── apps/
│   └── mobile/
├── packages/
│   └── domain/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
├── docs/
│   ├── architecture/
│   ├── compliance/
│   └── roadmap/
├── MEMORY.md
├── GLOSSARY.md
└── AGENTS.md
```

## Folder Roles

### `apps/mobile`
Home of the React Native application.

Put here:
- screens,
- navigation,
- app state,
- UI components that are app-specific,
- platform configuration.

Do not put core biomarker rules here if they are needed elsewhere.

### `packages/domain`
Home of product-domain logic.

Put here:
- biomarker definitions,
- units,
- validation schemas,
- derived-metric helpers,
- recommendation contracts,
- shared TypeScript types.

### `supabase`
Home of backend state and server-side execution.

Put here:
- SQL migrations,
- edge functions,
- local seed helpers,
- backend configuration notes.

### `docs/architecture`
Home of system shape and engineering decisions.

### `docs/compliance`
Home of boundary docs that should exist, but should not dominate early build velocity.

### `docs/roadmap`
Home of phased execution order and delivery sequencing.

## Working Rule

If a concept is:
- UI-only, it belongs in `apps/mobile`
- domain-critical, it belongs in `packages/domain`
- persistence or secret-bearing, it belongs in `supabase`
- explanatory or planning-oriented, it belongs in `docs/`
