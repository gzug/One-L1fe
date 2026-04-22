import { SaveMinimumSliceInterpretationResult } from './supabaseRepository.ts';

export interface MinimumSliceResultSummary {
  profileId: string;
  panelId: string;
  interpretationRunId: string;
  interpretedEntryCount: number;
  recommendationCount: number;
  coverageState?: string;
  priorityScoreValue?: number;
  topDrivers: string[];
  runtimeEvidenceClass?: string;
  runtimeEvidenceAnchorCount?: number;
  runtimePriorityScoreValue?: number;
}

export function summarizeMinimumSliceResult(
  result: SaveMinimumSliceInterpretationResult,
): MinimumSliceResultSummary {
  return {
    profileId: result.evaluation.profileId,
    panelId: result.evaluation.panelId,
    interpretationRunId: result.persistence.interpretationRunId,
    interpretedEntryCount: result.persistence.interpretedEntryIds.length,
    recommendationCount: result.persistence.recommendationIds.length,
    coverageState: result.evaluation.coverage?.state,
    priorityScoreValue: result.evaluation.priorityScore?.value,
    topDrivers: result.evaluation.priorityScore?.topDrivers ?? [],
    runtimeEvidenceClass: result.priorityScoreRuntime?.priorityScore.productEvidenceClass,
    runtimeEvidenceAnchorCount: result.priorityScoreRuntime?.priorityScore.anchorCount,
    runtimePriorityScoreValue: result.priorityScoreRuntime?.priorityScore.mappedValue,
  };
}
