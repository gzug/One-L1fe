import { useEffect, useState } from 'react';
import { getMobileSupabaseClient } from './mobileSupabaseAuth.ts';

export type AuthState = 'loading' | 'signed-out' | 'signed-in';

export interface UseAuthSessionResult {
  authState: AuthState;
}

/**
 * Thin hook that resolves the current Supabase auth state and listens for
 * changes. Returns 'loading' until the initial session check completes, then
 * 'signed-in' or 'signed-out' based on the active session.
 *
 * Keeps App.tsx and future screens free of direct Supabase client wiring.
 */
export function useAuthSession(): UseAuthSessionResult {
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    const client = getMobileSupabaseClient();

    client.auth.getSession().then(({ data }) => {
      setAuthState(data.session !== null ? 'signed-in' : 'signed-out');
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setAuthState(session !== null ? 'signed-in' : 'signed-out');
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { authState };
}
