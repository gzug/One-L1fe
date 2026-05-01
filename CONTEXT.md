---
status: current
canonical_for: rolling session context
owner: repo
last_verified: 2026-05-01
scope: all-agents
---

# CONTEXT.md — Rolling Session Summary

Last 2–3 sessions. Hard cap: 60 lines. Max 5 bullets per entry. Updated every session by the closing agent.
For startup: read after CHECKPOINT.md. Never load memory/ or docs/archive/ at startup.

---

## 2026-05-01 — ChatGPT (repo truth alignment cleanup branch)

- Cleanup branch: `cleanup/repo-truth-alignment-v2`.
- Active app truth aligned to v2: `apps/mobile/App.tsx -> apps/mobile/prototypes/v2/src/OneL1feV2Screen.tsx`.
- `v1-marathon` is the previous Marathon-focused snapshot; not the active runtime entry.
- Cleanup target: remove stale competing truth sources, archive scratch memory, and simplify closeout rules.
- No app code changes in this cleanup branch.

## 2026-04-28 — ChatGPT (v2 promoted as active mobile app)

- `apps/mobile/App.tsx` now renders `OneL1feV2Screen` from `apps/mobile/prototypes/v2/`.
- `CHECKPOINT.md`, `MEMORY.md`, `apps/mobile/README.md`, and `apps/mobile/prototypes/README.md` describe v2 as the active app path.
- `apps/mobile/prototypes/v1-marathon/` remains as the previous Marathon-focused snapshot.
- v2 has its own root, header, copy, theme helpers, and README.
- Known blockers: typecheck/device QA still need to be run after the v2 path change.

## 2026-04-27 — ChatGPT/Claude (APK and Health Connect status)

- Debug APK caused remote red screen because `assets/index.android.bundle` was missing; release/standalone APK path must be used for sideloading.
- Valid standalone artifact pattern: `app:assembleRelease` and verify `unzip -l ... | grep assets/index.android.bundle`.
- Health Connect native manifest looks structurally correct: minSdk 26, targetSdk 35, health read permissions, provider query, permission rationale alias.
- Current main Health Connect behavior is permission/status/display-only; no background sync, no Supabase write, no score recomputation.
- Garmin/Google Fit data should route through Health Connect; direct Garmin/Fit integration is not active in v2.
