/**
 * BloodContextCard
 * Replaces shallow BloodPanelsCard on Home.
 *
 * Shows:
 * - Top markers from most recent panel (2025), prioritized by out-of-ref
 * - Per-marker SVG range bar (react-native-svg, no Skia, no Victory)
 * - Per-marker support focus — lifestyle-supportive, clinician-first for
 *   persistent out-of-reference values
 * - CTA to open full Blood Results screen
 *
 * Rules:
 * - No diagnosis, no treatment, no supplement/drug prescriptions
 * - No guaranteed timeline
 * - Clinician-first wording for out-of-ref values
 * - Uses refLow/refHigh from bloodStorage only (units match storage)
 * - Does NOT cross-map units to biomarkers.ts domain (units differ)
 */
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import { loadPanels } from '../data/bloodStorage';
import type { BloodMarker } from '../data/bloodStorage';

// ---------------------------------------------------------------------------
// Static icon map — no dynamic strings (Android safety)
// ---------------------------------------------------------------------------
const STATUS_ICON_MAP = {
  within:      'checkmark-circle-outline',
  above:       'alert-circle-outline',
  below:       'alert-circle-outline',
  unavailable: 'help-circle-outline',
} as const satisfies Record<string, import('@expo/vector-icons/build/createIconSet').ComponentProps<typeof import('@expo/vector-icons').Ionicons>['name'] extends string ? string : never>;

// Simpler typed approach without the complex generic:
type StatusKey = 'within' | 'above' | 'below' | 'unavailable';
const ICON_BY_STATUS: Record<StatusKey, React.ComponentProps<typeof Ionicons>['name']> = {
  within:      'checkmark-circle-outline',
  above:       'alert-circle-outline',
  below:       'alert-circle-outline',
  unavailable: 'help-circle-outline',
};

// ---------------------------------------------------------------------------
// Per-marker support focus (lifestyle-supportive, clinician-first for outside-ref)
// ---------------------------------------------------------------------------
type SupportFocus = {
  lifestyle: string;
  clinicianNote?: string; // shown only when out-of-ref
};

const SUPPORT_FOCUS: Record<string, SupportFocus> = {
  glucose:       { lifestyle: 'Often reviewed alongside carbohydrate intake, sleep, and training volume.', clinicianNote: 'Persistent out-of-reference values are worth reviewing with a clinician alongside recent nutrition and lifestyle context.' },
  hba1c:         { lifestyle: 'Often tracked alongside nutrition pattern, training volume, and recovery context.', clinicianNote: 'A 3-month trend outside the reference context can be useful to bring to a clinician discussion.' },
  chol_total:    { lifestyle: 'Often reviewed alongside LDL, HDL, ApoB, dietary fat pattern, and training load.' },
  ldl:           { lifestyle: 'Often reviewed alongside ApoB, dietary pattern, and training volume.', clinicianNote: 'Useful to review alongside ApoB and total lipid context with a clinician.' },
  hdl:           { lifestyle: 'Regular aerobic training is commonly associated with HDL levels. Often reviewed alongside training frequency and body composition.' },
  triglycerides: { lifestyle: 'Often reviewed alongside carbohydrate intake, alcohol, sleep quality, and activity level.', clinicianNote: 'Persistent elevation can support a clinician discussion about metabolic context.' },
  apob:          { lifestyle: 'Often reviewed alongside LDL, total cholesterol, dietary pattern, and training context.', clinicianNote: 'ApoB is a direct lipid-particle marker — useful to raise in a clinician discussion if consistently above reference.' },
  hscrp:         { lifestyle: 'Often reviewed alongside training load, sleep quality, and recovery. Transient elevation after hard training is common.', clinicianNote: 'Persistent elevation outside reference range can support a clinician discussion about inflammation context.' },
  ferritin:      { lifestyle: 'Often reviewed alongside dietary iron intake and training volume. Endurance athletes may have higher baseline needs.', clinicianNote: 'Low ferritin can be worth discussing with a clinician, particularly in context of fatigue or training adaptation.' },
  vitd:          { lifestyle: 'Often reviewed alongside sun exposure, seasonal variation, and supplementation history.' },
  vitb12:        { lifestyle: 'Often reviewed alongside dietary pattern — particularly relevant for those following plant-based diets.', clinicianNote: 'Persistent low B12 can support a clinician discussion, particularly around absorption and dietary context.' },
  tsh:           { lifestyle: 'Often reviewed alongside energy, body composition, sleep, and stress context.', clinicianNote: 'TSH outside reference context is worth reviewing with a clinician as part of a broader thyroid panel.' },
  alt:           { lifestyle: 'Can be transiently elevated after intense training. Often reviewed alongside training load and recovery time.', clinicianNote: 'Persistent elevation outside reference range is worth raising with a clinician.' },
  creatinine:    { lifestyle: 'Often reviewed alongside hydration, protein intake, and training volume.', clinicianNote: 'Persistent out-of-range values can support a clinician discussion about kidney filtration context.' },
  homocysteine:  { lifestyle: 'Often reviewed alongside dietary B-vitamin intake (folate, B6, B12) and nutrition pattern.', clinicianNote: 'Elevated homocysteine can support a clinician discussion about B-vitamin status and dietary context.' },
  uric_acid:     { lifestyle: 'Often reviewed alongside hydration, protein intake, and training load.', clinicianNote: 'Persistent elevation can be worth discussing with a clinician alongside dietary and hydration context.' },
  testosterone:  { lifestyle: 'Often reviewed alongside sleep quality, training load, stress, and body composition.', clinicianNote: 'Persistent out-of-reference values are worth reviewing with a clinician in context of symptoms and lifestyle.' },
  shbg:          { lifestyle: 'Often reviewed alongside testosterone and body composition context.' },
};

