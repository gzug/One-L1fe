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

## 2026-05-01 — ChatGPT (agent efficiency docs cleanup)

- `AGENTS.md` now carries task-type routing so agents can jump directly to the right repo path.
- `README.md` was shortened into human/project orientation and no longer carries the deep docs index.
- `docs/README.md` now provides compact task-to-doc routing for deeper context.
- `CHECKPOINT.md` completed history was compacted into five recent items to avoid logbook drift.
- Historical root audit moved to `docs/archive/audits/`; root stays focused on active truth files.

## 2026-05-01 — ChatGPT (PR hygiene, CI, and dependency closeout)

- Verified active code no longer uses `MOCK_APP_INSTALL_ID` / `dev-install-001`; wearable provisioning uses real app install identity and old mock guard remains only as legacy protection.
- Local root and mobile TypeScript checks passed after dependency install.
- Closed stale broad PRs #99, #101, #105, and #108; preserved useful extraction work in issue #116.
- Merged PR #109 after green `CI` and `Supabase Validate`: `supabase/setup-cli@v2`, scoped Android resource hygiene exception, optional hygiene roots, and linked Supabase lint limited to `public` schema.
- Next: do Device QA separately, then start #116 as a fresh domain-only code session.

## 2026-05-01 — ChatGPT (repo truth alignment cleanup)

- Merged PR #115: active app truth aligned to v2 across startup docs.
- `v1-marathon` is the previous Marathon-focused snapshot; not the active runtime entry.
- Removed stale competing truth sources, archived scratch memory, simplified closeout rules, and marked old audit material historical.
- `MEMORY.md` startup-rule duplication was removed on `main` in follow-up commit `9eac3da`.
- No app code changed in the truth-source cleanup.
