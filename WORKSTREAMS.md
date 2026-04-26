---
status: current
canonical_for: active workstream routing
owner: repo
last_verified: 2026-04-26
scope: repo
---

# WORKSTREAMS.md

Persistent routing registry for agents and humans.

Read this file before `CHECKPOINT.md` whenever starting repo work from `main` or from an unknown context.

## Why this exists

`CHECKPOINT.md` is branch-local current state. It is not enough when active work happens on a branch that is not `main`.

This file prevents agents from following the wrong startup path when a task belongs to a focused product branch, prototype, demo, refactor, or experiment.

## Startup routing rule

1. Read this file.
2. Match the user task to an active workstream below.
3. Switch to that workstream branch when the task clearly belongs there.
4. Then read that branch's `CHECKPOINT.md` and canonical docs.
5. If no workstream matches, continue on `main` and read `CHECKPOINT.md`.

Do not infer active branch work from `main` alone.

## Active workstreams

### Prototype V1 - Marathon

- Status: active
- Branch: `claude/antler-health-os-demo-O6PNI`
- User-facing name: `Prototype V1 - Marathon`
- Purpose: reduced Android prototype for marathon-readiness demo/incubator presentation
- Canonical branch doc: `apps/mobile/docs/prototype-v1-marathon.md`
- Preferred screen import on branch: `apps/mobile/PrototypeV1MarathonScreen.tsx`
- Current implementation screen on branch: `apps/mobile/AntlerHealthOsDemoScreen.tsx`

Route here when the task mentions any of:

- Marathon
- Prototype V1 - Marathon
- reduced app
- incubator demo
- LUMA / Iguma design direction
- premium dark/apricot prototype polish
- score ring / orbit dots for the marathon prototype
- Garmin / Health Connect demo path for marathon readiness
- coaching / next steps / nutrition positioning for the marathon prototype

Branch startup for this workstream:

1. Switch to `claude/antler-health-os-demo-O6PNI`.
2. Read `CHECKPOINT.md` on that branch.
3. Read `apps/mobile/docs/prototype-v1-marathon.md`.
4. Only then inspect implementation files.

Current next implementation priority:

1. Split `apps/mobile/AntlerHealthOsDemoScreen.tsx` into focused components without UI/logic change.
2. Wire `apps/mobile/App.tsx` to the canonical `PrototypeV1MarathonScreen.tsx` import.
3. Then implement visual polish/home hierarchy/score-ring work in focused commits.

Do not merge this workstream into `main` until typecheck/build review and branch cleanup are complete.

### Main full-app baseline

- Status: stable baseline
- Branch: `main`
- Purpose: full One L1fe app baseline with login, minimum-slice submit, weekly check-in, wearable sync UI, and developer insight
- Canonical current-state doc: `CHECKPOINT.md`

Route here when the task is about:

- main app baseline
- Supabase ingest
- authenticated minimum slice
- wearable sync contract hardening outside the marathon prototype
- repo-wide operations not specific to an active workstream

## Registry maintenance rule

Whenever a new branch becomes an active product/design/refactor workstream, update this file in `main`.

Whenever a workstream is merged, abandoned, or superseded, update its status here before closing the session.

Required fields for every active workstream:

- Status
- Branch
- User-facing/product name when relevant
- Purpose
- Canonical doc(s)
- Task routing keywords
- Branch startup order
- Current next implementation priority
- Merge/closure condition
