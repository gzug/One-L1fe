import { FieldState, FieldStateReason, FieldValueSource, requiresNullValueForFieldState } from './fieldValueState.ts';
import { BiomarkerKey } from './v1.ts';

export interface MinimumSliceFunctionRequestEntry {
  marker: BiomarkerKey;
  value?: number | null;
  field_state?: FieldState;
  value_source?: FieldValueSource;
  state_reason?: FieldStateReason | null;
  unit?: string | null;
  assayType?: string | null;
  collectedAt?: string | null;
  fastingContext?: boolean | null;
  acuteContext?: boolean | null;
}

const VALID_FIELD_STATES: FieldState[] = ['provided', 'synced', 'manual_override', 'missing', 'disabled'];
const VALID_FIELD_VALUE_SOURCES: FieldValueSource[] = ['manual', 'wearable_sync', 'vendor_import', 'lab', 'derived', 'unknown'];
const VALID_FIELD_STATE_REASONS: FieldStateReason[] = [
  'not_available',
  'not_known',
  'prefer_not_to_answer',
  'sync_failed',
  'sync_partial',
  'sync_suspect',
  'user_corrected',
  'user_disabled',
  'out_of_scope',
];

export interface MinimumSliceFunctionRequestBody {
  panel: {
    panelId: string;
    collectedAt: string;
    source?: string | null;
    entries: MinimumSliceFunctionRequestEntry[];
  };
  persistence?: {
    labResultId?: string | null;
    interpretedEntryLabResultEntryIds?: Record<string, string>;
    derivedInsightId?: string | null;
    auditTraceId?: string | null;
  };
  execution?: {
    now?: string;
    createdAt?: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string.`);
  }

  return value;
}

function parseOptionalString(value: unknown, field: string): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return requireString(value, field);
}

function parseOptionalStringMap(value: unknown, field: string): Record<string, string> | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    throw new Error(`${field} must be an object when provided.`);
  }

  const output: Record<string, string> = {};

  for (const [key, entryValue] of Object.entries(value)) {
    output[key] = requireString(entryValue, `${field}.${key}`);
  }

  return output;
}

function parseOptionalIsoString(value: unknown, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const iso = requireString(value, field);

  if (Number.isNaN(new Date(iso).getTime())) {
    throw new Error(`${field} must be a valid ISO timestamp.`);
  }

  return iso;
}

function parseOptionalNullableIsoString(value: unknown, field: string): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return parseOptionalIsoString(value, field);
}

function parseOptionalFieldState(value: unknown, field: string): FieldState | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsed = requireString(value, field) as FieldState;
  if (!VALID_FIELD_STATES.includes(parsed)) {
    throw new Error(`${field} must be one of: ${VALID_FIELD_STATES.join(', ')}.`);
  }

  return parsed;
}

function parseFieldState(value: unknown, field: string): FieldState {
  const parsed = parseOptionalFieldState(value, field);
  if (parsed === undefined) {
    throw new Error(`${field} is required.`);
  }

  return parsed;
}

function parseOptionalFieldValueSource(value: unknown, field: string): FieldValueSource | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsed = requireString(value, field) as FieldValueSource;
  if (!VALID_FIELD_VALUE_SOURCES.includes(parsed)) {
    throw new Error(`${field} must be one of: ${VALID_FIELD_VALUE_SOURCES.join(', ')}.`);
  }

  return parsed;
}

function parseFieldValueSource(value: unknown, field: string): FieldValueSource {
  const parsed = parseOptionalFieldValueSource(value, field);
  if (parsed === undefined) {
    throw new Error(`${field} is required.`);
  }

  return parsed;
}

function parseOptionalFieldStateReason(value: unknown, field: string): FieldStateReason | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const parsed = requireString(value, field) as FieldStateReason;
  if (!VALID_FIELD_STATE_REASONS.includes(parsed)) {
    throw new Error(`${field} must be one of: ${VALID_FIELD_STATE_REASONS.join(', ')}.`);
  }

  return parsed;
}

function parseEntry(value: unknown, index: number): MinimumSliceFunctionRequestEntry {
  if (!isRecord(value)) {
    throw new Error(`panel.entries[${index}] must be an object.`);
  }

  const marker = requireString(value.marker, `panel.entries[${index}].marker`) as BiomarkerKey;
  const output: MinimumSliceFunctionRequestEntry = { marker };

  if (value.value !== undefined) {
    if (value.value !== null && typeof value.value !== 'number') {
      throw new Error(`panel.entries[${index}].value must be a number or null.`);
    }

    output.value = value.value;
  }

  if (value.field_state !== undefined) {
    output.field_state = parseFieldState(value.field_state, `panel.entries[${index}].field_state`);
  }

  if (value.value_source !== undefined) {
    output.value_source = parseFieldValueSource(value.value_source, `panel.entries[${index}].value_source`);
  }

  if (value.state_reason !== undefined) {
    const stateReason = parseOptionalFieldStateReason(value.state_reason, `panel.entries[${index}].state_reason`);

    if (stateReason !== undefined) {
      output.state_reason = stateReason;
    }
  }

  if (value.unit !== undefined) {
    const unit = parseOptionalString(value.unit, `panel.entries[${index}].unit`);

    if (unit !== undefined) {
      output.unit = unit;
    }
  }

  if (value.assayType !== undefined) {
    const assayType = parseOptionalString(value.assayType, `panel.entries[${index}].assayType`);

    if (assayType !== undefined) {
      output.assayType = assayType;
    }
  }

  if (value.collectedAt !== undefined) {
    const collectedAt = parseOptionalNullableIsoString(value.collectedAt, `panel.entries[${index}].collectedAt`);

    if (collectedAt !== undefined) {
      output.collectedAt = collectedAt;
    }
  }

  if (value.fastingContext !== undefined) {
    if (value.fastingContext !== null && typeof value.fastingContext !== 'boolean') {
      throw new Error(`panel.entries[${index}].fastingContext must be a boolean or null.`);
    }

    output.fastingContext = value.fastingContext;
  }

  if (value.acuteContext !== undefined) {
    if (value.acuteContext !== null && typeof value.acuteContext !== 'boolean') {
      throw new Error(`panel.entries[${index}].acuteContext must be a boolean or null.`);
    }

    output.acuteContext = value.acuteContext;
  }

  if (output.field_state && requiresNullValueForFieldState(output.field_state) && output.value !== undefined && output.value !== null) {
    throw new Error(`panel.entries[${index}].value must be null when field_state is ${output.field_state}.`);
  }

  if (output.state_reason && !output.field_state) {
    throw new Error(`panel.entries[${index}].state_reason requires field_state.`);
  }

  return output;
}

export function parseMinimumSliceFunctionRequestBody(value: unknown): MinimumSliceFunctionRequestBody {
  if (!isRecord(value)) {
    throw new Error('Request body must be a JSON object.');
  }

  if (!isRecord(value.panel)) {
    throw new Error('panel must be an object.');
  }

  if (!Array.isArray(value.panel.entries) || value.panel.entries.length === 0) {
    throw new Error('panel.entries must be a non-empty array.');
  }

  const body: MinimumSliceFunctionRequestBody = {
    panel: {
      panelId: requireString(value.panel.panelId, 'panel.panelId'),
      collectedAt: parseOptionalIsoString(value.panel.collectedAt, 'panel.collectedAt') ?? requireString(value.panel.collectedAt, 'panel.collectedAt'),
      entries: value.panel.entries.map((entry, index) => parseEntry(entry, index)),
    },
  };

  if (value.panel.source !== undefined) {
    const source = parseOptionalString(value.panel.source, 'panel.source');

    if (source !== undefined) {
      body.panel.source = source;
    }
  }

  if (value.persistence !== undefined) {
    if (!isRecord(value.persistence)) {
      throw new Error('persistence must be an object when provided.');
    }

    const persistence: NonNullable<MinimumSliceFunctionRequestBody['persistence']> = {};

    if (value.persistence.labResultId !== undefined) {
      const labResultId = parseOptionalString(value.persistence.labResultId, 'persistence.labResultId');

      if (labResultId !== undefined) {
        persistence.labResultId = labResultId;
      }
    }

    if (value.persistence.interpretedEntryLabResultEntryIds !== undefined) {
      const interpretedEntryLabResultEntryIds = parseOptionalStringMap(
        value.persistence.interpretedEntryLabResultEntryIds,
        'persistence.interpretedEntryLabResultEntryIds',
      );

      if (interpretedEntryLabResultEntryIds !== undefined) {
        persistence.interpretedEntryLabResultEntryIds = interpretedEntryLabResultEntryIds;
      }
    }

    if (value.persistence.derivedInsightId !== undefined) {
      const derivedInsightId = parseOptionalString(value.persistence.derivedInsightId, 'persistence.derivedInsightId');

      if (derivedInsightId !== undefined) {
        persistence.derivedInsightId = derivedInsightId;
      }
    }

    if (value.persistence.auditTraceId !== undefined) {
      const auditTraceId = parseOptionalString(value.persistence.auditTraceId, 'persistence.auditTraceId');

      if (auditTraceId !== undefined) {
        persistence.auditTraceId = auditTraceId;
      }
    }

    body.persistence = persistence;
  }

  if (value.execution !== undefined) {
    if (!isRecord(value.execution)) {
      throw new Error('execution must be an object when provided.');
    }

    const execution: NonNullable<MinimumSliceFunctionRequestBody['execution']> = {};

    if (value.execution.now !== undefined) {
      const now = parseOptionalIsoString(value.execution.now, 'execution.now');

      if (now !== undefined) {
        execution.now = now;
      }
    }

    if (value.execution.createdAt !== undefined) {
      const createdAt = parseOptionalIsoString(value.execution.createdAt, 'execution.createdAt');

      if (createdAt !== undefined) {
        execution.createdAt = createdAt;
      }
    }

    body.execution = execution;
  }

  return body;
}

export function parseOptionalDateFromIso(value: string | undefined, field: string): Date | undefined {
  if (value === undefined) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} must be a valid ISO timestamp.`);
  }

  return date;
}
