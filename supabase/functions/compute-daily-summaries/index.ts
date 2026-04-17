import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/http.ts';
import { validateComputeRequest } from './_lib/validate.ts';
import { computeDailySummaries } from './_lib/compute.ts';

/**
 * compute-daily-summaries
 *
 * Triggered by the mobile app (or a cron/pg_cron job) after a successful
 * wearables-sync call to materialise per-day aggregates into
 * wearable_daily_summaries.
 *
 * Design constraints:
 *   - Runs per profile_id + wearable_source_id + date range.
 *   - Only processes aggregation_level = 'day' observations in v1.
 *   - Uses upsert so it is safe to re-run (idempotent).
 *   - Does NOT merge across sources — summary_source_scope is always
 *     'single_source' in v1.
 *   - Requires a valid JWT; the caller must be the profile owner.
 */
Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'METHOD_NOT_ALLOWED', message: 'Only POST is accepted.' }, { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return json(
        { error: 'SERVER_MISCONFIGURED', message: 'SUPABASE_URL and SUPABASE_ANON_KEY must be set.' },
        { status: 500 },
      );
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'MISSING_AUTH', message: 'Missing Authorization header.' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token.' }, { status: 401 });
    }

    const rawBody = await request.json();
    const body = validateComputeRequest(rawBody);

    const result = await computeDailySummaries(supabase, user.id, body);

    return json(result, { status: 200 });
  } catch (error) {
    const isValidation = error instanceof Error && error.message.startsWith('VALIDATION:');
    const message = error instanceof Error ? error.message : 'Unknown error.';
    return json(
      { error: isValidation ? 'INVALID_REQUEST' : 'COMPUTE_ERROR', message },
      { status: isValidation ? 400 : 500 },
    );
  }
});
