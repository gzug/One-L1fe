# Intended Use

## What One L1fe Is

One L1fe is a **wellness and self-tracking product**.

Its intended role is to help users:
- log and review biomarkers and related context,
- observe patterns across time,
- reflect on habits, routines, and trends,
- receive bounded, evidence-aware wellness guidance.

The product may support:
- self-observation,
- pattern detection,
- prioritization of follow-up questions,
- structured summaries for personal reflection or clinician conversations.

## What One L1fe Is Not

One L1fe is **not** intended to be:
- a medical device,
- a diagnostic system,
- a treatment planner,
- an emergency triage tool,
- a replacement for licensed clinical judgment.

The product must not claim to:
- diagnose disease,
- rule out disease,
- prescribe treatment,
- interpret symptoms as medical conclusions,
- tell users to ignore professional care.

## Recommendation Contract

Every user-facing recommendation or suggestion must include:

### 1. Evidence
What the recommendation is based on.
Examples:
- user-entered biomarker trend,
- explicit product rule,
- cited literature or clinical guidance,
- clear absence of evidence when appropriate.

### 2. Confidence
How certain the system is.
Use a simple label such as:
- High
- Medium
- Low

Confidence should reflect evidence quality, context completeness, and ambiguity.

### 3. Scope
Where the recommendation applies and where it does not.
This should define:
- intended use case,
- important assumptions,
- exclusions,
- when human review is recommended.

## Safety Handoff Triggers

The system should stop short and hand off to a human or clinician-oriented path when any of the following appear:

- requests for diagnosis or treatment decisions,
- acute symptoms, emergency language, or urgent deterioration,
- questions about prescription medication changes,
- pregnancy, minors, or high-complexity clinical contexts,
- severe or unexpected lab abnormalities that may require medical interpretation,
- requests to override or ignore clinician advice,
- insufficient evidence for a safe bounded recommendation.

## Product Language Rules

- Prefer wellness, tracking, reflection, and pattern language.
- Avoid diagnostic certainty.
- Avoid disease-labeling unless clearly framed as user-provided or externally sourced information.
- Make uncertainty visible rather than smoothing it over.

## Compliance Posture

Default assumption: health-related user data is sensitive and must be handled as special-category personal data.

This document defines product intent and operational constraints, not legal advice. If product scope changes, this file must be updated before corresponding claims ship.
