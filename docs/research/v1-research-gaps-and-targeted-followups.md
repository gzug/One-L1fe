# V1 Research Gaps and Targeted Follow-Ups

## Verdict

The current research corpus is strong enough to build a serious V1.
We should not pause implementation for a broad new research phase.

A targeted reconciliation pass was completed on 2026-04-12 and is recorded in:
- `docs/research/v1-targeted-research-reconciliation-2026-04-12.md`

That pass strengthened the core architecture, but also made a few bounded revisions around Lp(a), hs-CRP, ferritin, vitamin D, and evidence governance.

## What Is Already Good Enough for V1

These areas are sufficiently grounded for a first bounded system design:
- preventive framing over reactive medicine,
- ApoB-first lipid logic,
- Lp(a) as one-time or infrequent marker,
- HbA1c and glucose as core metabolic signals,
- hs-CRP as inflammation signal when assay clarity exists,
- missing data as separate from severity,
- priority score as internal prioritization rather than clinical risk model,
- Notion as summary layer, not canonical logic store,
- Supabase as long-term measurement system of record.

## Remaining Gaps Worth Closing

The highest-priority conceptual gaps are now narrower than before.
The biggest remaining work is no longer broad literature gathering, but converting the improved policy posture into structured rule artifacts and implementation-safe schemas.

### 1. Core marker primary-source tightening
Goal:
- make the strongest V1 core rules defensible from higher-quality references.

Priority topics:
- ApoB target logic and LDL fallback logic,
- Lp(a) unit-specific interpretation,
- hs-CRP assay-specific interpretation,
- HbA1c and fasting glucose target policy.

### 2. Unit and conversion policy
Goal:
- prevent silent category errors in automated interpretation.

Priority topics:
- Lp(a) mg/dL vs nmol/L,
- HbA1c percent vs mmol/mol,
- glucose mg/dL vs mmol/L,
- CRP vs hs-CRP naming and assay field requirements.

Status after reconciliation:
- Lp(a) unit strictness is now much clearer.
- CRP assay gating is now much clearer.
- HbA1c and glucose normalization still need explicit implementation specs.

### 3. Ferritin context policy
Goal:
- avoid false priority signals from isolated ferritin values.

Priority topics:
- elevated ferritin with inflammation context,
- ferritin with liver context,
- when ferritin should remain informational only.

### 4. Vitamin D policy wording
Goal:
- distinguish deficiency prevention from longevity optimization policy.

Priority topics:
- difference between sufficiency and chosen target zone,
- upper-bound caution and U-curve handling.

Status after reconciliation:
- framing is clearer, but the exact implementation spec still needs to stay explicitly policy-labeled.

### 5. Weekly self-report anchor quality
Goal:
- make 0-10 weekly scoring more stable over time.

Priority topics:
- anchor definitions for 0, 3, 5, 7, 9,
- whether four weekly pillars are enough for V1,
- how weekly trend labels should be derived.

## Areas That Should Stay Out of the Hard V1 Core

These may remain in research or contextual modules for now:
- DAO as hard-score input,
- broad supplement optimization logic,
- ambitious performance scoring,
- HDL-driven core scoring,
- advanced insulin marker logic before unit/policy cleanup,
- complex cancer or neurodegeneration rule engines,
- composite longevity scores that look clinically validated.

## Quality Notes on the Current Research Set

The corpus contains strong reusable learnings, but source quality is mixed.
Observed issues include:
- summaries built on summaries,
- commercial or low-authority pages,
- placeholder rows like `null` or `Eingefügter Text`,
- mixed evidence depth across categories.

Consequence:
- every V1 rule should be tagged by confidence or evidence class,
- rules should not inherit equal authority from unequal sources,
- weak-source ideas should be downgraded to exploratory or policy-level logic.

## Recommended Follow-Up Strategy

Do not run a large new literature project now.

Instead:
1. implement the V1 structure,
2. mark rule hardness explicitly,
3. list unresolved critical questions,
4. perform short targeted follow-ups only for rules that block interpretation quality.

## Suggested First Follow-Up Queue

1. HbA1c and fasting glucose normalization policy
2. evidence registry implementation shape
3. source-to-rule linkage for the active V1 matrix
4. score metadata and bounded-modifier implementation details
5. ferritin and vitamin D schema fields in the actual database layer

## Working Standard for V1

A rule is good enough for V1 when:
- the unit requirements are clear,
- the recommendation boundary is clear,
- its evidence class is declared,
- it does not pretend to be stronger than it is,
- it improves actionability without overstating certainty.
