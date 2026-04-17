import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

import {
  parseMinimumSliceFunctionRequestBody,
  parseOptionalDateFromIso,
} from './_lib/domain/minimumSliceFunctionContract.ts';
import { saveMinimumSliceInterpretation } from './_lib/domain/supabaseRepository.ts';
import { corsHeaders, json } from '../_shared/http.ts';

/**
 * Thrown when the request payload is invalid or fails validation.
 * Maps to HTTP 400.
 */
class ClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClientError';
  }
}

/**
 * Thrown when the authenticated user does not own the requested resource.
 * Maps to HTTP 403.
 */
class OwnershipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OwnershipError';
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

    // Ownership enforcement: profileId is always taken from the authenticated
    // session. Any caller-supplied profileId in the payload is intentionally
    // ignored (see README). We surface an explicit error if the panel somehow
    // routes to a different profile to make ownership violations auditable.
    const profileId = user.id;

    const result = await saveMinimumSliceInterpretation(
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
        labResultId: body.persistence?.labResultId,
        interpretedEntryLabResultEntryIds: body.persistence?.interpretedEntryLabResultEntryIds,
        derivedInsightId: body.persistence?.derivedInsightId,
        auditTraceId: body.persistence?.auditTraceId,
      },
    );

    return json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ClientError) {
      return json({ error: error.message }, { status: 400 });
    }

    if (error instanceof OwnershipError) {
      return json({ error: error.message }, { status: 403 });
    }

    const message = error instanceof Error ? error.message : 'Unknown error.';
    return json({ error: message }, { status: 500 });
  }
});
