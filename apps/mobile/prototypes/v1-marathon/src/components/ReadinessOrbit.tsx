/**
 * ReadinessOrbit — renamed internally to ScoreOrbit but exported as ReadinessOrbit
 * for backwards-compatible imports.
 *
 * Changes (F8):
 * - Section title: 'One L1fe Score'
 * - Ring label inside: 'Score'
 * - Score shown as percentage: '68%'
 * - Ring arc color: threshold logic (red / amber / green)
 * - Segment bars: same threshold color logic
 * - No new dependencies
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { readinessSegments, dataCoveragePercent } from '../data/demoData';
import { prototypeCopy } from '../data/copy';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';

const RING_SIZE    = 96;
const STROKE_W     = 8;
const HALF         = RING_SIZE / 2;
const R            = HALF - STROKE_W / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

function clamp(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

/**
 * Threshold color — carries meaning:
 *  <50  → red    (needs attention)
 *  50–74 → amber  (moderate)
 *  ≥75   → green  (good)
 */
function thresholdColor(value: number, colors: ThemeColors): string {
  if (value >= 75) return colors.positive;
  if (value >= 50) return colors.warning;
  return colors.danger;
}

function SvgRing({
  progress,
  trackColor,
  progressColor,
}: {
  progress: number;
  trackColor: string;
  progressColor: string;
}) {
  const pct    = clamp(progress) / 100;
  const filled = pct * CIRCUMFERENCE;
  const gap    = CIRCUMFERENCE - filled;

  return (
    <Svg width={RING_SIZE} height={RING_SIZE}>
      <Circle cx={HALF} cy={HALF} r={R} stroke={trackColor} strokeWidth={STROKE_W} fill="none" />
      <Circle
        cx={HALF} cy={HALF} r={R}
        stroke={progressColor}
        strokeWidth={STROKE_W}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${filled} ${gap}`}
        rotation={-90}
        origin={`${HALF}, ${HALF}`}
      />
    </Svg>
  );
}

export function ReadinessOrbit() {
  const { colors } = useTheme();
  const s = createStyles(colors);

  const average = clamp(
    readinessSegments.reduce((sum, seg) => sum + seg.value, 0) / readinessSegments.length,
  );

  const ringColor = thresholdColor(average, colors);

  return (
    <View style={s.card}>
      {/* Title */}
      <Text style={s.interpretation}>{prototypeCopy.readinessInterpretation}</Text>
      <Text style={s.interpretationSub}>{prototypeCopy.readinessInterpretationSub}</Text>

      {/* Ring + segment bars */}
      <View style={s.bodyRow}>
        <View style={s.ringWrapper}>
          <SvgRing
            progress={average}
            trackColor={colors.ringTrack}
            progressColor={ringColor}
          />
          <View style={[StyleSheet.absoluteFillObject, s.ringCenter]} pointerEvents="none">
            <Text style={[s.score, { color: ringColor }]}>{average}%</Text>
            <Text style={s.scoreLabel}>{prototypeCopy.readinessScoreLabel}</Text>
          </View>
        </View>

        <View style={s.segmentList}>
          {readinessSegments.map((seg) => {
            const color = thresholdColor(seg.value, colors);
            return (
              <View key={seg.label} style={s.segmentRow}>
                <View style={s.segmentLabelRow}>
                  <Text style={s.segmentLabel}>{seg.label}</Text>
                  <Text style={[s.segmentVal, { color }]}>{seg.value}%</Text>
                </View>
                <View style={s.barTrack}>
                  <View
                    style={[
                      s.barFill,
                      { width: `${clamp(seg.value)}%` as `${number}%`, backgroundColor: color },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Data coverage */}
      <Text style={s.coverageNote}>
        {prototypeCopy.dataCoverageLabel}: {dataCoveragePercent}% of signals available
      </Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.md,
    },
    interpretation: {
      color: colors.text,
      fontSize: typography.heroInterpretation,
      fontWeight: '700',
      lineHeight: lineHeights.heroInterpretation,
      letterSpacing: -0.4,
    },
    interpretationSub: {
      color: colors.textMuted,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      marginTop: -spacing.xs,
    },
    bodyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    ringWrapper: { width: RING_SIZE, height: RING_SIZE, flexShrink: 0 },
    ringCenter: { alignItems: 'center', justifyContent: 'center' },
    score: {
      fontSize: 22,
      fontWeight: '800',
      lineHeight: 26,
      textAlign: 'center',
    },
    scoreLabel: {
      color: colors.textSubtle,
      fontSize: 8,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      textAlign: 'center',
    },
    segmentList: { flex: 1, gap: spacing.sm },
    segmentRow:  { gap: 3 },
    segmentLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    segmentLabel: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '500',
      letterSpacing: 0.2,
    },
    segmentVal: {
      fontSize: typography.micro,
      fontWeight: '700',
    },
    barTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.progressTrack,
      overflow: 'hidden',
    },
    barFill: { height: 4, borderRadius: 2 },
    coverageNote: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
      marginTop: -spacing.xs,
    },
  });
}
