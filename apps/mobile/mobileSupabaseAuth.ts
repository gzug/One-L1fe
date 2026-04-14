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

  // AsyncStorage is required on React Native / Expo for session persistence
  // across app restarts. Without it, the Supabase client cannot restore
  // the session and the user would be signed out on every cold start.
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

/**
 * Returns a fresh access token by calling refreshSession().
 * Use this as the canonical token path when calling the backend.
 * Do NOT use getSession() for token retrieval — it may return a stale token
 * without triggering a refresh.
 */
export async function getFreshAccessToken(): Promise<string> {
  const client = getMobileSupabaseClient();
  const { data, error } = await client.auth.refreshSession();

  if (error !== null) {
    throw new Error(`Supabase token refresh failed: ${error.message}`);
  }

  if (data.session === null) {
    throw new Error('No active session after refresh. Please sign in.');
  }

  return data.session.access_token;
}

export function createMobileSupabaseAuthSessionProvider(): MinimumSliceAuthSessionProvider {
  return {
    async getSession(): Promise<MinimumSliceAuthSession> {
      const client = getMobileSupabaseClient();

      // Use getUser() to validate the session server-side and get a
      // confirmed user object, then getFreshAccessToken() for a live token.
      const { data: userData, error: userError } = await client.auth.getUser();

      if (userError !== null) {
        throw new Error(`Supabase auth error: ${userError.message}`);
      }

      if (userData.user === null) {
        throw new Error('No active session. Please sign in first.');
      }

      const accessToken = await getFreshAccessToken();

      return {
        user: { id: userData.user.id },
        accessToken,
      };
    },
  };
}
