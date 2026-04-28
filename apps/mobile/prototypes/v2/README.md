# One L1fe v2

Status: active prototype workspace.

This folder is the working path for the next One L1fe prototype level after `v1-marathon`.

## Purpose

- Keep `v1-marathon` as the previous Marathon-focused snapshot.
- Continue product buildout in a separate v2 workspace.
- Prepare the app for private live use by the owner and brother.
- Keep user-facing framing broad: `One L1fe`, with a small low-emphasis `v2` marker.

## Current implementation strategy

v2 has its own root screen, copy, and header.

Unchanged UI modules may still be imported from `../v1-marathon/src/*` until they need v2-specific changes. When a module changes for v2, copy it into this folder first and update imports.

This avoids a noisy full-folder copy while still giving v2 a clear active path.

## Active entry

```text
apps/mobile/App.tsx -> apps/mobile/prototypes/v2/src/OneL1feV2Screen.tsx
```

## Product boundaries

- Not diagnostic.
- Not treatment.
- Not emergency triage.
- No score recomputation from Health Connect until explicitly implemented and validated.
- Imported or scanned blood values must be user-reviewed before saving or scoring.

## Next buildout direction

1. Device QA on Android.
2. Local realism: persistent profile, notes, and editable blood panels.
3. Blood intake pipeline: manual entry first, then PDF/image/scan upload.
4. Health Connect real-data integration only after display + consent + fallback rules are stable.
