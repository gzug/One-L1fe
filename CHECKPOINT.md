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

Active focus: **Prototype V1 - Marathon** — `apps/mobile/prototypes/v1-marathon/`

## How to run the prototype

```bash
cd apps/mobile
cp .env.prototype .env.local
npx expo start --clear
# or: npx expo run:android
```

Remove `.env.local` to restore the full app shell.

## Current state

- Branch: `main`
- Prototype wired in `apps/mobile/App.tsx` via `EXPO_PUBLIC_PROTOTYPE_V1_MARATHON` gate
- Visual polish complete (Batch D)
- Local typecheck not yet confirmed in CI — expected 0 errors

## Completed

### Batch A-lite — scaffold
- Source structure, component scaffold, demoData, copy, theme, product-strategy.md

### Batch B — home UI polish
- ReadinessOrbit with ring + segment bars
- Section headers with accent bar
- Status colour system across all cards
- NutritionContextCard locked/planned

### Batch C — wire
- `App.tsx` env-flag gate (PROTOTYPE_MODE)
- `.env.prototype` ready-to-copy file
- Existing app shell preserved as `AppShell` component — zero logic change

### Batch D — visual QA and premium mobile polish
- **Screen layout**: `maxWidth: 430` centered container for web/tablet safety; mobile-first primary target
- **Header**: `Prototype V1 — Marathon` as primary identity; `One L1fe` micro kicker above; greeting demoted to muted subtitle
- **DemoModeBanner**: new component — single global banner replaces per-card `DemoDataBadge` noise
- **ReadinessOrbit**: interpretation string (`Build carefully today.`) is now the primary claim; score demoted to 26px in compact 88px ring as supporting context; segments in a side-by-side layout with ring
- **SignalCard**: status-tinted bg per signal, status dot glyph, increased padding, quieter label uppercase
- **BloodMarkerCard**: 2-column `flexWrap` grid (compact premium), `flex: 1 / minWidth: 0` for equal columns, smaller status pill
- **CoachingCard**: priority-tinted background, stripe + tint reinforce coaching priority without extra visual weight
- **NutritionContextCard**: lock glyph, `Coming in a future release.` note, fully muted palette
- **marathonTheme**: added `layout` (maxWidth, screenPaddingH), `coachPrimaryTint/coachSupportTint/coachContextTint`, `positiveTint/warningTint`, `heroName/heroInterpretation` typography, `heroInterpretation` lineHeight, `surfaceTinted`, `xxxl` spacing
- **copy.ts**: added `readinessInterpretation`, `readinessInterpretationSub`, `readinessScoreContext`, `demoModeBanner`, `nutritionLockNote`, `signalGlyphs`
- **New file**: `src/components/DemoModeBanner.tsx`

## Working rules

- Work on `main`.
- Prototype files stay under `apps/mobile/prototypes/v1-marathon/`.
- Future prototypes use `apps/mobile/prototypes/v2-*/`.
- No Supabase changes for prototype UI batches.
- Demo data must stay visibly labelled (via DemoModeBanner).
- Nutrition remains context/planned only, not scoring-active.
- No medical advice, diagnosis, treatment, or risk-score framing.

## Current blockers

- Local typecheck not yet confirmed. Run: `npm --prefix apps/mobile run typecheck`
- Not yet tested on physical Android device or emulator.

## Next steps

1. **Local validation**: `npm --prefix apps/mobile run typecheck` — expected 0 errors
2. **Android QA run**: `npx expo run:android` with `.env.prototype` active — check ring glow, grid layout, safe area, scroll
3. **Batch E — Real data migration**: Port Apr 2025 lab values from `claude/antler-health-os-demo-O6PNI` into `demoData.ts`. Verify demo flags before surfacing.
4. **Batch F — Presentation prep**: Prototype footer bar (name + date), final copy review, accessibility check, screenshot for stakeholder delivery.
