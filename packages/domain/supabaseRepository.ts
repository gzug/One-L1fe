import { toInterpretationPersistencePayload } from './contracts.ts';
import { EvidenceAnchor } from './evidenceRegistry.ts';
import { evaluateMinimumSlice, MinimumSlicePanelInput } from './minimumSlice.ts';
import { persistInterpretationBundle, PersistInterpretationResult, SupabasePersistenceClient } from './supabasePersistence.ts';
import { toSupabasePersistenceBundle } from './supabasePayload.ts';

export interface SaveMinimumSliceInterpretationParams {
  now?: Date;
  createdAt?: string;
  labResultId?: string | null;
  interpretedEntryLabResultEntryIds?: Record<string, string>;
  derivedInsightId?: string | null;
  auditTraceId?: string | null;
  evidenceAnchors?: EvidenceAnchor[];
}

export interface SaveMinimumSliceInterpretationResult {
  evaluation: ReturnType<typeof evaluateMinimumSlice>;
  persistence: PersistInterpretationResult;
}

export async function saveMinimumSliceInterpretation(
  client: SupabasePersistenceClient,
  input: MinimumSlicePanelInput,
  params?: SaveMinimumSliceInterpretationParams,
): Promise<SaveMinimumSliceInterpretationResult> {
  const evaluation = evaluateMinimumSlice(input, params?.now ?? new Date(), params?.evidenceAnchors);
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
