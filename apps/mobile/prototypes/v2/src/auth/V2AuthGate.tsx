import type { Session, SupabaseClient } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { getMobileSupabaseClient } from '../../../../mobileSupabaseAuth';
import { OneL1feV2Screen } from '../OneL1feV2Screen';
import { ThemeProvider } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/marathonTheme';
import { V2AuthScreen } from './V2AuthScreen';
import { loadSignedInIdentity } from './profile';
import type { V2SignedInIdentity } from './types';

type GateState =
  | { kind: 'checking' }
  | { kind: 'signed-out'; configError?: string | null }
  | { kind: 'signed-in'; client: SupabaseClient; session: Session; identity: V2SignedInIdentity | null }
  | { kind: 'config-error'; message: string };

export function V2AuthGate() {
  const [state, setState] = useState<GateState>({ kind: 'checking' });

  useEffect(() => {
    let mounted = true;
    let client: SupabaseClient;

    try {
      client = getMobileSupabaseClient();
    } catch (error) {
      setState({
        kind: 'config-error',
        message: error instanceof Error ? error.message : 'Supabase client config invalid.',
      });
      return () => {
        mounted = false;
      };
    }

    async function applySession(nextSession: Session | null) {
      if (!mounted) return;

      if (!nextSession) {
        setState({ kind: 'signed-out' });
        return;
      }

      const activeClient = client;
      setState((current) => {
        if (current.kind === 'signed-in') {
          return { ...current, session: nextSession };
        }
        return { kind: 'signed-in', client: activeClient, session: nextSession, identity: null };
      });

      const identity = await loadSignedInIdentity(activeClient, nextSession);
      if (mounted) {
        setState({ kind: 'signed-in', client: activeClient, session: nextSession, identity });
      }
    }

    client.auth.getSession().then(({ data, error }) => {
      if (error) {
        if (mounted) setState({ kind: 'signed-out' });
        return;
      }
      void applySession(data.session);
    });

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (state.kind === 'checking') {
    return <LoadingScreen label="Checking session" />;
  }

  if (state.kind === 'config-error') {
    return (
      <ThemeProvider>
        <V2AuthScreen configError={state.message} />
      </ThemeProvider>
    );
  }

  if (state.kind === 'signed-out') {
    return (
      <ThemeProvider>
        <V2AuthScreen configError={state.configError} />
      </ThemeProvider>
    );
  }

  async function signOut() {
    if (state.kind !== 'signed-in') return;
    await state.client.auth.signOut();
  }

  return <OneL1feV2Screen identity={state.identity} onSignOut={signOut} />;
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <SafeAreaView style={loadingStyles.safeArea}>
      <View style={loadingStyles.card}>
        <ActivityIndicator />
        <Text style={loadingStyles.text}>{label}</Text>
      </View>
    </SafeAreaView>
  );
}

const loadingStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F7F4',
    padding: spacing.xl,
  },
  card: {
    minWidth: 180,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    color: '#5A5249',
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
});
