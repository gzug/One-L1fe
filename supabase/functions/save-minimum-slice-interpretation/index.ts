import { createClient } from 'npm:@supabase/supabase-js@2';

import { saveMinimumSliceInterpretation } from '../../../packages/domain/supabaseRepository.ts';
import { BiomarkerKey } from '../../../packages/domain/v1.ts';
import { corsHeaders, json } from '../_shared/http.ts';

interface RequestEntry {
  marker: BiomarkerKey;
  value?: number | null;
  unit?: string | null;
  assayType?: string | null;
  collectedAt?: string | null;
  fastingContext?: boolean | null;
  acuteContext?: boolean | null;
}

interface SaveMinimumSliceRequestBody {
  panel: {
    panelId: string;
    collectedAt: string;
    source?: string | null;
    entries: RequestEntry[];
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

function parseOptionalDate(value: unknown, field: string): Date | undefined {
  if (value === undefined) {
    return undefined;
  }

  const iso = requireString(value, field);
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} must be a valid ISO timestamp.`);
  }

  return date;
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

function parseEntry(value: unknown, index: number): RequestEntry {
  if (!isRecord(value)) {
    throw new Error(`panel.entries[${index}] must be an object.`);
  }

  const marker = requireString(value.marker, `panel.entries[${index}].marker`) as BiomarkerKey;
  const output: RequestEntry = { marker };

  if (value.value !== undefined) {
    if (value.value !== null && typeof value.value !== 'number') {
      throw new Error(`panel.entries[${index}].value must be a number or null.`);
    }

    output.value = value.value;
  }

  if (value.unit !== undefined) {
    output.unit = parseOptionalString(value.unit, `panel.entries[${index}].unit`);
  }

  if (value.assayType !== undefined) {
    output.assayType = parseOptionalString(value.assayType, `panel.entries[${index}].assayType`);
  }

  if (value.collectedAt !== undefined) {
    output.collectedAt = parseOptionalString(value.collectedAt, `panel.entries[${index}].collectedAt`);
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

function parseBody(value: unknown): SaveMinimumSliceRequestBody {
  if (!isRecord(value)) {
    throw new Error('Request body must be a JSON object.');
  }

  if (!isRecord(value.panel)) {
    throw new Error('panel must be an object.');
  }

  if (!Array.isArray(value.panel.entries) || value.panel.entries.length === 0) {
    throw new Error('panel.entries must be a non-empty array.');
  }

  const body: SaveMinimumSliceRequestBody = {
    panel: {
      panelId: requireString(value.panel.panelId, 'panel.panelId'),
      collectedAt: requireString(value.panel.collectedAt, 'panel.collectedAt'),
      entries: value.panel.entries.map((entry, index) => parseEntry(entry, index)),
    },
  };

  if (value.panel.source !== undefined) {
    body.panel.source = parseOptionalString(value.panel.source, 'panel.source');
  }

  if (value.persistence !== undefined) {
    if (!isRecord(value.persistence)) {
      throw new Error('persistence must be an object when provided.');
    }

    body.persistence = {
      labResultId: parseOptionalString(value.persistence.labResultId, 'persistence.labResultId'),
      interpretedEntryLabResultEntryIds: parseOptionalStringMap(
        value.persistence.interpretedEntryLabResultEntryIds,
        'persistence.interpretedEntryLabResultEntryIds',
      ),
      derivedInsightId: parseOptionalString(value.persistence.derivedInsightId, 'persistence.derivedInsightId'),
      auditTraceId: parseOptionalString(value.persistence.auditTraceId, 'persistence.auditTraceId'),
    };
  }

  if (value.execution !== undefined) {
    if (!isRecord(value.execution)) {
      throw new Error('execution must be an object when provided.');
    }

    body.execution = {
      now: parseOptionalIsoString(value.execution.now, 'execution.now'),
      createdAt: parseOptionalIsoString(value.execution.createdAt, 'execution.createdAt'),
    };
  }

  return body;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be configured for the function runtime.');
    }

    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return json({ error: 'Missing Authorization header.' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = parseBody(await request.json());

    const result = await saveMinimumSliceInterpretation(
      supabase,
      {
        profileId: user.id,
        panelId: body.panel.panelId,
        collectedAt: body.panel.collectedAt,
        source: body.panel.source,
        entries: body.panel.entries,
      },
      {
        now: parseOptionalDate(body.execution?.now, 'execution.now'),
        createdAt: body.execution?.createdAt,
        labResultId: body.persistence?.labResultId,
        interpretedEntryLabResultEntryIds: body.persistence?.interpretedEntryLabResultEntryIds,
        derivedInsightId: body.persistence?.derivedInsightId,
        auditTraceId: body.persistence?.auditTraceId,
      },
    );

    return json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error.';
    return json({ error: message }, { status: 400 });
  }
});
