import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BloodMarkerCard } from './components/BloodMarkerCard';
import { CoachingCard } from './components/CoachingCard';
import { DemoModeBanner } from './components/DemoModeBanner';
import { NutritionContextCard } from './components/NutritionContextCard';
import { ReadinessOrbit } from './components/ReadinessOrbit';
import { SignalCard } from './components/SignalCard';
import { bloodMarkers, coachingSteps, trainingSignals } from './data/demoData';
import { prototypeCopy } from './data/copy';
import { marathonTheme } from './theme/marathonTheme';

export function PrototypeV1MarathonScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* maxWidth container — keeps layout mobile-first on wider surfaces */}
        <View style={styles.container}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.appKicker}>{prototypeCopy.appName}</Text>
              <Text style={styles.prototypeName}>{prototypeCopy.prototypeName}</Text>
              <Text style={styles.greeting}>{prototypeCopy.greeting}</Text>
            </View>
          </View>

          {/* ── Demo mode banner (global, replaces per-card badges) ── */}
          <DemoModeBanner />

          {/* ── Readiness hero card ── */}
          <ReadinessOrbit />

          {/* ── Training signals ── */}
          <View style={styles.section}>
            <SectionHeader title={prototypeCopy.sectionSignals} />
            {trainingSignals.map((signal) => (
              <SignalCard key={signal.label} signal={signal} />
            ))}
          </View>

          {/* ── Blood context — 2-column grid ── */}
          <View style={styles.section}>
            <SectionHeader title={prototypeCopy.sectionBlood} />
            <View style={styles.bloodGrid}>
              {bloodMarkers.map((marker) => (
                <BloodMarkerCard key={marker.label} marker={marker} />
              ))}
            </View>
          </View>

          {/* ── Coaching ── */}
          <View style={styles.section}>
            <SectionHeader title={prototypeCopy.sectionCoaching} />
            {coachingSteps.map((step, index) => (
              <CoachingCard key={step.title} step={step} index={index} />
            ))}
          </View>

          {/* ── Nutrition — context only, not scoring-active ── */}
          <NutritionContextCard />

          {/* ── Safety note ── */}
          <Text style={styles.safetyNote}>{prototypeCopy.safetyNote}</Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={sectionStyles.row}>
      <View style={sectionStyles.accent} />
      <Text style={sectionStyles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: marathonTheme.colors.background,
  },
  scroll: {
    alignItems: 'center', // centers the maxWidth container on wide surfaces
    paddingVertical: marathonTheme.spacing.lg,
    paddingBottom: marathonTheme.spacing.xxxl,
  },
  container: {
    width: '100%',
    maxWidth: marathonTheme.layout.maxWidth,
    paddingHorizontal: marathonTheme.layout.screenPaddingH,
    gap: marathonTheme.spacing.xl,
  },
  header: {
    paddingTop: marathonTheme.spacing.sm,
    gap: 2,
  },
  appKicker: {
    color: marathonTheme.colors.accent,
    fontSize: marathonTheme.typography.heroName,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  prototypeName: {
    color: marathonTheme.colors.text,
    fontSize: marathonTheme.typography.title,
    fontWeight: '800',
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  greeting: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.body,
    marginTop: marathonTheme.spacing.xs,
    lineHeight: marathonTheme.lineHeights.body,
  },
  section: {
    gap: marathonTheme.spacing.sm,
  },
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: marathonTheme.spacing.sm,
  },
  safetyNote: {
    color: marathonTheme.colors.textSubtle,
    fontSize: marathonTheme.typography.caption,
    lineHeight: marathonTheme.lineHeights.caption,
    textAlign: 'center',
    paddingHorizontal: marathonTheme.spacing.xl,
    paddingBottom: marathonTheme.spacing.lg,
  },
});

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: marathonTheme.spacing.sm,
    marginBottom: 2,
  },
  accent: {
    width: 3,
    height: 13,
    borderRadius: 2,
    backgroundColor: marathonTheme.colors.accent,
  },
  title: {
    color: marathonTheme.colors.text,
    fontSize: marathonTheme.typography.subtitle,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
});

export default PrototypeV1MarathonScreen;
