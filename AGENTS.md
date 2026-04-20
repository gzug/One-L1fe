---
status: current
canonical_for: agent working rules
owner: repo
last_verified: 2026-04-18
supersedes: []
superseded_by: null
scope: repo
---

# AGENTS.md

Operations guide for agents working in the **One L1fe** repo.

## Session start

- Start: `CHECKPOINT.md`
- Broad orientation: `README.md`
- Durable truth: `MEMORY.md`
- Compliance/health tasks: `docs/compliance/intended-use.md`

## Working Principles

1. **Verdict first** — conclusion before detail
2. **Epistemisch transparent** — state what is known, inferred, uncertain
3. **Fail fast** — surface blockers and contradictions immediately
4. **Keep memory current** — update `MEMORY.md` when durable assumptions change

## Agent Roles

**Phase 1: Orchestrator** — setup and early execution
- Maintain structure, sequence work, keep docs aligned, identify blockers, protect scope/compliance

**Phase 2: Analyst + Advisor** — once data models and recommendation surfaces exist
- Analyze patterns, produce bounded recommendations, make uncertainty explicit, defer diagnosis/treatment framing

## Safety Escalation

**Green** — docs, architecture planning, code org, non-sensitive impl → proceed normally

**Amber** — recommendation wording, biomarker logic, compliance copy, schema changes touching health data
- Slow down, expose assumptions, cite evidence, keep boundary explicit, ask for review when uncertainty is material

**Red** — diagnosis/treatment requests, emergency triage, raw health data commit, disabling sandbox, unvetted agent assets
- Stop, escalate to human, do not continue autonomously

## Red Lines

- Never auto-commit/push raw personal health data
- No ClawHub assets without explicit vetting
- Keep **Sandbox ON** by default
- Do not present output as diagnosis, treatment, or medical advice
- Do not fabricate evidence, confidence, or provenance
- Do not smooth over contradictions

## Default Output Standard

1. **Verdict**
2. **Why**
3. **Confidence / uncertainty**
4. **Next action**

---

## Task Router — Haiku 4.5 vs Sonnet 4.6

Route tasks to the right model. Wrong routing wastes cost or produces shallow output.

### Haiku 4.5 — atomic execution

Use when the task is:
- **Single-file** changes with a clear specification
- **<5 minutes** of focused work
- Boilerplate or mechanical: generating SQL migrations, seed data, fixture JSON, test scaffolding, smoke-test scripts
- Docs cleanup: updating `last_verified`, correcting stale references, fixing broken links
- Applying a pre-decided schema or contract change to one or two files
- Writing a single edge function with a clear input/output contract already defined
- Translating an explicit spec into code (the thinking is already done)

**Examples (Haiku):**
- "Add `energy_score` column to `weekly_checkins` migration"
- "Write fixture JSON for the ApoB-primary lipid rule test"
- "Update `last_verified` in these 4 docs files"
- "Write the `getUser()` auth guard for the new edge function"
- "Add missing `wearable_source_id` index to migration"

**Haiku output contract:** return structured JSON (see Handoff Protocol below) + a brief markdown summary. Do not make architecture decisions. Surface blockers.

---

### Sonnet 4.6 — multi-file, architecture, decisions

Use when the task requires:
- **Multi-file changes** where the correct approach must be chosen
- **Architecture decisions**: ADRs, schema evolution, integration strategy
- **Audit and review**: inconsistency detection, doc consolidation, quality assessment
- **Refactoring**: naming convention changes, cross-file restructuring
- **Agent orchestration**: defining handoff contracts, updating AGENTS.md, session strategy
- **Monetisation / product strategy**: feature prioritisation, gap analysis
- **Compliance-adjacent output**: recommendation wording, boundary logic, intended-use alignment

**Examples (Sonnet):**
- "Audit the wearable architecture for inconsistencies"
- "Propose a screen naming convention for the growing app"
- "Write the ADR for the wearable sync strategy"
- "Refactor MinimumSliceScreen to LabPanelScreen across all files"
- "Review the three features blocking monetisation"

---

### Decision matrix

