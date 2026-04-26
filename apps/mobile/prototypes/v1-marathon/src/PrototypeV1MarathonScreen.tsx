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
import { SignalGroup } from './components/SignalCard';
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
  const [activeView, setActiveView]         = useState<ActiveView>('home');
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

      {/* Demo info modal */}
      <Modal
        visible={demoInfoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDemoInfoVisible(false)}
      >
        <Pressable
          style={demoOverlay.backdrop}
          onPress={() => setDemoInfoVisible(false)}
        >
          <Pressable
            style={[
              demoOverlay.sheet,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
          >
            <Ionicons name="information-circle" size={24} color={colors.accent} style={{ alignSelf: 'center' }} />
            <Text style={[demoOverlay.title, { color: colors.text }]}>
              {prototypeCopy.demoInfoTitle}
            </Text>
            <Text style={[demoOverlay.body, { color: colors.textMuted }]}>
              {prototypeCopy.demoInfoBody}
            </Text>
            <Pressable
              onPress={() => setDemoInfoVisible(false)}
              style={[demoOverlay.btn, { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft }]}
            >
              <Text style={[demoOverlay.btnText, { color: colors.accent }]}>
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
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.container}>

          <ReadinessOrbit />

          <View style={s.section}>
            <SectionLabel text={prototypeCopy.sectionSignals} />
            <SignalGroup signals={trainingSignals} />
          </View>

          <BloodPanelsCard onViewPress={onViewBloodPanels} />

          <View style={s.section}>
            <SectionLabel text={prototypeCopy.sectionCoaching} />
            {coachingSteps.map((step, index) => (
              <CoachingCard key={step.title} step={step} index={index} />
            ))}
          </View>

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
    gap: spacing.md,
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
  btn: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  btnText: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
  },
});

export default PrototypeV1MarathonScreen;
