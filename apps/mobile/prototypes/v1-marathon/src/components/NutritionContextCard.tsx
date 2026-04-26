import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { prototypeCopy } from '../data/copy';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';

export function NutritionContextCard() {
  const { colors } = useTheme();
  const s = createStyles(colors);

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <View style={s.labelRow}>
          <Text style={s.lockGlyph}>\uD83D\uDD12</Text>
          <Text style={s.label}>{prototypeCopy.sectionNutrition}</Text>
        </View>
        <View style={s.plannedPill}>
          <Text style={s.plannedText}>{prototypeCopy.planned}</Text>
        </View>
      </View>
      <Text style={s.body}>{prototypeCopy.nutritionBody}</Text>
      <Text style={s.lockNote}>{prototypeCopy.nutritionLockNote}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: radius.md,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderSubtle,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    lockGlyph: {
      fontSize: 13,
      opacity: 0.4,
    },
    label: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    plannedPill: {
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    plannedText: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    body: {
      color: colors.textSubtle,
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
    },
    lockNote: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      opacity: 0.6,
    },
  });
}
