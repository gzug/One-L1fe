---
status: current
canonical_for: rolling session context
owner: repo
last_verified: 2026-04-28
scope: all-agents
---

# CONTEXT.md — Rolling Session Summary

Last 2–3 sessions. Hard cap: 60 lines. Max 5 bullets per entry. Updated every session by the closing agent.
For startup: read after CHECKPOINT.md. Never load memory/ or docs/archive/ at startup.

---

## 2026-04-28 — ChatGPT (Marathon prototype promoted to root app — cleanup branch)

- Cleanup branch: `cleanup/promote-marathon-v1-main`
- `apps/mobile/App.tsx` now renders `PrototypeV1MarathonScreen` directly; env prototype gate/full-app fallback removed from active path
- `CHECKPOINT.md` updated: Marathon V1 is canonical mobile app; old authenticated minimum-slice shell is no longer active
- No broad deletion yet: old full-app files require reference audit before removal; Supabase/domain/compliance docs remain retained
- Known local parallel work from chat: Health Connect foreground display reader/card exists locally but is not part of this cleanup branch unless committed separately

## 2026-04-27 — ChatGPT/Claude (APK and Health Connect status)

- Debug APK caused remote red screen because `assets/index.android.bundle` was missing; release/standalone APK path must be used for brother sideloading
- Valid standalone artifact pattern: `app:assembleRelease` and verify `unzip -l ... | grep assets/index.android.bundle`
- Health Connect native manifest looks structurally correct: minSdk 26, targetSdk 35, health read permissions, provider query, permission rationale alias
- Current main Health Connect behavior is permission/status only; no real record import, no Supabase write, no score recomputation
- Garmin/Google Fit data should route through Health Connect; direct Garmin/Fit integration is not active in V1

## 2026-04-24 — Perplexity (repo cleanup — Block 1)

- Merged PR #106: aligned AGENTS.md, session-workflow, openclaw, README with memory-system-v2
- AGENTS.md now has explicit 5-line default startup rule (CHECKPOINT → CONTEXT → MEMORY on demand)
- session-workflow.md updated to v2 4-layer model; Daily Notes removed as startup context
- openclaw.md reduced to addendum; delegates general rules to AGENTS + v2
- README "Start here" now says "agentic repo work" and includes CONTEXT.md in startup order
