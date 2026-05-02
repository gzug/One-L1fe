/**
 * TodaySignalsRow
 *
 * Compact chip row: Recovery · Training Load · Biomarkers · Coverage.
 *
 * Chip colour comes from the shared scoreColor() helper for "scoreable"
 * signals (Recovery, Biomarkers) so chips stay in sync with the ring and
 * Score Trend.
 *
 * Training Load colour stays contextual (warm gold / muted), never green —
 * higher load is not "good", only informational.
 *
 * Coverage colour stays muted (interpretability dimension, separate from
 * health severity per data-freshness-and-coverage-policy-v1).
 *
 * Each chip shows two-line content: a small label, then the value with a
 * very short state qualifier (e.g. "68 · softer", "61 · latest panel",
 * "72 · partial") so the meaning is readable without an explanation.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import { scoreBandLabel, scoreColor, scoreSoftBg } from '../theme/scoreColor';

type ChipKind = 'score' | 'load' | 'panel' | 'coverage';

type Chip = {
  kind: ChipKind;
  label: string;
  value: number;
  qualifier: string;
};

const CHIPS: Chip[] = [
  { kind: 'score',    label: 'Recovery',      value: 68, qualifier: 'softer' },
  { kind: 'load',     label: 'Training Load', value: 74, qualifier: 'ahead' },
  { kind: 'panel',    label: 'Biomarkers',    value: 61, qualifier: 'latest panel' },
  { kind: 'coverage', label: 'Coverage',      value: 72, qualifier: 'partial' },
];

function chipColors(chip: Chip, colors: ThemeColors) {
  switch (chip.kind) {
    case 'score':
      return {
        bg:        scoreSoftBg(chip.value, colors),
        text:      scoreColor(chip.value, colors),
        qualifier: scoreBandLabel(chip.value),
      };
    case 'load':
      return {
        bg:        colors.warningSoft,
        text:      colors.warning,
        qualifier: chip.qualifier,
      };
    case 'panel':
      return {
        bg:        scoreSoftBg(chip.value, colors),
        text:      scoreColor(chip.value, colors),
        qualifier: chip.qualifier,
      };
    case 'coverage':
      return {
        bg:        colors.surface,
        text:      colors.textMuted,
        qualifier: chip.qualifier,
      };
  }
}

export function TodaySignalsRow() {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {CHIPS.map((chip) => {
        const c = chipColors(chip, colors);
        return (
          <View
            key={chip.label}
            style={[
              styles.chip,
              { backgroundColor: c.bg, borderColor: colors.borderSubtle },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSubtle }]}>{chip.label}</Text>
            <View style={styles.valueRow}>
              <Text style={[styles.value, { color: c.text }]}>{chip.value}</Text>
              <Text style={[styles.qualifier, { color: c.text }]}>· {c.qualifier}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  chip: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    alignItems: 'flex-start',
    minWidth: 96,
  },
  label: {
    fontSize: typography.micro,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  value: {
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  qualifier: {
    fontSize: typography.micro,
    fontWeight: '600',
    opacity: 0.85,
  },
});
