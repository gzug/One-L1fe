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

## Current state

- Branch: `main`
- Active prototype workspace: `apps/mobile/prototypes/v1-marathon/`
- Active user-facing prototype name: `Prototype V1 - Marathon`
- Prototype is wired into `apps/mobile/App.tsx` via env-flag gate
- To activate: copy `.env.prototype` → `.env.local` and run `npx expo start --clear`

## Completed

### Batch A-lite — scaffold
- Added `src/PrototypeV1MarathonScreen.tsx`
- Component scaffold: `ReadinessOrbit`, `SignalCard`, `CoachingCard`, `BloodMarkerCard`, `NutritionContextCard`, `DemoDataBadge`
- Data/copy/theme files: `demoData.ts`, `copy.ts`, `marathonTheme.ts`
- `docs/product-strategy.md`

### Batch B — home UI polish
- **ReadinessOrbit**: score ring with glow/shadow, per-segment progress bars with distinct palette colors
- **PrototypeV1MarathonScreen**: accent-bar section headers (`SectionHeader`), breathing scroll padding, greeting hierarchy
- **SignalCard**: left color stripe per status, elevated value typography
- **BloodMarkerCard**: full status color system, colored status pills with bg tint
- **CoachingCard**: left accent stripe per priority, body indented and breathing
- **NutritionContextCard**: transparent bg + dashed border for locked feel, `Planned` pill
- **DemoDataBadge**: softer, less dominant
- **marathonTheme**: added `borderSubtle`, `demoBadge`, `*Soft`/`*Border` status variants, `progressTrack`, `segmentColors`, `lineHeights`
- **copy.ts**: greeting, section eyebrow keys

### Batch C — wire + App.tsx
- `apps/mobile/App.tsx`: env-flag gate at module top
  - `EXPO_PUBLIC_PROTOTYPE_V1_MARATHON=true` → renders `PrototypeV1MarathonScreen` directly (no auth, no nav)
  - All existing screens extracted into `AppShell` component — zero logic change
- `apps/mobile/.env.prototype`: ready-to-copy env file for prototype builds
- No Supabase changes. No existing screens deleted.

## Working rules

- Work on `main`.
- Prototype files stay under `apps/mobile/prototypes/v1-marathon/`.
- Future prototypes use `apps/mobile/prototypes/v2-*/`.
- No Supabase changes for prototype UI batches.
- Demo data must stay visibly labelled.
- Nutrition remains context/planned only, not scoring-active.
- No medical advice, diagnosis, treatment, or risk-score framing.

## How to run the prototype

```bash
cd apps/mobile
cp .env.prototype .env.local
npx expo start --clear
# or: npx expo run:android
```

To restore the full app shell: remove or rename `.env.local`.

## Current blockers

- Local typecheck not yet confirmed (no CI runner in this environment).
  Run: `npm --prefix apps/mobile run typecheck`
- Build not yet verified on physical Android device.

## Next steps

1. **Local validation**: `npm --prefix apps/mobile run typecheck` — expected 0 errors
2. **Batch D — Visual QA + polish**: Run on Android emulator, check ring glow, stripe colors, scroll feel, safe area, font weights. Fix any render issues.
3. **Batch E — Real data migration**: Port Apr 2025 lab values from `claude/antler-health-os-demo-O6PNI` into `demoData.ts`. Re-verify demo flags before surfacing.
4. **Batch F — Presentation prep**: Add prototype footer bar with name + date, final copy review, accessibility pass.
