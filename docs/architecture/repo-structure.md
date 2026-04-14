# Repo Structure

## Actual structure (verified 2026-04-14)

```text
One-L1fe/
├── apps/
│   └── mobile/               # React Native / Expo app
├── packages/
│   └── domain/               # shared domain logic, biomarker rules, TS types
├── supabase/
│   ├── migrations/           # SQL migration files (source of truth)
│   ├── functions/            # Edge Functions source
│   └── seed/                 # local seed helpers
├── src/                      # root-level TS entry points (domain runner, scripts)
├── scripts/                  # bash scripts: deploy, smoke-test, hygiene, domain-prepare
├── docs/
│   ├── architecture/         # system shape, engineering decisions, schema docs
│   ├── compliance/           # boundary docs: intended-use, data-handling
│   ├── roadmap/              # phased execution, delivery sequencing, checkpoint archive
│   ├── ops/                  # operational guides: OpenClaw, supabase workflow
│   ├── planning/             # planning docs
│   ├── research/             # research notes
│   ├── notion/               # Notion-exported or synced docs
│   └── archive/              # superseded or retired docs
├── memory/                   # short-term session notes, daily continuity
├── CHECKPOINT.md             # current execution state (session startup)
├── checkpoint.yaml           # machine-readable checkpoint summary
├── MEMORY.md                 # durable project assumptions
├── AGENTS.md                 # agent working rules
├── GLOSSARY.md               # term definitions
├── CONTRIBUTING.md
├── README.md
├── package.json              # root workspace
├── tsconfig.json
├── .github/
│   └── workflows/ci.yml
├── .editorconfig
├── .gitattributes
└── .gitignore
```

## Folder Roles

### `apps/mobile`
Home of the React Native / Expo application.

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

**Important:** Every migration applied to the hosted Supabase project MUST exist in `supabase/migrations/` as a committed file. Migrations applied manually via `supabase db push` without a corresponding committed file create silent drift that survives until a reset or new team member.

### `src`
Root-level TypeScript entry points for domain runner and scripts.

### `scripts`
Bash scripts for: deploy, smoke-test, repo hygiene check, domain-prepare.

### `memory`
Short-term session notes and daily continuity. Not durable truth.
Promote to `CHECKPOINT.md` (current truth) or `MEMORY.md` (durable truth) when ready.

### `docs/architecture`
Home of system shape and engineering decisions.

### `docs/compliance`
Home of boundary docs that should exist, but should not dominate early build velocity.

### `docs/roadmap`
Home of phased execution order and delivery sequencing.

### `docs/ops`
Operational guides: OpenClaw startup order, Supabase workflow.

## Working Rule

If a concept is:
- UI-only, it belongs in `apps/mobile`
- domain-critical, it belongs in `packages/domain`
- persistence or secret-bearing, it belongs in `supabase`
- explanatory or planning-oriented, it belongs in `docs/`
- short-term session continuity, it belongs in `memory/`
- durable project assumption, it belongs in `MEMORY.md`
- current execution state, it belongs in `CHECKPOINT.md`
