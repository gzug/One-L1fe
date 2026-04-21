import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

import {
  parseMinimumSliceFunctionRequestBody,
  parseOptionalDateFromIso,
} from './_lib/domain/minimumSliceFunctionContract.ts';
import { loadEvidenceForRules } from './_lib/domain/evidenceRegistry.ts';
import { collectRuleIdsForPanel } from './_lib/domain/minimumSlice.ts';
import { saveMinimumSliceInterpretation } from './_lib/domain/supabaseRepository.ts';
import { corsHeaders, json } from '../_shared/http.ts';

// ---------------------------------------------------------------------------
// Typed error classes (#33)
// ---------------------------------------------------------------------------

/** Auth token missing or invalid → 401 */
class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/** Request payload malformed or fails validation → 400 */
class ClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClientError';
  }
}

/** Referenced ID does not belong to the authenticated user → 403 */
class OwnershipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OwnershipError';
  }
}

/** Supabase write/read failed unexpectedly → 502 */
class PersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PersistenceError';
  }
}

// ---------------------------------------------------------------------------
// Ownership validation (#32)
// ---------------------------------------------------------------------------

/**
 * Verifies that a lab_results row with the given id belongs to profileId.
 * Throws OwnershipError if it does not exist or belongs to another profile.
 */
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

/**
 * Verifies that all lab_result_entries rows belong to profileId via their
 * parent lab_result. Only validates IDs actually present in the map.
 */
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

/**
 * Verifies that a derived_insights row belongs to profileId.
 */
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

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

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
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
    const evidenceClient = supabaseServiceRoleKey
      ? createClient(supabaseUrl, supabaseServiceRoleKey)
      : supabase;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new AuthError('Unauthorized.');
    }

    // profileId is always derived from the auth session — never from the
    // request body. Caller-supplied profile ids are intentionally ignored.
    const profileId = user.id;

    // Parse and validate request body (ClientError on failure)
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

    const evidenceRuleIds = collectRuleIdsForPanel({
      profileId,
      panelId: body.panel.panelId,
      collectedAt: body.panel.collectedAt,
      source: body.panel.source,
      entries: body.panel.entries,
    });
    const evidenceAnchors = Array.from((await loadEvidenceForRules(evidenceClient, evidenceRuleIds)).values()).flat();

    // Ownership validation for all referenced IDs (#32)
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

    // Persistence (PersistenceError bubbles from supabaseRepository on failure)
    let result;
    try {
      result = await saveMinimumSliceInterpretation(
        supabase,
        {
          profileId,
          panelId: body.panel.panelId,
          collectedAt: body.panel.collectedAt,
          source: body.panel.source,
          entries: body.panel.entries,
        },
        {
          now: parseOptionalDateFromIso(body.execution?.now, 'execution.now'),
          createdAt: body.execution?.createdAt,
          labResultId: persistence?.labResultId,
          interpretedEntryLabResultEntryIds: persistence?.interpretedEntryLabResultEntryIds,
          derivedInsightId: persistence?.derivedInsightId,
          auditTraceId: persistence?.auditTraceId,
          evidenceAnchors,
        },
      );
    } catch (e) {
      if (e instanceof OwnershipError || e instanceof ClientError || e instanceof AuthError) throw e;
      throw new PersistenceError(e instanceof Error ? e.message : 'Persistence failed.');
    }

    return json(result, { status: 200 });

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
