import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { prototypeCopy } from '../data/copy';
import { marathonTheme } from '../theme/marathonTheme';

export function NutritionContextCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.status}>{prototypeCopy.planned}</Text>
      <Text style={styles.title}>{prototypeCopy.nutritionTitle}</Text>
      <Text style={styles.body}>{prototypeCopy.nutritionBody}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: marathonTheme.radius.md,
    backgroundColor: marathonTheme.colors.surface,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: marathonTheme.colors.border,
    padding: marathonTheme.spacing.lg,
    gap: marathonTheme.spacing.sm,
  },
  status: {
    color: marathonTheme.colors.textSubtle,
    fontSize: marathonTheme.typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: marathonTheme.colors.text,
    fontSize: marathonTheme.typography.subtitle,
    fontWeight: '800',
  },
  body: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.body,
    lineHeight: 21,
  },
});