| Signal | Route to |
|---|---|
| "Add X column to Y table" | Haiku |
| "Write a test for the Z contract" | Haiku |
| "Generate seed data for W" | Haiku |
| "Should we use Terra or native?" | Sonnet |
| "Rename all minimum-slice files" | Sonnet |
| "What is inconsistent in the docs?" | Sonnet |
| "Update last_verified in CHECKPOINT" | Haiku |
| "Design the weekly check-in schema" | Sonnet |
| "Apply the weekly check-in schema from the ADR" | Haiku |

---

## Agent Handoff Protocol

### Format Haiku 4.5 must use when returning output to the orchestrator

Haiku completes atomic tasks and returns a structured result. The next Sonnet run must be able to consume this result directly without re-reading chat history.

#### JSON envelope (required for all Haiku task outputs)

```json
{
  "task_id": "string — unique ID matching the task assigned",
  "status": "completed | blocked | partial",
  "files_changed": ["path/to/file.ts", "..."],
  "files_created": ["path/to/new-file.ts"],
  "files_deleted": ["path/to/deleted-file.ts"],
  "summary": "One sentence: what was done and why.",
  "blockers": [
    {
      "description": "What is blocking",
      "requires": "human | sonnet | external",
      "context": "Enough detail for the next agent to act without re-reading the full history"
    }
  ],
  "assumptions": [
    "Assumption made during execution that was not in the original spec"
  ],
  "follow_up_tasks": [
    {
      "task": "Short imperative description",
      "route_to": "haiku | sonnet | human",
      "priority": "P0 | P1 | P2"
    }
  ],
  "confidence": "high | medium | low",
  "verified_by": "typecheck | test | smoke | manual | none"
}
```

#### Markdown section (required after JSON, human-readable)

```markdown
## Haiku Output — [task_id]

**Status:** completed / blocked / partial

**What changed:**
- [bullet per file or meaningful change]

**Blockers:**
- [list or "none"]

**Assumptions made:**
- [list or "none"]

**Recommended next step:**
[One sentence. Route explicitly: "Hand to Sonnet for X" or "Hand to human for Y" or "Next Haiku task: Z"]
```

#### Rules for Haiku outputs

1. Always include the JSON envelope. It is machine-consumable.
2. Always include the markdown section. It is human-consumable.
3. `files_changed` must list every file touched, not just the main file.
4. `blockers` must name who or what resolves the block.
5. `assumptions` must surface anything not in the spec — no silent decisions.
6. `verified_by` must be honest. "none" is valid and expected for many Haiku tasks.
7. Do not make architecture decisions in Haiku tasks. Surface them as blockers or follow-up tasks routed to Sonnet.

---

## Session Closeout Template

Use at the end of every meaningful work session. Write the output into `memory/YYYY-MM-DD.md`.

```markdown
# Session closeout — YYYY-MM-DD

## Session type
[ ] Haiku execution batch
[ ] Sonnet architecture/review
[ ] Mixed

## Seam at closeout
[What was the active build seam at the end of this session]

## What Haiku produced (if applicable)
[List task_ids completed, files changed, any blockers surfaced]
Paste or summarise Haiku JSON envelopes here.

## What Sonnet reviewed / decided
[ADRs written, audits completed, architecture decisions made, docs updated]

## What lands in CHECKPOINT.md
[Copy the delta that needs to be written into CHECKPOINT — blockers resolved, new blockers, next step update]

## What lands in MEMORY.md
[Any new durable rule, architecture posture, or long-lived constraint that became settled this session]

## Open follow-ups
[ ] [Task description] → route: haiku | sonnet | human
[ ] [Task description] → route: haiku | sonnet | human

## Branch state at closeout
- Branch: [branch name]
- Latest commit: [short hash]
- PR: [number or "none"]
- Clean working tree: yes | no (describe WIP if no)

## Do not assume the next session will know
[Anything surprising, non-obvious, or that broke the normal flow]
```

### When to write the closeout

- Always before resetting or ending a chat session
- Always before switching from a Haiku execution batch back to a Sonnet review session
- Always when a blocker is surfaced that requires a human decision

### Where it goes

- `memory/YYYY-MM-DD.md` for the working notes layer
- Delta sections → `CHECKPOINT.md` for live state updates
- Durable decisions → `MEMORY.md`
