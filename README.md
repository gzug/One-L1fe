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

- Stable branch: `main`.
- Active mobile app: **One L1fe v2 prototype**.
- Active app entry: `apps/mobile/App.tsx -> apps/mobile/prototypes/v2/src/OneL1feV2Screen.tsx`.
- Previous snapshot: `apps/mobile/prototypes/v1-marathon/`.
- Historical full-app/auth shell may be reused later, but is not the active app surface.

Current execution state lives in [`CHECKPOINT.md`](./CHECKPOINT.md).

## Agent startup

Do not use this README as startup context.

Agents should use:

1. [`AGENTS.md`](./AGENTS.md) — rules and task routing
2. [`CHECKPOINT.md`](./CHECKPOINT.md) — current execution truth
3. [`CONTEXT.md`](./CONTEXT.md) — rolling recent-session context
4. [`MEMORY.md`](./MEMORY.md) — only when durable boundaries or architecture rules are needed

For deeper docs routing, use [`docs/README.md`](./docs/README.md).

## Main paths

```text
apps/mobile/          React Native / Expo mobile app
packages/domain/      Shared domain logic, scoring, biomarkers, field state
supabase/             Database migrations, Edge Functions, local backend setup
docs/                 Architecture, planning, research, compliance, ops, archive
```

## Active mobile path

```text
apps/mobile/App.tsx
  -> apps/mobile/prototypes/v2/src/OneL1feV2Screen.tsx
```

Rules:

- Keep v2 product work in `apps/mobile/prototypes/v2/` unless app-shell wiring is explicitly needed.
- Keep `v1-marathon/` stable unless explicitly fixing that snapshot.
- v2 may temporarily import unchanged modules from `v1-marathon/`.
- Fork a component into v2 before changing v2-specific behavior.

## Local development

```bash
npm ci
npm run typecheck
npm run typecheck:mobile
npm run test:domain
```

Mobile app:

```bash
cd apps/mobile
npm install
npx expo start --clear
# or: npx expo run:android
```

## Working constraints

- Keep `main` stable.
- Use short-lived focused branches or PRs for non-trivial/reviewable changes.
- Let CI validate repo hygiene, typecheck, mobile export, and domain tests.
- Update the real source-of-truth file when behavior or rules change.
- Do not use stale branches or broad draft PRs as backlog.
- Treat compliance and business topics as parked, not deleted, during the private MVP phase.
- Keep product framing bounded: no diagnosis, treatment, emergency triage, or clinical-risk-score claim.
- Do not put real personal health data into this repo.
