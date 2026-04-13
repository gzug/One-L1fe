# Canonical Biomarker Model

This document replaces the previous placeholder mapping with a practical baseline for the biomarker domain.

## Verdict

The repo now has a **real first-pass biomarker registry** in `packages/domain/biomarkers.ts`.
It is not a finished medical model, but it is now a clean technical starting point for product work, Supabase schema design, and recommendation contracts.

## What lives in code now

Implementation location: `packages/domain/biomarkers.ts`

The file now defines:
- canonical status values,
- biomarker categories,
- evidence levels,
- reference-range shapes,
- typed biomarker definitions,
- the MVP biomarker registry,
- helper functions for status and weighted scoring.

A first runtime bridge now also exists in `packages/domain/v1.ts`.
It adds:
- V1 marker runtime config,
- interpretability and freshness helpers,
- score-role metadata,
- and explicit ApoB-primary / LDL-fallback decision support.

## Design principles mapped to implementation

### 1. Canonical keys come first
Each biomarker has a stable machine key like `apob`, `ldl`, `hba1c`, or `vitamin_d`.

Why it matters:
- database schemas need stable identifiers,
- app screens should not depend on display strings,
- prompts and backend logic need the same naming surface.

Implementation:
- `BiomarkerDefinition.key`
- `biomarkerRegistry`
- `getBiomarkerDefinition()`

### 2. Display name and machine identity stay separate
Human-readable labels are stored separately from the key.

Why it matters:
- UI text can evolve without breaking code,
- localization stays possible later,
- contracts remain stable.

Implementation:
- `BiomarkerDefinition.displayName`

### 3. Category is explicit
The model encodes whether a marker is `core`, `supporting`, or `contextual`.

Why it matters:
- Phase 0 scope stays narrow,
- contextual markers like DAO stay bounded,
- roadmap decisions can filter by category instead of ad-hoc lists.

Implementation:
- `BiomarkerCategory`
- `BiomarkerDefinition.category`

### 4. Evidence posture is part of the model
Each biomarker carries a lightweight evidence label: `primary`, `secondary`, or `experimental`.

Why it matters:
- recommendation logic should not treat all markers equally,
- low-confidence surfaces stay visibly bounded,
- the repo preserves epistemic honesty early.

Implementation:
- `EvidenceLevel`
- `BiomarkerDefinition.evidenceLevel`

### 5. Units are defined in the registry
Every biomarker now has a canonical unit in the domain layer.

Why it matters:
- data ingestion and normalization need a clear target unit,
- UI rendering should not invent units screen-by-screen,
- Supabase schema design gets easier when units are explicit.

Implementation:
- `BiomarkerDefinition.unit`

### 6. Reference ranges are modeled, not implied
The registry defines reference interpretation as `upper_bound`, `lower_bound`, or `range`.

Why it matters:
- status calculation becomes predictable,
- future normalization can stay consistent,
- the scoring chain can reuse the same structure.

Implementation:
- `ReferenceRangeKind`
- `ReferenceRange`
- `BiomarkerDefinition.referenceRange`
- `calculateCanonicalStatus()`

### 7. Scoring is separated from raw biomarker storage
The file includes helper functions for weighted scoring and total priority aggregation.

Why it matters:
- raw lab values stay separate from derived interpretation,
- backend and UI can share the same scoring logic,
- recommendation work has a stable base contract.

Implementation:
- `mapPriorityScore()`
- `calculateWeightedScore()`
- `aggregateTotalPriorityScore()`
- `determinePrimaryFocus()`

### 8. The model is interpretation-oriented, not diagnostic
This registry is designed for prioritization and pattern detection, not medical diagnosis.

Why it matters:
- it matches the intended-use boundary,
- it reduces accidental medical overclaiming,
- it keeps early product language defensible.

Implementation:
- bounded descriptions in each biomarker definition,
- no diagnosis language in status helpers,
- optional/contextual treatment for interpretation-sensitive markers.

## Current MVP biomarker set

### Core
- ApoB
- LDL
- Triglycerides
- Lp(a)
- HbA1c
- Glucose
- CRP

### Supporting
- Vitamin D
- Ferritin
- B12
- Magnesium

### Contextual
- DAO

## What is still intentionally missing

This file is now a usable baseline, but several things are still deliberately unfinished:
- unit conversion rules,
- sex or age-specific ranges,
- validation schemas,
- trend aggregation across time,
- recommendation contracts,
- provenance and evidence citation structures.

Those should come next, but they no longer block the repo from being a coherent starting point.

## Recommended next step

Build the first shared interpretation path directly against the domain layer.

Suggested first implementation targets:
- explicit threshold policy files for ApoB, LDL, HbA1c, and glucose
- minimum-slice interpretation payload types
- deterministic fixtures for ApoB / LDL fallback and hs-CRP assay blocking
- recommendation contract types shared by backend and app
