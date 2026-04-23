import { ComputePriorityScoreRuntimeResult } from './computePriorityScoreRuntime.ts';
import { toInterpretationPersistencePayload } from './contracts.ts';
import { evaluateMinimumSlice, MinimumSlicePanelInput } from './minimumSlice.ts';
import { persistInterpretationBundle, PersistInterpretationResult, SupabasePersistenceClient } from './supabasePersistence.ts';
import { toSupabasePersistenceBundle } from './supabasePayload.ts';
import { loadEvidenceForRules } from './evidenceRegistry.ts';

export interface SaveMinimumSliceInterpretationParams {
  now?: Date;
  createdAt?: string;
  labResultId?: string | null;
  interpretedEntryLabResultEntryIds?: Record<string, string>;
  derivedInsightId?: string | null;
  auditTraceId?: string | null;
}

export interface SaveMinimumSliceInterpretationResult {
  evaluation: ReturnType<typeof evaluateMinimumSlice>;
  persistence: PersistInterpretationResult;
  priorityScoreRuntime?: ComputePriorityScoreRuntimeResult;
}

export async function saveMinimumSliceInterpretation(
  client: SupabasePersistenceClient,
  input: MinimumSlicePanelInput,
  params?: SaveMinimumSliceInterpretationParams,
): Promise<SaveMinimumSliceInterpretationResult> {
  const now = params?.now ?? new Date();
  const evaluation = evaluateMinimumSlice(input, now);
  const payload = toInterpretationPersistencePayload(
    evaluation,
    input,
    params?.createdAt ?? new Date().toISOString(),
  );
  const bundleParams: Parameters<typeof toSupabasePersistenceBundle>[1] = {};

  if (params?.labResultId !== undefined) {
    bundleParams.labResultId = params.labResultId;
  }

  if (params?.interpretedEntryLabResultEntryIds !== undefined) {
    bundleParams.interpretedEntryLabResultEntryIds = params.interpretedEntryLabResultEntryIds;
  }

  if (params?.derivedInsightId !== undefined) {
    bundleParams.derivedInsightId = params.derivedInsightId;
  }

  if (params?.auditTraceId !== undefined) {
    bundleParams.auditTraceId = params.auditTraceId;
  }

  const bundle = toSupabasePersistenceBundle(payload, bundleParams);

  return {
    evaluation,
    persistence: await persistInterpretationBundle(client, bundle),
  };
}
