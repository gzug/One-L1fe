import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { layout, lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import { loadPanels, savePanels } from '../data/bloodStorage';
import type { BloodMarker, BloodPanel } from '../data/bloodStorage';
import { getMarkerContext } from '../data/markerContext';

const ANDROID_TOP_INSET =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

type Props = { onClose: () => void };
type ViewMode = 'panel' | 'compare';

export function BloodResultsScreen({ onClose }: Props) {
  const { colors } = useTheme();
  const [panels, setPanels]       = useState<BloodPanel[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [viewMode, setViewMode]   = useState<ViewMode>('panel');
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [dirty, setDirty]         = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef                  = useRef<TextInput>(null);
  const s                         = createStyles(colors);

  useEffect(() => {
    loadPanels().then((data) => {
      setPanels(data);
      setActiveTab(data[data.length - 1]?.id ?? '');
      setLoading(false);
    });
  }, []);

  const activePanel = panels.find((p) => p.id === activeTab);

  function updateMarkerValue(markerId: string, value: string) {
    setPanels((prev) =>
      prev.map((panel) =>
        panel.id !== activeTab ? panel : {
          ...panel,
          markers: panel.markers.map((m) => m.id === markerId ? { ...m, value } : m),
        },
      ),
    );
    setDirty(true);
  }

  function toggleMarker(markerId: string, enabled: boolean) {
    setPanels((prev) =>
      prev.map((panel) =>
        panel.id !== activeTab ? panel : {
          ...panel,
          markers: panel.markers.map((m) => m.id === markerId ? { ...m, enabled } : m),
        },
      ),
    );
    setDirty(true);
  }

  const handleSave = useCallback(async () => {
    const current = panels.find((p) => p.id === activeTab);
    if (current) {
      const invalid = current.markers.filter((m) => m.enabled && m.value.trim() === '');
      if (invalid.length > 0) {
        Alert.alert(
          'Missing values',
          `These enabled markers need a value or should be disabled:\n${invalid.map((m) => m.label).join(', ')}`,
          [{ text: 'OK' }],
        );
        return;
      }
    }
    setSaving(true);
    await savePanels(panels);
    setSaving(false);
    setDirty(false);
    setEditingId(null);
  }, [panels, activeTab]);

  function handleUploadAction() {
    Alert.alert(
      'Import review planned',
      'Import from PDF or photo is planned. Values extracted from documents must be reviewed by you before saving.\n\nThis feature is not active in the prototype.',
      [{ text: 'OK' }],
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[s.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      {/* Header */}
      <View style={[s.header, { paddingTop: ANDROID_TOP_INSET + spacing.sm }]}>
        <Pressable
          onPress={onClose}
          style={s.backBtn}
          hitSlop={10}
          accessibilityLabel="Back to Overview"
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[s.backLabel, { color: colors.textMuted }]}>Overview</Text>
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Blood Results</Text>
          <Text style={s.headerSub}>
            {viewMode === 'compare'
              ? 'Comparing 2023 and 2025 panels · context only'
              : 'One panel per year · demo data'}
          </Text>
        </View>
        {viewMode === 'panel' && dirty ? (
          <Pressable onPress={handleSave} disabled={saving} style={[s.saveBtn, saving && s.saveBtnDisabled]}>
            {saving
              ? <ActivityIndicator size="small" color={colors.accent} />
              : <Text style={s.saveBtnText}>Save</Text>}
          </Pressable>
        ) : (
          <View style={s.savedIndicator}>
            {viewMode === 'panel' && <Ionicons name="checkmark" size={14} color={colors.positive} />}
            <Text style={[s.savedText, { color: viewMode === 'compare' ? colors.textSubtle : colors.positive }]}>
              {viewMode === 'panel' ? 'Saved' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Tab row */}
      <View style={[s.tabRow, { borderBottomColor: colors.border }]}>
        {viewMode === 'panel' && panels.map((panel) => (
          <Pressable
            key={panel.id}
            onPress={() => setActiveTab(panel.id)}
            style={[s.tab, activeTab === panel.id && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
          >
            <Text style={[s.tabText, activeTab === panel.id
              ? { color: colors.accent, fontWeight: '700' }
              : { color: colors.textMuted }]}
            >
              {panel.label}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => setViewMode(viewMode === 'compare' ? 'panel' : 'compare')}
          style={[s.tab, viewMode === 'compare' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
        >
          <Text style={[s.tabText, viewMode === 'compare'
            ? { color: colors.accent, fontWeight: '700' }
            : { color: colors.textMuted }]}
          >
            Comparison
          </Text>
        </Pressable>
      </View>

      {/* Info banner */}
      {viewMode === 'panel' && (
        <View style={[s.infoBanner, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          <Ionicons name="information-circle-outline" size={13} color={colors.textSubtle} />
          <Text style={[s.infoBannerText, { color: colors.textSubtle }]}>
            Demo seed values. Tap any value to edit. Toggle to exclude — excluded markers are not treated as missing.
          </Text>
        </View>
      )}
      {viewMode === 'compare' && (
        <View style={[s.infoBanner, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          <Ionicons name="information-circle-outline" size={13} color={colors.textSubtle} />
          <Text style={[s.infoBannerText, { color: colors.textSubtle }]}>
            Context only — not a diagnosis. Can support a clinician discussion and future follow-up tracking.
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.container}>
          {viewMode === 'panel' && activePanel && (
            <>
              <View style={[s.card, { borderColor: colors.border }]}>
                {activePanel.markers.map((marker, index) => (
                  <MarkerRow
                    key={marker.id}
                    marker={marker}
                    isLast={index === activePanel.markers.length - 1}
                    isEditing={editingId === marker.id}
                    inputRef={editingId === marker.id ? inputRef : undefined}
                    onStartEdit={() => setEditingId(marker.id)}
                    onEndEdit={() => setEditingId(null)}
                    onChangeValue={(val) => updateMarkerValue(marker.id, val)}
                    onToggle={(enabled) => toggleMarker(marker.id, enabled)}
                    colors={colors}
                  />
                ))}
              </View>
              <View style={s.uploadSection}>
                <Text style={[s.sectionLabel, { color: colors.textSubtle }]}>Import</Text>
                <View style={s.uploadRow}>
                  <Pressable onPress={handleUploadAction} style={[s.uploadBtn, { borderColor: colors.border }]}>
                    <Ionicons name="document-outline" size={14} color={colors.textMuted} />
                    <Text style={[s.uploadBtnText, { color: colors.textMuted }]}>Upload PDF</Text>
                  </Pressable>
                  <Pressable onPress={handleUploadAction} style={[s.uploadBtn, { borderColor: colors.border }]}>
                    <Ionicons name="camera-outline" size={14} color={colors.textMuted} />
                    <Text style={[s.uploadBtnText, { color: colors.textMuted }]}>Upload photo</Text>
                  </Pressable>
                </View>
                <Text style={[s.uploadNote, { color: colors.textSubtle }]}>
                  Import review is planned. Values must be reviewed before saving. Not active in prototype.
                </Text>
              </View>
            </>
          )}

          {viewMode === 'compare' && (
            <CompareView panels={panels} colors={colors} />
          )}

          <Text style={[s.footer, { color: colors.textSubtle }]}>
            Context only — not a diagnosis. Consult your clinician for medical interpretation.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Reference context helpers (shared)
// ---------------------------------------------------------------------------
type RefStatus = 'within' | 'below' | 'above' | 'unavailable';

function refStatus(val: string, refLow: string, refHigh: string): RefStatus {
  const n    = parseFloat(val);
  const low  = refLow  ? parseFloat(refLow)  : NaN;
  const high = refHigh ? parseFloat(refHigh) : NaN;
  if (isNaN(n)) return 'unavailable';
  if (isNaN(low) && isNaN(high)) return 'unavailable';
  if (!isNaN(low)  && n < low)  return 'below';
  if (!isNaN(high) && n > high) return 'above';
  return 'within';
}

function refStatusLabel(status: RefStatus): string {
  switch (status) {
    case 'within':      return 'Within reference context';
    case 'below':       return 'Below reference context';
    case 'above':       return 'Above reference context';
    case 'unavailable': return 'Reference range not available';
  }
}

function refContextSentence(status: RefStatus, year: string): string {
  switch (status) {
    case 'within':
      return `${year} value is within the available reference context.`;
    case 'below':
      return `${year} value sits below the available reference context. This can support a clinician discussion and future follow-up tracking.`;
    case 'above':
      return `${year} value sits above the available reference context. This can support a clinician discussion and future follow-up tracking.`;
    case 'unavailable':
      return 'Reference range not available for this marker.';
  }
}

// ---------------------------------------------------------------------------
// CompareSummary — overall picture across all markers
// ---------------------------------------------------------------------------
type MarkerSummaryEntry = {
  label: string;
  refSt: RefStatus;
  direction: 'higher' | 'lower' | 'stable' | null;
};

function buildSummaryEntries(
  panels: BloodPanel[],
  allMarkerIds: string[],
): MarkerSummaryEntry[] {
  const panel2023 = panels.find((p) => p.id === 'panel_2023');
  const panel2025 = panels.find((p) => p.id === 'panel_2025');

  return allMarkerIds.map((markerId) => {
    const m2023 = panel2023?.markers.find((m) => m.id === markerId) ?? null;
    const m2025 = panel2025?.markers.find((m) => m.id === markerId) ?? null;
    const meta  = m2025 ?? m2023;
    if (!meta) return null;

    const val2023 = m2023?.enabled ? m2023.value.trim() : '';
    const val2025 = m2025?.enabled ? m2025.value.trim() : '';
    const currentVal = val2025 || val2023;
    const refLow  = (m2025?.refLow  ?? m2023?.refLow  ?? '').trim();
    const refHigh = (m2025?.refHigh ?? m2023?.refHigh ?? '').trim();
    const st      = currentVal ? refStatus(currentVal, refLow, refHigh) : 'unavailable';

    // Trend direction
    let direction: 'higher' | 'lower' | 'stable' | null = null;
    if (val2023 && val2025) {
      const n23 = parseFloat(val2023);
      const n25 = parseFloat(val2025);
      if (!isNaN(n23) && !isNaN(n25)) {
        const pct = Math.abs(n25 - n23) / Math.abs(n23);
        direction = pct < 0.03 ? 'stable' : n25 > n23 ? 'higher' : 'lower';
      }
    }

    return { label: meta.label, refSt: st, direction } satisfies MarkerSummaryEntry;
  }).filter((e): e is MarkerSummaryEntry => e !== null);
}

function CompareSummary({
  panels,
  allMarkerIds,
  colors,
}: {
  panels: BloodPanel[];
  allMarkerIds: string[];
  colors: ThemeColors;
}) {
  const s       = createStyles(colors);
  const entries = buildSummaryEntries(panels, allMarkerIds);

  const withinList  = entries.filter((e) => e.refSt === 'within');
  const aboveList   = entries.filter((e) => e.refSt === 'above');
  const belowList   = entries.filter((e) => e.refSt === 'below');
  const noRangeList = entries.filter((e) => e.refSt === 'unavailable');
  const totalWithRange = withinList.length + aboveList.length + belowList.length;

  // Trend lists — neutral language, never "improved" / "got better"
  const movedLowerLabels = entries
    .filter((e) => e.direction === 'lower')
    .map((e) => e.label)
    .slice(0, 3);
  const movedHigherLabels = entries
    .filter((e) => e.direction === 'higher')
    .map((e) => e.label)
    .slice(0, 3);

  const flaggedLabels = [...aboveList, ...belowList].map((e) => e.label).slice(0, 4);

  // Build prioritized summary lines.
  // Pills above already cover the raw counts; lines focus on what's worth
  // looking at: current panel context → trend → missing range → follow-up.
  const lines: { icon: React.ComponentProps<typeof Ionicons>['name']; color: string; text: string }[] = [];

  // 1. Current panel context — only flagged markers (no count repeat)
  if (flaggedLabels.length > 0) {
    lines.push({
      icon:  'alert-circle-outline',
      color: colors.warning,
      text:  `Outside available reference context: ${flaggedLabels.join(', ')}. Useful to review alongside recent lifestyle factors and to raise in a clinician discussion.`,
    });
  } else if (totalWithRange > 0) {
    lines.push({
      icon:  'shield-checkmark-outline',
      color: colors.positive,
      text:  'No markers sit outside available reference context in the current panel.',
    });
  }

  // 2. Trend context — neutral language about which direction values moved
  if (movedLowerLabels.length > 0 || movedHigherLabels.length > 0) {
    const parts: string[] = [];
    if (movedLowerLabels.length > 0)  parts.push(`${movedLowerLabels.join(', ')} moved lower`);
    if (movedHigherLabels.length > 0) parts.push(`${movedHigherLabels.join(', ')} moved higher`);
    lines.push({
      icon:  'trending-down-outline',
      color: colors.textMuted,
      text:  `Trend context: ${parts.join('; ')} between 2023 and 2025. Useful for future follow-up tracking.`,
    });
  }

  // 3. Missing / no-range context
  if (noRangeList.length > 0) {
    const labels = noRangeList.map((e) => e.label).slice(0, 3).join(', ');
    lines.push({
      icon:  'help-circle-outline',
      color: colors.textSubtle,
      text:  `No reference range available for ${labels}${noRangeList.length > 3 ? ` (+${noRangeList.length - 3} more)` : ''}. Can still serve as a baseline for future comparisons.`,
    });
  }

  // 4. Follow-up focus — clinician-discussion oriented, no diagnosis
  if (flaggedLabels.length > 0) {
    lines.push({
      icon:  'person-outline',
      color: colors.textSubtle,
      text:  'Follow-up focus: bring outside-context markers to a clinician discussion alongside recent training, sleep, and nutrition context.',
    });
  } else {
    lines.push({
      icon:  'information-circle-outline',
      color: colors.textSubtle,
      text:  'Context only — not a clinical assessment. Useful to support a clinician discussion about lifestyle, training, and follow-up testing.',
    });
  }

  return (
    <View style={[s.summaryCard, { borderColor: colors.accentBorder, backgroundColor: colors.surface }]}>
      {/* Header row */}
      <View style={s.summaryHeader}>
        <Ionicons name="layers-outline" size={14} color={colors.accent} />
        <Text style={[s.summaryTitle, { color: colors.text }]}>Panel overview</Text>
        <View style={[s.summaryBadge, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}>
          <Text style={[s.summaryBadgeText, { color: colors.accent }]}>
            {entries.length} markers · 2 panels
          </Text>
        </View>
      </View>

      {/* Stat pills */}
      <View style={s.summaryPills}>
        {totalWithRange > 0 && (
          <View style={[s.pill, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Text style={[s.pillNum, { color: colors.positive }]}>{withinList.length}</Text>
            <Text style={[s.pillLabel, { color: colors.textSubtle }]}>Within</Text>
          </View>
        )}
        {(aboveList.length + belowList.length) > 0 && (
          <View style={[s.pill, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Text style={[s.pillNum, { color: colors.warning }]}>{aboveList.length + belowList.length}</Text>
            <Text style={[s.pillLabel, { color: colors.textSubtle }]}>Outside</Text>
          </View>
        )}
        {noRangeList.length > 0 && (
          <View style={[s.pill, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Text style={[s.pillNum, { color: colors.textMuted }]}>{noRangeList.length}</Text>
            <Text style={[s.pillLabel, { color: colors.textSubtle }]}>No range</Text>
          </View>
        )}
      </View>

      {/* Summary lines */}
      <View style={[s.summaryDivider, { backgroundColor: colors.borderSubtle }]} />
      <View style={s.summaryLines}>
        {lines.map((line, i) => (
          <View key={i} style={s.summaryLine}>
            <Ionicons name={line.icon} size={13} color={line.color} style={{ marginTop: 1 }} />
            <Text style={[s.summaryLineText, { color: colors.textMuted }]}>{line.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// CompareView
// ---------------------------------------------------------------------------
function CompareView({ panels, colors }: { panels: BloodPanel[]; colors: ThemeColors }) {
  const allMarkerIds = Array.from(
    new Set(panels.flatMap((p) => p.markers.map((m) => m.id))),
  );
  const panel2023 = panels.find((p) => p.id === 'panel_2023');
  const panel2025 = panels.find((p) => p.id === 'panel_2025');
  const orderedIds = panel2025
    ? [...panel2025.markers.map((m) => m.id), ...allMarkerIds.filter((id) => !panel2025.markers.find((m) => m.id === id))]
    : allMarkerIds;

  function getValue(panelId: string, markerId: string): BloodMarker | null {
    return panels.find((p) => p.id === panelId)?.markers.find((m) => m.id === markerId) ?? null;
  }

  return (
    <View style={{ gap: spacing.md }}>
      {/* Summary block at the top */}
      <CompareSummary panels={panels} allMarkerIds={orderedIds} colors={colors} />

      {orderedIds.map((markerId) => {
        const m2023 = panel2023 ? getValue(panel2023.id, markerId) : null;
        const m2025 = panel2025 ? getValue(panel2025.id, markerId) : null;
        const context = getMarkerContext(markerId);
        const meta = m2025 ?? m2023;
        if (!meta) return null;

        const val2023 = m2023?.enabled ? m2023.value.trim() : null;
        const val2025 = m2025?.enabled ? m2025.value.trim() : null;
        const hasBoth = !!(val2023 && val2025);
        const num2023 = hasBoth ? parseFloat(val2023!) : NaN;
        const num2025 = hasBoth ? parseFloat(val2025!) : NaN;
        const delta = hasBoth && !isNaN(num2023) && !isNaN(num2025) ? num2025 - num2023 : null;
        let direction: 'higher' | 'lower' | 'stable' | null = null;
        if (delta !== null) {
          const pct = Math.abs(delta) / Math.abs(num2023);
          direction = pct < 0.03 ? 'stable' : delta > 0 ? 'higher' : 'lower';
        }

        const refLow  = (m2025?.refLow  ?? m2023?.refLow  ?? '').trim();
        const refHigh = (m2025?.refHigh ?? m2023?.refHigh ?? '').trim();

        return (
          <CompareCard
            key={markerId}
            label={meta.label}
            unit={meta.unit}
            val2023={val2023}
            val2025={val2025}
            delta={delta}
            direction={direction}
            context={context}
            refLow={refLow}
            refHigh={refHigh}
            colors={colors}
          />
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// CompareCard
// ---------------------------------------------------------------------------
function CompareCard({
  label, unit, val2023, val2025, delta, direction, context, refLow, refHigh, colors,
}: {
  label: string;
  unit: string;
  val2023: string | null;
  val2025: string | null;
  delta: number | null;
  direction: 'higher' | 'lower' | 'stable' | null;
  context: ReturnType<typeof getMarkerContext>;
  refLow: string;
  refHigh: string;
  colors: ThemeColors;
}) {
  const s = createStyles(colors);
  const [expanded, setExpanded] = useState(false);

  const directionColor =
    direction === 'stable' ? colors.textSubtle
    : direction === 'higher' ? colors.warning
    : direction === 'lower'  ? colors.positive
    : colors.textSubtle;

  const directionIcon: React.ComponentProps<typeof Ionicons>['name'] =
    direction === 'stable'  ? 'remove-outline'
    : direction === 'higher' ? 'arrow-up-outline'
    : 'arrow-down-outline';

  const directionLabel =
    direction === 'stable' ? 'Stable'
    : direction === 'higher' ? 'Higher'
    : direction === 'lower'  ? 'Lower'
    : null;

  const currentVal   = val2025 ?? val2023;
  const currentYear  = val2025 ? '2025' : '2023';
  const refSt        = currentVal ? refStatus(currentVal, refLow, refHigh) : 'unavailable';
  const refLabel     = refStatusLabel(refSt);
  const refSentence  = currentVal
    ? refContextSentence(refSt, currentYear)
    : 'No current value available.';

  const refBadgeColor =
    refSt === 'within'      ? colors.positive
    : refSt === 'unavailable' ? colors.textSubtle
    : colors.warning;

  const refRangeText =
    (refLow || refHigh)
      ? `${refLow || '—'} – ${refHigh || '—'} ${unit}`
      : null;

  return (
    <View style={[s.compareCard, { borderColor: colors.border }]}>
      <View style={s.compareTop}>
        <View style={s.compareLeft}>
          <Text style={[s.compareLabel, { color: colors.text }]}>{label}</Text>
          <Text style={[s.compareUnit, { color: colors.textSubtle }]}>{unit}</Text>
        </View>
        <View style={s.compareValues}>
          <View style={s.compareValueCol}>
            <Text style={[s.compareYear, { color: colors.textSubtle }]}>2023</Text>
            <Text style={[s.compareValue, { color: val2023 ? colors.textMuted : colors.textSubtle }]}>
              {val2023 || '—'}
            </Text>
          </View>
          <View style={s.compareValueCol}>
            <Text style={[s.compareYear, { color: colors.textSubtle }]}>2025</Text>
            <Text style={[s.compareValue, { color: val2025 ? colors.text : colors.textSubtle }]}>
              {val2025 || '—'}
            </Text>
          </View>
          <View style={s.compareDeltaCol}>
            {delta !== null && directionLabel ? (
              <>
                <Ionicons name={directionIcon} size={13} color={directionColor} />
                <Text style={[s.compareDelta, { color: directionColor }]}>
                  {delta > 0 ? '+' : ''}{delta.toFixed(2)}
                </Text>
                <Text style={[s.compareDir, { color: directionColor }]}>{directionLabel}</Text>
              </>
            ) : (
              <Text style={[s.compareDir, { color: colors.textSubtle }]}>No trend</Text>
            )}
          </View>
        </View>
      </View>

      {context && (
        <>
          <Pressable
            onPress={() => setExpanded((e) => !e)}
            style={[s.contextToggle, { borderTopColor: colors.borderSubtle }]}
            accessibilityLabel={expanded ? 'Hide context' : 'Show context'}
          >
            <Text style={[s.contextToggleText, { color: colors.textSubtle }]}>
              {expanded ? 'Hide context' : 'Context'}
            </Text>
            <Ionicons
              name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={12}
              color={colors.textSubtle}
            />
          </Pressable>

          {expanded && (
            <View style={[s.contextBlock, { borderTopColor: colors.borderSubtle }]}>
              <Text style={[s.contextWhat, { color: colors.textMuted }]}>{context.what}</Text>

              {/* Trend */}
              {!val2023 || !val2025 ? (
                <View style={s.contextRow}>
                  <Ionicons name="git-branch-outline" size={11} color={colors.textSubtle} />
                  <Text style={[s.contextBody, { color: colors.textSubtle }]}>
                    Trend context not available — only one panel contains this marker. The available value can serve as a baseline for future comparisons.
                  </Text>
                </View>
              ) : (
                <View style={s.contextRow}>
                  <Ionicons name={directionIcon} size={11} color={directionColor} />
                  <Text style={[s.contextBody, { color: colors.textSubtle }]}>
                    Trend context: 2025 value is {directionLabel?.toLowerCase() ?? 'changed'} than 2023
                    {delta !== null ? ` (${delta > 0 ? '+' : ''}${delta.toFixed(2)} ${unit})` : ''}.
                    {' '}Useful to review alongside training load and recovery over time.
                  </Text>
                </View>
              )}

              {/* Reference context block */}
              <View style={[s.refContextBlock, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
                <View style={s.refContextHeader}>
                  <Text style={[s.refContextLabel, { color: refBadgeColor }]}>{refLabel}</Text>
                  {refRangeText && (
                    <Text style={[s.refRangeText, { color: colors.textSubtle }]}>Range: {refRangeText}</Text>
                  )}
                </View>
                <Text style={[s.refContextSentence, { color: colors.textMuted }]}>{refSentence}</Text>
              </View>

              {/* Performance angle */}
              <View style={s.contextRow}>
                <Ionicons name="pulse-outline" size={11} color={colors.textSubtle} />
                <Text style={[s.contextBody, { color: colors.textSubtle }]}>{context.performanceAngle}</Text>
              </View>

              {/* Support focus */}
              <View style={s.contextRow}>
                <Ionicons name="leaf-outline" size={11} color={colors.textSubtle} />
                <Text style={[s.contextBody, { color: colors.textSubtle }]}>
                  Support focus: {context.lifestyle}
                </Text>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// MarkerRow
// ---------------------------------------------------------------------------
function MarkerRow({
  marker, isLast, isEditing, inputRef,
  onStartEdit, onEndEdit, onChangeValue, onToggle, colors,
}: {
  marker: BloodMarker;
  isLast: boolean;
  isEditing: boolean;
  inputRef?: React.RefObject<TextInput | null>;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onChangeValue: (val: string) => void;
  onToggle: (enabled: boolean) => void;
  colors: ThemeColors;
}) {
  const disabled = !marker.enabled;
  const missingValue = marker.enabled && marker.value.trim() === '';

  // Toggle colour semantics:
  //   enabled + value present → positive (active, included)
  //   enabled + missing value → warning (needs a value)
  //   disabled                 → muted   (excluded)
  // Reference-range status (above/below/within) is handled in analysis,
  // never on the toggle itself.
  const thumbColor =
    disabled        ? colors.textSubtle
    : missingValue  ? colors.warning
    :                 colors.positive;
  const trackTrueColor = missingValue ? colors.warningSoft : colors.scoreStrongSoft;

  return (
    <View style={[
      rowStyles.row,
      !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSubtle },
      disabled && rowStyles.rowDisabled,
    ]}>
      <View style={rowStyles.left}>
        <Text style={[rowStyles.label, { color: disabled ? colors.textSubtle : colors.textMuted }]}>{marker.label}</Text>
        <Text style={[rowStyles.unit, { color: colors.textSubtle }]}>{marker.unit}</Text>
      </View>
      <View style={rowStyles.middle}>
        {disabled ? (
          <Text style={[rowStyles.excluded, { color: colors.textSubtle }]}>Excluded</Text>
        ) : isEditing ? (
          <TextInput
            ref={inputRef}
            value={marker.value}
            onChangeText={onChangeValue}
            onBlur={onEndEdit}
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={onEndEdit}
            selectTextOnFocus
            style={[rowStyles.input, { color: colors.accent, borderBottomColor: colors.accentBorder, borderBottomWidth: 1 }]}
            accessibilityLabel={`Edit ${marker.label}`}
          />
        ) : (
          <Pressable onPress={onStartEdit} hitSlop={8}>
            <Text style={[rowStyles.value, { color: missingValue ? colors.warning : colors.text }]}>
              {missingValue ? 'Add value' : marker.value}
            </Text>
          </Pressable>
        )}
      </View>
      <Switch
        value={marker.enabled}
        onValueChange={onToggle}
        trackColor={{ false: colors.progressTrack, true: trackTrueColor }}
        thumbColor={thumbColor}
        accessibilityLabel={`${marker.enabled ? 'Disable' : 'Enable'} ${marker.label}`}
        style={rowStyles.toggle}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const rowStyles = StyleSheet.create({
  row:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2, gap: spacing.sm },
  rowDisabled: { opacity: 0.45 },
  left:        { flex: 3, gap: 1 },
  label:       { fontSize: typography.bodySmall, fontWeight: '500' },
  unit:        { fontSize: typography.micro },
  middle:      { flex: 2, alignItems: 'flex-end' },
  value:       { fontSize: typography.bodySmall, fontWeight: '600' },
  input:       { fontSize: typography.bodySmall, fontWeight: '600', textAlign: 'right', minWidth: 64, paddingVertical: 2 },
  excluded:    { fontSize: typography.caption, fontStyle: 'italic' },
  toggle:      { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
});

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea:       { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderSubtle,
      gap: spacing.sm,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingRight: spacing.xs,
      minWidth: 80,
    },
    backLabel:      { fontSize: typography.bodySmall, fontWeight: '600' },
    headerCenter:   { flex: 1, gap: 1 },
    headerTitle:    { color: colors.text, fontSize: typography.subtitle, fontWeight: '800', letterSpacing: -0.2 },
    headerSub:      { color: colors.textSubtle, fontSize: typography.micro, lineHeight: lineHeights.caption },
    saveBtn:        { paddingHorizontal: spacing.md, paddingVertical: spacing.sm - 2, borderRadius: radius.pill, backgroundColor: colors.accent },
    saveBtnDisabled:{ opacity: 0.5 },
    saveBtnText:    { color: '#FFFFFF', fontSize: typography.bodySmall, fontWeight: '700' },
    savedIndicator: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: spacing.sm },
    savedText:      { fontSize: typography.caption, fontWeight: '600' },
    tabRow:         { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
    tab:            { flex: 1, alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabText:        { fontSize: typography.bodySmall },
    infoBanner:     { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
    infoBannerText: { fontSize: typography.micro, flex: 1, lineHeight: lineHeights.caption },
    scroll:         { alignItems: 'center', paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
    container:      { width: '100%', maxWidth: layout.maxWidth, paddingHorizontal: layout.screenPaddingH, gap: spacing.lg },
    card:           { borderRadius: radius.md, backgroundColor: colors.surfaceElevated, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
    sectionLabel:   { fontSize: typography.caption, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, paddingLeft: 2 },
    uploadSection:  { gap: spacing.sm },
    uploadRow:      { flexDirection: 'row', gap: spacing.sm },
    uploadBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderWidth: 1, borderRadius: radius.md, paddingVertical: spacing.sm + 2 },
    uploadBtnText:  { fontSize: typography.caption, fontWeight: '600' },
    uploadNote:     { fontSize: typography.micro, lineHeight: lineHeights.caption, fontStyle: 'italic' },
    footer:         { fontSize: typography.micro, lineHeight: lineHeights.caption, textAlign: 'center', paddingHorizontal: spacing.xl },
    // CompareCard
    compareCard:    { borderRadius: radius.md, backgroundColor: colors.surfaceElevated, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
    compareTop:     { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
    compareLeft:    { flex: 2, gap: 2 },
    compareLabel:   { fontSize: typography.bodySmall, fontWeight: '600', letterSpacing: -0.1 },
    compareUnit:    { fontSize: typography.micro },
    compareValues:  { flex: 3, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    compareValueCol:{ flex: 1, alignItems: 'center', gap: 2 },
    compareYear:    { fontSize: typography.micro, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
    compareValue:   { fontSize: typography.bodySmall, fontWeight: '700' },
    compareDeltaCol:{ flex: 1, alignItems: 'center', gap: 1 },
    compareDelta:   { fontSize: typography.caption, fontWeight: '700' },
    compareDir:     { fontSize: typography.micro, fontWeight: '600' },
    contextToggle:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
    contextToggleText: { fontSize: typography.caption, fontWeight: '600' },
    contextBlock:   { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.sm, gap: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
    contextWhat:    { fontSize: typography.caption, lineHeight: lineHeights.caption, fontStyle: 'italic' },
    contextRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
    contextBody:    { fontSize: typography.caption, lineHeight: lineHeights.caption, flex: 1 },
    refContextBlock:   { borderRadius: radius.sm, borderWidth: StyleSheet.hairlineWidth, padding: spacing.sm, gap: 4 },
    refContextHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    refContextLabel:   { fontSize: typography.caption, fontWeight: '700' },
    refRangeText:      { fontSize: typography.micro },
    refContextSentence:{ fontSize: typography.caption, lineHeight: lineHeights.caption },
    // CompareSummary
    summaryCard:    { borderRadius: radius.md, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
    summaryHeader:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    summaryTitle:   { fontSize: typography.bodySmall, fontWeight: '700', flex: 1 },
    summaryBadge:   { borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 2 },
    summaryBadgeText: { fontSize: typography.micro, fontWeight: '600' },
    summaryPills:   { flexDirection: 'row', gap: spacing.sm },
    pill:           { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
    pillNum:        { fontSize: typography.subtitle, fontWeight: '800', letterSpacing: -0.5 },
    pillLabel:      { fontSize: typography.micro, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
    summaryDivider: { height: 1, marginVertical: 2 },
    summaryLines:   { gap: spacing.sm },
    summaryLine:    { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
    summaryLineText:{ fontSize: typography.caption, lineHeight: lineHeights.caption, flex: 1 },
  });
}
