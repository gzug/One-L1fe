import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { prototypeCopy } from '../data/copy';
import { marathonTheme } from '../theme/marathonTheme';

type DemoDataBadgeProps = {
  compact?: boolean;
};

export function DemoDataBadge({ compact = false }: DemoDataBadgeProps) {
  return (
    <View style={[styles.badge, compact && styles.compact]}>
      <Text style={[styles.text, compact && styles.compactText]}>
        {prototypeCopy.demoData}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: marathonTheme.radius.pill,
    borderWidth: 1,
    borderColor: marathonTheme.colors.demoBadgeBorder,
    backgroundColor: marathonTheme.colors.demoBadge,
    paddingHorizontal: marathonTheme.spacing.md,
    paddingVertical: marathonTheme.spacing.xs,
  },
  compact: {
    paddingHorizontal: marathonTheme.spacing.sm,
    paddingVertical: 2,
  },
  text: {
    color: marathonTheme.colors.textSubtle,
    fontSize: marathonTheme.typography.caption,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  compactText: {
    fontSize: marathonTheme.typography.micro,
  },
});
