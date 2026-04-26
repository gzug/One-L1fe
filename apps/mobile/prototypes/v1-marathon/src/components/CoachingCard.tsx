import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CoachingStep } from '../data/demoData';
import { marathonTheme } from '../theme/marathonTheme';
import { DemoDataBadge } from './DemoDataBadge';

type CoachingCardProps = {
  step: CoachingStep;
  index: number;
};

const priorityColor: Record<CoachingStep['priority'], string> = {
  primary: marathonTheme.colors.accent,
  supporting: marathonTheme.colors.positive,
  context: marathonTheme.colors.textSubtle,
};

export function CoachingCard({ step, index }: CoachingCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.indexBadge, { borderColor: priorityColor[step.priority] }]}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{step.title}</Text>
          {step.isDemo ? <DemoDataBadge compact /> : null}
        </View>
        <Text style={styles.body}>{step.body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: marathonTheme.spacing.md,
    borderRadius: marathonTheme.radius.md,
    backgroundColor: marathonTheme.colors.surface,
    borderWidth: 1,
    borderColor: marathonTheme.colors.border,
    padding: marathonTheme.spacing.md,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    color: marathonTheme.colors.text,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    gap: marathonTheme.spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: marathonTheme.spacing.sm,
  },
  title: {
    flex: 1,
    color: marathonTheme.colors.text,
    fontSize: marathonTheme.typography.body,
    fontWeight: '800',
  },
  body: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.body,
    lineHeight: 21,
  },
});
