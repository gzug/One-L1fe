import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TrainingSignal } from '../data/demoData';
import { marathonTheme } from '../theme/marathonTheme';
import { DemoDataBadge } from './DemoDataBadge';

type SignalCardProps = {
  signal: TrainingSignal;
};

const STATUS_DOT: Record<TrainingSignal['status'], string> = {
  available: marathonTheme.colors.positive,
  needs_attention: marathonTheme.colors.warning,
  not_available: marathonTheme.colors.textSubtle,
};

export function SignalCard({ signal }: SignalCardProps) {
  const dotColor = STATUS_DOT[signal.status];

  return (
    <View style={styles.card}>
      <View style={[styles.statusStripe, { backgroundColor: dotColor }]} />
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <Text style={styles.label}>{signal.label}</Text>
          {signal.isDemo && <DemoDataBadge compact />}
        </View>
        <Text style={styles.value}>
          {signal.value}
          {signal.unit ? (
            <Text style={styles.unit}> {signal.unit}</Text>
          ) : null}
        </Text>
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
  statusStripe: {
    width: 3,
    borderRadius: 0,
  },
  inner: {
    flex: 1,
    padding: marathonTheme.spacing.md,
    gap: marathonTheme.spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.caption,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  value: {
    color: marathonTheme.colors.text,
    fontSize: marathonTheme.typography.subtitle,
    fontWeight: '700',
    lineHeight: 22,
  },
  unit: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.body,
    fontWeight: '400',
  },
});
