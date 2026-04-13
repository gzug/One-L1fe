# MEMORY.md

Project long-term operating memory for **One L1fe (OL)**.

Important: this file stores project memory, not personal health records. Do not place raw user health data, lab reports, or personally identifiable medical information here.

---

## Durable product boundary

- One L1fe is a wellness and self-tracking product, not a diagnostic or treatment system.
- Recommendations must stay bounded, uncertainty-aware, and within the intended-use boundary.
- Severity, coverage, freshness, and recommendation eligibility must stay distinct.

## Durable architecture posture

- Keep Notion out of hidden runtime logic.
- Keep core health/domain logic in shared domain/backend code.
- Keep ApoB primary and LDL fallback/secondary.
- Keep weak/contextual markers out of the hard core score unless clearly justified.
- Keep the Priority Score framed as a bounded prioritization aid, not a clinical risk score.

## Current implementation checkpoint

- The repo already has the V1 minimum-slice domain evaluator.
- The repo already has evidence-registry structures and Supabase seed/upsert generation.
- The repo now also has the minimum-slice persistence path end to end inside the shared TypeScript layer:
  - `packages/domain/minimumSlice.ts`
  - `packages/domain/contracts.ts`
  - `packages/domain/supabasePayload.ts`
  - `packages/domain/supabasePersistence.ts`
  - `packages/domain/supabaseRepository.ts`
- Idempotent re-run coverage now exists for repeated repository saves against the same external ids.
- Recent verification passed:
  - `npm run typecheck`
  - `npm run test:domain`

## Current next step

Expose the repository seam through a real Supabase edge function or a live server-side Supabase client integration.

## Startup rule

This file should stay compact.
Use `CHECKPOINT.md` for fresh-session startup.
Store detailed chronological history under `docs/roadmap/checkpoints/`, not here.

## History archive

Older detailed memory was archived to:
- `docs/roadmap/checkpoints/2026-04-13-pre-compact-memory.md`
