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

The active focus is **Prototype V1 - Marathon** inside:

```text
apps/mobile/prototypes/v1-marathon/
```

The previous branch/path material is reference only. Do not continue branch-routing as the normal workflow.

The broader One L1fe app remains baseline context, but it is not the active demo surface while this prototype is being built.

## Current state

- Branch: `main`
- Active prototype workspace: `apps/mobile/prototypes/v1-marathon/`
- Active user-facing prototype name: `Prototype V1 - Marathon`
- Current prototype workspace doc: `apps/mobile/prototypes/v1-marathon/README.md`
- Product strategy doc: `apps/mobile/prototypes/v1-marathon/docs/product-strategy.md`
- Scaffold source root: `apps/mobile/prototypes/v1-marathon/src/`

## Completed in latest update

Batch A-lite scaffold is now in the repo on `main`:

- Added `src/PrototypeV1MarathonScreen.tsx`
- Added component scaffold: `ReadinessOrbit`, `SignalCard`, `CoachingCard`, `BloodMarkerCard`, `NutritionContextCard`, `DemoDataBadge`
- Added prototype data/copy/theme files: `demoData.ts`, `copy.ts`, `marathonTheme.ts`
- Added `docs/product-strategy.md`
- Updated prototype README with current structure

## Working rule

For prototype work:

- Work on `main`.
- Keep prototype-specific files under `apps/mobile/prototypes/v1-marathon/`.
- Future prototypes should use sibling folders such as `apps/mobile/prototypes/v2-*`.
- Do not scatter prototype-specific files across the full app shell unless wiring is explicitly needed.
- Do not touch Supabase for prototype UI batches unless explicitly requested.
- Demo data must stay visibly labelled.
- Nutrition remains context/planned only and must not affect score.
- No medical advice, diagnosis, treatment, or risk-score framing.

## Current blockers

- Local typecheck still needs to be rerun after pulling latest `main` and installing dependencies if needed.
- The active app shell is not yet wired to the new prototype workspace.
- The scaffold is functional structure, not final visual polish.

## Next steps

1. Pull latest `main` locally and run `npm install` at repo root or `npm --prefix apps/mobile install` if `tsc` is missing.
2. Run `npm --prefix apps/mobile run typecheck`.
3. Review the scaffold for obvious TS/import issues.
4. Batch B: improve home hierarchy, visual polish, score/orbit treatment, coaching layout, and Nutrition positioning.
5. Batch C: wire `apps/mobile/App.tsx` to the V1 Marathon prototype only after the screen typechecks.
6. Final review: naming, demo honesty, accessibility, safety copy, and Android presentation readiness.

## Deferred full-app baseline work

- Physical Garmin / Health Connect data source proof (WEARABLE-TD-001)
- End-to-end Supabase ingest proof on Android
- Wearable sync request contract hardening outside the prototype path
- Garmin Terra webhook / Terra OAuth pairing
