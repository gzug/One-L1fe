---
status: current
canonical_for: docs folder orientation
owner: repo
last_verified: 2026-05-01
supersedes: []
superseded_by: null
scope: docs
---

# Docs guide

Use this file only when a task needs deeper documentation after `CHECKPOINT.md` and `CONTEXT.md`.

## Task routing

| Task | Read |
|---|---|
| Agent/session workflow | `docs/ops/memory-system-v2.md` |
| OpenClaw workflow | `docs/ops/openclaw.md` |
| Larger Supabase work | `docs/ops/supabase-agent-workflow.md` and `supabase/README.md` |
| Supabase Realtime | `docs/prompts/supabase-realtime-ai-assistant-guide.md` |
| Active mobile v2 work | `apps/mobile/README.md` and `apps/mobile/prototypes/v2/README.md` |
| Biomarker scoring | `docs/architecture/priority-score-v1.md` and `packages/domain/` |
| Field state / missingness | `docs/architecture/field-value-state-and-missingness-v1.md` |
| Wearable metrics | `docs/architecture/wearable-metric-keys-v1.md` |
| Recommendation contract | `docs/architecture/recommendation-contract-v1.md` |
| Intended use / claims | `docs/compliance/intended-use.md` |
| Data handling / redaction | `docs/compliance/data-handling-and-redaction.md` |
| Backlog / execution planning | `docs/planning/` |
| Historical context | `docs/archive/` only when explicitly needed |

## Folder roles

- `architecture/` = technical decisions and system shape
- `planning/` = active backlog and execution sequencing
- `research/` = evidence gathering and open questions
- `compliance/` = intended-use and boundary-sensitive material
- `ops/` = repo operations and session workflow
- `notion/` = Notion-specific design and migration notes
- `roadmap/` = phased progress and checkpoints
- `archive/` = superseded or historical material; never startup context

## Source-of-truth rule

Do not update multiple docs with the same purpose unless there is a clear reason.
Prefer one canonical location and link to it from elsewhere.
