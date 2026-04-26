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
    readinessSegments.reduce((sum, seg) => sum + seg.value, 0) /
      readinessSegments.length,
  );

  return (
    <View style={styles.card}>
      {/* Top row: eyebrow + demo badge */}
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>Readiness context</Text>
        <DemoDataBadge compact />
      </View>

      {/* Score ring */}
      <View style={styles.ringWrapper}>
        <View style={styles.ring}>
          <Text style={styles.score}>{average}</Text>
          <Text style={styles.scoreLabel}>/ 100</Text>
        </View>
      </View>

      {/* Segment bars */}
      <View style={styles.segmentList}>
        {readinessSegments.map((seg, i) => {
          const color =
            marathonTheme.segmentColors[i % marathonTheme.segmentColors.length];
          return (
            <View key={seg.label} style={styles.segmentRow}>
              <Text style={styles.segmentLabel}>{seg.label}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${clampScore(seg.value)}%` as `${number}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.segmentValue, { color }]}>
                {clampScore(seg.value)}
              </Text>
            </View>
          );
        })}
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
    color: marathonTheme.colors.textSubtle,
    fontSize: marathonTheme.typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  ringWrapper: {
    alignItems: 'center',
    paddingVertical: marathonTheme.spacing.sm,
  },
  ring: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 9,
    borderColor: marathonTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: marathonTheme.colors.surface,
    // Glow via shadow (iOS) — Android shows elevation tint
    shadowColor: marathonTheme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  score: {
    color: marathonTheme.colors.text,
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 48,
  },
  scoreLabel: {
    color: marathonTheme.colors.textSubtle,
    fontSize: marathonTheme.typography.bodySmall,
    fontWeight: '600',
  },
  segmentList: {
    gap: marathonTheme.spacing.md,
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: marathonTheme.spacing.sm,
  },
  segmentLabel: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.bodySmall,
    width: 110,
  },
  barTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: marathonTheme.colors.progressTrack,
    overflow: 'hidden',
  },
  barFill: {
    height: 5,
    borderRadius: 3,
  },
  segmentValue: {
    fontSize: marathonTheme.typography.bodySmall,
    fontWeight: '700',
    width: 26,
    textAlign: 'right',
  },
});
