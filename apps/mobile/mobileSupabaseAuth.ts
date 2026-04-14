import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  _client = createClient(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return _client;
}

// ─── Fresh Access Token ───────────────────────────────────────────────────────

export type FreshAccessTokenResult =
  | { kind: 'ok'; accessToken: string }
  | { kind: 'signed-out' }
  | { kind: 'error'; message: string };

export async function getFreshAccessToken(): Promise<FreshAccessTokenResult> {
  let client: SupabaseClient;
  try {
    client = getMobileSupabaseClient();
  } catch (e) {
    return {
      kind: 'error',
      message: e instanceof Error ? e.message : 'Supabase client config invalid.',
    };
  }

  const { data, error } = await client.auth.getSession();
  if (error) return { kind: 'error', message: `getSession failed: ${error.message}` };
  if (!data.session?.access_token) return { kind: 'signed-out' };
  return { kind: 'ok', accessToken: data.session.access_token };
}

// ─── Auth Session Provider ────────────────────────────────────────────────────

export function createMobileSupabaseAuthSessionProvider(): MinimumSliceAuthSessionProvider {
  return {
    async getSession(): Promise<MinimumSliceAuthSession> {
      const result = await getFreshAccessToken();

      if (result.kind === 'ok') {
        const client = getMobileSupabaseClient();
        const { data } = await client.auth.getSession();
        return {
          user: { id: data.session!.user.id },
          accessToken: result.accessToken,
        };
      }

      if (result.kind === 'signed-out') {
        throw new Error('No active session. Please sign in first.');
      }

      throw new Error(result.message);
    },
  };
}
