import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CoachingStep } from '../data/demoData';
import { marathonTheme } from '../theme/marathonTheme';

type CoachingCardProps = {
  step: CoachingStep;
  index: number;
};

const priorityAccent: Record<CoachingStep['priority'], string> = {
  primary: marathonTheme.colors.accent,
  supporting: marathonTheme.colors.positive,
  context: marathonTheme.colors.textSubtle,
};

export function CoachingCard({ step, index }: CoachingCardProps) {
  const accent = priorityAccent[step.priority];

  return (
    <View style={styles.card}>
      {/* Left accent stripe */}
      <View style={[styles.stripe, { backgroundColor: accent }]} />
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <Text style={[styles.indexText, { color: accent }]}>{index + 1}</Text>
          <Text style={styles.title}>{step.title}</Text>
        </View>
        <Text style={styles.body}>{step.body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: marathonTheme.radius.md,
    backgroundColor: marathonTheme.colors.surface,
    borderWidth: 1,
    borderColor: marathonTheme.colors.border,
    overflow: 'hidden',
  },
  stripe: {
    width: 3,
  },
  inner: {
    flex: 1,
    padding: marathonTheme.spacing.md,
    gap: marathonTheme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: marathonTheme.spacing.sm,
  },
  indexText: {
    fontSize: marathonTheme.typography.bodySmall,
    fontWeight: '800',
    lineHeight: 20,
    width: 16,
  },
  title: {
    flex: 1,
    color: marathonTheme.colors.text,
    fontSize: marathonTheme.typography.body,
    fontWeight: '700',
    lineHeight: 21,
  },
  body: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.bodySmall,
    lineHeight: marathonTheme.lineHeights.bodySmall,
    paddingLeft: 16 + marathonTheme.spacing.sm, // aligns under title
  },
});
