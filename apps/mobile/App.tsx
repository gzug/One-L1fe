import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ErrorUtils, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { createMinimumSliceScreenController } from './minimumSliceScreenController.ts';
import {
  getOneL1feSupabaseUrl,
  ONE_L1FE_SUPABASE_PROJECT_REF,
} from './minimumSliceHostedConfig.ts';
import { createMobileSupabaseAuthSessionProvider, getMobileSupabaseClient } from './mobileSupabaseAuth.ts';
import LoginScreen from './LoginScreen.tsx';
import MinimumSliceScreen from './MinimumSliceScreen.tsx';
import WearableSyncScreen from './WearableSyncScreen.tsx';
import HealthConnectPermissionGate from './HealthConnectPermissionGate.tsx';
import SessionBar from './SessionBar.tsx';
import { useAuthSession } from './useAuthSession.ts';
import { useWearablePermissions } from './useWearablePermissions';
import DevInsightScreen from './DevInsightScreen.tsx';

const controller = createMinimumSliceScreenController({
  authSessionProvider: createMobileSupabaseAuthSessionProvider(),
  supabaseUrl:
    process.env.EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL ??
    getOneL1feSupabaseUrl(ONE_L1FE_SUPABASE_PROJECT_REF),
  functionPath: process.env.EXPO_PUBLIC_ONE_L1FE_FUNCTION_PATH,
});

type ActiveScreen = 'minimum-slice' | 'wearable-sync' | 'dev-insight';

export default function App(): React.JSX.Element {
  const { authState, error, user, signOut } = useAuthSession();
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('minimum-slice');
  const [isDevUser, setIsDevUser] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<string>('MinimumSlice');

  // Resolve HC permission status at App level so the tab bar can reflect
  // the gate state without mounting a second hook instance inside the tab.
  const { status: hcStatus } = useWearablePermissions();
  const hcBlocked = hcStatus === 'denied' || hcStatus === 'unavailable';

  useEffect(() => {
    if (user?.id) {
      const fetchProfile = async (): Promise<void> => {
        try {
          const { data, error } = await getMobileSupabaseClient()
            .from('profiles')
            .select('is_dev')
            .eq('id', user.id)
            .single();

          if (!error && data && typeof data === 'object' && 'is_dev' in data) {
            setIsDevUser((data as { is_dev: boolean }).is_dev === true);
          }
        } catch (e) {
          console.error('Error fetching profile:', e);
        }
      };
      void fetchProfile();
    }
  }, [user?.id]);

  useEffect(() => {
    const defaultHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler(async (error, isFatal) => {
      if (user?.id && isDevUser) {
        try {
          await getMobileSupabaseClient().from('dev_error_log').insert({
            profile_id: user.id,
            error_message: error.message,
            error_stack: error.stack,
            screen: currentScreen,
            app_version: undefined,
            platform: undefined,
          });
        } catch (e) {
          console.error('Error logging to dev_error_log:', e);
        }
      }

      if (defaultHandler) {
        defaultHandler(error, isFatal);
      }
    });

    return () => {
      if (defaultHandler) {
        ErrorUtils.setGlobalHandler(defaultHandler);
      }
    };
  }, [user?.id, isDevUser, currentScreen]);

  if (authState === 'loading') {
    return <SafeAreaView style={styles.centered} />;
  }

  if (authState === 'signed-out' || authState === 'config-error') {
    return <LoginScreen initialError={error} />;
  }

  const screenTabs: ActiveScreen[] = [
    'minimum-slice',
    'wearable-sync',
    ...(isDevUser ? (['dev-insight'] as const) : []),
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <View style={styles.appShell}>
        {user !== undefined ? (
          <SessionBar email={user.email} userId={user.id} onSignOut={signOut} />
        ) : null}
        <View style={styles.tabBar}>
          {screenTabs.map((screen) => {
            const isWearable = screen === 'wearable-sync';
            const isActive = activeScreen === screen;
            const showLock = isWearable && hcBlocked;

            const label =
              screen === 'minimum-slice'
                ? 'Blood Panel'
                : screen === 'wearable-sync'
                  ? showLock
                    ? 'Wearable Sync 🔒'
                    : 'Wearable Sync'
                  : 'Dev Insight';

            return (
              <Pressable
                key={screen}
                onPress={() => {
                  setActiveScreen(screen);
                  setCurrentScreen(
                    screen === 'minimum-slice'
                      ? 'MinimumSlice'
                      : screen === 'wearable-sync'
                        ? 'WearableSync'
                        : 'DevInsight',
                  );
                }}
                style={[
                  styles.tab,
                  isActive && styles.tabActive,
                  showLock && styles.tabLocked,
                ]}
                accessibilityLabel={
                  showLock
                    ? 'Wearable Sync — Health Connect permission required'
                    : label
                }
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive, showLock && styles.tabTextLocked]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {activeScreen === 'minimum-slice' ? (
          <MinimumSliceScreen controller={controller} />
        ) : activeScreen === 'wearable-sync' ? (
          <HealthConnectPermissionGate>
            <WearableSyncScreen />
          </HealthConnectPermissionGate>
        ) : activeScreen === 'dev-insight' && user ? (
          <DevInsightScreen profileId={user.id} />
        ) : null}
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
  tabLocked: { opacity: 0.55 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#52607a' },
  tabTextActive: { color: '#4263eb' },
  tabTextLocked: { color: '#a0aabb' },
});
