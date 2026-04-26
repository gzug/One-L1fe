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
import { DemoDataBadge } from './components/DemoDataBadge';
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
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.appName}>{prototypeCopy.appName}</Text>
            <Text style={styles.greeting}>{prototypeCopy.greeting}</Text>
          </View>
          <DemoDataBadge />
        </View>

        {/* ── Readiness card ── */}
        <ReadinessOrbit />

        {/* ── Training signals ── */}
        <View style={styles.section}>
          <SectionHeader title={prototypeCopy.sectionSignals} />
          {trainingSignals.map((signal) => (
            <SignalCard key={signal.label} signal={signal} />
          ))}
        </View>

        {/* ── Blood context ── */}
        <View style={styles.section}>
          <SectionHeader title={prototypeCopy.sectionBlood} />
          {bloodMarkers.map((marker) => (
            <BloodMarkerCard key={marker.label} marker={marker} />
          ))}
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
  content: {
    paddingHorizontal: marathonTheme.spacing.lg,
    paddingTop: marathonTheme.spacing.lg,
    paddingBottom: marathonTheme.spacing.xxl,
    gap: marathonTheme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    gap: 2,
  },
  appName: {
    color: marathonTheme.colors.accent,
    fontSize: marathonTheme.typography.caption,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  greeting: {
    color: marathonTheme.colors.text,
    fontSize: marathonTheme.typography.title,
    fontWeight: '800',
    lineHeight: 32,
  },
  section: {
    gap: marathonTheme.spacing.sm,
  },
  safetyNote: {
    color: marathonTheme.colors.textSubtle,
    fontSize: marathonTheme.typography.caption,
    lineHeight: marathonTheme.lineHeights.caption,
    textAlign: 'center',
    paddingHorizontal: marathonTheme.spacing.lg,
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
    height: 14,
    borderRadius: 2,
    backgroundColor: marathonTheme.colors.accent,
  },
  title: {
    color: marathonTheme.colors.text,
    fontSize: marathonTheme.typography.subtitle,
    fontWeight: '800',
  },
});

export default PrototypeV1MarathonScreen;
