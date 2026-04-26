import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { marathonTheme } from '../theme/marathonTheme';
import { prototypeCopy } from '../data/copy';

type DemoDataBadgeProps = {
  compact?: boolean;
};

export function DemoDataBadge({ compact = false }: DemoDataBadgeProps) {
  return (
    <View style={[styles.badge, compact && styles.compact]}>
      <Text style={[styles.text, compact && styles.compactText]}>{prototypeCopy.demoData}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: marathonTheme.radius.pill,
    borderWidth: 1,
    borderColor: marathonTheme.colors.accent,
    backgroundColor: marathonTheme.colors.accentSoft,
    paddingHorizontal: marathonTheme.spacing.md,
    paddingVertical: marathonTheme.spacing.xs,
  },
  compact: {
    paddingHorizontal: marathonTheme.spacing.sm,
    paddingVertical: 2,
  },
  text: {
    color: marathonTheme.colors.accent,
    fontSize: marathonTheme.typography.caption,
    fontWeight: '700',
  },
  compactText: {
    fontSize: 11,
  },
});
