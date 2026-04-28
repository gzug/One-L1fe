import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from '../../v1-marathon/src/theme/ThemeContext';
import { useWebBackground } from '../../v1-marathon/src/theme/useWebBackground';
import { AppHeaderV2 } from './components/AppHeaderV2';
import { BloodContextCard } from '../../v1-marathon/src/components/BloodContextCard';
import { CoachingCard } from '../../v1-marathon/src/components/CoachingCard';
import { IdeasNotesCard } from '../../v1-marathon/src/components/IdeasNotesCard';
import { ProfileScreen } from '../../v1-marathon/src/components/ProfileScreen';
import { BloodResultsScreen } from '../../v1-marathon/src/screens/BloodResultsScreen';
import { ReadinessOrbit } from '../../v1-marathon/src/components/ReadinessOrbit';
import { ScoreTrendCard } from '../../v1-marathon/src/components/ScoreTrendCard';
import { TodaySignalsRow } from '../../v1-marathon/src/components/TodaySignalsRow';
import { WearableSourcesCard } from '../../v1-marathon/src/components/WearableSourcesCard';
import { HealthConnectLiveCard } from '../../v1-marathon/src/components/HealthConnectLiveCard';
import { checkHealthConnect } from '../../v1-marathon/src/data/healthConnect';
import type { HealthConnectStatus } from '../../v1-marathon/src/data/healthConnect';
import { nextActions } from '../../v1-marathon/src/data/demoData';
import type { Period } from '../../v1-marathon/src/data/demoData';
import { prototypeCopy } from './data/copy';
import { layout, lineHeights, radius, spacing, typography } from '../../v1-marathon/src/theme/marathonTheme';
import type { ThemeColors } from '../../v1-marathon/src/theme/marathonTheme';

export function OneL1feV2Screen() {
  return (
    <ThemeProvider>
      <V2Shell />
    </ThemeProvider>
  );
}

type ActiveView = 'home' | 'profile' | 'blood';

function V2Shell() {
  const { colors } = useTheme();
  const [activeView, setActiveView]           = useState<ActiveView>('home');
  const [demoInfoVisible, setDemoInfoVisible] = useState(false);

  useWebBackground(colors.background);

  function openProfile() {
    setDemoInfoVisible(false);
    setActiveView('profile');
  }

  return (
    <>
      <StatusBar
        barStyle={colors.statusBar === 'dark' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background}
        translucent={false}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {activeView === 'blood' ? (
          <BloodResultsScreen onClose={() => setActiveView('home')} />
        ) : activeView === 'profile' ? (
          <ProfileScreen
            onClose={() => setActiveView('home')}
            onViewBlood={() => setActiveView('blood')}
          />
        ) : (
          <HomeView
            onProfilePress={() => setActiveView('profile')}
            onDemoInfoPress={() => setDemoInfoVisible(true)}
            onViewBloodPanels={() => setActiveView('blood')}
            onManageSources={() => setActiveView('profile')}
          />
        )}
      </SafeAreaView>

      <Modal
        visible={demoInfoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDemoInfoVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDemoInfoVisible(false)}>
          <View style={demoOverlay.backdrop}>
            <TouchableWithoutFeedback onPress={() => { /* absorb */ }}>
              <View
                style={[
                  demoOverlay.sheet,
                  { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                ]}
              >
                <Ionicons
                  name="information-circle"
                  size={24}
                  color={colors.accent}
                  style={{ alignSelf: 'center' }}
                />
                <Text style={[demoOverlay.title, { color: colors.text }]}>
                  {prototypeCopy.demoInfoTitle}
                </Text>
                <Text style={[demoOverlay.body, { color: colors.textMuted }]}>
                  {prototypeCopy.demoInfoBody}
                </Text>
                <View style={[demoOverlay.divider, { backgroundColor: colors.borderSubtle }]} />
                <Text style={[demoOverlay.helperText, { color: colors.textSubtle }]}>
                  {prototypeCopy.demoInfoConnectHelper}
                </Text>
                <Pressable
                  onPress={openProfile}
                  style={[
                    demoOverlay.connectBtn,
                    { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft },
                  ]}
                  accessibilityLabel="Connect a source"
                >
                  <Ionicons name="link-outline" size={14} color={colors.accent} />
                  <Text style={[demoOverlay.connectBtnText, { color: colors.accent }]}>
                    {prototypeCopy.demoInfoConnectCta}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setDemoInfoVisible(false)}
                  style={demoOverlay.dismissBtn}
                >
                  <Text style={[demoOverlay.dismissText, { color: colors.textSubtle }]}>
                    {prototypeCopy.demoInfoDismiss}
                  </Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

function HomeView({
  onProfilePress,
  onDemoInfoPress,
  onViewBloodPanels,
  onManageSources,
}: {
  onProfilePress: () => void;
  onDemoInfoPress: () => void;
  onViewBloodPanels: () => void;
  onManageSources: () => void;
}) {
  const { colors } = useTheme();
  const s = createHomeStyles(colors);

  const [period, setPeriod]     = useState<Period>('7D');
  const [hcStatus, setHcStatus] = useState<HealthConnectStatus>('error');

  useEffect(() => {
    let cancelled = false;
    checkHealthConnect().then((s) => {
      if (!cancelled) setHcStatus(s.status);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <AppHeaderV2 onProfilePress={onProfilePress} onDemoInfoPress={onDemoInfoPress} />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.container}>
          <ReadinessOrbit period={period} onPeriodChange={setPeriod} />

          <ScoreTrendCard period={period} onPeriodChange={setPeriod} />

          <View style={s.section}>
            <SectionLabel text={prototypeCopy.sectionTodaySignals} />
            <TodaySignalsRow />
          </View>

          <WearableSourcesCard hcStatus={hcStatus} onManageSources={onManageSources} />

          <HealthConnectLiveCard />

          <View style={s.section}>
            <SectionLabel text={prototypeCopy.sectionRecommendations} />
            {nextActions.map((action) => (
              <CoachingCard key={action.id} action={action} />
            ))}
          </View>

          <BloodContextCard onViewPress={onViewBloodPanels} />

          <IdeasNotesCard />

          <Text style={s.safetyNote}>{prototypeCopy.safetyNote}</Text>
        </View>
      </ScrollView>
    </>
  );
}

function SectionLabel({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        color: colors.textSubtle,
        fontSize: typography.caption,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        paddingLeft: 2,
      }}
    >
      {text}
    </Text>
  );
}

function createHomeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    scroll: {
      alignItems: 'center',
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
    container: {
      width: '100%',
      maxWidth: layout.maxWidth,
      paddingHorizontal: layout.screenPaddingH,
      gap: spacing.lg,
    },
    section: { gap: spacing.sm },
    safetyNote: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
      textAlign: 'center',
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.sm,
    },
  });
}

const demoOverlay = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  sheet: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: typography.bodySmall,
    lineHeight: lineHeights.bodySmall,
    textAlign: 'center',
  },
  divider: { height: 1, marginVertical: spacing.xs },
  helperText: {
    fontSize: typography.caption,
    lineHeight: lineHeights.caption,
    textAlign: 'center',
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  connectBtnText: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  dismissBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  dismissText: { fontSize: typography.caption, fontWeight: '500' },
});

export default OneL1feV2Screen;
