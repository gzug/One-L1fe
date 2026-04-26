import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { prototypeCopy } from '../data/copy';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';

export function DemoModeBanner() {
  const { colors } = useTheme();
  const s = createStyles(colors);

  return (
    <View style={s.banner}>
      <View style={[s.dot, { backgroundColor: colors.accent }]} />
      <Text style={s.text}>{prototypeCopy.demoModeBanner}</Text>
    </View>
  );
}

function createStyles(colors: import('../theme/marathonTheme').ThemeColors) {
  return StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      backgroundColor: colors.demoBanner,
      borderWidth: 1,
      borderColor: colors.demoBannerBorder,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 5,
      flexShrink: 0,
    },
    text: {
      flex: 1,
      color: colors.textMuted,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
    },
  });
}
