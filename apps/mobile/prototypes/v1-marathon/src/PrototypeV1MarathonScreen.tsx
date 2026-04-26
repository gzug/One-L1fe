import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { AppHeader } from './components/AppHeader';
import { BloodPanelsCard } from './components/BloodPanelsCard';
import { CoachingCard } from './components/CoachingCard';
import { IdeasNotesCard } from './components/IdeasNotesCard';
import { ProfileScreen } from './components/ProfileScreen';
import { ReadinessOrbit } from './components/ReadinessOrbit';
import { SignalCard } from './components/SignalCard';
import { coachingSteps, trainingSignals } from './data/demoData';
import { prototypeCopy } from './data/copy';
import { layout, lineHeights, radius, spacing, typography } from './theme/marathonTheme';
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
  const [demoInfoVisible, setDemoInfoVisible] = useState(false);

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
          <HomeView
            onProfilePress={() => setActiveView('profile')}
            onDemoInfoPress={() => setDemoInfoVisible(true)}
            onViewBloodPanels={() => setActiveView('profile')}
          />
        )}
      </SafeAreaView>

      {/* Demo info overlay */}
      <Modal
        visible={demoInfoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDemoInfoVisible(false)}
      >
        <Pressable
          style={demoModalStyles.backdrop}
          onPress={() => setDemoInfoVisible(false)}
        >
          <Pressable style={[demoModalStyles.sheet, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={demoModalStyles.iconRow}>
              <Ionicons name="information-circle" size={22} color={colors.accent} />
            </View>
            <Text style={[demoModalStyles.title, { color: colors.text }]}>
              {prototypeCopy.demoInfoTitle}
            </Text>
            <Text style={[demoModalStyles.body, { color: colors.textMuted }]}>
              {prototypeCopy.demoInfoBody}
            </Text>
            <Pressable
              onPress={() => setDemoInfoVisible(false)}
              style={[demoModalStyles.dismissBtn, { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft }]}
            >
              <Text style={[demoModalStyles.dismissText, { color: colors.accent }]}>
                {prototypeCopy.demoInfoDismiss}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function HomeView({
  onProfilePress,
  onDemoInfoPress,
  onViewBloodPanels,
}: {
  onProfilePress: () => void;
  onDemoInfoPress: () => void;
  onViewBloodPanels: () => void;
}) {
  const { colors } = useTheme();
  const s = createHomeStyles(colors);

  return (
    <>
      <AppHeader onProfilePress={onProfilePress} onDemoInfoPress={onDemoInfoPress} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.container}>

          <ReadinessOrbit />

          {/* Training signals */}
          <View style={s.section}>
            <SectionHeader title={prototypeCopy.sectionSignals} />
            {trainingSignals.map((signal) => (
              <SignalCard key={signal.label} signal={signal} />
            ))}
          </View>

          {/* Blood panels entry card */}
          <BloodPanelsCard onViewPress={onViewBloodPanels} />

          {/* Coaching */}
          <View style={s.section}>
            <SectionHeader title={prototypeCopy.sectionCoaching} />
            {coachingSteps.map((step, index) => (
              <CoachingCard key={step.title} step={step} index={index} />
            ))}
          </View>

          {/* Ideas & Notes */}
          <IdeasNotesCard />

          <Text style={s.safetyNote}>{prototypeCopy.safetyNote}</Text>
        </View>
      </ScrollView>
    </>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <View style={sectionHeaderStyles.row}>
      <View style={[sectionHeaderStyles.accent, { backgroundColor: colors.accent }]} />
      <Text style={[sectionHeaderStyles.title, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

function createHomeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    scroll: { alignItems: 'center', paddingVertical: spacing.lg, paddingBottom: spacing.xxxl },
    container: {
      width: '100%',
      maxWidth: layout.maxWidth,
      paddingHorizontal: layout.screenPaddingH,
      gap: spacing.xl,
    },
    section: { gap: spacing.sm },
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
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 2 },
  accent: { width: 3, height: 13, borderRadius: 2 },
  title: { fontSize: typography.subtitle, fontWeight: '800', letterSpacing: -0.1 },
});

const demoModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.md,
  },
  iconRow: { alignItems: 'center' },
  title: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: typography.bodySmall,
    lineHeight: lineHeights.bodySmall,
    textAlign: 'center',
  },
  dismissBtn: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  dismissText: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
  },
});

export default PrototypeV1MarathonScreen;
