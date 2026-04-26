import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import type { CoachingStep } from '../data/demoData';

type CoachingCardProps = {
  step: CoachingStep;
  index: number;
};

export function CoachingCard({ step, index }: CoachingCardProps) {
  const { colors } = useTheme();
  const s = createStyles(colors);

  const isPrimary = step.priority === 'primary';

  return (
    <View style={[s.card, isPrimary && s.cardPrimary]}>
      <View style={s.topRow}>
        <Text style={s.index}>{String(index + 1).padStart(2, '0')}</Text>
        <Text style={s.title}>{step.title}</Text>
      </View>
      <Text style={s.body}>{step.body}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: radius.md,
      backgroundColor: colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    cardPrimary: {
      borderLeftWidth: 2,
      borderLeftColor: colors.accent,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.sm,
    },
    index: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      fontWeight: '600',
      letterSpacing: 0.5,
      lineHeight: lineHeights.bodySmall,
    },
    title: {
      flex: 1,
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '600',
      lineHeight: lineHeights.bodySmall,
      letterSpacing: -0.1,
    },
    body: {
      color: colors.textMuted,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
    },
  });
}
