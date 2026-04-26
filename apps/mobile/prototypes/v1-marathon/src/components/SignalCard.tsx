import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TrainingSignal } from '../data/demoData';
import { prototypeCopy } from '../data/copy';
import { marathonTheme } from '../theme/marathonTheme';

type SignalCardProps = {
  signal: TrainingSignal;
};

const STATUS_COLOR: Record<TrainingSignal['status'], string> = {
  available: marathonTheme.colors.positive,
  needs_attention: marathonTheme.colors.warning,
  not_available: marathonTheme.colors.textSubtle,
};

const STATUS_BG: Record<TrainingSignal['status'], string> = {
  available: marathonTheme.colors.positiveTint,
  needs_attention: marathonTheme.colors.warningTint,
  not_available: 'transparent',
};

export function SignalCard({ signal }: SignalCardProps) {
  const stripeColor = STATUS_COLOR[signal.status];
  const bgColor = STATUS_BG[signal.status];
  const glyph = prototypeCopy.signalGlyphs[signal.status] ?? '\u25cf';

  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <View style={[styles.stripe, { backgroundColor: stripeColor }]} />
      <View style={styles.inner}>
        <View style={styles.labelRow}>
          <Text style={[styles.glyph, { color: stripeColor }]}>{glyph}</Text>
          <Text style={styles.label}>{signal.label}</Text>
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
    borderWidth: 1,
    borderColor: marathonTheme.colors.border,
    overflow: 'hidden',
  },
  stripe: {
    width: 3,
  },
  inner: {
    flex: 1,
    paddingVertical: marathonTheme.spacing.md,
    paddingHorizontal: marathonTheme.spacing.lg,
    gap: marathonTheme.spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: marathonTheme.spacing.xs,
  },
  glyph: {
    fontSize: 7,
    lineHeight: 16,
  },
  label: {
    color: marathonTheme.colors.textSubtle,
    fontSize: marathonTheme.typography.caption,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  value: {
    color: marathonTheme.colors.text,
    fontSize: marathonTheme.typography.subtitle,
    fontWeight: '700',
    lineHeight: 24,
  },
  unit: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.body,
    fontWeight: '400',
  },
});
