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
Status: drafted

Likely first tables:
- profiles,
- biomarker_definitions,
- lab_results,
- lab_result_entries,
- derived_insights,
- recommendations.

### 4. React Native app scaffold
Status: next

Start with:
- auth shell,
- dashboard placeholder,
- biomarker list,
- trend detail screen,
- manual entry flow.

### 5. Recommendation contract
Status: drafted

The first contract and safety framing now exist in:
- `docs/architecture/recommendation-contract-v1.md`
- `docs/architecture/measurement-interpretation-policy.md`
- `docs/architecture/v1-rule-matrix.md`

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

## Supporting V1 design work now completed

The repo now also contains a first serious V1 planning layer for:
- measurement and interpretation policy,
- rule hardness and scoring boundaries,
- freshness and coverage policy,
- weekly self-report anchors,
- Notion V1 data model and migration planning.

This reduces the risk of rebuilding the first MVP data model later.

## My Recommended Next Step

Create the React Native app scaffold around one narrow workflow:
manual biomarker entry, list view, and a simple trend detail shell.

But implement it against the newly documented V1 boundaries so that:
- raw data,
- derived insights,
- recommendations,
- and Notion-facing summaries

do not collapse back into one mixed layer.
