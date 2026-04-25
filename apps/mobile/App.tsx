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
import AntlerHealthOsDemoScreen from './AntlerHealthOsDemoScreen.tsx';
import { captureAppError, initSentry } from './sentry';
import { DotIcon } from './src/icons/DotIcons.tsx';
import { colors, radius, shadow, spacing, touchTarget, type } from './src/theme/tokens.ts';
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
  if (process.env.EXPO_PUBLIC_ANTLER_DEMO !== '0') {
    return <AntlerHealthOsDemoScreen />;
  }

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
            <Text style={styles.greetingLine}>Good Morning,</Text>
            <Text style={styles.greetingName}>Alex</Text>
          </View>
          <Pressable onPress={onStartGuide} style={styles.helpButton} accessibilityLabel="Open guide">
            <Text style={styles.helpButtonText}>i</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.demoBadge}>{SYNTHETIC_DEMO_SNAPSHOT.periodLabel}</Text>
        <View style={styles.heroScoreRow}>
          <Text style={styles.heroScoreValue}>{SYNTHETIC_DEMO_SNAPSHOT.oneL1feScore}</Text>
          <Text style={styles.heroScoreDenom}>/100</Text>
        </View>
        <View style={styles.heroStatusRow}>
          <Text style={styles.heroVerdict}>{SYNTHETIC_DEMO_SNAPSHOT.heroVerdict}</Text>
          <Text style={styles.heroDelta}>{SYNTHETIC_DEMO_SNAPSHOT.heroDelta}</Text>
        </View>
        <Text style={styles.heroHeadline}>{SYNTHETIC_DEMO_SNAPSHOT.currentUpdateHeadline}</Text>
        <View style={styles.heroMetaRow}>
          <View style={styles.heroMetaPill}>
            <Text style={styles.heroMetaLabel}>Coverage</Text>
            <Text style={styles.heroMetaValue}>{SYNTHETIC_DEMO_SNAPSHOT.dataCoveragePercent}%</Text>
          </View>
          <View style={styles.heroMetaPill}>
            <Text style={styles.heroMetaLabel}>Confidence</Text>
            <Text style={styles.heroMetaValue}>{SYNTHETIC_DEMO_SNAPSHOT.confidenceLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.orbitGrid}>
        {orbitDisplay.map((dot) => {
          const dotPalette = colors.dot[dot.key];
          return (
            <Pressable
              key={dot.key}
              onPress={() => openScreen(dot.key)}
              style={[styles.orbitDot, { backgroundColor: dotPalette.tint, borderColor: dotPalette.accent }]}
              accessibilityLabel={`Open ${dot.title}`}
            >
              <View style={styles.orbitIconShell}>
                <DotIcon
                  iconKey={dot.key}
                  color={dotPalette.accent}
                  size={30}
                  backgroundColor={dotPalette.tint}
                />
              </View>
              <Text style={styles.orbitDotTitle}>{dot.title}</Text>
              <Text style={[styles.orbitDotValue, { color: dotPalette.accent }]}>
                {getDemoOrbitDotValue(dot)}
              </Text>
              <Text style={styles.orbitDotMeta}>{getDemoOrbitDotStateLabel(dot)}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.updateCard}>
        <Text style={styles.sectionEyebrow}>Current Update</Text>
        <Text style={styles.sectionTitle}>{SYNTHETIC_DEMO_SNAPSHOT.currentUpdateHeadline}</Text>
        <Text style={styles.detailText}>
          {SYNTHETIC_DEMO_SNAPSHOT.currentUpdate}
        </Text>
        <View style={styles.metricList}>
          {SYNTHETIC_DEMO_SNAPSHOT.metrics.slice(0, 3).map((metric) => (
            <View key={metric.key} style={styles.metricSummaryRow}>
              <View style={[styles.trendDot, getTrendStyle(metric.trend)]} />
              <View style={styles.metricSummaryText}>
                <Text style={styles.metricSummaryLabel}>{metric.label}</Text>
                <Text style={styles.metricSummaryValue}>{metric.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.askCard}>
        <Text style={styles.sectionEyebrow}>Ask One L1fe</Text>
        <Pressable onPress={() => openScreen('ask_one_l1fe')} style={styles.askInputShell}>
          <TextInput
            value={askDraft}
            onChangeText={setAskDraft}
            placeholder="Ask about your health data..."
            style={styles.askInput}
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={() => openScreen('ask_one_l1fe')}
            returnKeyType="search"
          />
          <Text style={styles.askArrow}>Ask</Text>
        </Pressable>
      </View>

      <View style={styles.homeActions}>
        <Pressable onPress={() => openScreen('doctor_prep')} style={styles.actionCard}>
          <Text style={styles.actionCardTitle}>Doctor Prep</Text>
          <Text style={styles.actionCardText}>Prepare a sourced summary for appointments.</Text>
        </Pressable>
        <Pressable onPress={() => openScreen('menu')} style={styles.actionCard}>
          <Text style={styles.actionCardTitle}>Menu</Text>
          <Text style={styles.actionCardText}>Profile, settings, score details, and tools.</Text>
        </Pressable>
      </View>

      <View style={styles.disclaimerCard}>
        <Text style={styles.detailText}>
          One L1fe is a guide, not medical advice. Missing data may lower precision, but it should never appear as a score of 0.
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
  const dotPalette = colors.dot[dot.key];
  return (
    <View style={styles.dotDetailHeader}>
      <View style={[styles.dotDetailIcon, { backgroundColor: dotPalette.tint }]}>
        <DotIcon
          iconKey={dot.key}
          color={dotPalette.accent}
          size={34}
          backgroundColor={dotPalette.tint}
        />
      </View>
      <Text style={styles.sectionEyebrow}>Dot Detail</Text>
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

function getDemoOrbitDotValue(dot: OrbitDotDisplay): string {
  if (dot.key === 'health') return `${SYNTHETIC_DEMO_SNAPSHOT.orbitScores.health}`;
  if (dot.key === 'mind_and_sleep') return `${SYNTHETIC_DEMO_SNAPSHOT.orbitScores.mindSleep}`;
  if (dot.key === 'activity') return `${SYNTHETIC_DEMO_SNAPSHOT.orbitScores.activity}`;
  return getOrbitDotDisplayLabel(getOrbitDot(dot.key));
}

function getDemoOrbitDotStateLabel(dot: OrbitDotDisplay): string {
  if (dot.key === 'nutrition') return 'No score effect yet';
  if (dot.displayState === 'excluded') return 'Excluded';
  if (dot.displayState === 'coming_soon') return 'Coming Soon';
  if (dot.displayState === 'no_score_available') return 'No Score available';
  return 'Score available';
}

function getTrendStyle(trend: SyntheticDemoHabitLink['direction']) {
  if (trend === 'improving') return styles.trendImproving;
  if (trend === 'worse') return styles.trendWorse;
  return styles.trendStable;
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
  safeArea: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  appShell: { flex: 1 },
  body: { flex: 1 },
  bodyContent: {
    gap: spacing.xl,
    padding: spacing.xl,
    paddingBottom: spacing.hero,
  },
  topNav: { flexDirection: 'row', gap: spacing.sm },
  topNavButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: touchTarget.minimum,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    ...shadow.soft,
  },
  topNavButtonText: {
    color: colors.textPrimary,
    fontSize: type.size.meta,
    fontWeight: type.weight.semibold,
  },
  homeHeader: { gap: spacing.xs },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  greetingLine: {
    color: colors.textSecondary,
    fontSize: type.size.greetingLine,
    fontWeight: type.weight.regular,
  },
  greetingName: {
    color: colors.textPrimary,
    fontSize: type.size.greetingName,
    fontWeight: type.weight.semibold,
    lineHeight: 40,
  },
  eyebrow: {
    color: colors.warmCoral,
    fontSize: type.size.disclaimer,
    fontWeight: type.weight.semibold,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  sectionEyebrow: {
    color: colors.warmCoral,
    fontSize: type.size.disclaimer,
    fontWeight: type.weight.semibold,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  mainHeader: { gap: spacing.sm },
  mainTitle: {
    color: colors.textPrimary,
    fontSize: type.size.greetingLine,
    fontWeight: type.weight.semibold,
    lineHeight: 30,
  },
  mainSubtitle: {
    color: colors.textSecondary,
    fontSize: type.size.body,
    lineHeight: 21,
  },
  helpButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: touchTarget.preferred,
    justifyContent: 'center',
    width: touchTarget.preferred,
    ...shadow.soft,
  },
  helpButtonText: {
    color: colors.textPrimary,
    fontSize: type.size.cardTitle,
    fontWeight: type.weight.semibold,
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.cardLarge,
    borderWidth: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    ...shadow.hero,
  },
  demoBadge: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    color: colors.textSecondary,
    fontSize: type.size.disclaimer,
    fontWeight: type.weight.semibold,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  heroScoreRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  heroScoreValue: {
    color: colors.textPrimary,
    fontSize: type.size.heroScore,
    fontVariant: ['tabular-nums'],
    fontWeight: type.weight.light,
    lineHeight: 104,
  },
  heroScoreDenom: {
    color: colors.textMuted,
    fontSize: type.size.heroScoreDenom,
    fontWeight: type.weight.regular,
    lineHeight: 58,
  },
  heroStatusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  heroVerdict: {
    color: colors.textPrimary,
    fontSize: type.size.cardTitle,
    fontWeight: type.weight.semibold,
  },
  heroDelta: {
    backgroundColor: colors.dot.health.tint,
    borderRadius: radius.pill,
    color: colors.dot.health.accent,
    fontSize: type.size.meta,
    fontWeight: type.weight.semibold,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  heroHeadline: {
    color: colors.textSecondary,
    fontSize: type.size.body,
    lineHeight: 21,
    textAlign: 'center',
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    width: '100%',
  },
  heroMetaPill: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexGrow: 1,
    gap: 2,
    minWidth: 130,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  heroMetaLabel: {
    color: colors.textMuted,
    fontSize: type.size.disclaimer,
    fontWeight: type.weight.medium,
  },
  heroMetaValue: {
    color: colors.textPrimary,
    fontSize: type.size.meta,
    fontWeight: type.weight.semibold,
  },
  orbitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  orbitDot: {
    borderRadius: radius.card,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 150,
    padding: spacing.lg,
    ...shadow.soft,
  },
  orbitIconShell: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    width: 48,
  },
  orbitDotTitle: {
    color: colors.textPrimary,
    fontSize: type.size.body,
    fontWeight: type.weight.semibold,
  },
  orbitDotValue: {
    fontSize: type.size.dotScore,
    fontVariant: ['tabular-nums'],
    fontWeight: type.weight.semibold,
    lineHeight: 27,
  },
  orbitDotMeta: {
    color: colors.textSecondary,
    fontSize: type.size.meta,
    fontWeight: type.weight.medium,
    lineHeight: 18,
  },
  updateCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xl,
    ...shadow.card,
  },
  metricList: {
    gap: spacing.sm,
  },
  metricSummaryRow: {
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.chip,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  trendDot: {
    borderRadius: radius.pill,
    height: 10,
    marginTop: 4,
    width: 10,
  },
  trendImproving: { backgroundColor: colors.dot.health.accent },
  trendStable: { backgroundColor: colors.amber },
  trendWorse: { backgroundColor: colors.warmPink },
  metricSummaryText: { flex: 1, gap: 2 },
  metricSummaryLabel: {
    color: colors.textPrimary,
    fontSize: type.size.meta,
    fontWeight: type.weight.semibold,
  },
  metricSummaryValue: {
    color: colors.textSecondary,
    fontSize: type.size.meta,
    lineHeight: 18,
  },
  askCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadow.card,
  },
  askInputShell: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 58,
    paddingHorizontal: spacing.lg,
  },
  askInput: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: type.size.body,
    minHeight: 48,
    paddingVertical: spacing.sm,
  },
  askArrow: {
    color: colors.warmCoral,
    fontSize: type.size.meta,
    fontWeight: type.weight.semibold,
  },
  homeActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.card,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minHeight: 104,
    padding: spacing.lg,
    ...shadow.soft,
  },
  actionCardTitle: {
    color: colors.textPrimary,
    fontSize: type.size.cardTitle,
    fontWeight: type.weight.semibold,
  },
  actionCardText: {
    color: colors.textSecondary,
    fontSize: type.size.meta,
    lineHeight: 18,
  },
  disclaimerCard: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
  },
  screenStack: { gap: spacing.lg },
  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadow.soft,
  },
  warningCard: {
    backgroundColor: '#FFF4E6',
    borderColor: colors.softApricot,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
  },
  warningText: {
    color: '#7A3F11',
    fontSize: type.size.meta,
    lineHeight: 19,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: type.size.cardTitle,
    fontWeight: type.weight.semibold,
    lineHeight: 23,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: type.size.disclaimer,
    lineHeight: 17,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  metricTile: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.chip,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: type.size.disclaimer,
    fontWeight: type.weight.semibold,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: type.size.meta,
    fontWeight: type.weight.semibold,
  },
  subDotList: { gap: spacing.sm },
  subDotRow: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.chip,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  subDotRowActive: {
    backgroundColor: '#FFF2EA',
    borderColor: colors.warmCoral,
  },
  subDotTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  subDotTitle: {
    color: colors.textPrimary,
    flexShrink: 1,
    fontSize: type.size.body,
    fontWeight: type.weight.semibold,
  },
  subDotDescription: {
    color: colors.textSecondary,
    fontSize: type.size.meta,
    lineHeight: 18,
  },
  subDotMeta: {
    color: colors.textSecondary,
    fontSize: type.size.disclaimer,
    lineHeight: 16,
  },
  statusPill: {
    borderRadius: radius.pill,
    fontSize: type.size.disclaimer,
    fontWeight: type.weight.semibold,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    textTransform: 'uppercase',
  },
  status_ready: { backgroundColor: colors.dot.health.tint, color: colors.dot.health.accent },
  status_needs: { backgroundColor: colors.dot.nutrition.tint, color: '#9A6818' },
  status_missing: { backgroundColor: '#EEF1F2', color: colors.textSecondary },
  status_excluded: { backgroundColor: '#E8E4DF', color: colors.textSecondary },
  status_coming: { backgroundColor: colors.dot.mind_and_sleep.tint, color: colors.dot.mind_and_sleep.accent },
  detailStack: { gap: spacing.md },
  detailTitle: {
    color: colors.textPrimary,
    fontSize: type.size.cardTitle,
    fontWeight: type.weight.semibold,
  },
  detailText: {
    color: colors.textSecondary,
    fontSize: type.size.body,
    lineHeight: 21,
  },
  detailMeta: {
    color: colors.textSecondary,
    fontSize: type.size.meta,
    lineHeight: 18,
  },
  menuRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.chip,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  menuTitle: {
    color: colors.textPrimary,
    flexShrink: 1,
    fontSize: type.size.body,
    fontWeight: type.weight.semibold,
  },
  menuArrow: {
    color: colors.warmCoral,
    fontSize: type.size.meta,
    fontWeight: type.weight.semibold,
  },
  staticRow: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.chip,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  bullet: {
    color: colors.textSecondary,
    fontSize: type.size.body,
    lineHeight: 21,
  },
  dotDetailHeader: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadow.card,
  },
  dotDetailIcon: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
});
