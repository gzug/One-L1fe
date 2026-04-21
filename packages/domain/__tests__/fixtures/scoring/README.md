# Scoring Fixtures

Each `*.json` file in this directory is a self-contained scoring fixture.

Fixture shape:

- `name`: short identifier for the scenario
- `input.values`: marker values as a `Record<string, number | null>`
- `input.anchors`: evidence anchors used to classify evidence strength
- `input.freshness`: optional marker freshness metadata for minimum-slice checks
- `expected`: the asserted `PriorityScoreResult` subset for the scenario

To add a new fixture:

1. Add a new JSON file with a one-line `rationale`.
2. Keep the fixture deterministic: no `Date.now()`, randomness, or network data.
3. Include evidence anchors unless the scenario is explicitly testing the unanchored path.
4. If A4 thresholds are still pending, leave a `TODO(A4)` note in the rationale and use the current audited values.
5. Add or extend the matching `describe` block in `scoring.test.ts`.
