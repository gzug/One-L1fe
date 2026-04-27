/**
 * TodaySignalsRow — F11
 *
 * Compact chip row: Recovery · Training Load · Biomarkers · Data coverage.
 * Color-coded by status threshold.
 * No new deps — pure RN primitives.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { todaySignals } from '../data/demoData';
import type { TodaySignal } from '../data/demoData';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';

function chipColors(status: TodaySignal['status'], colors: ThemeColors) {
  switch (status) {
    case 'ok':   return { bg: colors.accentSoft,  text: colors.accent };
    case 'warn': return { bg: colors.warningSoft, text: colors.warning };
    case 'muted':
    default:     return { bg: colors.surface,     text: colors.textMuted };
  }
}

export function TodaySignalsRow() {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {todaySignals.map((sig) => {
        const c = chipColors(sig.status, colors);
        return (
          <View
            key={sig.label}
            style={[
              styles.chip,
              {
                backgroundColor: c.bg,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSubtle }]}>{sig.label}</Text>
            <Text style={[styles.value, { color: c.text }]}>{sig.value}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  chip: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    minWidth: 80,
  },
  label: {
    fontSize: typography.micro,
    fontWeight: '500',
    letterSpacing: 0.1,
    marginBottom: 1,
  },
  value: {
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
