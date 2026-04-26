/**
 * ActivityTrendCard
 *
 * Lightweight 7-day activity bar chart.
 * Uses only React Native primitives — no chart library.
 *
 * Demo data only. No live sync claim.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { activityTrend } from '../data/demoData';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';

const BAR_MAX_HEIGHT = 44;
const BAR_MIN_HEIGHT = 4;

function thresholdColor(value: number, colors: ThemeColors): string {
  if (value >= 75) return colors.positive;
  if (value >= 50) return colors.warning;
  return colors.danger;
}

export function ActivityTrendCard() {
  const { colors } = useTheme();
  const s = createStyles(colors);

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.title}>Activity trend</Text>
        <Text style={s.sub}>Last 7 days · demo data</Text>
      </View>

      <View style={s.chartRow}>
        {activityTrend.map((day) => {
          const barH = Math.max(
            BAR_MIN_HEIGHT,
            Math.round((day.value / 100) * BAR_MAX_HEIGHT),
          );
          const color = thresholdColor(day.value, colors);
          return (
            <View key={day.day} style={s.barCol}>
              <View style={s.barArea}>
                <View
                  style={[
                    s.bar,
                    { height: barH, backgroundColor: color },
                  ]}
                />
              </View>
              <Text style={s.dayLabel}>{day.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.md,
    },
    header: { gap: 2 },
    title: {
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '700',
      letterSpacing: -0.1,
    },
    sub: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
    },
    chartRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    barCol: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
    },
    barArea: {
      height: BAR_MAX_HEIGHT,
      justifyContent: 'flex-end',
    },
    bar: {
      width: '100%',
      borderRadius: 3,
      minHeight: BAR_MIN_HEIGHT,
    },
    dayLabel: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '500',
      textAlign: 'center',
    },
  });
}
