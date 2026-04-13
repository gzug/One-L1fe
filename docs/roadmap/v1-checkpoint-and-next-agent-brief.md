# V1 Checkpoint and Next-Agent Brief

## Purpose of this file

This file is the compact handoff checkpoint for the next work round.
It explains:
- what was achieved,
- what changed from the old model,
- what is already stable enough,
- what new research material is now available,
- and what the next agent should do next.

## Current checkpoint

The project now has a real V1 planning baseline for the first serious data and interpretation layer.

This includes:
- a cleaner Notion V1 target structure,
- a clearer separation between raw measurements, insights, and recommendations,
- a bounded recommendation contract,
- a first rule matrix,
- explicit handling for coverage, freshness, units, and assay requirements,
- an implementation-ready rule inventory,
- decision tables for deterministic V1 control flow,
- and a more honest framing of the score as a **Priority Score**, not a medical risk score.

## What was improved compared with the old Notion MVP

### Old situation
The old MVP was useful for learning and prototyping, but too much lived in too few places.
A single structure tried to act as:
- data entry layer,
- scoring engine,
- recommendation engine,
- and dashboard.

That made it easy to prototype, but harder to trust, scale, or automate safely.

### New V1 approach
The new V1 keeps the useful layered idea, but improves the structure:
- one layer for profile baseline,
- one layer for lab panels,
- one layer for lab entries,
- one layer for derived insights,
- one layer for recommendations,
- one layer for overview/dashboard.

This makes the MVP:
- easier to understand,
- easier to review,
- easier to automate later,
- less dependent on hidden Notion formulas,
- and less likely to require a full rebuild.

## Most important design decisions already made

1. **Severity is not coverage**
   - missing data must not behave like disease severity.

2. **ApoB is primary, LDL is fallback or secondary lens**
   - avoid double-counting the same biological story.

3. **Weak/contextual markers should not shape the hard core score**
   - DAO stays contextual, not core.

4. **Units and assay type are part of the truth**
   - especially relevant for Lp(a), HbA1c, glucose, and CRP.

5. **The score is a Priority Score, not a risk score**
   - it helps focus attention, not simulate medical certainty.

6. **Recommendations need a contract**
   - verdict, evidence, confidence, scope, and recommendation type must be explicit.

7. **Notion is not the final home of core health logic**
   - Notion may help with review and structured operations,
   - but long-term domain logic belongs in shared domain files and backend logic.

## Main files created in this round

### Architecture
- `docs/architecture/measurement-interpretation-policy.md`
- `docs/architecture/recommendation-contract-v1.md`
- `docs/architecture/v1-rule-matrix.md`
- `docs/architecture/priority-score-v1.md`
- `docs/architecture/data-freshness-and-coverage-policy-v1.md`
- `docs/architecture/weekly-self-report-anchors-v1.md`
- `docs/architecture/v1-implementation-rule-inventory.md`
- `docs/architecture/v1-decision-tables.md`

### Notion / data model
- `docs/notion/final-first-automation-structure.md`
- `docs/notion/compact-private-notion-workspace-v1.md`
- `docs/notion/future-role-of-notion.md`
- `docs/notion/private-notion-v1-change-log.md`
- `docs/notion/v1-database-property-spec.md`
- `docs/notion/old-to-v1-migration-map.md`
- `docs/notion/notion-vs-backend-calculation-boundary.md`
- `docs/notion/v1-implementation-sequence.md`

### Research posture
- `docs/research/v1-research-gaps-and-targeted-followups.md`

## New research material now available for the next round

The inbox now also contains a larger second-pass research set, including targeted reports for:
- core biomarker policy,
- ApoB vs LDL fallback policy,
- Lp(a) unit policy,
- CRP / hs-CRP assay policy,
- ferritin context gate,
- vitamin D policy,
- weekly anchors,
- priority score design,
- safety states and recommendation boundaries,
- source registry design,
- Notion-to-backend migration,
- source-quality auditing.

Location:
- `/Users/ufo/.openclaw/workspace/inbox/research/`

## What the next agent should do

### Primary mission
Tighten and extend the first shared runtime implementation artifacts so they become testable and storage-ready.

### Required approach
The next agent should:
1. read the current V1 planning files first,
2. use the implementation inventory and decision tables as the coding source of truth,
3. project rule metadata into shared runtime config or domain files,
4. implement interpretability gates before marker-specific status logic,
5. implement ApoB-primary and LDL-fallback behavior exactly once in shared logic,
6. preserve the bounded recommendation and Priority Score posture.

## Specific tasks for the next round

1. **Project the rule inventory into code-facing structures**
   - add or extend a shared registry for:
     - marker role,
     - score role,
     - unit policy,
     - assay requirements,
     - recommendation eligibility,
     - provenance fields.

2. **Extend the minimum-slice evaluator**
   - keep interpretability gates authoritative,
   - keep ApoB-primary / LDL-fallback encoded only once,
   - and extend provenance plus recommendation serialization where needed.

3. **Expand assertion coverage around the fixtures**
   - the repo now has executable TypeScript assertions,
   - next expand them for:
     - recommendation structure validation,
     - provenance expectations,
     - additional negative paths,
     - and edge-case freshness behavior.

4. **Prepare backend-facing contracts**
   - align evaluator output with:
     - interpretation payload shape,
     - recommendation storage fields,
     - and audit/provenance capture.

5. **Keep generic reference-only scoring from becoming the hidden production path**
   - explicit threshold-policy and minimum-slice logic should now remain the preferred runtime path.

## Guardrails for the next agent

- Keep all repo documentation in English.
- Do not let weak or commercial sources silently upgrade heuristic rules into hard rules.
- Do not collapse Notion back into a hidden medical logic engine.
- Do not turn the Priority Score into a fake clinical risk score.
- Keep the system preventive, bounded, and honest.
- Preserve the distinction between:
  - measured data,
  - interpretability,
  - priority,
  - and recommendation.

## Definition of success for the next round

The next round is successful if:
- assertion coverage grows beyond the current smoke-pass fixture set,
- ApoB-primary and LDL-fallback behavior stay encoded without duplication,
- bounded modifiers stay bounded,
- backend-facing payload contracts are clearer,
- and the repo stays internally coherent.
