# Evidence Registry and Rule Governance V1

## Verdict

V1 needs an explicit evidence registry.
Not because the MVP needs academic perfection, but because health rules should never float around as unattributed product folklore.

The goal is simple:
- every meaningful rule should point to a source anchor,
- every rule should declare whether it is guideline-aligned, extrapolated, policy-based, or heuristic,
- and stronger rules should be allowed to do more than weaker ones.

## Why this matters

The new targeted research round confirmed a recurring problem:
- some areas are supported by strong guideline or consensus material,
- some are supported mainly by observational or synthesis material,
- some are still product-policy choices,
- and some weak sources are useful only for wording or exploration.

If we do not store that distinction explicitly, the system will slowly overclaim.

## Core entities

### Source
One document or artifact.

Examples:
- guideline
- consensus statement
- systematic review or meta-analysis
- primary study
- narrative review
- expert synthesis
- regulatory document
- commercial article

### Rule
One machine-readable condition or output rule.

Examples:
- ApoB above target policy
- hs-CRP high only when assay is known
- ferritin high requires context gate
- Lp(a) high acts as a bounded risk-enhancing flag

### Recommendation
A user-facing output produced by one or more rules.

## Source registry minimum schema

For every source used in active rules, store at least:

- `source_id`
- `title`
- `publisher`
- `year`
- `canonical_url_or_doi`
- `source_type`
- `biomedical_evidence_class`
- `authority_level`
- `bucket`
- `main_usable_contribution`
- `main_weakness`

Recommended enums:

### `source_type`
- guideline
- consensus_statement
- systematic_review_meta
- primary_study
- narrative_review
- expert_synthesis
- regulatory_spec
- commercial_article
- media_summary
- placeholder

### `biomedical_evidence_class`
- A = high
- B = moderate
- C = low or emerging
- D = very low or non-scientific

### `authority_level`
- very_high
- high
- medium
- low
- unusable

### `bucket`
- strong
- secondary
- heuristic
- discard

## Rule registry minimum schema

For every active rule, store at least:

- `rule_id`
- `biomarker_or_topic`
- `rule_type`
- `logic`
- `description`
- `impact_level`
- `origin`
- `anchor_source_id`
- `supporting_source_ids`
- `rule_biomedical_evidence_class`
- `product_evidence_class`
- `status`

Recommended enums:

### `rule_type`
- threshold
- composite
- trend
- recommendation_trigger
- safety_flag

### `impact_level`
- safety_critical
- major_priority
- minor_hint

### `origin`
- guideline_adopted
- evidence_extrapolated
- policy_choice
- heuristic

### `product_evidence_class`
- P0 = none
- P1 = internal observational
- P2 = external observational
- P3 = stronger intervention evidence

Important V1 assumption:
Most current One L1fe product behaviors are still effectively `P0`.
That means copy must stay conservative even when the biomedical evidence is strong.

## Rule inheritance policy

### Anchor source
Every active rule needs one anchor source.
No anchor source, no active rule.

### Inheritance logic
- if a rule directly adopts a threshold from a strong guideline or consensus in the same scope, it may inherit that strength,
- if a rule extrapolates into a broader prevention or longevity framing, downgrade one level,
- if a rule mainly reflects product policy or heuristic design, cap it at low strength even if it references strong sources.

Examples:
- `ApoB above target policy` can be high-confidence and guideline-adjacent.
- `Vitamin D longevity target band 30-50 ng/mL` should be treated as policy-based optimization framing, not hard consensus.
- `weekly lowest pillar` is a product heuristic, not biomedical evidence.

## What stronger rules are allowed to do

### Safety-critical rules
Only allowed when:
- rule evidence is A or B,
- origin is guideline-adopted or evidence-extrapolated,
- and the output stays within the intended-use boundary.

### Major-priority rules
Should generally be backed by A or B evidence.
C-level rules may contribute only if they are clearly labeled as softer or policy-based.

### Minor hints
May use C-level evidence or heuristics, but only for:
- optional suggestions,
- ordering,
- framing,
- or low-stakes summaries.

## Practical V1 usage rules

### Strong sources
Can anchor:
- thresholds,
- score eligibility,
- recommendation boundaries,
- safety gating.

### Secondary sources
Can refine:
- caveats,
- explanatory copy,
- bounded policy decisions.

### Heuristic sources
Can inform:
- product philosophy,
- UX wording,
- exploratory notes.

They must not silently become score or safety anchors.

### Discard sources
Keep only if useful for audit history.
Do not use them in active logic.

## Immediate V1 implementation rules

1. No active rule without an anchor source.
2. No safety-critical rule from heuristic-only support.
3. Lp(a), ferritin, vitamin D, and weekly self-report logic must explicitly expose policy softness where relevant.
4. Recommendation copy should inherit the rule's confidence and origin.
5. Weak or commercial sources may help explain, but not decide.

## Example V1 anchor posture

### ApoB
- likely anchor type: guideline or consensus + large discordance literature
- posture: strong

### Lp(a)
- likely anchor type: consensus and guideline statements
- posture: strong for one-time measurement and unit strictness
- softer for score weighting

### hs-CRP
- likely anchor type: preventive consensus and assay literature
- posture: moderate and assay-gated

### Ferritin
- likely anchor type: WHO / guideline-style context material
- posture: contextual with mandatory context gates

### Vitamin D
- likely anchor type: deficiency and safety guidance
- posture: strong for deficiency and excess caution, weaker for optimization bands

## Beginner explanation

The system should not act like every source is equally trustworthy.
Some rules come from strong consensus.
Some come from product choices.
Some are only hints.

The evidence registry makes that visible, which keeps the MVP more honest and easier to improve later.
