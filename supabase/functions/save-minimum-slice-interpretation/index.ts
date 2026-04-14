import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

import {
  parseMinimumSliceFunctionRequestBody,
  parseOptionalDateFromIso,
} from './_lib/domain/minimumSliceFunctionContract.ts';
import { saveMinimumSliceInterpretation } from './_lib/domain/supabaseRepository.ts';
import { corsHeaders, json } from '../_shared/http.ts';

/**
 * Determines whether a thrown error is the result of bad client input
 * (parse/validation failure) vs. an unexpected server-side failure.
 * Client errors → 400, server errors → 500.
 */
function isClientError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const clientErrorSignals = [
    'must be',
    'must be a',
    'must be an',
    'panel.',
    'persistence.',
    'execution.',
    'Request body',
    'non-empty',
    'valid ISO',
    'number or null',
    'boolean or null',
  ];
  return clientErrorSignals.some((signal) => error.message.includes(signal));
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

    const body = parseMinimumSliceFunctionRequestBody(await request.json());

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
    const message = error instanceof Error ? error.message : 'Unknown error.';
    const status = isClientError(error) ? 400 : 500;
    return json({ error: message }, { status });
  }
});
