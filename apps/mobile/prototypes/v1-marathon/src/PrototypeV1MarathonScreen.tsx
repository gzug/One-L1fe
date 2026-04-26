import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
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
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.kicker}>One L1fe</Text>
            <Text style={styles.title}>{prototypeCopy.appName}</Text>
            <Text style={styles.subtitle}>{prototypeCopy.readinessHelper}</Text>
          </View>
          <DemoDataBadge />
        </View>

        <ReadinessOrbit />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training signals</Text>
          {trainingSignals.map((signal) => (
            <SignalCard key={signal.label} signal={signal} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blood marker context</Text>
          <View style={styles.markerGrid}>
            {bloodMarkers.map((marker) => (
              <BloodMarkerCard key={marker.label} marker={marker} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{prototypeCopy.coachingTitle}</Text>
          {coachingSteps.map((step, index) => (
            <CoachingCard key={step.title} step={step} index={index} />
          ))}
        </View>

        <NutritionContextCard />

        <Text style={styles.safetyNote}>{prototypeCopy.safetyNote}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: marathonTheme.colors.background,
  },
  content: {
    padding: marathonTheme.spacing.lg,
    gap: marathonTheme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: marathonTheme.spacing.md,
  },
  titleBlock: {
    flex: 1,
    gap: marathonTheme.spacing.xs,
  },
  kicker: {
    color: marathonTheme.colors.accent,
    fontSize: marathonTheme.typography.caption,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: marathonTheme.colors.text,
    fontSize: marathonTheme.typography.title,
    fontWeight: '900',
  },
  subtitle: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.body,
    lineHeight: 21,
  },
  section: {
    gap: marathonTheme.spacing.md,
  },
  sectionTitle: {
    color: marathonTheme.colors.text,
    fontSize: marathonTheme.typography.subtitle,
    fontWeight: '800',
  },
  markerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: marathonTheme.spacing.md,
  },
  safetyNote: {
    color: marathonTheme.colors.textSubtle,
    fontSize: marathonTheme.typography.caption,
    lineHeight: 18,
    paddingBottom: marathonTheme.spacing.xl,
  },
});

export default PrototypeV1MarathonScreen;
