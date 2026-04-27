/**
 * ScoreTrendCard
 *
 * Visual rules:
 * - Score line       = solid, accent stroke (always strongest)
 * - Recovery         = thin solid green
 * - Training Load    = thin dashed amber (contextual, not good/bad)
 * - Biomarkers       = chip only (latest panel snapshot)
 *
 * Y-domain is dynamic — zoomed to visible-data extent + small headroom,
 * so 60–80 movement reads instead of being squashed against 0–100.
 *
 * Interactive inspection:
 * - Tap on the chart sets a selection at the nearest data index.
 * - Horizontal drag updates the selection live.
 * - Vertical guideline + intersection dots + a compact tooltip chip
 *   show the date and the values for currently visible lines.
 * - Selection persists after release until the user taps again.
 *
 * No new dependencies. Pure react-native-svg + responder events.
 */
import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import {
  scoreTrend7D,
  scoreTrend30D,
  scoreTrend90D,
  scoreTrendMax,
} from '../data/demoData';
import type { Period, ScoreTrendDay } from '../data/demoData';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import { scoreColor } from '../theme/scoreColor';

const PERIODS: Period[] = ['7D', '30D', '90D', 'Max'];

const DATA: Record<Period, ScoreTrendDay[]> = {
  '7D':  scoreTrend7D,
  '30D': scoreTrend30D,
  '90D': scoreTrend90D,
  'Max': scoreTrendMax,
};

const CHART_W    = 320;
const CHART_H    = 96;
const CHART_PAD  = 10;
const DOT_R      = 3;
const Y_HEADROOM = 6;
const TOOLTIP_W  = 156;

type Series = 'score' | 'recovery' | 'load';

function domainOf(data: ScoreTrendDay[], series: { score: boolean; recovery: boolean; load: boolean }) {
  const vals: number[] = [];
  for (const d of data) {
    if (series.score)    vals.push(d.score);
    if (series.recovery) vals.push(d.recovery);
    if (series.load)     vals.push(d.trainingLoad);
  }
  if (!vals.length) return { min: 0, max: 100 };
  let min = Math.min(...vals) - Y_HEADROOM;
  let max = Math.max(...vals) + Y_HEADROOM;
  if (max - min < 14) {
    const mid = (min + max) / 2;
    min = mid - 7;
    max = mid + 7;
  }
  min = Math.max(0, Math.floor(min));
  max = Math.min(100, Math.ceil(max));
  return { min, max };
}

function yFor(value: number, min: number, max: number) {
  const t = (value - min) / Math.max(1, max - min);
  return CHART_H - CHART_PAD - t * (CHART_H - CHART_PAD * 2);
}

function pointsFor(
  data: ScoreTrendDay[],
  key: 'score' | 'recovery' | 'trainingLoad',
  min: number,
  max: number,
) {
  if (data.length < 2) return '';
  const step = CHART_W / (data.length - 1);
  return data
    .map((d, i) => `${(i * step).toFixed(1)},${yFor(d[key], min, max).toFixed(1)}`)
    .join(' ');
}

type Props = {
  period: Period;
  onPeriodChange: (p: Period) => void;
};

