import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { ErrorUtils, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  deriveOrbitDisplayState,
  MENU_ENTRIES,
  getOrbitDot,
  getOrbitDotDisplayLabel,
  getSubDotsForOrbitDot,
} from '../../packages/domain/dotStructure.ts';
import type {
  AppScreenKey,
  OrbitDotDefinition,
  OrbitDotDisplay,
  OrbitDotKey,
  SubDotDefinition,
} from '../../packages/domain/dotStructure.ts';
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
import WeeklyCheckinScreen from './WeeklyCheckinScreen.tsx';
import NutritionScreen from './NutritionScreen.tsx';
import AskOneL1feScreen from './AskOneL1feScreen.tsx';
import FirstRunGuideOverlay from './FirstRunGuideOverlay.tsx';
import { getFirstRunGuideCompleted, setFirstRunGuideCompleted } from './firstRunGuideStorage.ts';
import { captureAppError, initSentry } from './sentry';
import { SYNTHETIC_DEMO_SNAPSHOT } from '../../packages/domain/syntheticDemoData.ts';
import type { SyntheticDemoHabitLink } from '../../packages/domain/syntheticDemoData.ts';

const controller = createMinimumSliceScreenController({
  authSessionProvider: createMobileSupabaseAuthSessionProvider(),
  supabaseUrl:
    process.env.EXPO_PUBLIC_ONE_L1FE_SUPABASE_URL ??
    getOneL1feSupabaseUrl(ONE_L1FE_SUPABASE_PROJECT_REF),
  functionPath: process.env.EXPO_PUBLIC_ONE_L1FE_FUNCTION_PATH,
});

const SCREEN_NAMES: Record<AppScreenKey, string> = {
  one_l1fe: 'OneL1fe',
  ask_one_l1fe: 'AskOneL1fe',
  health: 'Health',
  nutrition: 'Nutrition',
  mind_and_sleep: 'MindAndSleep',
  activity: 'Activity',
  doctor_prep: 'DoctorPrep',
  menu: 'Menu',
  profile: 'Profile',
  how_score_works: 'HowScoreWorks',
};

const STATUS_HELPER_TEXT =
  'Choose how each data point should be handled.\n\nActive values are used in calculations.\nMissing values may reduce score precision.\nNot provided values are intentionally excluded and do not affect your score.';

initSentry();

