# packages/domain

Shared domain layer for One L1fe.

This package is the source of truth for:
- biomarker identifiers,
- units,
- reference-range metadata,
- category and evidence labels,
- shared scoring helpers,
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
- helper functions for canonical status and weighted scoring.

## Important constraint

This package is a **product domain baseline**, not a medical decision engine.
Keep recommendation language bounded and keep diagnosis/treatment logic out of this layer.

## Recommended next additions

- validation schemas,
- unit conversion helpers,
- recommendation contracts,
- evidence metadata contracts,
- import/export types shared between mobile and backend.
