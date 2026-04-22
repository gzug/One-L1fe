import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

import { computePriorityScoreRuntime } from '../../../packages/domain/computePriorityScoreRuntime.ts';
import {
  parseMinimumSliceFunctionRequestBody,
  parseOptionalDateFromIso,
} from '../../../packages/domain/minimumSliceFunctionContract.ts';
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

    const result = await computePriorityScoreRuntime(
      supabase,
      {
        profileId: user.id,
        panelId: body.panel.panelId,
        collectedAt: body.panel.collectedAt,
        source: body.panel.source,
        entries: body.panel.entries,
      },
      parseOptionalDateFromIso(body.execution?.now, 'execution.now') ?? new Date(),
    );

    return json(result, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ClientError) {
      return json({ error: error.message }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Unknown error.';
    return json({ error: message }, { status: 500 });
  }
});
