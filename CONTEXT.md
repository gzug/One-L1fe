---
status: current
canonical_for: rolling session context
owner: repo
last_verified: 2026-04-21
scope: all-agents
---

# CONTEXT.md — Rolling Session Summary

Last 2–3 sessions. Hard cap: 60 lines. Updated every session by the closing agent.
For startup: read after CHECKPOINT.md. Never load memory/ or docs/archive/ at startup.

---

## 2026-04-21 — Claude Haiku (cleanup session)

- Repo cleanup: 11 stale branches deleted, issues #95/#94/#89 closed (duplicates/merged)
- Auto-delete branches on merge activated; AGENTS.md output standards added
- Open issues remaining: #88 (evidence → Priority Score), #69, #68 (backlog)
- Pending: `claude/real-app-install-id` intentionally held, not yet merged
- GitHub PAT setup for agent access; .env local only, gitignored

## 2026-04-20 — Claude Code (session 3)

- Merged PR #75 (memory-system-v2) and PR #82 (CHECKPOINT trim); ran audits H-2, H-4, H-6 — evidence registry provenance wired via `getRuleProvenance()` in `minimumSlice.ts`, doc links clean, Ferritin/Vit-D gap confirmed
- Task 1 — `apps/mobile/appInstallIdentity.ts`: AsyncStorage-backed persistent UUID replacing `MOCK_APP_INSTALL_ID`; branch `claude/real-app-install-id` pushed, PR pending
- Task 3a/3b — Vitamin D + Ferritin evidence seeds (2 sources, 4 rules SUP-001/SUP-002/CTX-001/CTX-002); migration `20260420091500`; merged as PR #90
- Observed merges during session: PR #91 (in-app dev insight interface), PR #86 (EAS sideload guide), PR #84 (TypeScript 5→6)
- GitHub MCP repeatedly disconnected/reconnected during session

## 2026-04-20 — Perplexity (session 2)

- Ran full session closeout audit: H-B migration ordering, H-C evidence registry consistency, H-D dead code check, H-E SQL constraint validation
- Migration order: 9 files, strictly ascending, no duplicates or gaps — PASS
- Evidence registry: all anchorSourceIds valid, all threshold rule IDs covered — PASS
- Dead code: `MOCK_APP_INSTALL_ID` still present in `WearableSyncScreen.tsx` — PR pending
- New migration `20260420091500` all constraint values PASS
