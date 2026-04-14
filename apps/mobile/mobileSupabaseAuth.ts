import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

export type FreshAccessTokenResult =
  | { kind: 'ok'; accessToken: string }
  | { kind: 'signed-out' }
  | { kind: 'error'; message: string };

export async function getFreshAccessToken(): Promise<FreshAccessTokenResult> {
  try {
    const client = getMobileSupabaseClient();
    const { data, error } = await client.auth.getSession();

    if (error !== null) {
      return { kind: 'error', message: error.message };
    }

    if (data.session === null) {
      return { kind: 'signed-out' };
    }

    return { kind: 'ok', accessToken: data.session.access_token };
  } catch (err) {
    return {
      kind: 'error',
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

export function createMobileSupabaseAuthSessionProvider(): MinimumSliceAuthSessionProvider {
  return {
    async getSession(): Promise<MinimumSliceAuthSession> {
      const result = await getFreshAccessToken();

      if (result.kind === 'signed-out') {
        throw new Error('No active session. Please sign in first.');
      }

      if (result.kind === 'error') {
        throw new Error(`Supabase auth error: ${result.message}`);
      }

      const client = getMobileSupabaseClient();
      const { data } = await client.auth.getSession();

      return {
        user: { id: data.session!.user.id },
        accessToken: result.accessToken,
      };
    },
  };
}
