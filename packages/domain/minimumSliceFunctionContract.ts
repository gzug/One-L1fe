import { BiomarkerKey } from './v1';

export interface MinimumSliceFunctionRequestEntry {
  marker: BiomarkerKey;
  value?: number | null;
  unit?: string | null;
  assayType?: string | null;
  collectedAt?: string | null;
  fastingContext?: boolean | null;
  acuteContext?: boolean | null;
}

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
    const collectedAt = parseOptionalString(value.collectedAt, `panel.entries[${index}].collectedAt`);

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
      collectedAt: requireString(value.panel.collectedAt, 'panel.collectedAt'),
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
