# Recommendation Contract V1

## Verdict

Recommendations in One L1fe must stop being vague text blobs.
They should be structured, bounded, reviewable, and honest about why they exist.

## Purpose

The V1 recommendation contract defines the minimum shape every recommendation must follow.
It is designed for:
- clear automation,
- easier review,
- safer health-adjacent outputs,
- better future migration into backend logic.

## Required Fields

### 1. Recommendation Type
Allowed values:
- inform
- monitor
- collect_more_data
- behavior_adjustment
- clinician_clarification

Meaning:
- `inform`: explain what the result means
- `monitor`: watch over time, no immediate action needed
- `collect_more_data`: missing or incomplete picture, gather better data
- `behavior_adjustment`: bounded non-medical lifestyle step
- `clinician_clarification`: discuss with a qualified clinician

### 2. Verdict
A short plain-language conclusion.

Examples:
- Lipid picture is incomplete
- Inflammation signal looks low
- Sleep is currently the weakest weekly pillar
- Ferritin is elevated but needs context before escalation

### 3. Recommendation Text
The direct next step.

Examples:
- Add ApoB to the next blood draw
- Re-check hs-CRP with explicit assay naming
- Keep current metabolic routine and re-test in 3 months
- Focus this week on sleep timing consistency

### 4. Evidence Summary
Short reason for the recommendation.

Examples:
- LDL is above target, but ApoB is missing
- Weekly sleep score is below baseline for two consecutive weeks
- Ferritin is elevated, but inflammation context is incomplete

### 5. Confidence
Allowed values:
- high
- medium
- low

Rule of thumb:
- `high`: strong rule, clean measurement context, bounded interpretation
- `medium`: useful but partial context or policy-based threshold
- `low`: exploratory or weak-context output

### 6. Scope
Must explicitly state what the recommendation covers and what it does not.

Examples:
- preventive lipid follow-up only, not diagnostic assessment
- weekly behavior support only
- contextual gut-related hypothesis, not core cardiometabolic scoring

### 7. Handoff Required
Boolean field.

Meaning:
- `true` when clinician clarification is the correct next step
- `false` otherwise

## Optional Support Fields

- linked insight id
- linked lab panel id
- linked weekly check-in id
- actionability
- safety state
- score version
- evidence class
- rule origin
- anchor source id

## Recommendation Eligibility Rules

A recommendation may be created only if:
1. the source data is interpretable,
2. the rule hardness is known,
3. the output fits one allowed recommendation type,
4. the scope is explicit,
5. the text does not overclaim,
6. the current safety state permits that output,
7. the rule has an explicit evidence posture.

## What Recommendations Must Not Do in V1

They must not:
- diagnose disease,
- prescribe treatment,
- suggest medication,
- pretend certainty from weak markers,
- convert one isolated biomarker into a broad health story,
- hide missing-data problems.

## Beginner Explanation

Old style:
- the system could jump from a number straight into advice text.

New style:
- every recommendation must answer six simple questions:
  1. what kind of recommendation is this?
  2. what is the verdict?
  3. why are we saying this?
  4. how sure are we?
  5. what is this recommendation actually about?
  6. what evidence posture or rule origin is behind it?

Why this is better:
- easier to trust,
- easier to review,
- easier to improve later,
- and much less likely to sound smarter than it really is.
