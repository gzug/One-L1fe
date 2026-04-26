import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TrainingSignal } from '../data/demoData';
import { prototypeCopy } from '../data/copy';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';

type SignalCardProps = { signal: TrainingSignal };

function statusColor(status: TrainingSignal['status'], colors: ThemeColors) {
  switch (status) {
    case 'available': return colors.positive;
    case 'needs_attention': return colors.warning;
    default: return colors.textSubtle;
  }
}

function statusBg(status: TrainingSignal['status'], colors: ThemeColors) {
  switch (status) {
    case 'available': return colors.positiveTint;
    case 'needs_attention': return colors.warningTint;
    default: return 'transparent';
  }
}

export function SignalCard({ signal }: SignalCardProps) {
  const { colors } = useTheme();
  const stripe = statusColor(signal.status, colors);
  const bg = statusBg(signal.status, colors);
  const glyph = prototypeCopy.signalGlyphs[signal.status] ?? '\u25cf';
  const s = createStyles(colors);

  return (
    <View style={[s.card, { backgroundColor: bg }]}>
      <View style={[s.stripe, { backgroundColor: stripe }]} />
      <View style={s.inner}>
        <View style={s.labelRow}>
          <Text style={[s.glyph, { color: stripe }]}>{glyph}</Text>
          <Text style={s.label}>{signal.label}</Text>
        </View>
        <Text style={s.value}>
          {signal.value}
          {signal.unit ? <Text style={s.unit}> {signal.unit}</Text> : null}
        </Text>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    stripe: { width: 3 },
    inner: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      gap: spacing.xs,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    glyph: { fontSize: 7, lineHeight: 16 },
    label: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      fontWeight: '600',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    value: {
      color: colors.text,
      fontSize: typography.subtitle,
      fontWeight: '700',
      lineHeight: 24,
    },
    unit: {
      color: colors.textMuted,
      fontSize: typography.body,
      fontWeight: '400',
    },
  });
}
