---
status: current
canonical_for: data handling and redaction rules
owner: repo
last_verified: 2026-04-13
supersedes: []
superseded_by: null
scope: repo
---

# Data handling and redaction

## Verdict

Use synthetic data by default.
Do not commit raw personal health data, direct identifiers, or lightly redacted artifacts that could still expose a real person.

## Purpose

This file defines the operational handling rules for:
- fixtures,
- screenshots,
- logs,
- smoke-test payloads,
- copied examples,
- debugging artifacts,
- imported sample data.

This is the canonical operational companion to `intended-use.md`.

## Allowed by default

- fully synthetic biomarker examples,
- fabricated names and identifiers,
- generated screenshots that contain no real user data,
- test payloads created only for development,
- example values clearly marked as demo content.

## Not allowed in the repo

- raw lab reports,
- real biomarker panels tied to a real person,
- screenshots containing names, dates of birth, patient numbers, emails, phone numbers, or addresses,
- logs containing access tokens, authorization headers, or session cookies,
- exports from real health systems unless fully transformed into safe synthetic data,
- copy-pasted support conversations that include health or identity data.

## Redaction rules

If an artifact could plausibly identify a real person, do not commit it.
Simple masking is not enough when the remaining context is still specific.

Minimum rule:
- remove direct identifiers,
- remove stable account identifiers,
- remove exact dates when they are unnecessary,
- remove embedded metadata from screenshots and files,
- prefer rebuilding an artifact synthetically instead of redacting a real one.

## Fixtures and examples

Fixtures must be:
- synthetic,
- minimal,
- bounded to the contract under test,
- free of hidden real-world provenance.

Example payloads should avoid creating an impression that they came from a real patient history.

## Logs and debugging

Do not commit logs containing:
- tokens,
- full request headers,
- raw request bodies from real users,
- stack traces that include sensitive payload fragments.

When debugging, prefer:
- counts,
- statuses,
- synthetic payload echoes,
- shortened opaque ids.

## Screenshots and demos

Before using a screenshot in docs, PRs, or demos:
1. confirm it contains no real health data,
2. confirm it contains no direct identifiers,
3. confirm no token, URL secret, or internal credential is visible,
4. prefer synthetic demo screens when possible.

## Smoke tests and imported data

Smoke tests must use synthetic or explicitly safe non-personal test values.
Imported sample datasets must be documented as synthetic before they enter the repo.

## Escalation rule

If there is doubt about whether an artifact is safe, do not commit it.
Replace it with a synthetic equivalent or escalate for review.

## Lightweight enforcement

Run:
- `npm run check:repo-hygiene`

This is intentionally small.
It is a first guard against obvious auth secret material and unsafe tracked text patterns, not a complete privacy scanner.

## Related canonical docs

- `docs/compliance/intended-use.md` for product boundary and recommendation limits
- `MEMORY.md` for durable repo rules
- `docs/ops/openclaw.md` for agent operating posture
