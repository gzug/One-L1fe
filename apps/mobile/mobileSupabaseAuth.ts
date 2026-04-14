import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  MinimumSliceAuthSession,
  MinimumSliceAuthSessionProvider,
} from './minimumSliceScreenController.ts';

let _client: SupabaseClient | undefined;

export function getMobileSupabaseClient(): SupabaseClient {
  if (_client !== undefined) return _client;

  const url = process.env.EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL and EXPO_PUBLIC_ONE_L1FE_SUPABASE_ANON_KEY must be set.',
    );
  }

  _client = createClient(url, anonKey);
  return _client;
}

export async function getFreshAccessToken(): Promise<string> {
  const client = getMobileSupabaseClient();
  const { data, error } = await client.auth.getSession();

  if (error !== null) {
    throw new Error(`Supabase auth error: ${error.message}`);
  }

  if (data.session === null) {
    throw new Error('No active session. Please sign in first.');
  }

  return data.session.access_token;
}

export function createMobileSupabaseAuthSessionProvider(): MinimumSliceAuthSessionProvider {
  return {
    async getSession(): Promise<MinimumSliceAuthSession> {
      const client = getMobileSupabaseClient();
      const { data, error } = await client.auth.getSession();

      if (error !== null) {
        throw new Error(`Supabase auth error: ${error.message}`);
      }

      if (data.session === null) {
        throw new Error('No active session. Please sign in first.');
      }

      return {
        user: { id: data.session.user.id },
        accessToken: data.session.access_token,
      };
    },
  };
}
