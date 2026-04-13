import { useCallback, useEffect, useState } from 'react';
import { getMobileSupabaseClient } from './mobileSupabaseAuth.ts';

export type AuthState = 'loading' | 'signed-out' | 'signed-in' | 'config-error';

export interface AuthUserSummary {
  id: string;
  email?: string;
}

export interface UseAuthSessionResult {
  authState: AuthState;
  error?: string;
  user?: AuthUserSummary;
  signOut: () => Promise<void>;
}

/**
 * Thin hook that resolves the current Supabase auth state and listens for
 * changes. Returns 'loading' until the initial session check completes, then
 * 'signed-in' or 'signed-out' based on the active session.
 *
 * Keeps App.tsx and future screens free of direct Supabase client wiring.
 */
type AuthSubscription = {
  unsubscribe: () => void;
};

export function useAuthSession(): UseAuthSessionResult {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [error, setError] = useState<string | undefined>();
  const [user, setUser] = useState<AuthUserSummary | undefined>();

  useEffect(() => {
    let authSubscription: AuthSubscription | undefined;

    try {
      const client = getMobileSupabaseClient();

      client.auth
        .getSession()
        .then(({ data, error: sessionError }) => {
          if (sessionError !== null) {
            setUser(undefined);
            setError(`Supabase auth error: ${sessionError.message}`);
            setAuthState('config-error');
            return;
          }

          setUser(
            data.session !== null
              ? {
                  id: data.session.user.id,
                  email: data.session.user.email,
                }
              : undefined,
          );
          setAuthState(data.session !== null ? 'signed-in' : 'signed-out');
        })
        .catch((sessionError: unknown) => {
          setUser(undefined);
          setError(
            sessionError instanceof Error
              ? sessionError.message
              : 'Failed to resolve auth session.',
          );
          setAuthState('config-error');
        });

      const authStateChangeListener = client.auth.onAuthStateChange(
        (_event, session) => {
          setError(undefined);
          setUser(
            session !== null
              ? {
                  id: session.user.id,
                  email: session.user.email,
                }
              : undefined,
          );
          setAuthState(session !== null ? 'signed-in' : 'signed-out');
        },
      );

      authSubscription = authStateChangeListener.data.subscription;
    } catch (clientError) {
      setUser(undefined);
      setError(
        clientError instanceof Error
          ? clientError.message
          : 'Supabase client configuration is invalid.',
      );
      setAuthState('config-error');
    }

    return () => {
      authSubscription?.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    const client = getMobileSupabaseClient();
    const { error: signOutError } = await client.auth.signOut();

    if (signOutError !== null) {
      throw new Error(`Supabase auth error: ${signOutError.message}`);
    }
  }, []);

  return { authState, error, user, signOut };
}
