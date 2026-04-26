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

## How to run

```bash
cd apps/mobile
cp .env.prototype .env.local
npx expo start --clear
# or: npx expo run:android
```

Remove `.env.local` to restore full app shell.

## Current state

- Branch: `main`
- Prototype wired via `EXPO_PUBLIC_PROTOTYPE_V1_MARATHON` gate in `App.tsx`
- Theme system active: light (default) / dark toggle, in-memory
- Local typecheck not yet confirmed in CI — expected 0 errors

## Completed

### Batch A-lite — scaffold
- Source structure, component scaffold, demoData, copy, theme, product-strategy.md

### Batch B — home UI polish
- ReadinessOrbit with ring + segment bars, section headers, status colour system

### Batch C — wire
- `App.tsx` env-flag gate, `.env.prototype`, `AppShell` preserved

### Batch D — visual QA and premium mobile polish
- maxWidth container, interpretation-led ReadinessOrbit, global DemoModeBanner,
  2-col blood grid, status-tinted SignalCards, priority-tinted CoachingCards

### Batch F1 — brand header + theme system + profile
- **ThemeContext**: `ThemeProvider` + `useTheme()`, light default, in-memory toggle
- **marathonTheme**: split into `darkColors` / `lightColors` + static tokens; legacy shim kept
- **AppHeader**: `One L1fe` (28px, accent) + `V1 — Marathon` (13px, muted); theme glyph (\u2600/\u25D0) + profile glyph (\u25A3) icon buttons
- **ProfileScreen**: 6 calm sections (Personal, Training goal, Training profile, Preferences, Connected sources, Sync status); all non-live values demo-labelled; no fake connected-source claims
- **All leaf components**: migrated to `useTheme()` + `createStyles(colors)` pattern; zero static `marathonTheme.colors` references
- **PrototypeV1MarathonScreen**: `ThemeProvider` root, `PrototypeShell` view-state (`home` / `profile`), `StatusBar` responds to theme scheme

## Working rules

- Work on `main`.
- Prototype files stay under `apps/mobile/prototypes/v1-marathon/`.
- No Supabase changes for prototype UI batches.
- Demo data must stay visibly labelled via `DemoModeBanner`.
- Nutrition is context/planned only, not scoring-active.
- No medical advice, diagnosis, treatment, or risk-score framing.
- `V1 — Marathon` and `One L1fe` are the canonical UI strings.

## Current blockers

- Local typecheck not yet confirmed. Run: `npm --prefix apps/mobile run typecheck`
- Not yet tested on physical Android device or emulator.

## Next steps

1. **Local validation**: `npm --prefix apps/mobile run typecheck` — expected 0 errors
2. **Android QA**: run with `.env.prototype`, check light/dark toggle, profile navigation, safe area, status bar colour
3. **Batch F2 — real data pass**: port Apr 2025 lab values into `demoData.ts`, verify demo flags
4. **Batch G — presentation prep**: prototype footer bar, final copy safety pass, screenshot/screen-record for stakeholder delivery
