import { SaveMinimumSliceInterpretationResult } from './supabaseRepository.ts';

export interface MinimumSliceResultSummary {
  profileId: string;
  panelId: string;
  interpretationRunId: string;
  interpretedEntryCount: number;
  recommendationCount: number;
  coverageState?: string;
  priorityScoreValue?: number;
  productEvidenceClass?: string;
  anchorCount?: number;
  topDrivers: string[];
  runtimeEvidenceClass?: string;
  runtimeEvidenceAnchorCount?: number;
  runtimePriorityScoreValue?: number;
}

export function summarizeMinimumSliceResult(
  result: SaveMinimumSliceInterpretationResult,
): MinimumSliceResultSummary {
  const summary: MinimumSliceResultSummary = {
    profileId: result.evaluation.profileId,
    panelId: result.evaluation.panelId,
    interpretationRunId: result.persistence.interpretationRunId,
    interpretedEntryCount: result.persistence.interpretedEntryIds.length,
    recommendationCount: result.persistence.recommendationIds.length,
    topDrivers: result.evaluation.priorityScore?.topDrivers ?? [],
  };

  if (result.priorityScoreRuntime?.priorityScore.productEvidenceClass !== undefined) {
    summary.runtimeEvidenceClass = result.priorityScoreRuntime.priorityScore.productEvidenceClass;
  }
  if (result.priorityScoreRuntime?.priorityScore.anchorCount !== undefined) {
    summary.runtimeEvidenceAnchorCount = result.priorityScoreRuntime.priorityScore.anchorCount;
  }
  if (result.priorityScoreRuntime?.priorityScore.mappedValue !== undefined) {
    summary.runtimePriorityScoreValue = result.priorityScoreRuntime.priorityScore.mappedValue;
  }

  if (result.evaluation.coverage?.state !== undefined) {
    summary.coverageState = result.evaluation.coverage.state;
  }
  if (result.evaluation.priorityScore?.value !== undefined) {
    summary.priorityScoreValue = result.evaluation.priorityScore.value;
  }

  return summary;
}
