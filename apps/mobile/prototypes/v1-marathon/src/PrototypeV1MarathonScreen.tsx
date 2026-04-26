import React, { useState } from 'react';
import {
  Modal,
  Platform,
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
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { useWebBackground } from './theme/useWebBackground';
import { AppHeader } from './components/AppHeader';
import { BloodContextCard } from './components/BloodContextCard';
import { CoachingCard } from './components/CoachingCard';
import { IdeasNotesCard } from './components/IdeasNotesCard';
import { ProfileScreen } from './components/ProfileScreen';
import { BloodResultsScreen } from './screens/BloodResultsScreen';
import { ReadinessOrbit } from './components/ReadinessOrbit';
import { ActivityTrendCard } from './components/ActivityTrendCard';
import { SignalGroup } from './components/SignalCard';
import { nextActions, trainingSignals } from './data/demoData';
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

type ActiveView = 'home' | 'profile' | 'blood';

function PrototypeShell() {
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

          <ActivityTrendCard />

          {/* BloodContextCard replaces shallow BloodPanelsCard */}
          <BloodContextCard onViewPress={onViewBloodPanels} />

          <View style={s.section}>
            <SectionLabel text="Recommendations" />
            {nextActions.map((action) => (
              <CoachingCard key={action.id} action={action} />
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

export default PrototypeV1MarathonScreen;
