import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TrainingSignal } from '../data/demoData';
import { marathonTheme } from '../theme/marathonTheme';
import { DemoDataBadge } from './DemoDataBadge';

type SignalCardProps = {
  signal: TrainingSignal;
};

const statusColor: Record<TrainingSignal['status'], string> = {
  available: marathonTheme.colors.positive,
  needs_attention: marathonTheme.colors.warning,
  not_available: marathonTheme.colors.textSubtle,
};

export function SignalCard({ signal }: SignalCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.dot, { backgroundColor: statusColor[signal.status] }]} />
      <View style={styles.content}>
        <Text style={styles.label}>{signal.label}</Text>
        <Text style={styles.value}>
          {signal.value}{signal.unit ? ` ${signal.unit}` : ''}
        </Text>
      </View>
      {signal.isDemo ? <DemoDataBadge compact /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: marathonTheme.spacing.md,
    borderRadius: marathonTheme.radius.md,
    backgroundColor: marathonTheme.colors.surface,
    borderWidth: 1,
    borderColor: marathonTheme.colors.border,
    padding: marathonTheme.spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.caption,
  },
  value: {
    color: marathonTheme.colors.text,
    fontSize: marathonTheme.typography.body,
    fontWeight: '700',
  },
});