// ---------------------------------------------------------------------------
// Ref status helpers
// ---------------------------------------------------------------------------
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

// Priority order: above/below first, then within, then unavailable
function statusPriority(s: RefStatus): number {
  if (s === 'above' || s === 'below') return 0;
  if (s === 'within') return 1;
  return 2;
}

// ---------------------------------------------------------------------------
// SVG Range Bar
// ---------------------------------------------------------------------------
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

  // Compute display range: span from min(0.5*low, n) to max(1.5*high, n)
  const lo  = !isNaN(low)  ? low  : n * 0.5;
  const hi  = !isNaN(high) ? high : n * 1.5;
  const rangeMin = Math.min(lo * 0.8, n * 0.8);
  const rangeMax = Math.max(hi * 1.2, n * 1.2);
  const span     = rangeMax - rangeMin || 1;

  // Ref zone in pixels
  const refStart = !isNaN(low)  ? ((lo - rangeMin) / span) * BAR_W : 0;
  const refEnd   = !isNaN(high) ? ((hi - rangeMin) / span) * BAR_W : BAR_W;
  const refWidth = Math.max(refEnd - refStart, 2);

  // Value dot position
  const dotX = Math.min(Math.max(((n - rangeMin) / span) * BAR_W, 3), BAR_W - 3);

  const status = getRefStatus(value, refLow, refHigh);
  const dotColor =
    status === 'within' ? colors.positive
    : status === 'unavailable' ? colors.textSubtle
    : colors.warning;

  return (
    <Svg width={BAR_W} height={14}>
      {/* Track */}
      <Rect x={0} y={4} width={BAR_W} height={BAR_H} rx={3} fill={colors.progressTrack} />
      {/* Reference zone */}
      <Rect x={refStart} y={4} width={refWidth} height={BAR_H} rx={2} fill={colors.accentSoft} opacity={0.9} />
      {/* Value marker */}
      <Rect x={dotX - 1.5} y={2} width={3} height={10} rx={1.5} fill={dotColor} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// MarkerRow
// ---------------------------------------------------------------------------
function MarkerContextRow({
  marker, colors, isLast,
}: { marker: BloodMarker; colors: ThemeColors; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const s = createStyles(colors);

  const refLow  = (marker.refLow  ?? '').trim();
  const refHigh = (marker.refHigh ?? '').trim();
  const status  = getRefStatus(marker.value, refLow, refHigh);
  const support = SUPPORT_FOCUS[marker.id];

  const statusColor =
    status === 'within'      ? colors.positive
    : status === 'unavailable' ? colors.textSubtle
    : colors.warning;

  const iconName = ICON_BY_STATUS[status];

  return (
    <View style={[s.markerRow, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSubtle }]}>
      {/* Top row */}
      <View style={s.markerTop}>
        <Ionicons name={iconName} size={14} color={statusColor} style={{ marginTop: 1, flexShrink: 0 }} />
        <View style={s.markerMeta}>
          <Text style={[s.markerLabel, { color: colors.text }]}>{marker.label}</Text>
          <Text style={[s.markerValue, { color: status !== 'unavailable' ? statusColor : colors.textMuted }]}>
            {marker.value} <Text style={{ color: colors.textSubtle, fontWeight: '400' }}>{marker.unit}</Text>
          </Text>
        </View>
        <View style={s.markerRight}>
          <RangeBar value={marker.value} refLow={refLow} refHigh={refHigh} colors={colors} />
          {(refLow || refHigh) && (
            <Text style={[s.refRange, { color: colors.textSubtle }]}>
              {refLow || '—'} – {refHigh || '—'}
            </Text>
          )}
        </View>
        {support && (
          <Pressable
            onPress={() => setExpanded((e) => !e)}
            hitSlop={10}
            accessibilityLabel={expanded ? 'Hide support context' : 'Show support context'}
          >
            <Ionicons
              name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={13}
              color={colors.textSubtle}
            />
          </Pressable>
        )}
      </View>

      {/* Expanded context */}
      {expanded && support && (
        <View style={[s.contextBlock, { borderTopColor: colors.borderSubtle }]}>
          <View style={s.contextRow}>
            <Ionicons name="leaf-outline" size={11} color={colors.textSubtle} />
            <Text style={[s.contextText, { color: colors.textMuted }]}>{support.lifestyle}</Text>
          </View>
          {(status === 'above' || status === 'below') && support.clinicianNote && (
            <View style={[s.clinicianNote, { backgroundColor: colors.warningSoft, borderColor: colors.border }]}>
              <Ionicons name="person-outline" size={11} color={colors.warning} />
              <Text style={[s.clinicianNoteText, { color: colors.warning }]}>{support.clinicianNote}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main card
// ---------------------------------------------------------------------------
type Props = { onViewPress: () => void };

export function BloodContextCard({ onViewPress }: Props) {
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [markers, setMarkers] = useState<BloodMarker[]>([]);

  useEffect(() => {
    loadPanels().then((panels) => {
      const latest = panels[panels.length - 1];
      if (!latest) return;
      // Enabled markers only, sorted by ref priority
      const sorted = latest.markers
        .filter((m) => m.enabled && m.value.trim() !== '')
        .sort((a, b) => {
          const stA = getRefStatus(a.value, a.refLow ?? '', a.refHigh ?? '');
          const stB = getRefStatus(b.value, b.refLow ?? '', b.refHigh ?? '');
          return statusPriority(stA) - statusPriority(stB);
        })
        .slice(0, 6); // show top 6 on home
      setMarkers(sorted);
    });
  }, []);

  const outsideCount = markers.filter((m) => {
    const st = getRefStatus(m.value, m.refLow ?? '', m.refHigh ?? '');
    return st === 'above' || st === 'below';
  }).length;

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.headerRow}>
        <View style={s.headerLeft}>
          <Ionicons name="flask-outline" size={15} color={colors.accent} />
          <Text style={s.headerTitle}>Blood Context</Text>
          <Text style={s.headerSub}>2025 · latest panel</Text>
        </View>
        <Pressable
          onPress={onViewPress}
          style={[s.cta, { borderColor: colors.accentBorder }]}
          accessibilityLabel="Open full blood results"
        >
          <Text style={[s.ctaText, { color: colors.accent }]}>Full view</Text>
          <Ionicons name="chevron-forward" size={11} color={colors.accent} />
        </Pressable>
      </View>

      {/* Status summary bar */}
      {markers.length > 0 && (
        <View style={s.statusBar}>
          {outsideCount > 0 ? (
            <>
              <Ionicons name="alert-circle-outline" size={12} color={colors.warning} />
              <Text style={[s.statusText, { color: colors.warning }]}>
                {outsideCount} marker{outsideCount > 1 ? 's' : ''} outside available reference context · context only
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={12} color={colors.positive} />
              <Text style={[s.statusText, { color: colors.positive }]}>
                All {markers.length} shown markers within available reference context
              </Text>
            </>
          )}
        </View>
      )}

      {/* Marker rows */}
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
        Context only · not a diagnosis · tap markers for support focus
      </Text>
    </View>
  );
}

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
    },
    headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
    headerTitle: { color: colors.text, fontSize: typography.bodySmall, fontWeight: '700', letterSpacing: -0.1 },
    headerSub:   { color: colors.textSubtle, fontSize: typography.micro },
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