export function ScoreTrendCard({ period, onPeriodChange }: Props) {
  const { colors } = useTheme();
  const s = createStyles(colors);
  const data = DATA[period];

  const [visible, setVisible] = useState({ score: true, recovery: true, load: true });
  const [layoutW, setLayoutW] = useState(CHART_W);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const layoutWRef = useRef(CHART_W);

  function toggle(key: Series) {
    setVisible((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.score && !next.recovery && !next.load) return prev;
      return next;
    });
  }

  const { min, max } = useMemo(() => domainOf(data, visible), [data, visible]);
  const lastScore = data.length ? data[data.length - 1].score : null;

  function indexFromTouch(locationX: number): number {
    const w = layoutWRef.current || CHART_W;
    if (data.length <= 1 || w <= 0) return 0;
    const t = Math.max(0, Math.min(1, locationX / w));
    return Math.round(t * (data.length - 1));
  }

  function onChartLayout(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width;
    setLayoutW(w);
    layoutWRef.current = w;
  }

  function onTouch(e: GestureResponderEvent) {
    setSelectedIdx(indexFromTouch(e.nativeEvent.locationX));
  }

  const sel = selectedIdx !== null && selectedIdx < data.length ? data[selectedIdx] : null;

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <View style={s.headerLeft}>
          <Text style={s.title}>One L1fe Score Trend</Text>
          <Text style={s.sub}>Demo trend · local prototype · tap to inspect</Text>
        </View>
        <View style={s.periodRow}>
          {PERIODS.map((p) => (
            <Pressable
              key={p}
              onPress={() => { onPeriodChange(p); setSelectedIdx(null); }}
              style={[s.periodBtn, period === p && { backgroundColor: colors.accent }]}
              accessibilityLabel={`Show ${p} trend`}
            >
              <Text style={[
                s.periodLabel,
                { color: period === p ? '#FFFFFF' : colors.textSubtle },
              ]}>
                {p}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View
        style={s.chartWrapper}
        onLayout={onChartLayout}
      >
        <View
          style={{ height: CHART_H }}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderGrant={onTouch}
          onResponderMove={onTouch}
        >
          <ChartLines
            data={data}
            colors={colors}
            visible={visible}
            min={min}
            max={max}
            selectedIdx={selectedIdx}
          />
        </View>

        {sel !== null && (
          <Tooltip
            data={data}
            sel={sel}
            selectedIdx={selectedIdx as number}
            visible={visible}
            colors={colors}
            layoutW={layoutW}
            onClear={() => setSelectedIdx(null)}
          />
        )}

        <View style={s.axisRow}>
          <Text style={s.axisLabel}>{min}</Text>
          <Text style={[s.axisLabel, { textAlign: 'right' }]}>{max}</Text>
        </View>
        <View style={s.xLabels}>
          {data.map((d, i) => (
            <Text
              key={`x-${i}`}
              style={[
                s.xLabel,
                i === 0
                  ? { textAlign: 'left' }
                  : i === data.length - 1
                  ? { textAlign: 'right' }
                  : { textAlign: 'center' },
                selectedIdx === i && { color: colors.text, fontWeight: '700' },
              ]}
            >
              {d.label}
            </Text>
          ))}
        </View>
      </View>

      <View style={s.legendRow}>
        <LegendChip
          color={colors.accent}
          label="Score"
          solid
          active={visible.score}
          onPress={() => toggle('score')}
        />
        <LegendChip
          color={colors.positive}
          label="Recovery"
          active={visible.recovery}
          onPress={() => toggle('recovery')}
        />
        <LegendChip
          color={colors.warning}
          label="Training Load"
          dashed
          active={visible.load}
          onPress={() => toggle('load')}
        />
        <View style={[s.bioChip, { borderColor: colors.borderSubtle, backgroundColor: colors.surface }]}>
          <Text style={[s.bioChipText, { color: colors.textSubtle }]}>
            Biomarkers 61% · latest panel
          </Text>
        </View>
        {lastScore !== null && visible.score && selectedIdx === null && (
          <View style={[s.endTag, { borderColor: colors.borderSubtle, backgroundColor: colors.surface }]}>
            <Text style={[s.endTagLabel, { color: colors.textSubtle }]}>End</Text>
            <Text style={[s.endTagValue, { color: scoreColor(lastScore, colors) }]}>
              {lastScore}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function ChartLines({
  data, colors, visible, min, max, selectedIdx,
}: {
  data: ScoreTrendDay[];
  colors: ThemeColors;
  visible: { score: boolean; recovery: boolean; load: boolean };
  min: number;
  max: number;
  selectedIdx: number | null;
}) {
  const W = CHART_W;
  const scorePts    = pointsFor(data, 'score',        min, max);
  const recoveryPts = pointsFor(data, 'recovery',     min, max);
  const loadPts     = pointsFor(data, 'trainingLoad', min, max);

  const gridYs = [0.25, 0.5, 0.75].map(
    (t) => CHART_H - CHART_PAD - t * (CHART_H - CHART_PAD * 2),
  );

  const lastIdx = data.length - 1;
  const step = W / Math.max(lastIdx, 1);

  const showEndpoint = selectedIdx === null;
  const scoreEnd    = data.length ? { x: lastIdx * step, y: yFor(data[lastIdx].score,        min, max) } : null;
  const recoveryEnd = data.length ? { x: lastIdx * step, y: yFor(data[lastIdx].recovery,     min, max) } : null;
  const loadEnd     = data.length ? { x: lastIdx * step, y: yFor(data[lastIdx].trainingLoad, min, max) } : null;
  const endColor    = data.length ? scoreColor(data[lastIdx].score, colors) : colors.accent;

  const selX = selectedIdx !== null ? selectedIdx * step : null;

  return (
    <Svg width="100%" height={CHART_H} viewBox={`0 0 ${W} ${CHART_H}`} preserveAspectRatio="none">
      {gridYs.map((y, i) => (
        <Line key={`g-${i}`} x1={0} y1={y} x2={W} y2={y} stroke={colors.borderSubtle} strokeWidth={0.8} />
      ))}

      {visible.recovery && data.length >= 2 && (
        <Polyline
          points={recoveryPts}
          fill="none"
          stroke={colors.positive}
          strokeWidth={1.4}
          strokeOpacity={0.85}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {visible.load && data.length >= 2 && (
        <Polyline
          points={loadPts}
          fill="none"
          stroke={colors.warning}
          strokeWidth={1.4}
          strokeOpacity={0.85}
          strokeDasharray="3 3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {visible.score && data.length >= 2 && (
        <Polyline
          points={scorePts}
          fill="none"
          stroke={colors.accent}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {showEndpoint && visible.recovery && recoveryEnd && (
        <Circle cx={recoveryEnd.x} cy={recoveryEnd.y} r={2.4} fill={colors.positive} />
      )}
      {showEndpoint && visible.load && loadEnd && (
        <Circle cx={loadEnd.x} cy={loadEnd.y} r={2.4} fill={colors.warning} />
      )}
      {showEndpoint && visible.score && scoreEnd && (
        <>
          <Circle cx={scoreEnd.x} cy={scoreEnd.y} r={DOT_R + 1.6} fill={colors.surfaceElevated} />
          <Circle cx={scoreEnd.x} cy={scoreEnd.y} r={DOT_R} fill={endColor} />
        </>
      )}

      {selX !== null && data.length > 0 && (
        <>
          <Line
            x1={selX}
            x2={selX}
            y1={CHART_PAD - 4}
            y2={CHART_H - CHART_PAD + 2}
            stroke={colors.textSubtle}
            strokeOpacity={0.65}
            strokeWidth={1}
            strokeDasharray="2 2"
          />
          {visible.recovery && (
            <Circle
              cx={selX}
              cy={yFor(data[selectedIdx as number].recovery, min, max)}
              r={3}
              fill={colors.positive}
              stroke={colors.surfaceElevated}
              strokeWidth={1}
            />
          )}
          {visible.load && (
            <Circle
              cx={selX}
              cy={yFor(data[selectedIdx as number].trainingLoad, min, max)}
              r={3}
              fill={colors.warning}
              stroke={colors.surfaceElevated}
              strokeWidth={1}
            />
          )}
          {visible.score && (
            <>
              <Circle
                cx={selX}
                cy={yFor(data[selectedIdx as number].score, min, max)}
                r={DOT_R + 1.6}
                fill={colors.surfaceElevated}
              />
              <Circle
                cx={selX}
                cy={yFor(data[selectedIdx as number].score, min, max)}
                r={DOT_R}
                fill={scoreColor(data[selectedIdx as number].score, colors)}
              />
            </>
          )}
        </>
      )}
    </Svg>
  );
}

function Tooltip({
  data, sel, selectedIdx, visible, colors, layoutW, onClear,
}: {
  data: ScoreTrendDay[];
  sel: ScoreTrendDay;
  selectedIdx: number;
  visible: { score: boolean; recovery: boolean; load: boolean };
  colors: ThemeColors;
  layoutW: number;
  onClear: () => void;
}) {
  // x in real (laid-out) px, clamped so the tooltip stays on-screen
  const lastIdx = Math.max(data.length - 1, 1);
  const xPx     = (selectedIdx / lastIdx) * layoutW;
  const left    = Math.max(0, Math.min(layoutW - TOOLTIP_W, xPx - TOOLTIP_W / 2));

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.tooltipWrap,
        { left, width: TOOLTIP_W, borderColor: colors.borderSubtle, backgroundColor: colors.surfaceElevated },
      ]}
    >
      <View style={styles.tooltipHeader}>
        <Text style={[styles.tooltipDate, { color: colors.text }]}>{sel.label}</Text>
        <Pressable onPress={onClear} hitSlop={6} accessibilityLabel="Clear selection">
          <Text style={[styles.tooltipClose, { color: colors.textSubtle }]}>×</Text>
        </Pressable>
      </View>
      {visible.score && (
        <TooltipRow
          color={scoreColor(sel.score, colors)}
          label="Score"
          value={`${sel.score}`}
          textColor={colors.text}
        />
      )}
      {visible.recovery && (
        <TooltipRow
          color={colors.positive}
          label="Recovery"
          value={`${sel.recovery}`}
          textColor={colors.textMuted}
        />
      )}
      {visible.load && (
        <TooltipRow
          color={colors.warning}
          label="Training Load"
          value={`${sel.trainingLoad}`}
          textColor={colors.textMuted}
        />
      )}
    </View>
  );
}

function TooltipRow({
  color, label, value, textColor,
}: {
  color: string;
  label: string;
  value: string;
  textColor: string;
}) {
  return (
    <View style={styles.tooltipRow}>
      <View style={[styles.tooltipDot, { backgroundColor: color }]} />
      <Text style={[styles.tooltipLabel, { color: textColor }]}>{label}</Text>
      <Text style={[styles.tooltipValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

function LegendChip({
  color, label, solid, dashed, active, onPress,
}: {
  color: string;
  label: string;
  solid?: boolean;
  dashed?: boolean;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={legendStyles.row}
      accessibilityLabel={`Toggle ${label}`}
    >
      {solid ? (
        <View style={[legendStyles.dot, { backgroundColor: color, opacity: active ? 1 : 0.3 }]} />
      ) : dashed ? (
        <View style={legendStyles.dashWrap}>
          <View style={[legendStyles.dashSeg, { backgroundColor: color, opacity: active ? 0.9 : 0.25 }]} />
          <View style={[legendStyles.dashSeg, { backgroundColor: color, opacity: active ? 0.9 : 0.25 }]} />
        </View>
      ) : (
        <View style={[legendStyles.dash, { backgroundColor: color, opacity: active ? 0.85 : 0.25 }]} />
      )}
      <Text style={[
        legendStyles.label,
        { color: active ? colors.textMuted : colors.textSubtle, opacity: active ? 1 : 0.6 },
      ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const legendStyles = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 2 },
  dot:      { width: 8, height: 8, borderRadius: 4 },
  dash:     { width: 14, height: 2, borderRadius: 1 },
  dashWrap: { flexDirection: 'row', gap: 2, width: 14, alignItems: 'center' },
  dashSeg:  { width: 6, height: 2, borderRadius: 1 },
  label:    { fontSize: 10, fontWeight: '600' },
});

const styles = StyleSheet.create({
  tooltipWrap: {
    position: 'absolute',
    top: -4,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 3,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  tooltipDate: {
    fontSize: typography.micro,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  tooltipClose: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tooltipDot:  { width: 6, height: 6, borderRadius: 3 },
  tooltipLabel:{ fontSize: typography.micro, fontWeight: '500', flex: 1 },
  tooltipValue:{ fontSize: typography.micro, fontWeight: '700' },
});

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
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    headerLeft: { gap: 2, flex: 1 },
    title: {
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '700',
      letterSpacing: -0.1,
    },
    sub: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
    },
    periodRow: { flexDirection: 'row', gap: 4 },
    periodBtn: {
      borderRadius: radius.pill,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: 'transparent',
    },
    periodLabel: {
      fontSize: typography.micro,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    chartWrapper: { gap: 2, position: 'relative' },
    axisRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: -2,
    },
    axisLabel: {
      flex: 1,
      color: colors.textSubtle,
      fontSize: 9,
      fontWeight: '500',
      opacity: 0.7,
    },
    xLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    xLabel: {
      flex: 1,
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontWeight: '500',
    },
    legendRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      alignItems: 'center',
    },
    bioChip: {
      borderRadius: radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    bioChipText: {
      fontSize: typography.micro,
      fontWeight: '500',
    },
    endTag: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
      borderRadius: radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
    },
    endTagLabel: {
      fontSize: typography.micro,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    endTagValue: {
      fontSize: typography.caption,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
  });
}
