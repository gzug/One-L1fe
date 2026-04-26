import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View as RNView,
} from 'react-native';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { AppHeader } from './components/AppHeader';
import { BloodMarkerCard } from './components/BloodMarkerCard';
import { CoachingCard } from './components/CoachingCard';
import { DemoModeBanner } from './components/DemoModeBanner';
import { NutritionContextCard } from './components/NutritionContextCard';
import { ProfileScreen } from './components/ProfileScreen';
import { ReadinessOrbit } from './components/ReadinessOrbit';
import { SignalCard } from './components/SignalCard';
import { bloodMarkers, coachingSteps, trainingSignals, bloodPanelCount } from './data/demoData';
import { prototypeCopy } from './data/copy';
import { layout, lineHeights, spacing, typography } from './theme/marathonTheme';
import type { ThemeColors } from './theme/marathonTheme';

export function PrototypeV1MarathonScreen() {
  return (
    <ThemeProvider>
      <PrototypeShell />
    </ThemeProvider>
  );
}

type ActiveView = 'home' | 'profile';

function PrototypeShell() {
  const { colors } = useTheme();
  const [activeView, setActiveView] = useState<ActiveView>('home');

  return (
    <>
      <StatusBar
        barStyle={colors.statusBar === 'dark' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {activeView === 'profile' ? (
          <ProfileScreen onClose={() => setActiveView('home')} />
        ) : (
          <HomeView onProfilePress={() => setActiveView('profile')} />
        )}
      </SafeAreaView>
    </>
  );
}

function HomeView({ onProfilePress }: { onProfilePress: () => void }) {
  const { colors } = useTheme();
  const s = createHomeStyles(colors);

  return (
    <>
      <AppHeader onProfilePress={onProfilePress} />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <RNView style={s.container}>

          <DemoModeBanner />
          <ReadinessOrbit />

          {/* Training signals */}
          <RNView style={s.section}>
            <SectionHeader title={prototypeCopy.sectionSignals} />
            {trainingSignals.map((signal) => (
              <SignalCard key={signal.label} signal={signal} />
            ))}
          </RNView>

          {/* Blood context */}
          <RNView style={s.section}>
            <RNView style={s.sectionTitleRow}>
              <SectionHeader title={prototypeCopy.sectionBlood} />
              <Text style={s.panelCount}>
                {prototypeCopy.bloodPanelCount(bloodPanelCount)}
              </Text>
            </RNView>
            <RNView style={s.bloodGrid}>
              {bloodMarkers.map((marker) => (
                <BloodMarkerCard key={marker.label} marker={marker} />
              ))}
            </RNView>
          </RNView>

          {/* Coaching */}
          <RNView style={s.section}>
            <SectionHeader title={prototypeCopy.sectionCoaching} />
            {coachingSteps.map((step, index) => (
              <CoachingCard key={step.title} step={step} index={index} />
            ))}
          </RNView>

          <NutritionContextCard />

          <Text style={s.safetyNote}>{prototypeCopy.safetyNote}</Text>
        </RNView>
      </ScrollView>
    </>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <RNView style={sectionHeaderStyles.row}>
      <RNView style={[sectionHeaderStyles.accent, { backgroundColor: colors.accent }]} />
      <Text style={[sectionHeaderStyles.title, { color: colors.text }]}>{title}</Text>
    </RNView>
  );
}

function createHomeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    scroll: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
    container: {
      width: '100%',
      maxWidth: layout.maxWidth,
      paddingHorizontal: layout.screenPaddingH,
      gap: spacing.xl,
    },
    section: { gap: spacing.sm },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    panelCount: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '500',
    },
    bloodGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    safetyNote: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      textAlign: 'center',
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.lg,
    },
  });
}

const sectionHeaderStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  accent: {
    width: 3,
    height: 13,
    borderRadius: 2,
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
});

export default PrototypeV1MarathonScreen;
