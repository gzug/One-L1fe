# Mobile prototypes

## Active workspace

`v2/` is the active mobile app workspace.

Current app entry:

```text
apps/mobile/App.tsx -> apps/mobile/prototypes/v2/src/OneL1feV2Screen.tsx
```

All current product work should happen in `v2/`.

## Archived snapshot

`v1-marathon/` is an archived Marathon-focused snapshot.

Do not add new product work there. Do not use it as a runtime entry. It may remain in place while v2 still imports unchanged modules from it.

Rule: before changing behavior for v2, fork the relevant file into `v2/` and update the v2 import.

## Future physical archive

Move `v1-marathon/` to `archive/v1-marathon/` only after v2 no longer imports from it and TypeScript passes.

Target later structure:

```text
apps/mobile/prototypes/
├─ v2/
└─ archive/
   └─ v1-marathon/
```
