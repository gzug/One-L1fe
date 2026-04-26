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

## Completed

### Batch A-lite — scaffold
- Added `src/PrototypeV1MarathonScreen.tsx`
- Added component scaffold: `ReadinessOrbit`, `SignalCard`, `CoachingCard`, `BloodMarkerCard`, `NutritionContextCard`, `DemoDataBadge`
- Added prototype data/copy/theme files: `demoData.ts`, `copy.ts`, `marathonTheme.ts`
- Added `docs/product-strategy.md`
- Updated prototype README with current structure

### Batch B — home UI polish
- **ReadinessOrbit**: score ring with glow/shadow, per-segment progress bars with distinct colors, cleaner layout
- **PrototypeV1MarathonScreen**: accent-bar section headers (`SectionHeader`), breathing scroll padding, `appName` kicker + greeting hierarchy, demo badge in header
- **SignalCard**: left color stripe per status, elevated value typography, label/value vertical stack
- **BloodMarkerCard**: full status color system (positive/warning/subtle), colored status pills with bg tint, list layout replacing fragile minWidth grid
- **CoachingCard**: left accent stripe per priority, index inline with title, body indented and breathing
- **NutritionContextCard**: transparent bg + dashed border for locked feel, `Planned` pill, fully muted palette
- **DemoDataBadge**: softer opacity, less dominant — present but not distracting
- **marathonTheme**: added `borderSubtle`, `demoBadge`/`demoBadgeBorder`, `*Soft`/`*Border` variants for status colors, `progressTrack`, `segmentColors`, `bodySmall`, `micro`, `lineHeights`
- **copy.ts**: added `greeting`, section eyebrow keys, `prototypeName`

## Working rules

- Work on `main`.
- Keep prototype-specific files under `apps/mobile/prototypes/v1-marathon/`.
- Future prototypes use sibling folders `apps/mobile/prototypes/v2-*`.
- Do not scatter prototype-specific files across the full app shell unless wiring is explicitly needed.
- Do not touch Supabase for prototype UI batches unless explicitly requested.
- Demo data must stay visibly labelled.
- Nutrition remains context/planned only and must not affect score.
- No medical advice, diagnosis, treatment, or risk-score framing.

## Current blockers

- `apps/mobile/App.tsx` is not yet wired to the prototype — screen is not visible in a live build.
- Typecheck has not been run in CI — pending Batch C local run.

## Next steps

1. **Batch C — Wire + typecheck**: Update `apps/mobile/App.tsx` to render `PrototypeV1MarathonScreen`. Run `npm --prefix apps/mobile run typecheck`. Fix any type errors. Commit.
2. **Batch D — Visual polish pass**: Animated score ring mount, micro-interactions, final spacing QA on a real Android device or emulator.
3. **Batch E — Real data migration**: Port Apr 2025 lab panel values from `claude/antler-health-os-demo-O6PNI` branch into `demoData.ts` (they were demo-flagged there; re-verify before surfacing as `isDemo: false`).
