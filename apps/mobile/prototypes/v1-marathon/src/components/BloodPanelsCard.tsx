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
        <Ionicons name="flask-outline" size={15} color={colors.accent} style={{ marginTop: 1 }} />
        <View style={s.labelBlock}>
          <Text style={s.title}>{prototypeCopy.sectionBlood}</Text>
          <Text style={s.sub}>{prototypeCopy.bloodPanelCount(bloodPanelCount)}</Text>
        </View>
        <Pressable
          onPress={onViewPress}
          style={[s.cta, { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft }]}
          accessibilityLabel={prototypeCopy.bloodPanelsViewCta}
        >
          <Text style={[s.ctaText, { color: colors.accent }]}>
            {prototypeCopy.bloodPanelsViewCta}
          </Text>
          <Ionicons name="chevron-forward" size={11} color={colors.accent} />
        </Pressable>
      </View>
      <Text style={s.body}>
        Lab results from 2023 and 2025. Upload only — no live sync in prototype.
      </Text>
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
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    labelBlock: { flex: 1, gap: 1 },
    title: {
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '600',
      letterSpacing: -0.1,
    },
    sub: {
      color: colors.textSubtle,
      fontSize: typography.micro,
    },
    body: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
    },
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      borderWidth: 1,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    ctaText: {
      fontSize: typography.caption,
      fontWeight: '600',
    },
  });
}
