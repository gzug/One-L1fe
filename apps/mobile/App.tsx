import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ErrorUtils, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getDotsByTab, TAB_ORDER } from '../../packages/domain/dots.ts';
import type { DotDefinition, TabKey } from '../../packages/domain/dots.ts';
import { createMinimumSliceScreenController } from './minimumSliceScreenController.ts';
import {
  getOneL1feSupabaseUrl,
  ONE_L1FE_SUPABASE_PROJECT_REF,
} from './minimumSliceHostedConfig.ts';
import { createMobileSupabaseAuthSessionProvider, getMobileSupabaseClient } from './mobileSupabaseAuth.ts';
import FirstCheckinCard from './FirstCheckinCard.tsx';
import LoginScreen from './LoginScreen.tsx';
import LockedFeatureCard from './LockedFeatureCard.tsx';
import MinimumSliceScreen from './MinimumSliceScreen.tsx';
import WearableSyncScreen from './WearableSyncScreen.tsx';
import HealthConnectPermissionGate from './HealthConnectPermissionGate.tsx';
import SessionBar from './SessionBar.tsx';
import { useAuthSession } from './useAuthSession.ts';
import { useWearablePermissions } from './useWearablePermissions';
import DevInsightScreen from './DevInsightScreen.tsx';
import WeeklyCheckinScreen from './WeeklyCheckinScreen.tsx';
import { captureAppError, initSentry } from './sentry';

const controller = createMinimumSliceScreenController({
  authSessionProvider: createMobileSupabaseAuthSessionProvider(),
  supabaseUrl:
    process.env.EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL ??
    getOneL1feSupabaseUrl(ONE_L1FE_SUPABASE_PROJECT_REF),
  functionPath: process.env.EXPO_PUBLIC_ONE_L1FE_FUNCTION_PATH,
});

type DevScreen = 'dev-insight';
type ActiveScreen = TabKey | DevScreen;

const MAIN_TAB_LABELS: Record<TabKey, string> = {
  one_l1fe: 'One L1fe',
  doctor_prep: 'Doctor Prep',
  health_data: 'Health Data',
  lifestyle: 'Lifestyle',
  activity: 'Activity',
};

const SCREEN_NAMES: Record<ActiveScreen, string> = {
  one_l1fe: 'OneL1fe',
  doctor_prep: 'DoctorPrep',
  health_data: 'HealthData',
  lifestyle: 'Lifestyle',
  activity: 'Activity',
  'dev-insight': 'DevInsight',
};

initSentry();

