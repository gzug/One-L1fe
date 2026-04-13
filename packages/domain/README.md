# packages/domain

Shared domain layer for One L1fe.

This package is the source of truth for:
- biomarker identifiers,
- units,
- reference-range metadata,
- category and evidence labels,
- shared scoring helpers,
- V1 runtime rule scaffolding,
- future validation and recommendation contracts.

## Why this exists

Without a domain layer, product rules get duplicated between the app, backend, and prompts. That becomes brittle fast.

## Current status

A first-pass canonical biomarker registry now exists in `biomarkers.ts`.

That means this package is no longer just a placeholder. It now provides:
- a typed biomarker registry,
- explicit categories (`core`, `supporting`, `contextual`),
- evidence levels,
- starter reference ranges,
- helper functions for canonical status and weighted scoring,
- a first V1 runtime bridge in `v1.ts` for interpretability, freshness, score-role, and ApoB-primary / LDL-fallback behavior,
- explicit marker threshold paths in `thresholds.ts`,
- a minimum-slice evaluator in `minimumSlice.ts`,
- deterministic fixtures in `fixtures.v1.ts`,
- assertion checks in `minimumSlice.assertions.ts`,
- backend-facing persistence contracts in `contracts.ts`,
- provisional provenance mapping in `provenance.ts`,
- backend persistence contracts in `contracts.ts`,
- Supabase-shape mapping in `supabasePayload.ts`,
- contract assertions in `contracts.assertions.ts`,
- Supabase payload assertions in `supabasePayload.assertions.ts`,
- a repository seam in `supabaseRepository.ts`,
- repository re-run assertions in `supabaseRepository.assertions.ts`,
- and executable TypeScript build/test entrypoints via the repo root scripts.

## Important constraint

This package is a **product domain baseline**, not a medical decision engine.
Keep recommendation language bounded and keep diagnosis/treatment logic out of this layer.

## Recommended next additions

- validation schemas,
- recommendation contracts shared across app and backend boundaries,
- evidence metadata contracts,
- import/export types shared between mobile and backend,
- richer scenario coverage beyond the current minimum-slice assertions,
- and a live backend entrypoint that calls the shared repository seam.
