import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { readinessSegments } from '../data/demoData';
import { prototypeCopy } from '../data/copy';
import { marathonTheme } from '../theme/marathonTheme';

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
      {/* Interpretation — primary claim */}
      <Text style={styles.interpretation}>
        {prototypeCopy.readinessInterpretation}
      </Text>
      <Text style={styles.interpretationSub}>
        {prototypeCopy.readinessInterpretationSub}
      </Text>

      {/* Ring + segments row */}
      <View style={styles.bodyRow}>
        {/* Score ring — supporting context */}
        <View style={styles.ringWrapper}>
          <View style={styles.ring}>
            <Text style={styles.score}>{average}</Text>
            <Text style={styles.scoreContext}>{prototypeCopy.readinessScoreContext}</Text>
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
              </View>
            );
          })}
        </View>
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
  interpretation: {
    color: marathonTheme.colors.text,
    fontSize: marathonTheme.typography.heroInterpretation,
    fontWeight: '700',
    lineHeight: marathonTheme.lineHeights.heroInterpretation,
    letterSpacing: -0.3,
  },
  interpretationSub: {
    color: marathonTheme.colors.textMuted,
    fontSize: marathonTheme.typography.bodySmall,
    lineHeight: marathonTheme.lineHeights.bodySmall,
    marginTop: -marathonTheme.spacing.sm,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: marathonTheme.spacing.lg,
  },
  ringWrapper: {
    alignItems: 'center',
    flexShrink: 0,
  },
  ring: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 6,
    borderColor: marathonTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: marathonTheme.colors.surface,
    shadowColor: marathonTheme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  score: {
    color: marathonTheme.colors.text,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
  },
  scoreContext: {
    color: marathonTheme.colors.textSubtle,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  segmentList: {
    flex: 1,
    gap: marathonTheme.spacing.sm,
  },
  segmentRow: {
    gap: marathonTheme.spacing.xs,
  },
  segmentLabel: {
    color: marathonTheme.colors.textSubtle,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: marathonTheme.colors.progressTrack,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
});
