import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import type { HomeChartPoint } from '../data/homeTypes';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';

const CHART_W = 320;
const TOOLTIP_W = 164;

export type TrendChartSeries = {
  key: string;
  label: string;
  color: string;
  data: HomeChartPoint[];
  style?: 'line' | 'dashed' | 'area';
};

type InteractiveTrendChartV2Props = {
  colors: ThemeColors;
  series: TrendChartSeries[];
  height?: number;
  yMin?: number;
  yMax?: number;
  yTicks?: number[];
  showTooltip?: boolean;
  showYAxis?: boolean;
  showXAxis?: boolean;
};

type ChartPoint = { x: number; y: number; value: number; label: string };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function computeDomain(series: TrendChartSeries[], yMin?: number, yMax?: number) {
  if (typeof yMin === 'number' && typeof yMax === 'number') {
    return { min: yMin, max: yMax };
  }
  const values = series.flatMap((item) => item.data.map((point) => point.value));
  if (!values.length) return { min: 0, max: 100 };
  let min = typeof yMin === 'number' ? yMin : Math.min(...values);
  let max = typeof yMax === 'number' ? yMax : Math.max(...values);
  const span = Math.max(6, max - min);
  if (typeof yMin !== 'number') min = Math.max(0, Math.floor(min - span * 0.18));
  if (typeof yMax !== 'number') max = Math.min(100, Math.ceil(max + span * 0.18));
  if (max - min < 12) {
    const mid = (min + max) / 2;
    min = Math.max(0, Math.floor(mid - 6));
    max = Math.min(100, Math.ceil(mid + 6));
  }
  return { min, max };
}

function createPoints(data: HomeChartPoint[], width: number, height: number, min: number, max: number) {
  const padX = 12;
  const padTop = 12;
  const padBottom = 12;
  const span = Math.max(1, max - min);
  return data.map((point, index) => {
    const x = data.length === 1
      ? width / 2
      : padX + (index * (width - padX * 2)) / (data.length - 1);
    const y = padTop + (1 - (point.value - min) / span) * (height - padTop - padBottom);
    return { x, y, value: point.value, label: point.label };
  });
}

function pathFromPoints(points: ChartPoint[]) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
}

function areaFromPoints(points: ChartPoint[], height: number) {
  if (points.length < 2) return '';
  const line = pathFromPoints(points);
  return `${line} L ${points[points.length - 1].x.toFixed(1)} ${height - 12} L ${points[0].x.toFixed(1)} ${height - 12} Z`;
}

