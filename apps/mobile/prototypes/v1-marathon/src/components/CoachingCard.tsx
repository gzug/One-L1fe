/**
 * CoachingCard — replaced with NextActionCard (F8).
 *
 * Compact action card:
 *   [icon]  Title text
 *           1-line reason
 *           [impact tag]
 *
 * Rules:
 * - No medical advice
 * - No treatment wording
 * - No "you should" / "you need"
 * - Assistive language: Focus on / Keep / Check / Review
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import type { NextAction } from '../data/demoData';

// Impact tag colors by category — uses theme semantic colors
function impactTagColors(
  impactKey: NextAction['impactKey'],
  colors: ThemeColors,
): { bg: string; text: string } {
  switch (impactKey) {
    case 'recovery': return { bg: colors.accentSoft,   text: colors.accent };
    case 'training': return { bg: colors.warningSoft ?? colors.progressTrack, text: colors.warning };
    case 'data':     return { bg: colors.progressTrack, text: colors.textMuted };
  }
}

type NextActionCardProps = {
  action: NextAction;
};

export function CoachingCard({ action }: NextActionCardProps) {
  const { colors } = useTheme();
  const s = createStyles(colors);
  const tag = impactTagColors(action.impactKey, colors);

  return (
    <View style={s.card}>
      {/* Left: icon */}
      <View style={s.iconWrap}>
        <Ionicons name={action.icon as any} size={18} color={colors.textMuted} />
      </View>

      {/* Right: text */}
      <View style={s.content}>
        <Text style={s.title} numberOfLines={1}>{action.title}</Text>
        <Text style={s.reason} numberOfLines={1}>{action.reason}</Text>
        <View style={[s.tag, { backgroundColor: tag.bg }]}>
          <Text style={[s.tagText, { color: tag.text }]}>{action.impact}</Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderRadius: radius.md,
      backgroundColor: colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: radius.sm,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: 1,
    },
    content: { flex: 1, gap: 4 },
    title: {
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '600',
      lineHeight: lineHeights.bodySmall,
      letterSpacing: -0.1,
    },
    reason: {
      color: colors.textMuted,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
    },
    tag: {
      alignSelf: 'flex-start',
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      marginTop: 2,
    },
    tagText: {
      fontSize: typography.micro,
      fontWeight: '700',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
  });
}
