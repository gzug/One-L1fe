---
status: reference
canonical_for: high-level system shape
owner: repo
last_verified: 2026-04-22
supersedes: []
superseded_by: null
scope: architecture
---

# Architecture Overview

## Verdict

Start simple.

One L1fe should begin as a **single product repo with one mobile app, one backend surface, and one shared domain layer**. That is enough structure for speed without turning the repo into chaos.

## High-Level Shape

```text
React Native App
    ↓
Supabase (Auth + Postgres + Storage)
    ↓
Supabase Functions / Backend Endpoints
    ↓
OpenAI API (planned, not yet wired in production)
```

## Core Components

### 1. Mobile Client
Location: `apps/mobile`

Responsibilities:
- authentication,
- biomarker entry and review,
- trend visualization,
- user-facing recommendation display,
- settings and profile flows.

Constraint: no direct model API keys in the client.

### 2. Backend / Data Layer
Location: `supabase`

Responsibilities:
- auth,
- relational storage,
- row-level security,
- storage for imports or attachments if needed,
- server-side functions for derived computations and AI-facing calls.

### 3. Shared Domain Layer
Location: `packages/domain`

Responsibilities:
- biomarker registry,
- units and normalization rules,
- reference-range metadata,
- typed contracts,
- validation,
- evidence and recommendation structures.

This layer exists to stop business logic from being duplicated across app UI, SQL, and prompts.

### 4. Wearable ingest layer
Location: `apps/mobile` + `supabase`

Responsibilities:
- read permitted device data via platform health stores,
- normalize wearable records into stable internal metric keys,
- persist raw observations separately from summaries,
- preserve provenance across source platform, device, and aggregation level.

Current state: the wearable seam is partially wired for mobile + backend ingestion, but real device-backed proof and full runtime scoring use are still incomplete.

## Design Decisions

### Keep AI server-side
OpenAI should sit behind backend functions, not inside the mobile app. This protects keys, enables logging and gating, and keeps recommendation behavior more controllable.

Current note: this is still a planned architecture layer. The repo shows the intended OpenAI position in the stack, but no production-wired function should be assumed from this diagram alone.

### Keep raw data and generated output separate
Store:
- raw biomarker records,
- normalized or derived values,
- generated recommendations,
- evidence metadata,

as separate conceptual layers. Do not collapse them into one blob.

### Start with one credible workflow
The first workflow should be:
1. user enters or imports biomarker data,
2. data is normalized and stored,
3. trends are shown clearly,
4. bounded recommendations are produced with explicit evidence and confidence.

That path is more valuable than prematurely building dashboards, multi-agent complexity, or broad health feature scope.

### Avoid premature package sprawl
Right now, `packages/domain` is enough. Do not create extra packages until reuse pressure is real.

## Parked Areas

These are documented but not current build drivers:
- business formalization,
- public launch framing,
- advanced compliance packaging,
- multi-user or enterprise concerns.

## Execution note

This document describes the intended high-level architecture.
It is not the current execution plan.

For the real current next step, use `CHECKPOINT.md` as the active source of truth.
