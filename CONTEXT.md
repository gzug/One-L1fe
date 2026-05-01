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

## 2026-04-28 — ChatGPT (v2 promoted as active mobile app)

- `apps/mobile/App.tsx` now renders `OneL1feV2Screen` from `apps/mobile/prototypes/v2/`.
- `CHECKPOINT.md`, `MEMORY.md`, `apps/mobile/README.md`, and `apps/mobile/prototypes/README.md` describe v2 as the active app path.
- `apps/mobile/prototypes/v1-marathon/` remains as the previous Marathon-focused snapshot.
- v2 has its own root, header, copy, theme helpers, and README.
- Known blocker carried forward: Device QA still needs to run for active v2.
