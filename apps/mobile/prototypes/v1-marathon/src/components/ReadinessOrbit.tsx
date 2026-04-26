import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { readinessSegments } from '../data/demoData';
import { marathonTheme } from '../theme/marathonTheme';
import { DemoDataBadge } from './DemoDataBadge';

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function ReadinessOrbit() {
  const average = clampScore(
    readinessSegments.reduce((sum, segment) => sum + segment.value, 0) / readinessSegments.length,
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>Today</Text>
        <DemoDataBadge compact />
      </View>
      <View style={styles.orbit}>
        <Text style={styles.score}>{average}</Text>
        <Text style={styles.scoreLabel}>Readiness context</Text>
      </View>
      <View style={styles.segmentList}>
        {readinessSegments.map((segment) => (
          <View key={segment.label} style={styles.segmentRow}>
            <Text style={styles.segmentLabel}>{segment.label}</Text>
            <Text style={styles.segmentValue}>{clampScore(segment.value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: marathonTheme.radius.lg,
    backgroundColor: marathonTheme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: marathonTheme.colors.border,
    padding: marathonTheme.spacing.lg,
    gap: marathonTheme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  orbit: {
    alignSelf: 'center',
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 10,
    borderColor: marathonTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: marathonTheme.colors.surface,
  },
  score: {
    color: marathonTheme.colors.text,
    fontSize: 46,
    fontWeight: '800',
  },
  scoreLabel: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.caption,
  },
  segmentList: {
    gap: marathonTheme.spacing.sm,
  },
  segmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  segmentLabel: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.body,
  },
  segmentValue: {
    color: marathonTheme.colors.text,
    fontSize: marathonTheme.typography.body,
    fontWeight: '700',
  },
});
