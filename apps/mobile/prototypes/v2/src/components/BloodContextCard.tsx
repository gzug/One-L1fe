/**
 * BloodContextCard
 *
 * Home card for the latest blood panel. Shows up to 6 prioritized markers
 * (out-of-reference first), each with a small SVG range bar and a clearly
 * labelled latest value vs reference context.
 *
 * Copy rules:
 * - "value" = latest panel value, "range" = reference context
 * - Green = within available reference context
 * - Amber = outside available reference context
 * - Grey  = no reference range available
 * - Never imply the green number is an "average" or that all values are "good"
 * - Per-marker support focus comes from data/markerSupportFocus.ts
 *
 * Reference data comes from bloodStorage only (units match storage). We do
 * NOT cross-map to packages/domain/biomarkers.ts thresholds because the
 * canonical thresholds use different units and would mislead.
 *
 * Icons are primitive SVG (no font dependency) so they render reliably on
 * Android in both Light and Dark mode.
 */
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import { loadPanels } from '../../../v1-marathon/src/data/bloodStorage';
import type { BloodMarker } from '../../../v1-marathon/src/data/bloodStorage';
import { getSupportFocus } from '../../../v1-marathon/src/data/markerSupportFocus';

// ---- Primitive SVG icons (no font dependency) -----------------------------

