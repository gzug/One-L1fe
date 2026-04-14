/**
 * Shared HTTP utilities for Supabase Edge Functions.
 *
 * CORS policy note:
 * Access-Control-Allow-Origin is set to '*' intentionally.
 * All endpoints require a valid Bearer token in the Authorization header,
 * which means CORS wildcard does not grant unauthorized access.
 * Browsers will not send the Bearer token cross-origin without explicit
 * JavaScript code doing so — passive cross-site reads are not a risk here.
 * If cookies or credentials were used instead, '*' would be unsafe.
 */
export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  });
}
