---
status: current
canonical_for: rolling session context
owner: repo
last_verified: 2026-05-02
scope: all-agents
---

# CONTEXT.md — Rolling Session Summary

Last 2–3 sessions. Hard cap: 60 lines. Max 5 bullets per entry. Updated by closing agents.
For startup: read after CHECKPOINT.md. Never load `memory/` or `docs/archive/` at startup.

---

## 2026-05-02 — Codex (v2 Home + Trends)

- Active app path remains `apps/mobile/App.tsx -> apps/mobile/prototypes/v2/src/OneL1feV2Screen.tsx`; v2 Home is separated from the legacy v1 ThemeProvider boundary.
- Home is score-first: persistent header, Demo/User Data mode, global time range with Custom picker, multi-ring One L1fe Score, contributor legend, score trend, Recovery/Activity cards, Health Inputs, Nutrition Hub, Notes & Ideas, source status, safety note, and bottom nav.
- `homeDataAdapter.ts` / `homeTypes.ts` define the v2 `HomeDisplayData` boundary; guardrail tests cover demo/user data, time ranges, empty states, blood panel scoping, and future contributors.
- Trends MVP is live and uses existing `HomeDisplayData` only for Score, Recovery, Sleep, HRV, Resting HR, Activity, Steps, Training, and Calories; Insights remains a placeholder.
- No package, `packages/domain/`, active entry, navigation library, runtime scoring, or backend changes were introduced. CI is green; physical OnePlus-class QA is still pending.
