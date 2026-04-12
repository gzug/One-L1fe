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

### Notion / data model
- `docs/notion/final-first-automation-structure.md`
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
Use the new research outputs to strengthen, refine, or selectively revise the current V1 planning baseline.

### Required approach
The next agent should:
1. read the current V1 planning files first,
2. read the newly added targeted research outputs,
3. compare the new research outputs against the current V1 decisions,
4. identify which current V1 rules become:
   - stronger,
   - unchanged,
   - weaker,
   - or in need of revision,
5. update the English repo documentation accordingly,
6. preserve the core architectural direction unless strong evidence justifies a change.

## Specific tasks for the next round

1. **Research reconciliation**
   - compare the 12 new targeted research outputs against:
     - marker classes,
     - rule hardness,
     - unit/assay policy,
     - score eligibility,
     - recommendation boundaries.

2. **Tighten rule quality**
   - upgrade rules that are now better supported,
   - downgrade rules that remain heuristic,
   - remove or soften anything that still overclaims.

3. **Strengthen evidence mapping**
   - convert important rule areas into clearer evidence-to-rule linkage.

4. **Refine V1 marker policy**
   - especially for:
     - Lp(a),
     - hs-CRP / CRP,
     - ferritin,
     - vitamin D,
     - weekly self-report anchors,
     - priority score framing.

5. **Document all meaningful changes in plain English**
   - every revision should state:
     - what changed,
     - why it changed,
     - and how it improves the MVP.

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
- the current V1 model becomes more evidence-tight,
- weak areas are explicitly marked or corrected,
- the repo stays internally coherent,
- and the system becomes more credible without becoming overcomplicated.
