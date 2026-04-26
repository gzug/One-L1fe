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
- Theme system: light (default) / dark, in-memory toggle
- `@expo/vector-icons` (Ionicons) in use for all icons
- Local typecheck not yet confirmed in CI — expected 0 errors

## Completed

### Batch A-lite — scaffold
Source structure, component scaffold, demoData, copy, theme.

### Batch B — home UI polish
ReadinessOrbit ring + segments, section headers, status color system.

### Batch C — wire
`App.tsx` env-flag gate, `.env.prototype`, `AppShell` preserved.

### Batch D — visual QA and premium mobile polish
maxWidth container, interpretation-led ReadinessOrbit, global DemoModeBanner,
2-col blood grid, status-tinted SignalCards, priority-tinted CoachingCards.

### Batch F1 — brand header + theme system + profile
ThemeProvider + useTheme(), light default, AppHeader with brand identity,
ProfileScreen with 6 sections, all leaf components migrated to createStyles(colors).

### Batch F2 — refine brand, theme, profile, home clarity
- **Theme**: removed blue from all segment/data colors (warm taupe `#C4A882` replaces `#7FAFD4`); deepened dark bg to `#0E0D0B`; added `ringTrack`/`ringProgress` tokens; warm linen light palette unchanged
- **demoData**: Markus Sommer profile; Brisbane Marathon Jun 07 2026; `connectedSources` with honest action states; `bloodPanelCount = 2`; `Data coverage` removed as bar — now inline text; `Mental load` replaces it in segments; `panelNote` per blood marker
- **ReadinessOrbit**: real progress ring via rotation/clip technique (no SVG, no deps); data coverage as inline text note below segments
- **AppHeader**: Ionicons `sunny-outline`/`moon-outline`/`person-circle-outline` replace Unicode glyphs
- **ProfileScreen**: Gender (not Sex); Brisbane race; trimmed field set (13 useful fields); Edit mode toggle with `pencil-outline` per editable field; Connected sources with action buttons (`link-outline`, `settings-outline`, `cloud-upload-outline`); back chevron with `chevron-back`
- **BloodMarkerCard**: `panelNote` shown below date; status label changed from `Needs attention` to `Review`
- **PrototypeV1MarathonScreen**: greeting removed; panel count inline with Blood context section header; home feels like preview, not dashboard

## Working rules

- Work on `main`.
- Prototype files stay under `apps/mobile/prototypes/v1-marathon/`.
- No Supabase changes for prototype UI batches.
- Demo data stays visibly labelled.
- Nutrition is context/planned only.
- No medical advice, diagnosis, treatment, or risk-score framing.
- `V1 — Marathon` and `One L1fe` are the canonical UI strings.

## Current blockers

- Local typecheck not yet confirmed. Run: `npm --prefix apps/mobile run typecheck`
- Progress ring rendering needs Android QA (rotation/clip may need tuning).

## Next steps

1. **Local validation**: `npm --prefix apps/mobile run typecheck`
2. **Android QA**: check progress ring, Ionicons render, light/dark toggle, Edit mode, source action buttons
3. **Batch G — presentation prep**: prototype footer, final copy pass, screenshot/screen-record
4. **Batch H — detail surfaces**: signal detail, blood marker history stub, coaching detail
