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
