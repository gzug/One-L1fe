import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
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
      <View style={s.header}>
        <Pressable onPress={onClose} style={s.backBtn} hitSlop={8} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Blood Results</Text>
          <Text style={s.headerSub}>
            {viewMode === 'compare'
              ? 'Comparing one blood panel from 2023 with one from 2025'
              : 'One blood panel is available for each year'}
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
            Comparing one blood panel from 2023 with one blood panel from 2025. Context only — not a diagnosis.
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
            Values are context only. Not a diagnosis. Consult your doctor for medical interpretation.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  label, unit, val2023, val2025, delta, direction, context, colors,
}: {
  label: string;
  unit: string;
  val2023: string | null;
  val2025: string | null;
  delta: number | null;
  direction: 'higher' | 'lower' | 'stable' | null;
  context: ReturnType<typeof getMarkerContext>;
  colors: ThemeColors;
}) {
  const s = createStyles(colors);
  const [expanded, setExpanded] = useState(false);

  const directionColor =
    direction === 'stable' ? colors.textSubtle
    : direction === 'higher' ? colors.warning
    : direction === 'lower'  ? colors.positive
    : colors.textSubtle;

  const directionIcon =
    direction === 'stable' ? 'remove-outline'
    : direction === 'higher' ? 'arrow-up-outline'
    : 'arrow-down-outline';

  const directionLabel =
    direction === 'stable' ? 'Stable'
    : direction === 'higher' ? 'Higher'
    : direction === 'lower'  ? 'Lower'
    : null;

  const noTrend = !val2023 || !val2025;

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
                <Ionicons name={directionIcon as any} size={13} color={directionColor} />
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
              {noTrend ? (
                <View style={s.contextRow}>
                  <Ionicons name="git-branch-outline" size={11} color={colors.textSubtle} />
                  <Text style={[s.contextBody, { color: colors.textSubtle }]}>
                    No trend is shown because only one panel contains this marker. The available value can serve as baseline context for future comparisons.
                  </Text>
                </View>
              ) : (
                <View style={s.contextRow}>
                  <Ionicons name={directionIcon as any} size={11} color={directionColor} />
                  <Text style={[s.contextBody, { color: colors.textSubtle }]}>
                    The 2025 value is {directionLabel?.toLowerCase() ?? 'changed'} than 2023
                    {delta !== null ? ` (${delta > 0 ? '+' : ''}${delta.toFixed(2)} ${unit})` : ''}.
                    {' '}This is useful context for tracking over time.
                  </Text>
                </View>
              )}
              <View style={s.contextRow}>
                <Ionicons name="pulse-outline" size={11} color={colors.textSubtle} />
                <Text style={[s.contextBody, { color: colors.textSubtle }]}>{context.performanceAngle}</Text>
              </View>
              <View style={s.contextRow}>
                <Ionicons name="leaf-outline" size={11} color={colors.textSubtle} />
                <Text style={[s.contextBody, { color: colors.textSubtle }]}>{context.lifestyle}</Text>
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
            <Text style={[rowStyles.value, { color: marker.value.trim() === '' ? colors.textSubtle : colors.text }]}>
              {marker.value.trim() === '' ? 'Add value' : marker.value}
            </Text>
          </Pressable>
        )}
      </View>
      <Switch
        value={marker.enabled}
        onValueChange={onToggle}
        trackColor={{ false: colors.progressTrack, true: colors.accentSoft }}
        thumbColor={marker.enabled ? colors.accent : colors.textSubtle}
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
    safeArea:          { flex: 1, backgroundColor: colors.background },
    header:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSubtle, gap: spacing.sm },
    backBtn:           { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    headerCenter:      { flex: 1, gap: 1 },
    headerTitle:       { color: colors.text, fontSize: typography.subtitle, fontWeight: '800', letterSpacing: -0.2 },
    headerSub:         { color: colors.textSubtle, fontSize: typography.micro, lineHeight: lineHeights.caption },
    saveBtn:           { paddingHorizontal: spacing.md, paddingVertical: spacing.sm - 2, borderRadius: radius.pill, backgroundColor: colors.accent },
    saveBtnDisabled:   { opacity: 0.5 },
    saveBtnText:       { color: '#FFFFFF', fontSize: typography.bodySmall, fontWeight: '700' },
    savedIndicator:    { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: spacing.sm },
    savedText:         { fontSize: typography.caption, fontWeight: '600' },
    tabRow:            { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
    tab:               { flex: 1, alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabText:           { fontSize: typography.bodySmall },
    infoBanner:        { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
    infoBannerText:    { fontSize: typography.micro, flex: 1, lineHeight: lineHeights.caption },
    scroll:            { alignItems: 'center', paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
    container:         { width: '100%', maxWidth: layout.maxWidth, paddingHorizontal: layout.screenPaddingH, gap: spacing.lg },
    card:              { borderRadius: radius.md, backgroundColor: colors.surfaceElevated, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
    sectionLabel:      { fontSize: typography.caption, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, paddingLeft: 2 },
    uploadSection:     { gap: spacing.sm },
    uploadRow:         { flexDirection: 'row', gap: spacing.sm },
    uploadBtn:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderWidth: 1, borderRadius: radius.md, paddingVertical: spacing.sm + 2 },
    uploadBtnText:     { fontSize: typography.caption, fontWeight: '600' },
    uploadNote:        { fontSize: typography.micro, lineHeight: lineHeights.caption, fontStyle: 'italic' },
    footer:            { fontSize: typography.micro, lineHeight: lineHeights.caption, textAlign: 'center', paddingHorizontal: spacing.xl },
    compareCard:       { borderRadius: radius.md, backgroundColor: colors.surfaceElevated, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
    compareTop:        { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
    compareLeft:       { flex: 2, gap: 2 },
    compareLabel:      { fontSize: typography.bodySmall, fontWeight: '600', letterSpacing: -0.1 },
    compareUnit:       { fontSize: typography.micro },
    compareValues:     { flex: 3, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    compareValueCol:   { flex: 1, alignItems: 'center', gap: 2 },
    compareYear:       { fontSize: typography.micro, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
    compareValue:      { fontSize: typography.bodySmall, fontWeight: '700' },
    compareDeltaCol:   { flex: 1, alignItems: 'center', gap: 1 },
    compareDelta:      { fontSize: typography.caption, fontWeight: '700' },
    compareDir:        { fontSize: typography.micro, fontWeight: '600' },
    contextToggle:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
    contextToggleText: { fontSize: typography.caption, fontWeight: '600' },
    contextBlock:      { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.sm, gap: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
    contextWhat:       { fontSize: typography.caption, lineHeight: lineHeights.caption, fontStyle: 'italic' },
    contextRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
    contextBody:       { fontSize: typography.caption, lineHeight: lineHeights.caption, flex: 1 },
  });
}
