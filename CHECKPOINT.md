---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-04-26
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Verdict

Work continues directly on `main`.

The active focus is now **Prototype V1 - Marathon** inside the main repo workspace:

```text
apps/mobile/prototypes/v1-marathon/
```

The earlier branch `claude/antler-health-os-demo-O6PNI` is no longer the normal working path. Treat it only as a migration/source reference for useful prototype code and docs. Do not continue branch-routing as the default workflow.

The broader existing One L1fe app remains in the repo as baseline context, but it is not the active demo surface while this prototype is being built.

## Current state

- Branch: `main`
- Active prototype workspace: `apps/mobile/prototypes/v1-marathon/`
- Active user-facing prototype name: `Prototype V1 - Marathon`
- Current prototype workspace doc: `apps/mobile/prototypes/v1-marathon/README.md`
- Previous prototype source branch: `claude/antler-health-os-demo-O6PNI` — migration reference only

## Working rule

For prototype work:

- Work on `main`.
- Keep prototype-specific files under `apps/mobile/prototypes/v1-marathon/`.
- Future prototypes should use sibling folders such as `apps/mobile/prototypes/v2-*`.
- Do not scatter prototype-specific files across the full app shell unless wiring is explicitly needed.
- Keep the old/full-app surfaces out of the active prototype path while this prototype is being built.

## What changed in current repo-ops cleanup

- Removed the temporary `WORKSTREAMS.md` branch-routing approach.
- Restored README startup to direct `CHECKPOINT.md` / `CONTEXT.md` flow.
- Added `apps/mobile/prototypes/v1-marathon/README.md` as the canonical prototype workspace doc.
- README now documents `apps/mobile/prototypes/` as the place for versioned prototype work on `main`.

## Current blockers

- Useful Prototype V1 - Marathon code still needs to be migrated from `claude/antler-health-os-demo-O6PNI` into `apps/mobile/prototypes/v1-marathon/`.
- The large earlier screen file `AntlerHealthOsDemoScreen.tsx` should be split before major UI redesign.
- The active app shell is not yet wired to the new prototype workspace on `main`.
- Typecheck/build validation still required after migration.

## Next steps

1. Migrate the useful V1 Marathon prototype files from `claude/antler-health-os-demo-O6PNI` into `apps/mobile/prototypes/v1-marathon/` on `main`.
2. Split the large prototype screen into focused components before visual redesign.
3. Wire `apps/mobile/App.tsx` to the V1 Marathon prototype workspace only after files are present and typecheckable.
4. Keep the previous full-app flow inactive / out of the active prototype path while the prototype is being built.
5. Apply visual polish, home hierarchy, score-ring, coaching/next-steps, and Nutrition positioning in focused commits.
6. Run `npm --prefix apps/mobile run typecheck` and an Android build check when implementation files are migrated.

## Deferred full-app baseline work

- Physical Garmin / Health Connect data source proof (WEARABLE-TD-001)
- End-to-end Supabase ingest proof on Android
- Wearable sync request contract hardening outside the prototype path
- Garmin Terra webhook / Terra OAuth pairing
