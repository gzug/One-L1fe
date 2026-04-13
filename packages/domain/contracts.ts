import { CanonicalStatus } from './biomarkers';
import { BiomarkerKey, FreshnessState, InterpretabilityState, LipidHierarchyDecision } from './v1';
import { MinimumSliceEvaluation, Recommendation } from './minimumSlice';
import { ProductEvidenceClass, RuleOrigin } from './provenance';

export const PRIORITY_SCORE_VERSION = 'priority-score-v1-minimum-slice';
export const DOMAIN_ENGINE_NAME = 'one-l1fe-domain';
export const DOMAIN_ENGINE_MODE = 'minimum_slice_v1';

export interface InterpretationRunRecord {
  interpretationRunId: string;
  profileId: string;
  panelId: string;
  ruleVersion: string;
  scoreVersion: string;
  createdAt: string;
  engineName: string;
  engineMode: string;
  inputSnapshot: unknown;
  coverageState: MinimumSliceEvaluation['coverage']['state'];
  coverageNotes: string[];
  priorityScoreValue: number;
  priorityScoreRawValue: number;
  priorityScoreMetadata: MinimumSliceEvaluation['priorityScore'];
}

export interface InterpretedEntryRecord {
  interpretedEntryId: string;
  interpretationRunId: string;
  markerKey: BiomarkerKey;
  displayName: string;
  rawValue: number | null | undefined;
  rawUnit: string | null | undefined;
  interpretableState: InterpretabilityState;
  blockingReason: string | undefined;
  freshnessState: FreshnessState;
  canonicalStatus: CanonicalStatus | 'unknown';
  severity: number | null;
  scoreEligible: boolean;
  scoreContribution: number;
  ruleIds: string[];
  notesJson: string[];
}

export interface RecommendationRecord extends Recommendation {
  recommendationId: string;
  interpretationRunId: string;
  anchorSourceId: string | undefined;
  ruleOrigin: RuleOrigin | undefined;
  productEvidenceClass: ProductEvidenceClass | undefined;
}

export interface InterpretationPersistencePayload {
  run: InterpretationRunRecord;
  lipidDecision: LipidHierarchyDecision;
  entries: InterpretedEntryRecord[];
  recommendations: RecommendationRecord[];
}

function makeId(prefix: string, parts: Array<string | number>): string {
  return [prefix, ...parts]
    .join('_')
    .replace(/[^a-zA-Z0-9_:-]/g, '_');
}

export function toInterpretationPersistencePayload(
  evaluation: MinimumSliceEvaluation,
  inputSnapshot: unknown,
  createdAt: string = new Date().toISOString(),
): InterpretationPersistencePayload {
  const interpretationRunId = makeId('irun', [evaluation.panelId, evaluation.ruleVersion]);

  return {
    run: {
      interpretationRunId,
      profileId: evaluation.profileId,
      panelId: evaluation.panelId,
      ruleVersion: evaluation.ruleVersion,
      scoreVersion: PRIORITY_SCORE_VERSION,
      createdAt,
      engineName: DOMAIN_ENGINE_NAME,
      engineMode: DOMAIN_ENGINE_MODE,
      inputSnapshot,
      coverageState: evaluation.coverage.state,
      coverageNotes: evaluation.coverage.notes,
      priorityScoreValue: evaluation.priorityScore.value,
      priorityScoreRawValue: evaluation.priorityScore.rawValue,
      priorityScoreMetadata: evaluation.priorityScore,
    },
    lipidDecision: evaluation.lipidDecision,
    entries: evaluation.entries.map((entry) => ({
      interpretedEntryId: makeId('ientry', [evaluation.panelId, entry.marker]),
      interpretationRunId,
      markerKey: entry.marker,
      displayName: entry.displayName,
      rawValue: entry.value,
      rawUnit: entry.unit,
      interpretableState: entry.interpretableState,
      blockingReason: entry.blockingReason,
      freshnessState: entry.freshness,
      canonicalStatus: entry.canonicalStatus,
      severity: entry.severity,
      scoreEligible: entry.scoreEligible,
      scoreContribution: entry.scoreContribution,
      ruleIds: entry.ruleIds,
      notesJson: entry.notes,
    })),
    recommendations: evaluation.recommendations.map((recommendation, index) => ({
      recommendationId: makeId('rec', [evaluation.panelId, index + 1, recommendation.ruleId]),
      interpretationRunId,
      ...recommendation,
    })),
  };
}
