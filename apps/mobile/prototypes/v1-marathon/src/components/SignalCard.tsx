/**
 * SignalCard — compact grouped signal rows.
 * All signals render inside a single shared surface, not individual cards.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography, lineHeights } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import type { TrainingSignal } from '../data/demoData';

type SignalCardProps = {
  signal: TrainingSignal;
  isLast?: boolean;
};

export function SignalCard({ signal, isLast = false }: SignalCardProps) {
  const { colors } = useTheme();
  const s = createStyles(colors);

  const dotColor =
    signal.status === 'available'
      ? colors.positive
      : signal.status === 'needs_attention'
      ? colors.warning
      : colors.textSubtle;

  return (
    <View style={[s.row, !isLast && s.rowBorder]}>
      <View style={[s.dot, { backgroundColor: dotColor }]} />
      <Text style={s.label}>{signal.label}</Text>
      <Text style={s.value}>
        {signal.value}
        {signal.unit ? <Text style={s.unit}> {signal.unit}</Text> : null}
      </Text>
    </View>
  );
}

/** Wrapper that puts all signals into one shared surface */
export function SignalGroup({ signals }: { signals: TrainingSignal[] }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        borderRadius: radius.md,
        backgroundColor: colors.surfaceElevated,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      {signals.map((s, i) => (
        <SignalCard key={s.label} signal={s} isLast={i === signals.length - 1} />
      ))}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderSubtle,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      flexShrink: 0,
    },
    label: {
      flex: 1,
      color: colors.textMuted,
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
    },
    value: {
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '600',
      textAlign: 'right',
    },
    unit: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      fontWeight: '400',
    },
  });
}
