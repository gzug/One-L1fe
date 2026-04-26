# Prototype V1 - Marathon

Status: active prototype workspace on `main`.

This folder is the canonical workspace for the reduced marathon-readiness prototype.

## Purpose

Keep prototype-specific app code, docs, notes, and future variant work separated from the broader One L1fe app shell while working directly on `main`.

## Current product framing

- User-facing name: `Prototype V1 - Marathon`
- Platform focus: Android-first prototype
- Presentation goal: incubator/demo version focused on marathon preparation
- Product boundary: health/training data organization and coaching support, not diagnosis or treatment

## Scope

Included:

- Garmin / Android Health Connect demo path
- recovery and training signals
- biomarker context
- local notes / ideas
- Real Data vs Demo data distinction
- premium dark/apricot design direction
- future Coach / Next Steps area
- Nutrition visible as context/planned area, not scoring-active unless a justified data model exists

Excluded:

- Direct Garmin API
- Terra OAuth
- public store release flow
- medical advice
- fake live sync claims
- Nutrition influencing score without a validated model

## Current structure

```text
apps/mobile/prototypes/v1-marathon/
  README.md
  docs/
    product-strategy.md
  src/
    PrototypeV1MarathonScreen.tsx
    components/
      BloodMarkerCard.tsx
      CoachingCard.tsx
      DemoDataBadge.tsx
      NutritionContextCard.tsx
      ReadinessOrbit.tsx
      SignalCard.tsx
    data/
      copy.ts
      demoData.ts
    theme/
      marathonTheme.ts
```

## Folder rule

Future prototype versions should use sibling folders:

```text
apps/mobile/prototypes/v1-marathon/
apps/mobile/prototypes/v2-*/
apps/mobile/prototypes/v3-*/
```

Keep version-specific prototype work inside its folder unless app-shell wiring is explicitly needed.

## Migration note

The previous branch/path material is reference only. Future work should continue in this folder on `main` and stop relying on branch-routing as a normal workflow.

## First implementation priorities

1. Review and typecheck the scaffold.
2. Improve the home hierarchy and visual polish in small commits.
3. Wire `apps/mobile/App.tsx` to this prototype workspace only after the screen is present and typecheckable.
4. Keep old/full-app surfaces out of the active prototype path while this prototype is being built.

## Naming

Use exactly:

```text
Prototype V1 - Marathon
```

Avoid user-facing legacy labels:

- `Antler Health OS`
- `Marathon readiness`
- `Synthetic demo`
- `Demo Filled`

Preferred user-facing copy:

- `Demo data`
- `Demo value`
- `Needs attention`
- `Available`
- `Connected`
- `Not available`
