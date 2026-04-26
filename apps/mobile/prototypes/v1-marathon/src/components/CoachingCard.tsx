/**
 * CoachingCard — Recommendation card (F9)
 *
 * Layout:
 *   [icon badge]  Title
 *                 [source chip]
 *                 1-line reason
 *                 [impact chip]
 *
 * Icons are resolved from a typed key enum — avoids dynamic string
 * casting which was the root cause of blank icons on Android.
 *
 * Language: no medical advice, no "must", no fake live-sync claim.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import type { NextAction } from '../data/demoData';

// Hardcoded icon map — typed key only, no dynamic string from data
const ICON_MAP: Record<NextAction['iconKey'], React.ComponentProps<typeof Ionicons>['name']> = {
  moon:        'moon-outline',
  speedometer: 'speedometer-outline',
  sync:        'sync-outline',
  flask:       'flask-outline',
};

function impactTagColors(
  impactKey: NextAction['impactKey'],
  colors: ThemeColors,
): { bg: string; text: string } {
  switch (impactKey) {
    case 'recovery': return { bg: colors.accentSoft,    text: colors.accent };
    case 'training': return { bg: colors.warningSoft,   text: colors.warning };
    case 'data':     return { bg: colors.progressTrack, text: colors.textMuted };
  }
}

type Props = { action: NextAction };

export function CoachingCard({ action }: Props) {
  const { colors } = useTheme();
  const s   = createStyles(colors);
  const tag = impactTagColors(action.impactKey, colors);
  const iconName = ICON_MAP[action.iconKey];

  return (
    <View style={s.card}>
      {/* Icon badge */}
      <View style={s.iconWrap}>
        <Ionicons name={iconName} size={22} color={colors.accent} />
      </View>

      {/* Text block */}
      <View style={s.content}>
        <Text style={s.title} numberOfLines={2}>{action.title}</Text>

        {/* Source chip */}
        <View style={s.sourceChipWrap}>
          <Ionicons name="radio-button-on-outline" size={9} color={colors.textSubtle} />
          <Text style={s.sourceChip}>{action.sourceChip}</Text>
        </View>

        <Text style={s.reason} numberOfLines={2}>{action.reason}</Text>

        {/* Impact chip */}
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
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.accentSoft,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: 1,
    },
    content: { flex: 1, gap: 5 },
    title: {
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '700',
      lineHeight: lineHeights.bodySmall,
      letterSpacing: -0.1,
    },
    sourceChipWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    sourceChip: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '500',
      letterSpacing: 0.1,
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
      marginTop: 1,
    },
    tagText: {
      fontSize: typography.micro,
      fontWeight: '700',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
  });
}
