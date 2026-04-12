# V1 Backlog

This backlog turns the tightened V1 documentation into an implementation-oriented priority list.
It stays aligned with the current V1 boundary: labs first, bounded interpretation, honest Priority Score framing, and explicit recommendation contracts.

## Rule engine

### 1. Implement core marker interpretability gate
- Description: Create the first shared rule layer that blocks interpretation when value, unit, or required assay metadata is missing.
- Size: M
- Acceptance hint: ApoB, LDL, HbA1c, glucose, hs-CRP, CRP, ferritin, vitamin D, and Lp(a) each return `interpretable` or `interpretation_limited` with an explicit reason.

### 2. Implement ApoB-primary lipid rule chain
- Description: Encode ApoB as the primary lipid signal and LDL as fallback or secondary lens only.
- Size: M
- Acceptance hint: When ApoB is present, LDL does not create an independent primary score contribution; when ApoB is missing, LDL can drive a bounded fallback path.

### 3. Implement canonical status mapping for core markers
- Description: Map interpretable values into stable statuses such as optimal, good, borderline, high, and critical under versioned policy rules.
- Size: M
- Acceptance hint: ApoB, LDL, triglycerides, HbA1c, and glucose produce deterministic canonical status outputs from the same input payload.

### 4. Implement bounded Lp(a) modifier logic
- Description: Add one-time or infrequent Lp(a) flagging with unit-specific handling and no recurring missing penalty.
- Size: M
- Acceptance hint: Elevated Lp(a) can create a bounded modifier or informational output only when unit is explicit; mg/dL and nmol/L paths stay separate.

### 5. Implement hs-CRP assay and acute-context gating
- Description: Support hs-CRP only when assay context is clear and prevent acute-phase values from acting like stable baseline risk signals.
- Size: M
- Acceptance hint: Unknown assay yields `interpretation_limited`, likely acute-phase values are excluded from hard score contribution, and recommendation types remain bounded.

### 6. Implement ferritin context gate
- Description: Prevent elevated ferritin from escalating without inflammation, liver, or iron-context support.
- Size: M
- Acceptance hint: High ferritin alone cannot enter the hard score and only creates contextual outputs until gate inputs are available.

## Recommendation layer

### 7. Build recommendation contract serializer
- Description: Generate structured recommendation objects with type, verdict, text, evidence summary, confidence, scope, and handoff flag.
- Size: M
- Acceptance hint: Every generated recommendation conforms to the documented contract and fails validation if required fields are missing.

### 8. Add recommendation eligibility guardrails
- Description: Gate outputs by interpretability, rule hardness, evidence posture, and allowed recommendation type.
- Size: M
- Acceptance hint: A rule cannot emit a recommendation if data is stale, interpretation-limited, out of scope, or unsupported by the rule’s allowed output types.

### 9. Implement collect-more-data recommendation patterns
- Description: Turn coverage and metadata gaps into explicit data-collection recommendations instead of pseudo-severity.
- Size: S
- Acceptance hint: Missing ApoB, missing units, missing assay, and stale panels all produce bounded `collect_more_data` outputs with plain-English reasons.

### 10. Implement behavior-adjustment output templates
- Description: Add bounded lifestyle-oriented outputs for V1-safe cases without drifting into diagnosis or treatment advice.
- Size: M
- Acceptance hint: Behavior outputs are available only for allowed rules and always include explicit scope and non-diagnostic framing.

### 11. Implement clinician-clarification handoff logic
- Description: Mark recommendations that require qualified clinician review rather than stronger in-product escalation.
- Size: S
- Acceptance hint: Handoff-required recommendations set `handoff_required=true` and remain clearly preventive, not diagnostic.

## Data model

### 12. Create minimal V1 interpretation payload schema
- Description: Define the smallest stable input/output structure for lab panels, entries, interpretations, and recommendations.
- Size: M
- Acceptance hint: A single payload can carry raw measurement data, interpretation state, score metadata, and linked recommendation output without ad hoc fields.

### 13. Add marker metadata registry projection
- Description: Persist marker class, score eligibility, unit policy, assay requirements, and rule hardness in a shared domain registry projection.
- Size: M
- Acceptance hint: Runtime logic resolves marker behavior from one canonical registry instead of duplicated inline conditionals.

### 14. Add freshness and coverage state model
- Description: Represent complete, partial, missing, interpretation-limited, and stale states separately from severity.
- Size: M
- Acceptance hint: Panel and entry payloads expose coverage and freshness metadata independently from score severity.

### 15. Add rule provenance fields
- Description: Track rule id, rule version, evidence posture, and source anchor on each interpretation and recommendation.
- Size: S
- Acceptance hint: Stored outputs can be traced back to the rule matrix and evidence anchor that produced them.

## Notion boundary

### 16. Define the Notion export summary contract
- Description: Specify exactly what the backend can send to Notion for human review without moving hidden logic back into formulas.
- Size: S
- Acceptance hint: Notion-facing rows contain summary fields, freshness labels, coverage notes, score metadata, and recommendation objects, but not canonical threshold logic.

### 17. Build a one-way sync for minimum V1 outputs
- Description: Sync interpretations and recommendations into Notion as review artifacts, not as the source of truth.
- Size: M
- Acceptance hint: Updating backend interpretation state refreshes the corresponding Notion-visible summary without requiring Notion formulas to recompute the decision.

### 18. Lock the allowed V1 Notion formula surface
- Description: Freeze which calculations may remain in Notion, such as simple rollups and view helpers, and reject deeper domain logic there.
- Size: S
- Acceptance hint: A documented allowlist exists and any score weighting, unit policy, assay gating, or recommendation assembly stays outside Notion.

## QA / test

### 19. Add rule fixtures for core and bounded markers
- Description: Create deterministic test cases for core markers, supporting modifiers, and contextual exclusions.
- Size: M
- Acceptance hint: Fixtures cover ApoB vs LDL fallback, Lp(a) unit separation, hs-CRP assay dependence, ferritin context gating, and vitamin D non-score behavior.

### 20. Add end-to-end minimum-slice tests
- Description: Test the labs-in to interpretation to Priority Score to recommendation flow with a single realistic panel.
- Size: M
- Acceptance hint: The same fixture produces stable interpretation outputs, bounded score metadata, and at least one contract-valid recommendation.

### 21. Add negative-path safety tests
- Description: Verify that the system refuses overclaiming when data is missing, stale, ambiguous, or out of scope.
- Size: S
- Acceptance hint: Tests prove missing coverage does not increase severity, unknown assay blocks hs-CRP interpretation, and prohibited recommendation types are never emitted.

## Infra

### 22. Create versioned rule configuration loading
- Description: Load rule definitions and thresholds under an explicit version so historical outputs remain auditable.
- Size: M
- Acceptance hint: Interpretation output includes the active rule version and old payloads can still be read against their original version.

### 23. Add evidence registry seed structure
- Description: Introduce the minimal storage or file format needed to attach active rules to anchor sources and evidence classes.
- Size: M
- Acceptance hint: Each live V1 rule can reference at least one anchor source and one evidence posture label.

### 24. Add interpretation and recommendation audit logging
- Description: Capture input snapshot, decision path, and emitted output for debugging and governance.
- Size: M
- Acceptance hint: A single interpretation run can be inspected later with its input values, gates hit, score contributions, and generated recommendations.

## Recommended first execution order

1. Rule engine items 1 to 6
2. Data model items 12 to 15
3. Recommendation layer items 7 to 11
4. QA items 19 to 21
5. Notion boundary items 16 to 18
6. Infra items 22 to 24
