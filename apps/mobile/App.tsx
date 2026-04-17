import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { createMinimumSliceScreenController } from './minimumSliceScreenController.ts';
import {
  getOneL1feSupabaseUrl,
  ONE_L1FE_SUPABASE_PROJECT_REF,
} from './minimumSliceHostedConfig.ts';
import { createMobileSupabaseAuthSessionProvider } from './mobileSupabaseAuth.ts';
import LoginScreen from './LoginScreen.tsx';
import MinimumSliceScreen from './MinimumSliceScreen.tsx';
import WearableSyncScreen from './WearableSyncScreen.tsx';
import HealthConnectPermissionGate from './HealthConnectPermissionGate.tsx';
import SessionBar from './SessionBar.tsx';
import { useAuthSession } from './useAuthSession.ts';

const controller = createMinimumSliceScreenController({
  authSessionProvider: createMobileSupabaseAuthSessionProvider(),
  supabaseUrl:
    process.env.EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL ??
    getOneL1feSupabaseUrl(ONE_L1FE_SUPABASE_PROJECT_REF),
  functionPath: process.env.EXPO_PUBLIC_ONE_L1FE_FUNCTION_PATH,
});

type ActiveScreen = 'minimum-slice' | 'wearable-sync';

export default function App(): React.JSX.Element {
  const { authState, error, user, signOut } = useAuthSession();
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('minimum-slice');

  const handleSignedIn = React.useCallback(() => {}, []);

  if (authState === 'loading') {
    return <SafeAreaView style={styles.centered} />;
  }

  if (authState === 'signed-out' || authState === 'config-error') {
    return <LoginScreen onSignedIn={handleSignedIn} initialError={error} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <View style={styles.appShell}>
        {user !== undefined ? (
          <SessionBar email={user.email} userId={user.id} onSignOut={signOut} />
        ) : null}
        <View style={styles.tabBar}>
          {(['minimum-slice', 'wearable-sync'] as const).map((screen) => (
            <Pressable
              key={screen}
              onPress={() => setActiveScreen(screen)}
              style={[styles.tab, activeScreen === screen && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeScreen === screen && styles.tabTextActive]}>
                {screen === 'minimum-slice' ? 'Blood Panel' : 'Wearable Sync'}
              </Text>
            </Pressable>
          ))}
        </View>
        {activeScreen === 'minimum-slice' ? (
          <MinimumSliceScreen controller={controller} />
        ) : (
          <HealthConnectPermissionGate>
            <WearableSyncScreen />
          </HealthConnectPermissionGate>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f7fb' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  appShell: { flex: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#d9e2f2', backgroundColor: '#ffffff' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#4263eb' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#52607a' },
  tabTextActive: { color: '#4263eb' },
});
