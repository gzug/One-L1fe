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
import { theme } from './ui/theme';
import OverviewScreen from './OverviewScreen';
import HealthConnectDiagnosticScreen from './src/screens/HealthConnectDiagnosticScreen';

const controller = createMinimumSliceScreenController({
  authSessionProvider: createMobileSupabaseAuthSessionProvider(),
  supabaseUrl:
    process.env.EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL ??
    getOneL1feSupabaseUrl(ONE_L1FE_SUPABASE_PROJECT_REF),
  functionPath: process.env.EXPO_PUBLIC_ONE_L1FE_FUNCTION_PATH,
});

type ActiveScreen = 'overview' | 'minimum-slice' | 'wearable-sync' | 'health-connect-diagnostic';

export default function App(): React.JSX.Element {
  const { authState, error, user, signOut } = useAuthSession();
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('overview');

  if (authState === 'loading') {
    return <SafeAreaView style={styles.centered} />;
  }

  if (authState === 'signed-out' || authState === 'config-error') {
    return <LoginScreen initialError={error} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <View style={styles.appShell}>
        {user !== undefined ? (
          <SessionBar email={user.email} userId={user.id} onSignOut={signOut} />
        ) : null}
        <View style={styles.tabBar}>
          {(['overview', 'minimum-slice', 'wearable-sync', ...(__DEV__ ? ['health-connect-diagnostic'] as const : [])] as const).map((screen) => (
            <Pressable
              key={screen}
              onPress={() => setActiveScreen(screen)}
              style={[styles.tab, activeScreen === screen && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeScreen === screen && styles.tabTextActive]}>
                {screen === 'overview'
                  ? 'Overview'
                  : screen === 'minimum-slice'
                    ? 'Blood Panel'
                    : screen === 'wearable-sync'
                      ? 'Wearable Sync'
                      : 'HC Diagnostics'}
              </Text>
            </Pressable>
          ))}
        </View>
        {activeScreen === 'overview' ? (
          <OverviewScreen snapshot={null} />
        ) : activeScreen === 'minimum-slice' ? (
          <MinimumSliceScreen controller={controller} />
        ) : activeScreen === 'health-connect-diagnostic' ? (
          <HealthConnectDiagnosticScreen />
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
  safeArea: { flex: 1, backgroundColor: theme.colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  appShell: { flex: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: theme.colors.textMuted },
  tabTextActive: { color: theme.colors.primary },
});
