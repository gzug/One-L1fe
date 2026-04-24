import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { ErrorUtils, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { deriveScoreDisplayState } from '../../packages/domain/scoreDisplay.ts';
import { getMainDotStructure, getSubDotsForTab } from '../../packages/domain/dotStructure.ts';
import type { SubDotDefinition } from '../../packages/domain/dotStructure.ts';
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
import WeeklyCheckinScreen from './WeeklyCheckinScreen.tsx';
import NutritionScreen from './NutritionScreen.tsx';
import { captureAppError, initSentry } from './sentry';

const controller = createMinimumSliceScreenController({
  authSessionProvider: createMobileSupabaseAuthSessionProvider(),
  supabaseUrl:
    process.env.EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL ??
    getOneL1feSupabaseUrl(ONE_L1FE_SUPABASE_PROJECT_REF),
  functionPath: process.env.EXPO_PUBLIC_ONE_L1FE_FUNCTION_PATH,
});

type ActiveScreen = 'one_l1fe' | 'doctor_prep' | 'health_data' | 'lifestyle' | 'activity' | 'dev-insight';

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
  const [activeSubDotKey, setActiveSubDotKey] = useState<string>('one_l1fe_score');
  const [isDevUser, setIsDevUser] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<string>(SCREEN_NAMES.one_l1fe);

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
    if (typeof ErrorUtils === 'undefined' || typeof ErrorUtils.getGlobalHandler !== 'function') {
      return;
    }

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
      if (defaultHandler && typeof ErrorUtils.setGlobalHandler === 'function') {
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

  const mainDots = [
    'one_l1fe',
    'doctor_prep',
    'health_data',
    'lifestyle',
    'activity',
    ...(isDevUser ? (['dev-insight'] as const) : []),
  ] as const;

  const mainDot = getMainDotStructure(activeScreen === 'dev-insight' ? 'one_l1fe' : activeScreen);
  const subDots = getSubDotsForTab(activeScreen === 'dev-insight' ? 'one_l1fe' : activeScreen);
  const selectedSubDot = subDots.find((dot) => dot.key === activeSubDotKey) ?? subDots[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <View style={styles.appShell}>
        {user !== undefined ? (
          <SessionBar email={user.email} userId={user.id} onSignOut={signOut} />
        ) : null}
        <View style={styles.tabBar}>
          {mainDots.map((screen) => {
            const isActive = activeScreen === screen;
            const isActivity = screen === 'activity';
            const showPermissionHint = isActivity && hcBlocked;
            const label = screen === 'dev-insight' ? 'Dev' : getMainDotStructure(screen as Exclude<ActiveScreen, 'dev-insight'>).title;

            return (
              <Pressable
                key={screen}
                onPress={() => {
                  setActiveScreen(screen as ActiveScreen);
                  setCurrentScreen(SCREEN_NAMES[screen as ActiveScreen]);
                  setActiveSubDotKey(getSubDotsForTab(screen === 'dev-insight' ? 'one_l1fe' : screen)[0]?.key ?? '');
                }}
                style={[
                  styles.tab,
                  isActive && styles.tabActive,
                  showPermissionHint && styles.tabPermissionHint,
                ]}
                accessibilityLabel={label}
              >
                <Text numberOfLines={2} style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeScreen === 'dev-insight' && user ? (
          <DevInsightScreen profileId={user.id} allowAccess={isDevUser} />
        ) : (
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <View style={styles.mainHeader}>
              <Text style={styles.mainTitle}>{mainDot.title}</Text>
              <Text style={styles.mainSubtitle}>{mainDot.description}</Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Sub-Dots</Text>
              <View style={styles.subDotList}>
                {subDots.map((dot) => (
                  <Pressable
                    key={dot.key}
                    onPress={() => setActiveSubDotKey(dot.key)}
                    style={[styles.subDotRow, activeSubDotKey === dot.key && styles.subDotRowActive]}
                  >
                    <View style={styles.subDotTextStack}>
                      <View style={styles.subDotTitleRow}>
                        <Text style={styles.subDotTitle}>{dot.title}</Text>
                        <Text style={[styles.statusPill, getStatusStyle(dot.status)]}>
                          {statusLabel(dot.status)}
                        </Text>
                      </View>
                      <Text style={styles.subDotDescription}>{dot.description}</Text>
                      <Text style={styles.subDotMeta}>
                        {dot.kind === 'active' ? 'Active now' : dot.kind === 'needs_data' ? 'Needs data' : dot.kind === 'planned' ? 'Planned' : 'Coming soon'}
                        {dot.affectsScore ? ' · affects score' : ' · does not affect score yet'}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Detail</Text>
              {renderSubDotDetail(activeScreen === 'dev-insight' ? 'one_l1fe' : activeScreen, selectedSubDot, hcBlocked)}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

function renderSubDotDetail(
  tabKey: Exclude<ActiveScreen, 'dev-insight'>,
  dot: SubDotDefinition | undefined,
  hcBlocked: boolean,
): React.JSX.Element {
  if (!dot) {
    return <Text style={styles.detailText}>No sub-dot selected.</Text>;
  }

  if (tabKey === 'one_l1fe' && dot.key === 'one_l1fe_score') {
    const score = deriveScoreDisplayState({
      score: null,
      totalEffectiveWeight: 0,
      eligibleDotCount: 0,
      coverageRatio: 0,
      activeLeafTotal: 0,
      activeLeafWithData: 0,
    } as any);
    return (
      <View style={styles.detailStack}>
        <Text style={styles.detailTitle}>One L1fe Score</Text>
        <Text style={styles.detailText}>{score.message}</Text>
        <Text style={styles.detailMeta}>Currently: {score.state}</Text>
      </View>
    );
  }

  if (tabKey === 'one_l1fe' && dot.key === 'current_update') {
    return (
      <View style={styles.detailStack}>
        <Text style={styles.detailTitle}>Current Update</Text>
        <WeeklyCheckinScreen />
      </View>
    );
  }

  if (tabKey === 'health_data' && dot.key === 'blood_biomarkers') {
    return (
      <View style={styles.detailStack}>
        <Text style={styles.detailTitle}>Blood / Biomarkers</Text>
        <MinimumSliceScreen controller={controller} />
      </View>
    );
  }

  if (tabKey === 'lifestyle' && dot.key === 'nutrition') {
    return (
      <View style={styles.detailStack}>
        <NutritionScreen />
      </View>
    );
  }

  if (tabKey === 'activity' && dot.key === 'wearable_sync') {
    return (
      <View style={styles.detailStack}>
        <Text style={styles.detailTitle}>Wearable Sync</Text>
        <HealthConnectPermissionGate>
          <WearableSyncScreen />
        </HealthConnectPermissionGate>
        {hcBlocked ? <Text style={styles.detailMeta}>Health Connect is not available on this device.</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.detailStack}>
      <Text style={styles.detailTitle}>{dot.title}</Text>
      <Text style={styles.detailText}>{dot.description}</Text>
      <Text style={styles.detailMeta}>
        Status: {statusLabel(dot.status)} · {dot.affectsScore ? 'Included in score logic when active.' : 'Not part of score logic yet.'}
      </Text>
      <Text style={styles.detailMeta}>
        What it needs: {needsForKind(dot.kind)}
      </Text>
      <Text style={styles.detailMeta}>
        Why it is not active yet: {whyNotActive(dot.kind)}
      </Text>
    </View>
  );
}

function needsForKind(kind: SubDotDefinition['kind']): string {
  if (kind === 'active') return 'Current app data or a local prototype flow.';
  if (kind === 'needs_data') return 'More input data from the user or a device source.';
  if (kind === 'planned') return 'A later implementation slice.';
  return 'A later implementation slice and backend support.';
}

function whyNotActive(kind: SubDotDefinition['kind']): string {
  if (kind === 'active') return 'It is active in the current prototype.';
  if (kind === 'needs_data') return 'Relevant data is missing or incomplete.';
  if (kind === 'planned') return 'The feature is visible, but the functional slice has not been built yet.';
  return 'The concept is visible, but the backend or device wiring is not ready yet.';
}

function statusLabel(status: SubDotDefinition['status']): string {
  return status === 'planned_locked'
    ? 'coming soon'
    : status === 'needs_update'
      ? 'needs data'
      : status === 'missing'
        ? 'missing'
        : status === 'excluded'
          ? 'excluded'
          : 'ready';
}

function getStatusStyle(status: SubDotDefinition['status']) {
  return status === 'planned_locked'
    ? styles.status_coming
    : status === 'needs_update'
      ? styles.status_needs
      : status === 'missing'
        ? styles.status_missing
        : status === 'excluded'
          ? styles.status_excluded
          : styles.status_ready;
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
  body: { flex: 1 },
  bodyContent: { gap: 14, padding: 16, paddingBottom: 60 },
  mainHeader: { gap: 6 },
  mainTitle: { color: '#152033', fontSize: 28, fontWeight: '800' },
  mainSubtitle: { color: '#52607a', fontSize: 15, lineHeight: 21 },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  sectionTitle: { color: '#152033', fontSize: 16, fontWeight: '800' },
  subDotList: { gap: 10 },
  subDotRow: {
    backgroundColor: '#f8fafc',
    borderColor: '#d9e2f2',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  subDotRowActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#4263eb',
  },
  subDotTextStack: { gap: 4 },
  subDotTitleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  subDotTitle: { color: '#152033', fontSize: 15, fontWeight: '800', flexShrink: 1 },
  subDotDescription: { color: '#52607a', fontSize: 13, lineHeight: 18 },
  subDotMeta: { color: '#24324a', fontSize: 12, lineHeight: 16 },
  statusPill: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  status_ready: { backgroundColor: '#d1fae5', color: '#065f46' },
  status_needs: { backgroundColor: '#fef3c7', color: '#92400e' },
  status_missing: { backgroundColor: '#e2e8f0', color: '#334155' },
  status_excluded: { backgroundColor: '#e5e7eb', color: '#4b5563' },
  status_coming: { backgroundColor: '#e0e7ff', color: '#3730a3' },
  detailStack: { gap: 10 },
  detailTitle: { color: '#152033', fontSize: 18, fontWeight: '800' },
  detailText: { color: '#24324a', fontSize: 14, lineHeight: 20 },
  detailMeta: { color: '#52607a', fontSize: 12, lineHeight: 17 },
});
