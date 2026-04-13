import { SaveMinimumSliceInterpretationResult, SaveMinimumSliceInterpretationParams } from './supabaseRepository.ts';
import { MinimumSlicePanelInput } from './minimumSlice.ts';
import { MinimumSliceFunctionRequestBody } from './minimumSliceFunctionContract.ts';

export interface BuildMinimumSliceFunctionRequestOptions extends SaveMinimumSliceInterpretationParams {}

export interface MinimumSliceFunctionTransportRequest {
  path: string;
  method: 'POST';
  headers: Record<string, string>;
  body: string;
}

export interface MinimumSliceFunctionTransportResponse {
  status: number;
  json: unknown;
}

export type MinimumSliceFunctionTransport = (
  request: MinimumSliceFunctionTransportRequest,
) => Promise<MinimumSliceFunctionTransportResponse>;

export interface InvokeMinimumSliceFunctionOptions extends BuildMinimumSliceFunctionRequestOptions {
  path?: string;
}

function toIsoString(value: string | Date, field: string): string {
  const iso = value instanceof Date ? value.toISOString() : value;

  if (Number.isNaN(new Date(iso).getTime())) {
    throw new Error(`${field} must be a valid ISO timestamp.`);
  }

  return iso;
}

function toOptionalIsoString(value: string | Date | null | undefined): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return toIsoString(value, 'timestamp');
}

export function buildMinimumSliceFunctionRequestBody(
  input: MinimumSlicePanelInput,
  options?: BuildMinimumSliceFunctionRequestOptions,
): MinimumSliceFunctionRequestBody {
  const panel: MinimumSliceFunctionRequestBody['panel'] = {
    panelId: input.panelId,
    collectedAt: toIsoString(input.collectedAt, 'panel.collectedAt'),
    entries: input.entries.map((entry) => {
      const requestEntry: MinimumSliceFunctionRequestBody['panel']['entries'][number] = {
        marker: entry.marker,
      };

      if (entry.value !== undefined) {
        requestEntry.value = entry.value;
      }

      if (entry.unit !== undefined) {
        requestEntry.unit = entry.unit;
      }

      if (entry.assayType !== undefined) {
        requestEntry.assayType = entry.assayType;
      }

      const collectedAt = toOptionalIsoString(entry.collectedAt);
      if (collectedAt !== undefined) {
        requestEntry.collectedAt = collectedAt;
      }

      if (entry.fastingContext !== undefined) {
        requestEntry.fastingContext = entry.fastingContext;
      }

      if (entry.acuteContext !== undefined) {
        requestEntry.acuteContext = entry.acuteContext;
      }

      return requestEntry;
    }),
  };

  if (input.source !== undefined) {
    panel.source = input.source;
  }

  const body: MinimumSliceFunctionRequestBody = { panel };

  const persistence: NonNullable<MinimumSliceFunctionRequestBody['persistence']> = {};
  if (options?.labResultId !== undefined) {
    persistence.labResultId = options.labResultId;
  }
  if (options?.interpretedEntryLabResultEntryIds !== undefined) {
    persistence.interpretedEntryLabResultEntryIds = options.interpretedEntryLabResultEntryIds;
  }
  if (options?.derivedInsightId !== undefined) {
    persistence.derivedInsightId = options.derivedInsightId;
  }
  if (options?.auditTraceId !== undefined) {
    persistence.auditTraceId = options.auditTraceId;
  }
  if (Object.keys(persistence).length > 0) {
    body.persistence = persistence;
  }

  const execution: NonNullable<MinimumSliceFunctionRequestBody['execution']> = {};
  if (options?.now !== undefined) {
    execution.now = options.now.toISOString();
  }
  if (options?.createdAt !== undefined) {
    execution.createdAt = options.createdAt;
  }
  if (Object.keys(execution).length > 0) {
    body.execution = execution;
  }

  return body;
}

function extractFunctionErrorMessage(value: unknown, status: number): string {
  if (typeof value === 'object' && value !== null && 'error' in value && typeof (value as { error?: unknown }).error === 'string') {
    return (value as { error: string }).error;
  }

  return `Minimum slice function call failed with status ${status}.`;
}

function isSaveMinimumSliceInterpretationResult(value: unknown): value is SaveMinimumSliceInterpretationResult {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const persistence = candidate.persistence as Record<string, unknown> | undefined;
  const evaluation = candidate.evaluation as Record<string, unknown> | undefined;

  return Boolean(
    persistence &&
      typeof persistence.interpretationRunId === 'string' &&
      Array.isArray(persistence.interpretedEntryIds) &&
      Array.isArray(persistence.recommendationIds) &&
      evaluation &&
      typeof evaluation.panelId === 'string' &&
      typeof evaluation.profileId === 'string',
  );
}

export async function invokeMinimumSliceFunction(
  transport: MinimumSliceFunctionTransport,
  input: MinimumSlicePanelInput,
  options?: InvokeMinimumSliceFunctionOptions,
): Promise<SaveMinimumSliceInterpretationResult> {
  const body = buildMinimumSliceFunctionRequestBody(input, options);
  const response = await transport({
    path: options?.path ?? 'save-minimum-slice-interpretation',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.status >= 400) {
    throw new Error(extractFunctionErrorMessage(response.json, response.status));
  }

  if (!isSaveMinimumSliceInterpretationResult(response.json)) {
    throw new Error('Minimum slice function returned an unexpected response shape.');
  }

  return response.json;
}
