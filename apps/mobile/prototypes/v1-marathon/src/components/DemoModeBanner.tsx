import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { prototypeCopy } from '../data/copy';
import { marathonTheme } from '../theme/marathonTheme';

/**
 * Global demo-mode banner. Shown once at the top of the screen.
 * Replaces per-card DemoDataBadge to reduce visual noise.
 */
export function DemoModeBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.dot}>\u25cf</Text>
      <Text style={styles.text}>{prototypeCopy.demoModeBanner}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: marathonTheme.spacing.sm,
    backgroundColor: marathonTheme.colors.demoBanner,
    borderWidth: 1,
    borderColor: marathonTheme.colors.demoBannerBorder,
    borderRadius: marathonTheme.radius.md,
    paddingHorizontal: marathonTheme.spacing.lg,
    paddingVertical: marathonTheme.spacing.md,
  },
  dot: {
    color: marathonTheme.colors.accent,
    fontSize: 9,
    lineHeight: 20,
  },
  text: {
    flex: 1,
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.caption,
    lineHeight: marathonTheme.lineHeights.caption,
  },
});
