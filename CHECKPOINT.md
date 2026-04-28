---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-04-28
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Verdict

Work continues on `main` by default. For destructive cleanup, use a short-lived branch and merge only after validation.

Active mobile app: **Prototype V1 - Marathon**.

Canonical app entry:

```text
apps/mobile/App.tsx -> apps/mobile/prototypes/v1-marathon/src/PrototypeV1MarathonScreen.tsx
```

The previous authenticated minimum-slice/full-app shell is no longer the active app path.

## How to run

```bash
cd apps/mobile
npx expo start --clear
# or: npx expo run:android
```

No `.env.local` prototype gate is required for the active app path. `.env.prototype` is kept only as historical/build-context documentation until removed in a later cleanup pass.

## Current state

- Branch: `main` is stable; cleanup work happens on `cleanup/promote-marathon-v1-main` until merged.
- `App.tsx` renders `PrototypeV1MarathonScreen` directly.
- Prototype files stay under `apps/mobile/prototypes/v1-marathon/`.
- App version on `main`: `0.2.1`, Android `versionCode: 3`.
- Health Connect layer in `main`: permission/status only; no live record import, no Supabase write, no score recomputation.
- Latest known standalone APK fix: release APK must contain `assets/index.android.bundle`; debug APK without bundled JS caused remote red-screen failure.

## Completed

### Prototype V1 - Marathon

- Scaffold, demo data, copy, theme, home UI polish.
- Light/dark theme system and profile surface.
- Score trend card with tap/drag inspection.
- Blood context and comparison surfaces with neutral, non-diagnostic language.
- Connected sources card with Health Connect status handoff.
- Health Connect native plugin: manifest permissions, Health Connect provider query, permission rationale alias, permission delegate hook.
- Release/standalone APK path validated conceptually: use `app:assembleRelease`, not `assembleDebug`, for remote sideloading.

### Repo cleanup — in progress

- Marathon prototype is being promoted to the root mobile app.
- Full-app shell removal is intentionally staged, not broad-deleted.
- Supabase, `packages/domain`, compliance docs, and architecture docs remain source-of-truth for the later real-data/scoring path.

## Working rules

- `V1 — Marathon` and `One L1fe` are canonical UI strings.
- Demo data must stay visibly labelled where used.
- Health Connect claims must stay honest: permission/status or display-only foreground reads unless real ingest is implemented.
- No medical advice, diagnosis, treatment, emergency triage, or clinical-risk-score framing.
- Do not put raw personal health data, secrets, or local build artifacts into the repo.
- Do not commit generated `apps/mobile/android/*` changes unless intentionally accepting native project drift.

## Current blockers

- Typecheck/build not yet validated after root-app cleanup branch.
- Full-app shell files have not yet been reference-audited for safe deletion.
- Live Health Connect display work exists locally in the current chat flow but is not yet in this cleanup branch unless separately committed.

## Next steps

1. Validate cleanup branch locally: `npm --prefix apps/mobile run typecheck`.
2. Run Android build path for standalone APK: `cd apps/mobile/android && ./gradlew app:assembleRelease`.
3. Check APK bundle: `unzip -l app/build/outputs/apk/release/app-release.apk | grep assets/index.android.bundle`.
4. Audit old full-app files by import/reference before deletion.
5. After merge, update `CONTEXT.md` with the cleanup result.
