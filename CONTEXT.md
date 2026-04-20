---
status: current
canonical_for: rolling session context
owner: repo
last_verified: 2026-04-20
scope: all-agents
---

# CONTEXT.md — Rolling Session Summary

Last 2–3 sessions. Hard cap: 60 lines. Updated every session by the closing agent.
For startup: read after CHECKPOINT.md. Never load memory/ or docs/archive/ at startup.

---

## 2026-04-20 — Claude Code (session 3)

- Merged PR #75 (memory-system-v2) and PR #82 (CHECKPOINT trim); ran audits H-2, H-4, H-6 — evidence registry provenance wired via `getRuleProvenance()` in `minimumSlice.ts`, doc links clean, Ferritin/Vit-D gap confirmed
- Task 1 — `apps/mobile/appInstallIdentity.ts`: AsyncStorage-backed persistent UUID replacing `MOCK_APP_INSTALL_ID`; branch `claude/real-app-install-id` pushed, PR pending
- Task 3a/3b — Vitamin D + Ferritin evidence seeds (2 sources, 4 rules SUP-001/SUP-002/CTX-001/CTX-002); migration `20260420091500`; merged as PR #90
- Observed merges during session: PR #91 (in-app dev insight interface — supersedes T-3 from this session's plan), PR #86 (EAS sideload guide — supersedes U-5), PR #84 (TypeScript 5→6)
- GitHub MCP repeatedly disconnected/reconnected; PR creation for remaining branch requires manual browser action

## 2026-04-20 — Perplexity (session 2)

- Ran full session closeout audit: H-B migration ordering, H-C evidence registry consistency, H-D dead code check, H-E SQL constraint validation
- Migration order: 9 files, strictly ascending, no duplicates or gaps — PASS
- Evidence registry: all anchorSourceIds valid, all threshold rule IDs covered — PASS; CTX-001/CTX-002 have no evaluate*() in thresholds.ts (expected, draft/context-only)
- Dead code: `MOCK_APP_INSTALL_ID = 'dev-install-001'` still present in `WearableSyncScreen.tsx` — PR `claude/real-app-install-id` pending merge
- New migration `20260420091500` all constraint values PASS (source_type, bio_class, authority, bucket, origin, product_class)

## 2026-04-20 — Perplexity (session 1)

- Introduced memory-system-v2: CONTEXT.md, daily note full lifecycle, promotion rules, 7-step session-end checklist, universal closeout command
- Archived memory/2026-04-17.md to docs/archive/memory/
- Defined no-local-memory-layer rule: repo is sole source of truth
- Daily notes are scratch-only — archived end of session, never loaded at agent startup
- Deferred: CONTEXT.md entry for 2026-04-18 session (user to provide Claude task summary to backfill)
