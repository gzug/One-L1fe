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
const R            = HALF - STROKE_W / 2;   // inner radius that keeps stroke inside bounds
const CIRCUMFERENCE = 2 * Math.PI * R;

function clamp(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

/** Semantic bar color: >=70 positive, 50–69 warning, <50 danger */
function segmentColor(value: number, colors: ThemeColors): string {
  if (value >= 70) return colors.positive;
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
      {/* Track */}
      <Circle
        cx={HALF}
        cy={HALF}
        r={R}
        stroke={trackColor}
        strokeWidth={STROKE_W}
        fill="none"
      />
      {/* Progress arc — starts at top (rotate -90°) */}
      <Circle
        cx={HALF}
        cy={HALF}
        r={R}
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

  return (
    <View style={s.card}>
      {/* Interpretation */}
      <Text style={s.interpretation}>{prototypeCopy.readinessInterpretation}</Text>
      <Text style={s.interpretationSub}>{prototypeCopy.readinessInterpretationSub}</Text>

      {/* Ring + segments row */}
      <View style={s.bodyRow}>
        {/* SVG ring with score inside */}
        <View style={s.ringWrapper}>
          <SvgRing
            progress={average}
            trackColor={colors.ringTrack}
            progressColor={colors.ringProgress}
          />
          {/* Score label centered over ring */}
          <View style={[StyleSheet.absoluteFillObject, s.ringCenter]} pointerEvents="none">
            <Text style={s.score}>{average}</Text>
            <Text style={s.scoreLabel}>{prototypeCopy.readinessScoreLabel}</Text>
          </View>
        </View>

        {/* Segment bars */}
        <View style={s.segmentList}>
          {readinessSegments.map((seg) => {
            const color = segmentColor(seg.value, colors);
            return (
              <View key={seg.label} style={s.segmentRow}>
                <Text style={s.segmentLabel}>{seg.label}</Text>
                <View style={s.barTrack}>
                  <View
                    style={[
                      s.barFill,
                      {
                        width: `${clamp(seg.value)}%` as `${number}%`,
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

      {/* Data coverage — subtle */}
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
    ringWrapper: {
      width: RING_SIZE,
      height: RING_SIZE,
      flexShrink: 0,
    },
    ringCenter: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    score: {
      color: colors.text,
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
    segmentRow:  { gap: 4 },
    segmentLabel: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '500',
      letterSpacing: 0.2,
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
