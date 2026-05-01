# Prototype V1 - Marathon

Status: previous Marathon-focused snapshot. Not the active runtime entry.

This folder preserves the reduced marathon-readiness prototype as a reference snapshot.

The active mobile app is now:

```text
apps/mobile/App.tsx -> apps/mobile/prototypes/v2/src/OneL1feV2Screen.tsx
```

## Purpose

Keep the previous Marathon-specific app code, docs, notes, and UI modules available while v2 continues product buildout.

v2 may temporarily import unchanged modules from this folder. Before changing behavior for v2, copy the relevant file into `apps/mobile/prototypes/v2/` and update the v2 import.

## Current product framing

- User-facing snapshot name: `Prototype V1 - Marathon`
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

Future product work should not be added here unless explicitly fixing or preserving this snapshot.

Current product work belongs in:

```text
apps/mobile/prototypes/v2/
```

Keep version-specific prototype work inside its folder unless app-shell wiring is explicitly needed.

## Migration note

The previous branch/path material is reference only. Future work should continue in `v2/` on a focused branch or `main` as appropriate and stop relying on branch-routing as a normal workflow.

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
