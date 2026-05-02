---
status: current
canonical_for: rolling session context
owner: repo
last_verified: 2026-05-02
scope: all-agents
---

# CONTEXT.md — Rolling Session Summary

Last 2–3 sessions. Hard cap: 60 lines. Max 5 bullets per entry. Updated every session by the closing agent.
For startup: read after CHECKPOINT.md. Never load memory/ or docs/archive/ at startup.

---

## 2026-05-02 — Codex (v2 Home redesign closeout)

- Active app path still runs through `apps/mobile/App.tsx -> apps/mobile/prototypes/v2/src/OneL1feV2Screen.tsx`; v2 Home ownership is now separate from the legacy v1 ThemeProvider boundary.
- The active v2 Home was redesigned into a score-first structure with a persistent header, Demo/User Data mode, global time range plus local Custom range picker, multi-ring One L1fe Score, contributor legend, separate score trend, Recovery/Activity metric cards, Health Inputs, Nutrition Hub, Notes & Ideas, source status, safety note, and bottom nav with Home/Trends/Insights/Profile.
- New v2-local files under `apps/mobile/prototypes/v2/src/data/` now provide a `HomeDisplayData` adapter boundary for mode, time range/custom range, contributor groups, score trend, metric chart data, Health Inputs, and Nutrition Hub so `HomeScreen` mostly renders display data instead of shaping it inline.
- Legacy Blood Results and Profile stay on the existing v1 screens; Blood Markers CTA still opens Blood Results, Profile stays reachable from the bottom nav, and Trends/Insights remain lightweight placeholders.
- No `package.json`, `apps/mobile/package.json`, `packages/domain/`, active entry, navigation library, detail screen, or runtime scoring changes were introduced; `npm run typecheck`, `npm run typecheck:mobile`, `npm run test:domain`, and Android dev run/QA on `Pixel_9_Pro` passed.
