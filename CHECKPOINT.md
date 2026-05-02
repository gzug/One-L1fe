---
status: current
canonical_for: current execution state
owner: repo
last_verified: 2026-05-02
supersedes: []
superseded_by: null
scope: repo
---

# CHECKPOINT.md

## Current facts

- Stable branch: `main`.
- Active mobile app: **One L1fe v2 prototype**.
- Canonical app entry: `apps/mobile/App.tsx -> apps/mobile/prototypes/v2/src/OneL1feV2Screen.tsx`.
- v2 code lives under `apps/mobile/prototypes/v2/src/`; `v1-marathon/` remains the previous Marathon snapshot.
- v2 bottom nav: Home, Trends, Insights, Profile.
- Home and Trends are live; Insights is a placeholder; Profile uses the legacy Profile screen.
- Home display data is centralized in `homeDataAdapter.ts` / `homeTypes.ts`; adapter guardrail tests are merged.
- Trends uses existing `HomeDisplayData` only: Score, Recovery, Sleep, HRV, Resting HR, Activity, Steps, Training, Calories.
- Home and Trends currently consume adapter data independently; cross-tab mode/range sync is a follow-up only if QA shows confusion.
- Health Connect is foreground display-only: no background sync, no Supabase write, no score recomputation.
- App config: `apps/mobile/app.json`; Expo `0.2.2`, Android `versionCode: 4`, `minSdkVersion: 26`.
- CI is green on latest `main`.

## Run

```bash
cd apps/mobile
npx expo start --clear
# or: npx expo run:android
```

## Working rules

- Keep `One L1fe` as canonical app name; keep `v2` visually secondary.
- Keep v1 Marathon stable unless explicitly fixing that snapshot.
- Fork v1 components into v2 before changing v2-specific behavior.
- Keep demo data labelled and User Data empty states honest.
- Keep product framing bounded: no diagnosis, treatment, emergency triage, or clinical-risk-score claim.
- Do not commit secrets or local build artifacts.
- Do not delete full-app/auth/backend files without import/reference audit.

## Current blockers

- Physical OnePlus-class Android device QA not yet run.
- Full-app shell files not yet reference-audited for safe deletion.
- Native Android version values drift from `app.json` unless regenerated intentionally.

## Next steps

1. Run Android QA for Home + Trends on emulator and, if possible, physical OnePlus-class device.
2. Fix only small QA defects: clipped text, hidden controls, broken charts, touch targets.
3. If QA shows cross-tab confusion, add a minimal shared mode/range sync layer.
4. Extract pure Dot/Score domain work from issue #116 in an isolated branch with no UI changes.
5. Start Blood Intake / Scanner research as a requirements doc/issue, not code.