export default function App(): React.JSX.Element {
  const { authState, error, user, signOut } = useAuthSession();
  const [activeScreen, setActiveScreen] = useState<AppScreenKey>('one_l1fe');
  const [activeSubDotKey, setActiveSubDotKey] = useState<string>('blood_biomarkers');
  const [askDraft, setAskDraft] = useState('');
  const [guideVisible, setGuideVisible] = useState(false);
  const [guideStepIndex, setGuideStepIndex] = useState(0);
  const [isDevUser, setIsDevUser] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<string>(SCREEN_NAMES.one_l1fe);

  const { status: hcStatus } = useWearablePermissions();
  const hcBlocked = hcStatus === 'denied' || hcStatus === 'unavailable';

  const openScreen = (screen: AppScreenKey): void => {
    setActiveScreen(screen);
    setCurrentScreen(SCREEN_NAMES[screen]);

    if (isOrbitDotKey(screen)) {
      setActiveSubDotKey(getSubDotsForOrbitDot(screen)[0]?.key ?? '');
    }
  };

  const openWearableSync = (): void => {
    setActiveScreen('activity');
    setCurrentScreen(SCREEN_NAMES.activity);
    setActiveSubDotKey('wearable_sync');
  };

  // V1 stub: pass an empty score map. Once the score pipeline feeds real
  // DotScore values, this memo will take the live map.
  const orbitDisplay = useMemo(() => deriveOrbitDisplayState({}), []);

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
    let cancelled = false;

    const loadGuideState = async (): Promise<void> => {
      if (authState !== 'signed-in' || !user?.id) {
        setGuideVisible(false);
        return;
      }

      const completed = await getFirstRunGuideCompleted();
      if (!cancelled && !completed) {
        setGuideStepIndex(0);
        setGuideVisible(true);
        openScreen('one_l1fe');
      }
    };

    void loadGuideState();

    return () => {
      cancelled = true;
    };
  }, [authState, user?.id]);

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

  const moveGuideToStep = (nextStepIndex: number): void => {
    const boundedIndex = Math.max(0, Math.min(nextStepIndex, 6));
    setGuideStepIndex(boundedIndex);

    if (boundedIndex === 5) {
      openScreen('menu');
      return;
    }

    if (boundedIndex === 6) {
      openScreen('one_l1fe');
    }
  };

  const completeGuide = async (): Promise<void> => {
    await setFirstRunGuideCompleted(true);
    setGuideVisible(false);
    setGuideStepIndex(0);
  };

  const startGuide = (): void => {
    setGuideStepIndex(0);
    setGuideVisible(true);
    openScreen('one_l1fe');
  };

  const handleConnectDataFromGuide = async (): Promise<void> => {
    await completeGuide();
    openWearableSync();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <View style={styles.appShell}>
        {user !== undefined ? (
          <SessionBar email={user.email} userId={user.id} onSignOut={signOut} />
        ) : null}
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {activeScreen !== 'one_l1fe' ? (
            <View style={styles.topNav}>
              <Pressable onPress={() => openScreen('one_l1fe')} style={styles.topNavButton}>
                <Text style={styles.topNavButtonText}>Home</Text>
              </Pressable>
              {activeScreen !== 'menu' ? (
                <Pressable onPress={() => openScreen('menu')} style={styles.topNavButton}>
                  <Text style={styles.topNavButtonText}>Menu</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {activeScreen === 'one_l1fe'
            ? renderHome(openScreen, orbitDisplay, askDraft, setAskDraft, startGuide)
            : activeScreen === 'menu'
              ? renderMenu(openScreen)
              : activeScreen === 'ask_one_l1fe'
                ? <AskOneL1feScreen initialQuestion={askDraft} />
                : activeScreen === 'doctor_prep'
                  ? renderDoctorPrep()
                  : activeScreen === 'profile'
                    ? renderProfile()
                    : activeScreen === 'how_score_works'
                      ? renderHowScoreWorks()
                      : renderOrbitDotDetail(activeScreen, activeSubDotKey, setActiveSubDotKey, hcBlocked)}
        </ScrollView>
        <FirstRunGuideOverlay
          visible={guideVisible}
          stepIndex={guideStepIndex}
          platformSupportsHealthConnect={Platform.OS === 'android'}
          onBack={() => moveGuideToStep(guideStepIndex - 1)}
          onNext={() => moveGuideToStep(guideStepIndex + 1)}
          onSkip={() => {
            void completeGuide();
          }}
          onConnectData={() => {
            void handleConnectDataFromGuide();
          }}
          onNotNow={() => {
            void completeGuide();
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function renderHome(
  openScreen: (screen: AppScreenKey) => void,
  orbitDisplay: readonly OrbitDotDisplay[],
  askDraft: string,
  setAskDraft: (value: string) => void,
  onStartGuide: () => void,
): React.JSX.Element {
  return (
    <>
      <View style={styles.homeHeader}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.eyebrow}>One L1fe</Text>
            <Text style={styles.mainTitle}>Home</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={onStartGuide} style={styles.helpButton} accessibilityLabel="Open guide">
              <Text style={styles.helpButtonText}>i</Text>
            </Pressable>
            <Pressable onPress={() => openScreen('menu')} style={styles.iconButton} accessibilityLabel="Open menu">
              <Text style={styles.iconButtonText}>Menu</Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.mainSubtitle}>
          Your central score surface. Only score-capable domains are shown in the orbit.
        </Text>
      </View>

      <View style={styles.scorePanel}>
        <Text style={styles.demoBadge}>{SYNTHETIC_DEMO_SNAPSHOT.periodLabel}</Text>
        <Text style={styles.scoreLabel}>One L1fe Score</Text>
        <Text style={styles.scoreValue}>{SYNTHETIC_DEMO_SNAPSHOT.oneL1feScore}</Text>
        <Text style={styles.scoreMessage}>
          {SYNTHETIC_DEMO_SNAPSHOT.currentUpdate}
        </Text>
      </View>

      <View style={styles.askCard}>
        <Text style={styles.sectionTitle}>Ask One L1fe</Text>
        <Text style={styles.detailText}>
          Ask questions about your available data. Answers must show sources and will not invent missing values.
        </Text>
        <TextInput
          value={askDraft}
          onChangeText={setAskDraft}
          placeholder="Ask about your health data..."
          style={styles.askInput}
          placeholderTextColor="#6b7280"
          multiline
        />
        <Pressable onPress={() => openScreen('ask_one_l1fe')} style={styles.askButton}>
          <Text style={styles.askButtonText}>Ask One L1fe</Text>
        </Pressable>
      </View>

      <View style={styles.orbitShell}>
        <View style={styles.centerOrb}>
          <Text style={styles.centerOrbTitle}>One L1fe</Text>
          <Text style={styles.centerOrbText}>Guide, not diagnosis</Text>
        </View>
        <View style={styles.orbitGrid}>
          {orbitDisplay.map((dot) => (
            <Pressable
              key={dot.key}
              onPress={() => openScreen(dot.key)}
              style={styles.orbitDot}
              accessibilityLabel={`Open ${dot.title}`}
            >
              <Text style={styles.orbitDotTitle}>{dot.title}</Text>
              <Text style={styles.orbitDotMeta}>{getDemoOrbitDotDisplayLabel(dot)}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Current update</Text>
        {SYNTHETIC_DEMO_SNAPSHOT.metrics.slice(0, 3).map((metric) => (
          <Text key={metric.key} style={styles.bullet}>
            - {metric.label}: {metric.value}
          </Text>
        ))}
      </View>

      <View style={styles.homeActions}>
        <Pressable onPress={() => openScreen('doctor_prep')} style={styles.primaryAction}>
          <Text style={styles.primaryActionText}>Doctor Prep</Text>
        </Pressable>
        <Pressable onPress={() => openScreen('menu')} style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>Menu</Text>
        </Pressable>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Precision nudge</Text>
        <Text style={styles.detailText}>
          Add or update data when available. Missing data can reduce precision, but it should never appear as a score of 0.
        </Text>
      </View>
    </>
  );
}

function renderMenu(openScreen: (screen: AppScreenKey) => void): React.JSX.Element {
  const groups = [
    { key: 'primary', title: 'Primary Spaces' },
    { key: 'account', title: 'Profile' },
    { key: 'education', title: 'Learn' },
  ] as const;

  return (
    <View style={styles.screenStack}>
      <ScreenHeader title="Menu" subtitle="Backup navigation and structure overview." />
      {groups.map((group) => {
        const entries = MENU_ENTRIES.filter((entry) => entry.group === group.key);
        return (
          <View key={group.key} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            {entries.map((entry) => (
              <Pressable key={entry.key} onPress={() => openScreen(entry.key)} style={styles.menuRow}>
                <Text style={styles.menuTitle}>{entry.title}</Text>
                <Text style={styles.menuArrow}>Open</Text>
              </Pressable>
            ))}
          </View>
        );
      })}
    </View>
  );
}

function renderOrbitDotDetail(
  dotKey: OrbitDotKey,
  activeSubDotKey: string,
  setActiveSubDotKey: (key: string) => void,
  hcBlocked: boolean,
): React.JSX.Element {
  const dot = getOrbitDot(dotKey);
  const selectedSubDot = dot.subDots.find((subDot) => subDot.key === activeSubDotKey) ?? dot.subDots[0];

  return (
    <View style={styles.screenStack}>
      <DotDetailHeader dot={dot} />
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Sub-Dots</Text>
        <Text style={styles.helperText}>{STATUS_HELPER_TEXT}</Text>
        <View style={styles.subDotList}>
          {dot.subDots.map((subDot) => (
            <Pressable
              key={subDot.key}
              onPress={() => setActiveSubDotKey(subDot.key)}
              style={[styles.subDotRow, selectedSubDot?.key === subDot.key && styles.subDotRowActive]}
            >
              <View style={styles.subDotTitleRow}>
                <Text style={styles.subDotTitle}>{subDot.title}</Text>
                <Text style={[styles.statusPill, getStatusStyle(subDot.status)]}>
                  {statusLabel(subDot.status)}
                </Text>
              </View>
              <Text style={styles.subDotDescription}>{subDot.description}</Text>
              <Text style={styles.subDotMeta}>
                {subDot.affectsScore ? 'Can affect this dot when usable' : 'Context only or not active yet'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Detail</Text>
        {renderSubDotDetail(dotKey, selectedSubDot, hcBlocked)}
      </View>
    </View>
  );
}

function DotDetailHeader({ dot }: { dot: OrbitDotDefinition }): React.JSX.Element {
  const scoreLabel = getDemoOrbitDotDisplayLabel(dot);
  return (
    <View style={styles.mainHeader}>
      <Text style={styles.eyebrow}>Dot Detail</Text>
      <Text style={styles.mainTitle}>{dot.title}</Text>
      <Text style={styles.mainSubtitle}>{dot.description}</Text>
      <View style={styles.metricGrid}>
        <MetricTile label="Dot Score" value={scoreLabel} />
        <MetricTile label="Confidence" value={dot.key === 'nutrition' ? 'Coming Soon' : 'Demo confidence'} />
        <MetricTile label="Coverage" value={dot.key === 'nutrition' ? 'No Score available' : 'Synthetic 90 days'} />
        <MetricTile label="Freshness" value={dot.status === 'planned_locked' ? 'Coming Soon' : 'Current demo'} />
      </View>
    </View>
  );
}

function MetricTile({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function renderSubDotDetail(
  dotKey: OrbitDotKey,
  subDot: SubDotDefinition | undefined,
  hcBlocked: boolean,
): React.JSX.Element {
  if (!subDot) {
    return <Text style={styles.detailText}>No sub-dot selected.</Text>;
  }

  if (dotKey === 'health' && subDot.key === 'blood_biomarkers') {
    return (
      <View style={styles.detailStack}>
        <Text style={styles.detailTitle}>Blood / Biomarkers</Text>
        <MinimumSliceScreen controller={controller} />
      </View>
    );
  }

  if (dotKey === 'nutrition') {
    return (
      <View style={styles.detailStack}>
        <Text style={styles.detailMeta}>This feature is visible in the prototype, but full AI analysis is not active yet. Nutrition does not affect the One L1fe Score yet.</Text>
        <NutritionScreen />
      </View>
    );
  }

  if (dotKey === 'mind_and_sleep' && subDot.key === 'check_in') {
    return (
      <View style={styles.detailStack}>
        <Text style={styles.detailTitle}>Mind & Sleep Check-in</Text>
        <WeeklyCheckinScreen />
      </View>
    );
  }

  if (dotKey === 'mind_and_sleep' && subDot.key === 'habits_context') {
    return (
      <View style={styles.detailStack}>
        <Text style={styles.detailTitle}>Habits & Context</Text>
        <Text style={styles.detailText}>
          Habits are explanatory context. They can help connect unusual days, positive trends, or negative dips across sleep, activity, recovery, and energy, but they do not directly change the One L1fe Score.
        </Text>
        {SYNTHETIC_DEMO_SNAPSHOT.habitLinks.map((link) => (
          <HabitLinkCard key={link.habit} link={link} />
        ))}
      </View>
    );
  }

  if (dotKey === 'activity' && subDot.key === 'wearable_sync') {
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
      <Text style={styles.detailTitle}>{subDot.title}</Text>
      <Text style={styles.detailText}>{subDot.description}</Text>
      <Text style={styles.detailMeta}>
        Status: {statusLabel(subDot.status)}. {subDot.affectsScore ? 'This can affect the dot score when enough usable data exists.' : 'This does not directly affect your score.'}
      </Text>
      <Text style={styles.detailMeta}>What it needs: {needsForKind(subDot.kind)}</Text>
      <Text style={styles.detailMeta}>Why it is not active yet: {whyNotActive(subDot.kind)}</Text>
    </View>
  );
}

function renderDoctorPrep(): React.JSX.Element {
  const items = [
    'Doctor Summary',
    'What to Show Your Doctor',
    'Questions to Ask',
    'Tests to Discuss',
    'Sources & Dates',
    'Export',
  ];

  return (
    <View style={styles.screenStack}>
      <ScreenHeader
        title="Doctor Prep"
        subtitle="Output and visit preparation. Doctor Prep does not directly affect the One L1fe Score."
      />
      <View style={styles.sectionCard}>
        {items.map((item) => (
          <View key={item} style={styles.staticRow}>
            <Text style={styles.menuTitle}>{item}</Text>
            <Text style={styles.detailMeta}>{item === 'Export' ? 'Coming Soon' : 'Visible prototype area'}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function HabitLinkCard({ link }: { link: SyntheticDemoHabitLink }): React.JSX.Element {
  return (
    <View style={styles.staticRow}>
      <Text style={styles.menuTitle}>{link.habit}</Text>
      <Text style={styles.detailMeta}>Linked areas: {link.linkedAreas.join(', ')}</Text>
      <Text style={styles.detailText}>{link.observation}</Text>
      <Text style={styles.detailMeta}>Score effect: context only.</Text>
    </View>
  );
}

function getDemoOrbitDotDisplayLabel(dot: OrbitDotDefinition | OrbitDotDisplay): string {
  if (dot.key === 'health') return `Score ${SYNTHETIC_DEMO_SNAPSHOT.orbitScores.health}`;
  if (dot.key === 'mind_and_sleep') return `Score ${SYNTHETIC_DEMO_SNAPSHOT.orbitScores.mindSleep}`;
  if (dot.key === 'activity') return `Score ${SYNTHETIC_DEMO_SNAPSHOT.orbitScores.activity}`;
  return getOrbitDotDisplayLabel(getOrbitDot(dot.key));
}

function renderProfile(): React.JSX.Element {
  const sections = [
    {
      title: 'Basic Information',
      body: 'Name, date of birth or age, sex at birth, height, weight, country, and units.',
    },
    {
      title: 'Health Context',
      body: 'Goals, known conditions, allergies, medications, and supplements overview.',
    },
    {
      title: 'Preferences',
      body: 'Units, notification preferences, language, and privacy preferences.',
    },
    {
      title: 'Connected Sources',
      body: 'Wearables, lab sources, document uploads, and manual entries.',
    },
    {
      title: 'Data Choices',
      body: 'Excluded data points, not provided markers, source priority, and stale data handling.',
    },
    {
      title: 'App Settings',
      body: 'Account, sign out, export, data deletion request placeholder, and future gated developer options.',
    },
  ];

  return (
    <View style={styles.screenStack}>
      <ScreenHeader
        title="Profile"
        subtitle="Profile is coming soon. This area will contain your basic information, preferences, and connected data sources."
      />
      {sections.map((section) => (
        <View key={section.title} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.detailText}>{section.body}</Text>
        </View>
      ))}
    </View>
  );
}

function renderHowScoreWorks(): React.JSX.Element {
  const rules = [
    'The One L1fe Score is a guide, not medical advice.',
    'It is based on available data.',
    'Scores are only shown when enough data exists.',
    'Missing data lowers precision, not health.',
    'Coming Soon and Excluded data do not affect the score.',
    'Habits are context only and do not directly affect the score.',
    'Confidence, coverage, and freshness are shown inside detail screens.',
  ];

  return (
    <View style={styles.screenStack}>
      <ScreenHeader title="How the One L1fe Score Works" subtitle="Score logic and current prototype boundaries." />
      <View style={styles.sectionCard}>
        {rules.map((rule) => (
          <Text key={rule} style={styles.bullet}>- {rule}</Text>
        ))}
      </View>
      <View style={styles.warningCard}>
        <Text style={styles.warningText}>
          One L1fe does not provide medical advice, diagnosis, or treatment. It helps you organize and understand your health data so you can prepare better conversations with your healthcare professional.
        </Text>
      </View>
    </View>
  );
}

function ScreenHeader({ title, subtitle }: { title: string; subtitle: string }): React.JSX.Element {
  return (
    <View style={styles.mainHeader}>
      <Text style={styles.eyebrow}>One L1fe</Text>
      <Text style={styles.mainTitle}>{title}</Text>
      <Text style={styles.mainSubtitle}>{subtitle}</Text>
    </View>
  );
}

function isOrbitDotKey(value: AppScreenKey): value is OrbitDotKey {
  return value === 'health' || value === 'nutrition' || value === 'mind_and_sleep' || value === 'activity';
}

function needsForKind(kind: SubDotDefinition['kind']): string {
  if (kind === 'active') return 'Current app data or a local prototype flow.';
  if (kind === 'needs_data') return 'More input data from the user or a device source.';
  if (kind === 'context') return 'Optional context that can explain data changes.';
  return 'A later implementation slice and backend support.';
}

function whyNotActive(kind: SubDotDefinition['kind']): string {
  if (kind === 'active') return 'It is active in the current prototype.';
  if (kind === 'needs_data') return 'Relevant data is missing or incomplete.';
  if (kind === 'context') return 'It is context only and does not directly affect the score.';
  return 'The concept is visible, but the backend or device wiring is not ready yet.';
}

function statusLabel(status: SubDotDefinition['status']): string {
  return status === 'planned_locked'
    ? 'Coming Soon'
    : status === 'needs_update'
      ? 'Needs update'
      : status === 'missing'
        ? 'No Score available'
        : status === 'excluded'
          ? 'Excluded'
          : 'Score available';
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
  body: { flex: 1 },
  bodyContent: { gap: 14, padding: 16, paddingBottom: 60 },
  topNav: { flexDirection: 'row', gap: 10 },
  topNavButton: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  topNavButtonText: { color: '#24324a', fontSize: 13, fontWeight: '800' },
  homeHeader: { gap: 8 },
  titleRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  eyebrow: { color: '#4263eb', fontSize: 12, fontWeight: '800', letterSpacing: 0, textTransform: 'uppercase' },
  mainHeader: { gap: 6 },
  mainTitle: { color: '#152033', fontSize: 28, fontWeight: '800' },
  mainSubtitle: { color: '#52607a', fontSize: 15, lineHeight: 21 },
  helpButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 999,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  helpButtonText: { color: '#24324a', fontSize: 15, fontWeight: '900' },
  iconButton: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  iconButtonText: { color: '#24324a', fontSize: 13, fontWeight: '800' },
  scorePanel: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  demoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef2ff',
    borderColor: '#c7d2fe',
    borderRadius: 999,
    borderWidth: 1,
    color: '#3730a3',
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 4,
    textTransform: 'uppercase',
  },
  scoreLabel: { color: '#52607a', fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  scoreValue: { color: '#152033', fontSize: 26, fontWeight: '800' },
  scoreMessage: { color: '#52607a', fontSize: 14, lineHeight: 20 },
  askCard: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  askInput: {
    backgroundColor: '#f8fafc',
    borderColor: '#c8d3e1',
    borderRadius: 8,
    borderWidth: 1,
    color: '#152033',
    fontSize: 15,
    minHeight: 58,
    padding: 12,
    textAlignVertical: 'top',
  },
  askButton: {
    alignItems: 'center',
    backgroundColor: '#152033',
    borderRadius: 8,
    paddingVertical: 12,
  },
  askButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  orbitShell: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 14,
  },
  centerOrb: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#4263eb',
    borderRadius: 999,
    borderWidth: 2,
    height: 128,
    justifyContent: 'center',
    width: 128,
  },
  centerOrbTitle: { color: '#152033', fontSize: 17, fontWeight: '900' },
  centerOrbText: { color: '#52607a', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  orbitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  orbitDot: {
    backgroundColor: '#f8fafc',
    borderColor: '#c8d3e1',
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 92,
    justifyContent: 'center',
    gap: 6,
    padding: 12,
  },
  orbitDotTitle: { color: '#152033', fontSize: 16, fontWeight: '800' },
  orbitDotMeta: { color: '#52607a', fontSize: 13, fontWeight: '700' },
  homeActions: { flexDirection: 'row', gap: 10 },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#4263eb',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 12,
  },
  primaryActionText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  secondaryActionText: { color: '#24324a', fontSize: 14, fontWeight: '800' },
  screenStack: { gap: 14 },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#d9e2f2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  warningCard: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  warningText: { color: '#7c2d12', fontSize: 13, lineHeight: 19 },
  sectionTitle: { color: '#152033', fontSize: 16, fontWeight: '800' },
  helperText: { color: '#52607a', fontSize: 12, lineHeight: 17 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingTop: 4 },
  metricTile: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e2f2',
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: 4,
    padding: 10,
  },
  metricLabel: { color: '#52607a', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  metricValue: { color: '#152033', fontSize: 13, fontWeight: '800' },
  subDotList: { gap: 10 },
  subDotRow: {
    backgroundColor: '#f8fafc',
    borderColor: '#d9e2f2',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  subDotRowActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#4263eb',
  },
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
  menuRow: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#d9e2f2',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  menuTitle: { color: '#152033', fontSize: 14, fontWeight: '800', flexShrink: 1 },
  menuArrow: { color: '#4263eb', fontSize: 12, fontWeight: '800' },
  staticRow: {
    backgroundColor: '#f8fafc',
    borderColor: '#d9e2f2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  bullet: { color: '#24324a', fontSize: 14, lineHeight: 20 },
});