export function InteractiveTrendChartV2({
  colors,
  series,
  height = 160,
  yMin,
  yMax,
  yTicks,
  showTooltip = true,
  showYAxis = true,
  showXAxis = true,
}: InteractiveTrendChartV2Props) {
  const [layoutW, setLayoutW] = useState(CHART_W);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const layoutWRef = useRef(CHART_W);
  const domain = useMemo(() => computeDomain(series, yMin, yMax), [series, yMin, yMax]);
  const pointsBySeries = useMemo(
    () => Object.fromEntries(
      series.map((item) => [item.key, createPoints(item.data, CHART_W, height, domain.min, domain.max)]),
    ) as Record<string, ChartPoint[]>,
    [domain.max, domain.min, height, series],
  );
  const labels = series[0]?.data.map((point) => point.label) ?? [];
  const activeIndex = selectedIdx === null ? null : clamp(selectedIdx, 0, Math.max(0, labels.length - 1));
  const ticks = yTicks?.length ? yTicks : [domain.max, Math.round((domain.max + domain.min) / 2), domain.min];
  const activePointIndex = activeIndex ?? 0;

  function indexFromTouch(locationX: number) {
    if (labels.length <= 1) return 0;
    const ratio = clamp(locationX / Math.max(layoutWRef.current, 1), 0, 1);
    return Math.round(ratio * (labels.length - 1));
  }

  function handleTouch(e: GestureResponderEvent) {
    setSelectedIdx(indexFromTouch(e.nativeEvent.locationX));
  }

  function handleLayout(e: LayoutChangeEvent) {
    const next = e.nativeEvent.layout.width;
    layoutWRef.current = next;
    setLayoutW(next);
  }

  const selectedLabel = activeIndex === null ? null : labels[activeIndex] ?? null;
  const tooltipLeft = activeIndex === null || labels.length <= 1
    ? 0
    : clamp((activeIndex / (labels.length - 1)) * layoutW - TOOLTIP_W / 2, 0, Math.max(0, layoutW - TOOLTIP_W));

  return (
    <View style={styles.wrap}>
      <View
        style={styles.chartTouchWrap}
        onLayout={handleLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
      >
        <Svg width="100%" height={height} viewBox={`0 0 ${CHART_W} ${height}`} preserveAspectRatio="none">
          {ticks.map((tick, index) => {
            const ratio = (tick - domain.min) / Math.max(1, domain.max - domain.min);
            const y = height - 12 - ratio * (height - 24);
            return (
              <Line
                key={`${tick}-${index}`}
                x1={0}
                x2={CHART_W}
                y1={y}
                y2={y}
                stroke={colors.borderSubtle}
                strokeWidth={1}
                strokeDasharray={index === ticks.length - 1 ? '0' : '3 4'}
              />
            );
          })}

          {series.map((item) => {
            const points = pointsBySeries[item.key] ?? [];
            const path = pathFromPoints(points);
            const areaPath = areaFromPoints(points, height);
            return (
              <React.Fragment key={item.key}>
                {item.style === 'area' && areaPath ? (
                  <Path d={areaPath} fill={item.color} opacity={0.12} />
                ) : null}
                {points.length > 1 ? (
                  <Path
                    d={path}
                    stroke={item.color}
                    strokeWidth={item.style === 'area' ? 2.6 : 2.1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={item.style === 'dashed' ? '4 4' : undefined}
                    fill="none"
                  />
                ) : null}
                {points.map((point, index) => {
                  const selected = activeIndex === index;
                  const radius = selected ? 4.6 : item.style === 'area' ? 3.7 : 2.8;
                  return (
                    <React.Fragment key={`${item.key}-${point.label}-${index}`}>
                      {selected ? (
                        <Circle cx={point.x} cy={point.y} r={radius + 2} fill={colors.surface} />
                      ) : null}
                      <Circle cx={point.x} cy={point.y} r={radius} fill={item.color} />
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}

          {activeIndex !== null && labels.length > 0 ? (
            <>
              <Line
                x1={labels.length === 1 ? CHART_W / 2 : (activeIndex * CHART_W) / (labels.length - 1)}
                x2={labels.length === 1 ? CHART_W / 2 : (activeIndex * CHART_W) / (labels.length - 1)}
                y1={8}
                y2={height - 8}
                stroke={colors.textSubtle}
                strokeWidth={1}
                strokeDasharray="3 4"
                opacity={0.72}
              />
            </>
          ) : null}
        </Svg>

        {showTooltip && selectedLabel ? (
          <View
            pointerEvents="box-none"
            style={[
              styles.tooltip,
              {
                left: tooltipLeft,
                width: TOOLTIP_W,
                borderColor: colors.borderSubtle,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <View style={styles.tooltipHeader}>
              <Text style={[styles.tooltipDate, { color: colors.text }]}>{selectedLabel}</Text>
              <Pressable onPress={() => setSelectedIdx(null)} hitSlop={6}>
                <Text style={[styles.tooltipClose, { color: colors.textSubtle }]}>×</Text>
              </Pressable>
            </View>
            {series.map((item) => {
              const point = pointsBySeries[item.key]?.[activePointIndex];
              if (!point) return null;
              return (
                <View key={item.key} style={styles.tooltipRow}>
                  <View style={[styles.tooltipDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.tooltipLabel, { color: colors.textMuted }]}>{item.label}</Text>
                  <Text style={[styles.tooltipValue, { color: colors.text }]}>{point.value}</Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>

      {showYAxis ? (
        <View style={styles.yAxis}>
          {ticks.map((tick) => (
            <Text key={tick} style={[styles.axisText, { color: colors.textSubtle }]}>
              {tick}
            </Text>
          ))}
        </View>
      ) : null}

      {showXAxis ? (
        <View style={styles.xAxis}>
          {labels.map((label, index) => (
            <Text
              key={`${label}-${index}`}
              style={[
                styles.axisText,
                styles.xAxisText,
                { color: activeIndex === index ? colors.text : colors.textSubtle },
              ]}
            >
              {label}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

type QuietBarChartProps = {
  colors: ThemeColors;
  data: HomeChartPoint[];
  color: string;
  height?: number;
};

export function QuietBarChartV2({
  colors,
  data,
  color,
  height = 96,
}: QuietBarChartProps) {
  const max = Math.max(...data.map((point) => point.value), 1);
  const slot = (CHART_W - 24) / Math.max(data.length, 1);
  const barWidth = Math.max(12, Math.min(26, slot * 0.56));
  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={height} viewBox={`0 0 ${CHART_W} ${height}`} preserveAspectRatio="none">
        {[0.25, 0.5, 0.75].map((ratio) => {
          const y = height - 10 - ratio * (height - 24);
          return (
            <Line
              key={ratio}
              x1={0}
              x2={CHART_W}
              y1={y}
              y2={y}
              stroke={colors.borderSubtle}
              strokeWidth={1}
              strokeDasharray="3 4"
            />
          );
        })}
        {data.map((point, index) => {
          const barHeight = Math.max(10, (point.value / max) * (height - 28));
          const x = 12 + index * slot + (slot - barWidth) / 2;
          const y = height - barHeight - 10;
          return (
            <React.Fragment key={`${point.label}-${index}`}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={barWidth / 2}
                fill={color}
                opacity={0.92}
              />
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={styles.xAxis}>
        {data.map((point, index) => (
          <Text key={`${point.label}-${index}`} style={[styles.axisText, styles.xAxisText, { color: colors.textSubtle }]}>
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  chartTouchWrap: {
    position: 'relative',
  },
  tooltip: {
    position: 'absolute',
    top: 6,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tooltipDate: {
    fontSize: typography.micro,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  tooltipClose: {
    fontSize: 15,
    lineHeight: 15,
    fontWeight: '700',
    paddingHorizontal: 3,
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tooltipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  tooltipLabel: {
    flex: 1,
    fontSize: typography.micro,
    lineHeight: 14,
    fontWeight: '700',
  },
  tooltipValue: {
    fontSize: typography.micro,
    lineHeight: 14,
    fontWeight: '800',
  },
  yAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -2,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  axisText: {
    flex: 1,
    fontSize: typography.micro,
    lineHeight: lineHeights.caption,
    fontWeight: '700',
  },
  xAxisText: {
    textAlign: 'center',
  },
});
