import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { createMinimumSliceScreenController } from './minimumSliceScreenController.ts';
import {
  getOneL1feSupabaseUrl,
  ONE_L1FE_SUPABASE_PROJECT_REF,
} from './minimumSliceHostedConfig.ts';
import { createMobileSupabaseAuthSessionProvider } from './mobileSupabaseAuth.ts';
import LoginScreen from './LoginScreen.tsx';
import MinimumSliceScreen from './MinimumSliceScreen.tsx';
import { useAuthSession } from './useAuthSession.ts';

const controller = createMinimumSliceScreenController({
  authSessionProvider: createMobileSupabaseAuthSessionProvider(),
  supabaseUrl:
    process.env.EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL ??
    getOneL1feSupabaseUrl(ONE_L1FE_SUPABASE_PROJECT_REF),
  functionPath: process.env.EXPO_PUBLIC_ONE_L1FE_FUNCTION_PATH,
});

export default function App(): React.JSX.Element {
  const { authState } = useAuthSession();

  // onSignedIn is kept for LoginScreen prop contract; auth state managed by useAuthSession
  const handleSignedIn = React.useCallback(() => {}, []);

  if (authState === 'loading') {
    return (
      <SafeAreaView style={styles.centered} />
    );
  }

  if (authState === 'signed-out') {
    return <LoginScreen onSignedIn={handleSignedIn} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <MinimumSliceScreen controller={controller} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