export default function App(): React.JSX.Element {
  const { authState, error, user, signOut } = useAuthSession();
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('one_l1fe');
  const [isDevUser, setIsDevUser] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<string>(SCREEN_NAMES.one_l1fe);

  // Resolve HC permission status at App level so the tab bar can reflect
  // the gate state without mounting a second hook instance inside the tab.
  const { status: hcStatus } = useWearablePermissions();
  const hcBlocked = hcStatus === 'denied' || hcStatus === 'unavailable';

  useEffect(() => {
    if (!user?.id) {
      setIsDevUser(false);
      return;
    }

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
  }, [user?.id]);

  useEffect(() => {
    if (!isDevUser && activeScreen === 'dev-insight') {
      setActiveScreen('one_l1fe');
      setCurrentScreen(SCREEN_NAMES.one_l1fe);
    }
  }, [activeScreen, isDevUser]);

  useEffect(() => {
    const defaultHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler(async (error, isFatal) => {
      captureAppError(error, {
        screen: currentScreen,
        userId: user?.id,
        isFatal,
      });

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
    ...TAB_ORDER,
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
            const isActivity = screen === 'activity';
            const isActive = activeScreen === screen;
            const showPermissionHint = isActivity && hcBlocked;

            const label =
              screen === 'dev-insight'
                ? 'Dev'
                : MAIN_TAB_LABELS[screen];

            return (
              <Pressable
                key={screen}
                onPress={() => {
                  setActiveScreen(screen);
                  setCurrentScreen(SCREEN_NAMES[screen]);
                }}
                style={[
                  styles.tab,
                  isActive && styles.tabActive,
                  showPermissionHint && styles.tabPermissionHint,
                ]}
                accessibilityLabel={
                  showPermissionHint
                    ? 'Activity - Health Connect permission required for wearable sync'
                    : label
                }
              >
                <Text
                  numberOfLines={2}
                  style={[
                    styles.tabText,
                    isActive && styles.tabTextActive,
                    showPermissionHint && styles.tabTextPermissionHint,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {activeScreen === 'one_l1fe' ? (
          <OneL1feTab />
        ) : activeScreen === 'doctor_prep' ? (
          <StaticDotTab
            tabKey="doctor_prep"
            title="Doctor Prep"
            subtitle="Read-only visit preparation generated from the data you already have."
          />
        ) : activeScreen === 'health_data' ? (
          <HealthDataTab />
        ) : activeScreen === 'lifestyle' ? (
          <StaticDotTab
            tabKey="lifestyle"
            title="Lifestyle"
            subtitle="Self-report context stays visible here while deeper lifestyle dots remain locked."
          />
        ) : activeScreen === 'activity' ? (
          <ActivityTab />
        ) : activeScreen === 'dev-insight' && user ? (
          <DevInsightScreen profileId={user.id} allowAccess={isDevUser} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function OneL1feTab(): React.JSX.Element {
  return (
    <View style={styles.tabPanel}>
      <View style={styles.topStack}>
        <FirstCheckinCard />
        <StaticMenu />
      </View>
      <View style={styles.embeddedScreen}>
        <WeeklyCheckinScreen />
      </View>
    </View>
  );
}

function HealthDataTab(): React.JSX.Element {
  return (
    <View style={styles.tabPanel}>
      <PlannedLockedDotStrip tabKey="health_data" />
      <View style={styles.embeddedScreen}>
        <MinimumSliceScreen controller={controller} />
      </View>
    </View>
  );
}

function ActivityTab(): React.JSX.Element {
  return (
    <View style={styles.tabPanel}>
      <PlannedLockedDotStrip tabKey="activity" />
      <View style={styles.embeddedScreen}>
        <HealthConnectPermissionGate>
          <WearableSyncScreen />
        </HealthConnectPermissionGate>
      </View>
    </View>
  );
}

interface StaticDotTabProps {
  tabKey: TabKey;
  title: string;
  subtitle: string;
}

function StaticDotTab({ tabKey, title, subtitle }: StaticDotTabProps): React.JSX.Element {
  return (
    <ScrollView style={styles.scrollPanel} contentContainerStyle={styles.staticTabContent}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>{title}</Text>
        <Text style={styles.screenSubtitle}>{subtitle}</Text>
      </View>
      <PlannedLockedDotList tabKey={tabKey} />
    </ScrollView>
  );
}

function StaticMenu(): React.JSX.Element {
  return (
    <View style={styles.menuCard}>
      <Text style={styles.menuTitle}>Menu</Text>
      <View style={styles.menuRow}>
        <View style={styles.menuItemBody}>
          <Text style={styles.menuItemTitle}>Settings</Text>
          <Text style={styles.menuItemSubtitle}>Account, app preferences, and data controls.</Text>
        </View>
        <Text style={styles.menuItemStatus}>Planned</Text>
      </View>
    </View>
  );
}

function PlannedLockedDotStrip({ tabKey }: { tabKey: TabKey }): React.JSX.Element | null {
  const lockedDots = getPlannedLockedDots(tabKey);
  if (lockedDots.length === 0) return null;

  return (
    <View style={styles.lockedStripSection}>
      <Text style={styles.lockedSectionTitle}>Planned</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.lockedStripContent}
      >
        {lockedDots.map((dot) => (
          <LockedFeatureCard
            key={dot.key}
            compact
            title={dot.title}
            description={dot.description}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function PlannedLockedDotList({ tabKey }: { tabKey: TabKey }): React.JSX.Element {
  const lockedDots = getPlannedLockedDots(tabKey);
  if (lockedDots.length === 0) {
    return (
      <Text style={styles.emptyState}>
        No locked features in this section.
      </Text>
    );
  }

  return (
    <View style={styles.lockedList}>
      {lockedDots.map((dot) => (
        <LockedFeatureCard
          key={dot.key}
          title={dot.title}
          description={dot.description}
        />
      ))}
    </View>
  );
}

function getPlannedLockedDots(tabKey: TabKey): DotDefinition[] {
  return getDotsByTab(tabKey).filter((dot) => dot.defaultStatus === 'planned_locked');
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f7fb' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  appShell: { flex: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#d9e2f2', backgroundColor: '#ffffff' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 54, paddingHorizontal: 4, paddingVertical: 10 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#4263eb' },
  tabPermissionHint: { opacity: 0.65 },
  tabText: { color: '#52607a', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  tabTextActive: { color: '#4263eb' },
  tabTextPermissionHint: { color: '#a0aabb' },
  tabPanel: { flex: 1, backgroundColor: '#f4f7fb' },
  topStack: { gap: 12, padding: 14, paddingBottom: 0 },
  embeddedScreen: { flex: 1, minHeight: 0 },
  scrollPanel: { flex: 1, backgroundColor: '#f4f7fb' },
  staticTabContent: { gap: 14, padding: 18, paddingBottom: 60 },
  screenHeader: { gap: 6 },
  screenTitle: { color: '#152033', fontSize: 28, fontWeight: '800' },
  screenSubtitle: { color: '#52607a', fontSize: 15, lineHeight: 21 },
  menuCard: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  menuTitle: { color: '#152033', fontSize: 16, fontWeight: '800' },
  menuRow: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  menuItemTitle: { color: '#152033', fontSize: 15, fontWeight: '700' },
  menuItemBody: { flex: 1 },
  menuItemSubtitle: { color: '#52607a', fontSize: 12, marginTop: 2 },
  menuItemStatus: { color: '#4263eb', fontSize: 12, fontWeight: '800', marginLeft: 12 },
  lockedStripSection: {
    backgroundColor: '#f4f7fb',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  lockedSectionTitle: { color: '#152033', fontSize: 15, fontWeight: '800' },
  lockedStripContent: { gap: 10, paddingBottom: 12 },
  lockedList: { gap: 12 },
  emptyState: { color: '#52607a', fontSize: 14 },
});
