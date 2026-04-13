# V1 Backend Interpretation Contract

## Verdict

The minimum-slice evaluator is now good enough to define the first backend-facing contract.
The backend should store evaluator output as structured interpretation artifacts, not as loose text blobs.

## Purpose

This file translates the current domain evaluator into a backend-ready payload shape for:
- storage,
- audit,
- recommendation rendering,
- future Notion export summaries,
- and historical re-readability.

It does not require the full final schema yet.
It defines the minimum contract needed to keep the evaluator output coherent once it leaves the domain layer.

## Contract goals

1. preserve the distinction between raw data and derived interpretation
2. preserve coverage and freshness separately from severity
3. preserve provenance and rule version
4. preserve bounded recommendation structure
5. keep score output clearly framed as Priority Score metadata, not as medical truth

## Proposed objects

### 1. Interpretation run
One execution of the evaluator against one panel snapshot.

Minimum fields:
- `interpretation_run_id`
- `profile_id`
- `panel_id`
- `rule_version`
- `score_version`
- `created_at`
- `engine_name`
- `engine_mode` (`minimum_slice_v1`)
- `input_snapshot`
- `coverage_state`
- `coverage_notes`
- `priority_score_value`
- `priority_score_raw_value`
- `priority_score_metadata`

### 2. Interpreted entry
One evaluated biomarker row tied to the run.

Minimum fields:
- `interpreted_entry_id`
- `interpretation_run_id`
- `marker_key`
- `display_name`
- `raw_value`
- `raw_unit`
- `interpretable_state`
- `blocking_reason`
- `freshness_state`
- `canonical_status`
- `severity`
- `score_eligible`
- `score_contribution`
- `rule_ids`
- `notes_json`

### 3. Recommendation
One structured recommendation tied to the run.

Minimum fields:
- `recommendation_id`
- `interpretation_run_id`
- `type`
- `verdict`
- `text`
- `evidence_summary`
- `confidence`
- `scope`
- `handoff_required`
- `rule_id`
- `anchor_source_id` nullable until the registry is fully wired
- `rule_origin`
- `product_evidence_class`

## Recommended JSON payload shape

```json
{
  "interpretation_run_id": "irun_123",
  "profile_id": "profile_123",
  "panel_id": "panel_123",
  "rule_version": "v1-draft-implementation-bridge",
  "score_version": "priority-score-v1-minimum-slice",
  "engine_name": "one-l1fe-domain",
  "engine_mode": "minimum_slice_v1",
  "input_snapshot": {
    "collected_at": "2026-04-10T08:00:00.000Z",
    "source": "manual_entry",
    "entries": []
  },
  "coverage": {
    "state": "partial",
    "notes": ["Missing ApoB."]
  },
  "lipid_decision": {
    "primary_driver": "ldl",
    "include_apob_score": false,
    "include_ldl_score": true,
    "rule_ids": ["LIP-002", "LIP-003"]
  },
  "entries": [
    {
      "marker": "ldl",
      "interpretable_state": "interpretable",
      "freshness": "current",
      "canonical_status": "high",
      "severity": 3,
      "score_eligible": true,
      "score_contribution": 3,
      "rule_ids": ["LIP-002"],
      "notes": []
    }
  ],
  "priority_score": {
    "name": "Priority Score",
    "raw_value": 7,
    "value": 4,
    "included_marker_count": 3,
    "top_drivers": ["ApoB", "HbA1c"],
    "bounded_modifier_note": "Bounded modifiers are visible but do not behave like major recurring core score drivers.",
    "excluded_marker_note": "Some interpretable signals are intentionally excluded from the hard core score.",
    "coverage_summary": "Missing ApoB.",
    "freshness_note": "Freshness is acceptable for the currently included score inputs."
  },
  "recommendations": []
}
```

## Storage posture

### Raw panel stays separate
Do not overwrite or mutate raw measurement rows with derived values.
Store interpretation output as a separate derived artifact linked back to the source panel.

### Input snapshot is worth keeping
The evaluator should store the exact input snapshot used for the run.
That preserves:
- auditability,
- historical reproducibility,
- and future rescoring safety.

### Rule version is mandatory
Without `rule_version`, historical interpretation becomes untrustworthy once thresholds or gates change.

### Score version should be separate
Keep `score_version` separate from `rule_version` so the score framing can evolve without pretending the whole engine changed in the same way.

## Mapping from current domain evaluator

### `evaluateMinimumSlice()` output maps directly to:
- run-level coverage fields
- interpreted entry rows
- Priority Score metadata
- recommendation rows

### Additional backend-only fields still needed later
- actor metadata
- audit trace ids
- persistence timestamps
- storage-layer schema version
- richer source anchor ids from the final evidence registry
- supporting source lists where multiple anchors matter

## Guardrails

1. Do not collapse `coverage_state` into `canonical_status`.
2. Do not store missing-data recommendations as if they were severity alerts.
3. Do not let `Priority Score` become a generic `health_score` field name.
4. Do not drop `rule_ids` and `rule_version` from stored output.
5. Do not rewrite structured recommendations back into free text as the only saved form.

## Recommended next implementation step

Add backend-facing types that mirror this contract and keep them aligned with:
- `packages/domain/minimumSlice.ts`
- future recommendation contract types
- and the evidence registry once anchor sources are wired.
