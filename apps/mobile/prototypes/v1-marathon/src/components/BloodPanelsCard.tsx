/**
 * BloodPanelsCard — Home entry card.
 * Shows panel count and a CTA that navigates to Profile.
 * Does not display individual marker values.
 * Navigation to Profile is prototype-only behaviour, labelled as such.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import { bloodPanelCount } from '../data/demoData';
import { prototypeCopy } from '../data/copy';

type BloodPanelsCardProps = {
  onViewPress: () => void;
};

export function BloodPanelsCard({ onViewPress }: BloodPanelsCardProps) {
  const { colors } = useTheme();
  const s = createStyles(colors);

  return (
    <View style={s.card}>
      <View style={s.topRow}>
        <View style={s.iconWrap}>
          <Ionicons name="flask-outline" size={18} color={colors.accent} />
        </View>
        <View style={s.labelBlock}>
          <Text style={s.title}>{prototypeCopy.sectionBlood}</Text>
          <Text style={s.sub}>{prototypeCopy.bloodPanelCount(bloodPanelCount)}</Text>
        </View>
      </View>

      <Text style={s.body}>
        Lab results from 2023 and 2025 are stored. No live sync — upload only in prototype.
      </Text>

      <Pressable
        onPress={onViewPress}
        style={[s.cta, { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft }]}
        accessibilityLabel={prototypeCopy.bloodPanelsViewCta}
      >
        <Text style={[s.ctaText, { color: colors.accent }]}>
          {prototypeCopy.bloodPanelsViewCta}
        </Text>
        <Ionicons name="chevron-forward" size={13} color={colors.accent} />
      </Pressable>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.md,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.accentBorder,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    labelBlock: { gap: 2 },
    title: {
      color: colors.text,
      fontSize: typography.subtitle,
      fontWeight: '800',
      letterSpacing: -0.1,
    },
    sub: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '500',
    },
    body: {
      color: colors.textMuted,
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
    },
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: spacing.xs,
      borderWidth: 1,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
    },
    ctaText: {
      fontSize: typography.bodySmall,
      fontWeight: '700',
      letterSpacing: 0.1,
    },
  });
}
