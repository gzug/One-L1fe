import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { prototypeCopy } from '../data/copy';
import { marathonTheme } from '../theme/marathonTheme';

// Nutrition is context-only. Not connected to readiness score.
export function NutritionContextCard() {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{prototypeCopy.sectionNutrition}</Text>
        <View style={styles.plannedPill}>
          <Text style={styles.plannedText}>{prototypeCopy.planned}</Text>
        </View>
      </View>
      <Text style={styles.body}>{prototypeCopy.nutritionBody}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: marathonTheme.radius.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: marathonTheme.colors.borderSubtle,
    padding: marathonTheme.spacing.md,
    gap: marathonTheme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: marathonTheme.colors.textSubtle,
    fontSize: marathonTheme.typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  plannedPill: {
    borderRadius: marathonTheme.radius.pill,
    borderWidth: 1,
    borderColor: marathonTheme.colors.borderSubtle,
    paddingHorizontal: marathonTheme.spacing.sm,
    paddingVertical: 2,
  },
  plannedText: {
    color: marathonTheme.colors.textSubtle,
    fontSize: marathonTheme.typography.micro,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  body: {
    color: marathonTheme.colors.textSubtle,
    fontSize: marathonTheme.typography.bodySmall,
    lineHeight: marathonTheme.lineHeights.bodySmall,
  },
});
