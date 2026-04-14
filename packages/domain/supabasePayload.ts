import { InterpretationPersistencePayload } from './contracts.ts';

export interface SupabaseInterpretationRunInsert {
  external_run_id: string;
  profile_id: string;
  lab_result_id: string | null;
  rule_version: string;
  score_version: string;
  engine_name: string;
  engine_mode: string;
  input_snapshot: unknown;
  coverage_state: string;
  coverage_notes: unknown;
  priority_score_value: number;
  priority_score_raw_value: number;
  priority_score_metadata: unknown;
  lipid_decision: unknown;
  audit_trace_id: string | null;
}

export interface SupabaseInterpretedEntryInsert {
  external_entry_id: string;
  interpretation_run_id?: string;
  lab_result_entry_id: string | null;
  marker_key: string;
  display_name: string;
  raw_value: number | null;
  raw_unit: string | null;
  interpretable_state: string;
  blocking_reason: string | null;
  freshness_state: string;
  canonical_status: string;
  severity: number | null;
  score_eligible: boolean;
  score_contribution: number;
  rule_ids: unknown;
  notes_json: unknown;
}

export interface SupabaseRecommendationInsert {
  external_recommendation_id: string;
  profile_id: string;
  interpretation_run_id?: string;
  derived_insight_id: string | null;
  recommendation_type: string;
  verdict: string;
  recommendation_text: string;
  evidence_summary: string;
  // TODO: evidence field is currently a single-element array wrapping evidence_summary.
  // This should be typed as string[] in the DB schema and populated with the full
  // supporting source list from the evidence registry (anchorSourceId + supportingSourceIds).
  evidence: unknown;
  confidence: string;
  scope: string;
  actionability: string | null;
  handoff_required: boolean;
  rule_id: string;
  anchor_source_id: string | null;
  rule_origin: string | null;
  product_evidence_class: string | null;
  status: string;
}

export interface SupabasePersistenceBundle {
  interpretationRun: SupabaseInterpretationRunInsert;
  interpretedEntries: SupabaseInterpretedEntryInsert[];
  recommendations: SupabaseRecommendationInsert[];
}

function normalizeNullableText(value: string | undefined): string | null {
  return value ?? null;
}

export function toSupabasePersistenceBundle(
  payload: InterpretationPersistencePayload,
  params?: {
    labResultId?: string | null;
    interpretedEntryLabResultEntryIds?: Record<string, string>;
    derivedInsightId?: string | null;
    auditTraceId?: string | null;
  },
): SupabasePersistenceBundle {
  const interpretationRun: SupabaseInterpretationRunInsert = {
    external_run_id: payload.run.interpretationRunId,
    profile_id: payload.run.profileId,
    lab_result_id: params?.labResultId ?? null,
    rule_version: payload.run.ruleVersion,
    score_version: payload.run.scoreVersion,
    engine_name: payload.run.engineName,
    engine_mode: payload.run.engineMode,
    input_snapshot: payload.run.inputSnapshot,
    coverage_state: payload.run.coverageState,
    coverage_notes: payload.run.coverageNotes,
    priority_score_value: payload.run.priorityScoreValue,
    priority_score_raw_value: payload.run.priorityScoreRawValue,
    priority_score_metadata: payload.run.priorityScoreMetadata,
    lipid_decision: payload.lipidDecision,
    audit_trace_id: params?.auditTraceId ?? null,
  };

  const interpretedEntries: SupabaseInterpretedEntryInsert[] = payload.entries.map((entry) => ({
    external_entry_id: entry.interpretedEntryId,
    lab_result_entry_id: params?.interpretedEntryLabResultEntryIds?.[entry.markerKey] ?? null,
    marker_key: entry.markerKey,
    display_name: entry.displayName,
    raw_value: entry.rawValue ?? null,
    raw_unit: entry.rawUnit ?? null,
    interpretable_state: entry.interpretableState,
    blocking_reason: normalizeNullableText(entry.blockingReason),
    freshness_state: entry.freshnessState,
    canonical_status: entry.canonicalStatus,
    severity: entry.severity,
    score_eligible: entry.scoreEligible,
    score_contribution: entry.scoreContribution,
    rule_ids: entry.ruleIds,
    notes_json: entry.notesJson,
  }));

  const recommendations: SupabaseRecommendationInsert[] = payload.recommendations.map((recommendation) => ({
    external_recommendation_id: recommendation.recommendationId,
    profile_id: payload.run.profileId,
    derived_insight_id: params?.derivedInsightId ?? null,
    recommendation_type: recommendation.type,
    verdict: recommendation.verdict,
    recommendation_text: recommendation.text,
    evidence_summary: recommendation.evidenceSummary,
    evidence: [recommendation.evidenceSummary],
    confidence: recommendation.confidence,
    scope: recommendation.scope,
    actionability: null,
    handoff_required: recommendation.handoffRequired,
    rule_id: recommendation.ruleId,
    anchor_source_id: normalizeNullableText(recommendation.anchorSourceId),
    rule_origin: normalizeNullableText(recommendation.ruleOrigin),
    product_evidence_class: normalizeNullableText(recommendation.productEvidenceClass),
    status: 'open',
  }));

  return {
    interpretationRun,
    interpretedEntries,
    recommendations,
  };
}
