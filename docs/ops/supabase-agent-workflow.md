---
status: current
canonical_for: Supabase implementation workflow for agents
owner: repo
last_verified: 2026-04-23
supersedes: []
superseded_by: null
scope: all-agents
---

# Supabase Agent Workflow

Use this workflow whenever a task makes a meaningful change to the Supabase project.

## When this applies

Apply this workflow for:
- schema or migration changes
- RLS or policy changes
- Realtime channels, triggers, broadcasts, presence, or topic design
- Edge Functions
- Auth flows or auth policy changes
- Storage buckets or storage policies
- project-level Supabase settings that affect runtime behavior

Do not skip it just because the code change is small if the runtime or data-contract risk is real.

## Required files

Load these first:
1. `CHECKPOINT.md`
2. `CONTEXT.md`
3. `AGENTS.md`
4. This file: `docs/ops/supabase-agent-workflow.md`

Load these on demand:
- `MEMORY.md` if the task touches durable architecture or operating rules
- `supabase/README.md` for deploy/runtime conventions
- `docs/prompts/supabase-realtime-ai-assistant-guide.md` for any Realtime work

## Realtime rule

If the task touches Supabase Realtime:
- include `docs/prompts/supabase-realtime-ai-assistant-guide.md` in the AI working context before planning or editing
- prefer `broadcast` over `postgres_changes`
- use private channels by default
- design topics as `scope:entity:id`
- design events as snake_case, e.g. `message_created`
- add unsubscribe/cleanup logic in client code
- add indexes for any columns used in RLS policies

## Working order

1. **Find the current seam**
   - Inspect existing migrations, policies, triggers, functions, and client call sites before editing.
   - Do not invent a parallel Supabase pattern if the repo already has one.

2. **Define the contract first**
   - Write down the affected tables, topics, events, function names, and policy boundaries.
   - For Realtime, identify who publishes, who subscribes, and how access is authorized.

3. **Prefer one coherent slice**
   - Update schema, backend/function code, shared domain types, and client call sites together when they are part of the same contract.
   - Avoid landing a migration without updating the owning runtime path unless the task is explicitly migration-only.

4. **Keep security explicit**
   - Private channels over public channels by default.
   - RLS changes require matching indexes when policies filter on those columns.
   - Do not move database helper functions like `realtime.send` or `realtime.broadcast_changes` into client code.

5. **Add the operational proof**
   - For schema/RLS/function work, run the closest available verification step.
   - For Realtime work, verify naming, cleanup, authorization, and failure handling in code, not just happy-path subscription code.
   - If hosted verification is not possible, say so explicitly and leave the repo in a locally verifiable state.

6. **Update repo memory**
   - If the change affects how future agents should work in Supabase, update `AGENTS.md` or `MEMORY.md`.
   - End every session with `CHECKPOINT.md` and `CONTEXT.md` updated.

## Minimum review checklist

Before finishing a Supabase task, check:
- Is there one clear contract from client/domain/function/schema?
- Are RLS predicates backed by indexes?
- If Realtime is involved, did we use `broadcast` and private channels unless there is a documented reason not to?
- Are topic names and event names specific and consistent?
- Is subscription cleanup present?
- Is auth handled before subscription for private channels?
- Did we avoid client-side use of database-only helper functions?
- Did we document any hosted-only gap that still needs a real project run?

## Copy/paste handoff for other AI tools

When using another AI tool for a bigger Supabase task, include:
- `docs/ops/supabase-agent-workflow.md`
- and, if Realtime is involved, `docs/prompts/supabase-realtime-ai-assistant-guide.md`

Short handoff line:

```text
Follow docs/ops/supabase-agent-workflow.md for this task. If Realtime is involved, also include docs/prompts/supabase-realtime-ai-assistant-guide.md and follow it strictly.
```