function IconCheck({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Circle cx={7} cy={7} r={6} stroke={color} strokeWidth={1.4} fill="none" />
      <Path d="M4.4 7.2 L6.2 9 L9.6 5.4" stroke={color} strokeWidth={1.6}
            strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function IconAlert({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Circle cx={7} cy={7} r={6} stroke={color} strokeWidth={1.4} fill="none" />
      <Path d="M7 3.7 L7 7.6" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx={7} cy={9.7} r={0.9} fill={color} />
    </Svg>
  );
}

function IconHelp({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Circle cx={7} cy={7} r={6} stroke={color} strokeWidth={1.4} fill="none" />
      <Path d="M5.3 5.4 C5.3 4.3 6.1 3.6 7 3.6 C7.9 3.6 8.7 4.2 8.7 5.1 C8.7 6.1 7 6.5 7 7.6"
            stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <Circle cx={7} cy={9.7} r={0.8} fill={color} />
    </Svg>
  );
}

function IconChevron({ color, up }: { color: string; up: boolean }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Path
        d={up ? 'M3 7.5 L6 4.5 L9 7.5' : 'M3 4.5 L6 7.5 L9 4.5'}
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function IconLeaf({ color }: { color: string }) {
  return (
    <Svg width={11} height={11} viewBox="0 0 11 11">
      <Path d="M2 9 C2 5 5 2 9 2 C9 6 6 9 2 9 Z"
            stroke={color} strokeWidth={1.1} strokeLinejoin="round" fill="none" />
      <Path d="M2 9 L6 5" stroke={color} strokeWidth={1.1} strokeLinecap="round" />
    </Svg>
  );
}

function IconClinician({ color }: { color: string }) {
  return (
    <Svg width={11} height={11} viewBox="0 0 11 11">
      <Circle cx={5.5} cy={4} r={1.6} stroke={color} strokeWidth={1.1} fill="none" />
      <Path d="M2.5 9.6 C3 7.8 4.1 7 5.5 7 C6.9 7 8 7.8 8.5 9.6"
            stroke={color} strokeWidth={1.1} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function IconFlask({ color }: { color: string }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 15 15">
      <Path
        d="M5.4 2 L5.4 6.5 L3 11 C2.6 11.7 3 12.5 3.9 12.5 L11.1 12.5 C12 12.5 12.4 11.7 12 11 L9.6 6.5 L9.6 2"
        stroke={color}
        strokeWidth={1.2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M4.6 2 L10.4 2" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </Svg>
  );
}

function IconChevronRight({ color }: { color: string }) {
  return (
    <Svg width={11} height={11} viewBox="0 0 11 11">
      <Path d="M4 2.5 L7.5 5.5 L4 8.5" stroke={color} strokeWidth={1.5}
            strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

// ---- Ref status -----------------------------------------------------------
type RefStatus = 'within' | 'above' | 'below' | 'unavailable';

function getRefStatus(val: string, refLow: string, refHigh: string): RefStatus {
  const n    = parseFloat(val);
  const low  = refLow  ? parseFloat(refLow)  : NaN;
  const high = refHigh ? parseFloat(refHigh) : NaN;
  if (isNaN(n)) return 'unavailable';
  if (isNaN(low) && isNaN(high)) return 'unavailable';
  if (!isNaN(low)  && n < low)  return 'below';
  if (!isNaN(high) && n > high) return 'above';
  return 'within';
}

function statusPriority(s: RefStatus): number {
  if (s === 'above' || s === 'below') return 0;
  if (s === 'within') return 1;
  return 2;
}

function StatusIcon({ status, color }: { status: RefStatus; color: string }) {
  if (status === 'within')      return <IconCheck color={color} />;
  if (status === 'unavailable') return <IconHelp  color={color} />;
  return <IconAlert color={color} />;
}

// ---- Range bar ------------------------------------------------------------
function RangeBar({
  value, refLow, refHigh, colors,
}: { value: string; refLow: string; refHigh: string; colors: ThemeColors }) {
  const BAR_W = 80;
  const BAR_H = 6;
  const n    = parseFloat(value);
  const low  = refLow  ? parseFloat(refLow)  : NaN;
  const high = refHigh ? parseFloat(refHigh) : NaN;

  if (isNaN(n) || (isNaN(low) && isNaN(high))) {
    return (
      <View style={{ width: BAR_W, height: BAR_H, borderRadius: 3, backgroundColor: colors.progressTrack }} />
    );
  }

  const lo  = !isNaN(low)  ? low  : n * 0.5;
  const hi  = !isNaN(high) ? high : n * 1.5;
  const rangeMin = Math.min(lo * 0.8, n * 0.8);
  const rangeMax = Math.max(hi * 1.2, n * 1.2);
  const span     = rangeMax - rangeMin || 1;

  const refStart = !isNaN(low)  ? ((lo - rangeMin) / span) * BAR_W : 0;
  const refEnd   = !isNaN(high) ? ((hi - rangeMin) / span) * BAR_W : BAR_W;
  const refWidth = Math.max(refEnd - refStart, 2);

  const dotX = Math.min(Math.max(((n - rangeMin) / span) * BAR_W, 3), BAR_W - 3);

  const status = getRefStatus(value, refLow, refHigh);
  const dotColor =
    status === 'within' ? colors.positive
    : status === 'unavailable' ? colors.textSubtle
    : colors.warning;

  return (
    <Svg width={BAR_W} height={14}>
      <Rect x={0} y={4} width={BAR_W} height={BAR_H} rx={3} fill={colors.progressTrack} />
      <Rect x={refStart} y={4} width={refWidth} height={BAR_H} rx={2}
            fill={colors.positive} opacity={0.18} />
      <Rect x={dotX - 1.5} y={2} width={3} height={10} rx={1.5} fill={dotColor} />
    </Svg>
  );
}

// ---- Marker row -----------------------------------------------------------
function MarkerContextRow({
  marker, colors, isLast,
}: { marker: BloodMarker; colors: ThemeColors; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const s = createStyles(colors);

  const refLow  = (marker.refLow  ?? '').trim();
  const refHigh = (marker.refHigh ?? '').trim();
  const status  = getRefStatus(marker.value, refLow, refHigh);
  const support = getSupportFocus(marker.id);

  const statusColor =
    status === 'within'      ? colors.positive
    : status === 'unavailable' ? colors.textSubtle
    : colors.warning;

  return (
    <View style={[s.markerRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSubtle }]}>
      <View style={s.markerTop}>
        <View style={{ marginTop: 1, flexShrink: 0 }}>
          <StatusIcon status={status} color={statusColor} />
        </View>
        <View style={s.markerMeta}>
          <Text style={[s.markerLabel, { color: colors.text }]}>{marker.label}</Text>
          <Text style={[s.markerValue, { color: status !== 'unavailable' ? statusColor : colors.textMuted }]}>
            {marker.value}
            <Text style={{ color: colors.textSubtle, fontWeight: '400' }}>{' '}{marker.unit}</Text>
          </Text>
        </View>
        <View style={s.markerRight}>
          <RangeBar value={marker.value} refLow={refLow} refHigh={refHigh} colors={colors} />
          {(refLow || refHigh) ? (
            <Text style={[s.refRange, { color: colors.textSubtle }]}>
              range {refLow || '—'}–{refHigh || '—'}
            </Text>
          ) : (
            <Text style={[s.refRange, { color: colors.textSubtle }]}>no range</Text>
          )}
        </View>
        {support && (
          <Pressable
            onPress={() => setExpanded((e) => !e)}
            hitSlop={10}
            accessibilityLabel={expanded ? 'Hide support context' : 'Show support context'}
            style={s.expandBtn}
          >
            <IconChevron color={colors.textSubtle} up={expanded} />
          </Pressable>
        )}
      </View>

      {expanded && support && (
        <View style={[s.contextBlock, { borderTopColor: colors.borderSubtle }]}>
          <View style={s.contextRow}>
            <View style={{ marginTop: 2 }}><IconLeaf color={colors.textSubtle} /></View>
            <Text style={[s.contextText, { color: colors.textMuted }]}>{support.lifestyle}</Text>
          </View>
          {(status === 'above' || status === 'below') && support.clinicianNote && (
            <View style={[s.clinicianNote, { backgroundColor: colors.warningSoft, borderColor: colors.border }]}>
              <View style={{ marginTop: 2 }}><IconClinician color={colors.warning} /></View>
              <Text style={[s.clinicianNoteText, { color: colors.warning }]}>{support.clinicianNote}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ---- Main card ------------------------------------------------------------
type Props = { onViewPress: () => void };

export function BloodContextCard({ onViewPress }: Props) {
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [markers, setMarkers] = useState<BloodMarker[]>([]);

  useEffect(() => {
    loadPanels().then((panels) => {
      const latest = panels[panels.length - 1];
      if (!latest) return;
      const sorted = latest.markers
        .filter((m) => m.enabled && m.value.trim() !== '')
        .sort((a, b) => {
          const stA = getRefStatus(a.value, a.refLow ?? '', a.refHigh ?? '');
          const stB = getRefStatus(b.value, b.refLow ?? '', b.refHigh ?? '');
          return statusPriority(stA) - statusPriority(stB);
        })
        .slice(0, 6);
      setMarkers(sorted);
    });
  }, []);

  const outsideCount = markers.filter((m) => {
    const st = getRefStatus(m.value, m.refLow ?? '', m.refHigh ?? '');
    return st === 'above' || st === 'below';
  }).length;

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <View style={s.headerLeft}>
          <View style={{ marginTop: 1 }}><IconFlask color={colors.accent} /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Blood Context</Text>
            <Text style={s.headerSub}>Latest 2025 panel · {markers.length} key markers shown</Text>
          </View>
        </View>
        <Pressable
          onPress={onViewPress}
          style={[s.cta, { borderColor: colors.accentBorder }]}
          accessibilityLabel="Open full blood results"
        >
          <Text style={[s.ctaText, { color: colors.accent }]}>Full view</Text>
          <IconChevronRight color={colors.accent} />
        </Pressable>
      </View>

      <View style={s.legendBlock}>
        <Text style={[s.fullViewHint, { color: colors.textSubtle }]}>
          Full view compares 2023 and 2025 panels.
        </Text>
        <View style={s.legendRow}>
          <LegendSwatch color={colors.positive}   label="Within context" colors={colors} />
          <LegendSwatch color={colors.warning}    label="Outside context" colors={colors} />
          <LegendSwatch color={colors.textSubtle} label="No range" colors={colors} />
        </View>
      </View>

      {markers.length > 0 && (
        <View style={s.statusBar}>
          {outsideCount > 0 ? (
            <>
              <IconAlert color={colors.warning} />
              <Text style={[s.statusText, { color: colors.warning }]}>
                {outsideCount} marker{outsideCount > 1 ? 's' : ''} outside available reference context · context only
              </Text>
            </>
          ) : (
            <>
              <IconCheck color={colors.positive} />
              <Text style={[s.statusText, { color: colors.positive }]}>
                {markers.length} shown markers within available reference context
              </Text>
            </>
          )}
        </View>
      )}

      <View style={[s.markerList, { borderColor: colors.border }]}>
        {markers.map((m, i) => (
          <MarkerContextRow
            key={m.id}
            marker={m}
            colors={colors}
            isLast={i === markers.length - 1}
          />
        ))}
        {markers.length === 0 && (
          <Text style={[s.emptyText, { color: colors.textSubtle }]}>No panel data loaded.</Text>
        )}
      </View>

      <Text style={s.disclaimer}>
        Context only · not a diagnosis · tap a marker for support focus
      </Text>
    </View>
  );
}

function LegendSwatch({ color, label, colors }: { color: string; label: string; colors: ThemeColors }) {
  return (
    <View style={legendSwatchStyles.row}>
      <View style={[legendSwatchStyles.dot, { backgroundColor: color }]} />
      <Text style={[legendSwatchStyles.label, { color: colors.textSubtle }]}>{label}</Text>
    </View>
  );
}

const legendSwatchStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot:   { width: 7, height: 7, borderRadius: 4 },
  label: { fontSize: typography.micro, fontWeight: '500' },
});

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: radius.md,
      backgroundColor: colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingTop: spacing.md,
      gap: spacing.sm,
      overflow: 'hidden',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
    headerTitle: { color: colors.text, fontSize: typography.bodySmall, fontWeight: '700', letterSpacing: -0.1 },
    headerSub:   { color: colors.textSubtle, fontSize: typography.micro, marginTop: 1 },
    legendBlock: {
      paddingHorizontal: spacing.lg,
      gap: spacing.xs,
    },
    fullViewHint: {
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
    },
    legendRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      alignItems: 'center',
    },
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      borderWidth: 1,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    ctaText: { fontSize: typography.caption, fontWeight: '600' },
    statusBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.lg,
    },
    statusText: { fontSize: typography.micro, flex: 1, lineHeight: lineHeights.caption },
    markerList: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    markerRow:  { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2 },
    markerTop:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    markerMeta: { flex: 1, gap: 1 },
    markerLabel:{ fontSize: typography.caption, fontWeight: '600' },
    markerValue:{ fontSize: typography.caption, fontWeight: '700' },
    markerRight:{ alignItems: 'flex-end', gap: 2 },
    refRange:   { fontSize: typography.micro },
    expandBtn:  { paddingHorizontal: 4, paddingVertical: 4 },
    contextBlock:{
      paddingTop: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    contextRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
    contextText:{ fontSize: typography.caption, lineHeight: lineHeights.caption, flex: 1 },
    clinicianNote:{
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
      borderRadius: radius.sm,
      borderWidth: StyleSheet.hairlineWidth,
      padding: spacing.sm,
    },
    clinicianNoteText:{ fontSize: typography.caption, lineHeight: lineHeights.caption, flex: 1 },
    disclaimer: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      lineHeight: lineHeights.caption,
    },
    emptyText: { padding: spacing.lg, fontSize: typography.caption, textAlign: 'center' },
  });
}
