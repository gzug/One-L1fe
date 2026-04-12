# Phase 0 Roadmap

## Goal

Turn the repo from a documentation baseline into a working product skeleton with one clean end-to-end path.

## Priority Order

### 1. Architecture skeleton
Status: done

Directories and baseline docs now exist.

### 2. Canonical biomarker model
Status: drafted

Define for each MVP biomarker:
- canonical key,
- display name,
- unit,
- value type,
- normal/reference representation,
- optional metadata,
- whether it is core, supporting, or contextual.

### 3. Supabase schema draft
Status: next

Likely first tables:
- profiles,
- biomarker_definitions,
- lab_results,
- lab_result_entries,
- derived_insights,
- recommendations.

### 4. React Native app scaffold
Status: pending

Start with:
- auth shell,
- dashboard placeholder,
- biomarker list,
- trend detail screen,
- manual entry flow.

### 5. Recommendation contract
Status: pending

Define the structure for:
- verdict,
- evidence,
- confidence,
- scope,
- follow-up prompts.

### 6. First end-to-end flow
Status: pending

Target outcome:
- enter sample biomarker data,
- persist it,
- view the trend,
- generate one bounded recommendation.

## Explicit Non-Priorities Right Now

- company structure,
- monetization,
- public launch polish,
- broad regulatory packaging,
- multi-agent expansion inside the product repo.

## My Recommended Next Step

Draft the Supabase schema directly against the canonical biomarker registry in `packages/domain/biomarkers.ts`.
That will keep the database shape aligned with the domain layer before app scaffolding begins.
