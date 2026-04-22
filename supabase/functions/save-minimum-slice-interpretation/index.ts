import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

import { computePriorityScoreRuntime } from '../../../packages/domain/computePriorityScoreRuntime.ts';
import {
  parseMinimumSliceFunctionRequestBody,
  parseOptionalDateFromIso,
} from '../../../packages/domain/minimumSliceFunctionContract.ts';
import { saveMinimumSliceInterpretation } from '../../../packages/domain/supabaseRepository.ts';
import { corsHeaders, json } from '../_shared/http.ts';

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

class ClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClientError';
  }
}

class OwnershipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OwnershipError';
  }
}

class PersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PersistenceError';
  }
}

async function assertLabResultOwnership(
  client: SupabaseClient,
  labResultId: string,
  profileId: string,
): Promise<void> {
  const { data, error } = await client
    .from('lab_results')
    .select('id')
    .eq('id', labResultId)
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) {
    throw new PersistenceError(`Ownership check failed for lab_results: ${error.message}`);
  }

  if (!data) {
    throw new OwnershipError(
      `labResultId ${labResultId} does not exist or does not belong to the authenticated profile.`,
    );
  }
}

async function assertLabResultEntriesOwnership(
  client: SupabaseClient,
  entryIds: string[],
  profileId: string,
): Promise<void> {
  if (entryIds.length === 0) return;

  const { data, error } = await client
    .from('lab_result_entries')
    .select('id, lab_results!inner(profile_id)')
    .in('id', entryIds)
    .eq('lab_results.profile_id', profileId);

  if (error) {
    throw new PersistenceError(`Ownership check failed for lab_result_entries: ${error.message}`);
  }

  const ownedIds = new Set((data ?? []).map((row: { id: string }) => row.id));
  const foreign = entryIds.filter((id) => !ownedIds.has(id));

  if (foreign.length > 0) {
    throw new OwnershipError(
      `interpretedEntryLabResultEntryIds contains IDs that do not belong to the authenticated profile: ${foreign.join(', ')}.`,
    );
  }
}

async function assertDerivedInsightOwnership(
  client: SupabaseClient,
  derivedInsightId: string,
  profileId: string,
): Promise<void> {
  const { data, error } = await client
    .from('derived_insights')
    .select('id')
    .eq('id', derivedInsightId)
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) {
    throw new PersistenceError(`Ownership check failed for derived_insights: ${error.message}`);
  }

  if (!data) {
    throw new OwnershipError(
      `derivedInsightId ${derivedInsightId} does not exist or does not belong to the authenticated profile.`,
    );
  }
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
      throw new AuthError('Missing Authorization header.');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new AuthError('Unauthorized.');
    }

    const profileId = user.id;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      throw new ClientError('Request body must be valid JSON.');
    }

    const body = (() => {
      try {
        return parseMinimumSliceFunctionRequestBody(rawBody);
      } catch (e) {
        throw new ClientError(e instanceof Error ? e.message : 'Invalid request body.');
      }
    })();

    const persistence = body.persistence;

    if (persistence?.labResultId) {
      await assertLabResultOwnership(supabase, persistence.labResultId, profileId);
    }

    if (persistence?.interpretedEntryLabResultEntryIds) {
      const entryIds = Object.values(persistence.interpretedEntryLabResultEntryIds);
      await assertLabResultEntriesOwnership(supabase, entryIds, profileId);
    }

    if (persistence?.derivedInsightId) {
      await assertDerivedInsightOwnership(supabase, persistence.derivedInsightId, profileId);
    }

    const panelInput = {
      profileId,
      panelId: body.panel.panelId,
      collectedAt: body.panel.collectedAt,
      source: body.panel.source,
      entries: body.panel.entries,
    };
    const executionNow = parseOptionalDateFromIso(body.execution?.now, 'execution.now');

    let result;
    try {
      result = await saveMinimumSliceInterpretation(
        supabase,
        panelInput,
        {
          now: executionNow,
          createdAt: body.execution?.createdAt,
          labResultId: persistence?.labResultId,
          interpretedEntryLabResultEntryIds: persistence?.interpretedEntryLabResultEntryIds,
          derivedInsightId: persistence?.derivedInsightId,
          auditTraceId: persistence?.auditTraceId,
        },
      );
    } catch (e) {
      if (e instanceof OwnershipError || e instanceof ClientError || e instanceof AuthError) throw e;
      throw new PersistenceError(e instanceof Error ? e.message : 'Persistence failed.');
    }

    try {
      const priorityScoreRuntime = await computePriorityScoreRuntime(
        supabase,
        panelInput,
        executionNow ?? new Date(),
      );

      return json({
        ...result,
        priorityScoreRuntime,
      }, { status: 200 });
    } catch (e) {
      throw new PersistenceError(
        e instanceof Error
          ? `Priority score runtime failed after persistence: ${e.message}`
          : 'Priority score runtime failed after persistence.',
      );
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ClientError) {
      return json({ error: error.message }, { status: 400 });
    }
    if (error instanceof OwnershipError) {
      return json({ error: error.message }, { status: 403 });
    }
    if (error instanceof PersistenceError) {
      return json({ error: error.message }, { status: 502 });
    }
    const message = error instanceof Error ? error.message : 'Unknown error.';
    return json({ error: message }, { status: 500 });
  }
});
