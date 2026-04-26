import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CoachingStep } from '../data/demoData';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';

type CoachingCardProps = { step: CoachingStep; index: number };

function accentFor(priority: CoachingStep['priority'], colors: ThemeColors) {
  switch (priority) {
    case 'primary': return colors.accent;
    case 'supporting': return colors.positive;
    default: return colors.textSubtle;
  }
}
function bgFor(priority: CoachingStep['priority'], colors: ThemeColors) {
  switch (priority) {
    case 'primary': return colors.coachPrimaryTint;
    case 'supporting': return colors.coachSupportTint;
    default: return colors.coachContextTint;
  }
}

export function CoachingCard({ step, index }: CoachingCardProps) {
  const { colors } = useTheme();
  const accent = accentFor(step.priority, colors);
  const bg = bgFor(step.priority, colors);
  const s = createStyles(colors);

  return (
    <View style={[s.card, { backgroundColor: bg }]}>
      <View style={[s.stripe, { backgroundColor: accent }]} />
      <View style={s.inner}>
        <View style={s.titleRow}>
          <Text style={[s.index, { color: accent }]}>{index + 1}</Text>
          <Text style={s.title}>{step.title}</Text>
        </View>
        <Text style={s.body}>{step.body}</Text>
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
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    index: {
      fontSize: typography.bodySmall,
      fontWeight: '800',
      lineHeight: 21,
      width: 14,
    },
    title: {
      flex: 1,
      color: colors.text,
      fontSize: typography.body,
      fontWeight: '700',
      lineHeight: 21,
    },
    body: {
      color: colors.textMuted,
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
      paddingLeft: 14 + spacing.sm,
    },
  });
}
