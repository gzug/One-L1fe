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

type Props = { onClose: () => void };

export function BloodResultsScreen({ onClose }: Props) {
  const { colors } = useTheme();
  const [panels, setPanels]           = useState<BloodPanel[]>([]);
  const [activeTab, setActiveTab]     = useState<string>('');
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [dirty, setDirty]             = useState(false);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const inputRef                      = useRef<TextInput>(null);
  const s                             = createStyles(colors);

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
        panel.id !== activeTab
          ? panel
          : {
              ...panel,
              markers: panel.markers.map((m) =>
                m.id === markerId ? { ...m, value } : m,
              ),
            },
      ),
    );
    setDirty(true);
  }

  function toggleMarker(markerId: string, enabled: boolean) {
    setPanels((prev) =>
      prev.map((panel) =>
        panel.id !== activeTab
          ? panel
          : {
              ...panel,
              markers: panel.markers.map((m) =>
                m.id === markerId ? { ...m, enabled } : m,
              ),
            },
      ),
    );
    setDirty(true);
  }

  const handleSave = useCallback(async () => {
    // Validate: enabled markers must have a non-empty value
    const current = panels.find((p) => p.id === activeTab);
    if (current) {
      const invalid = current.markers.filter(
        (m) => m.enabled && m.value.trim() === '',
      );
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
          <Text style={s.headerSub}>Local data · device only</Text>
        </View>
        {dirty ? (
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[s.saveBtn, saving && s.saveBtnDisabled]}
            accessibilityLabel="Save changes"
          >
            {saving
              ? <ActivityIndicator size="small" color={colors.accent} />
              : <Text style={s.saveBtnText}>Save</Text>
            }
          </Pressable>
        ) : (
          <View style={s.savedIndicator}>
            <Ionicons name="checkmark" size={14} color={colors.positive} />
            <Text style={s.savedText}>Saved</Text>
          </View>
        )}
      </View>

      {/* Panel tabs */}
      <View style={s.tabRow}>
        {panels.map((panel) => (
          <Pressable
            key={panel.id}
            onPress={() => setActiveTab(panel.id)}
            style={[
              s.tab,
              activeTab === panel.id && { borderBottomColor: colors.accent, borderBottomWidth: 2 },
            ]}
          >
            <Text
              style={[
                s.tabText,
                activeTab === panel.id
                  ? { color: colors.accent, fontWeight: '700' }
                  : { color: colors.textMuted },
              ]}
            >
              {panel.dateLabel}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Info banner */}
      <View style={[s.infoBanner, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
        <Ionicons name="information-circle-outline" size={13} color={colors.textSubtle} />
        <Text style={[s.infoBannerText, { color: colors.textSubtle }]}>
          Demo seed values. Tap any value to edit. Toggle to exclude a marker — excluded markers are not treated as missing.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.container}>
          {/* Markers */}
          {activePanel && (
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
          )}

          {/* Upload actions */}
          <View style={s.uploadSection}>
            <Text style={[s.uploadLabel, { color: colors.textSubtle }]}>Import</Text>
            <View style={s.uploadRow}>
              <Pressable
                onPress={handleUploadAction}
                style={[s.uploadBtn, { borderColor: colors.border }]}
              >
                <Ionicons name="document-outline" size={14} color={colors.textMuted} />
                <Text style={[s.uploadBtnText, { color: colors.textMuted }]}>Upload PDF</Text>
              </Pressable>
              <Pressable
                onPress={handleUploadAction}
                style={[s.uploadBtn, { borderColor: colors.border }]}
              >
                <Ionicons name="camera-outline" size={14} color={colors.textMuted} />
                <Text style={[s.uploadBtnText, { color: colors.textMuted }]}>Upload photo</Text>
              </Pressable>
            </View>
            <Text style={[s.uploadNote, { color: colors.textSubtle }]}>
              Import review is planned. Values must be reviewed before saving. Not active in prototype.
            </Text>
          </View>

          <Text style={[s.footer, { color: colors.textSubtle }]}>
            Values are context only. Not a diagnosis. Consult your doctor for medical interpretation.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// MarkerRow
// ---------------------------------------------------------------------------
function MarkerRow({
  marker,
  isLast,
  isEditing,
  inputRef,
  onStartEdit,
  onEndEdit,
  onChangeValue,
  onToggle,
  colors,
}: {
  marker: BloodMarker;
  isLast: boolean;
  isEditing: boolean;
  inputRef?: React.RefObject<TextInput>;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onChangeValue: (val: string) => void;
  onToggle: (enabled: boolean) => void;
  colors: ThemeColors;
}) {
  const disabled = !marker.enabled;
  return (
    <View
      style={[
        rowStyles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSubtle },
        disabled && rowStyles.rowDisabled,
      ]}
    >
      {/* Label + unit */}
      <View style={rowStyles.left}>
        <Text
          style={[
            rowStyles.label,
            { color: disabled ? colors.textSubtle : colors.textMuted },
          ]}
        >
          {marker.label}
        </Text>
        <Text style={[rowStyles.unit, { color: colors.textSubtle }]}>
          {marker.unit}
        </Text>
      </View>

      {/* Value */}
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
            style={[
              rowStyles.input,
              {
                color: colors.accent,
                borderBottomColor: colors.accentBorder,
                borderBottomWidth: 1,
              },
            ]}
            accessibilityLabel={`Edit ${marker.label}`}
          />
        ) : (
          <Pressable onPress={onStartEdit} hitSlop={8}>
            <Text
              style={[
                rowStyles.value,
                {
                  color:
                    marker.value.trim() === ''
                      ? colors.textSubtle
                      : colors.text,
                },
              ]}
            >
              {marker.value.trim() === '' ? 'Add value' : marker.value}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Enable/disable toggle */}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  rowDisabled: { opacity: 0.45 },
  left: { flex: 3, gap: 1 },
  label: { fontSize: typography.bodySmall, fontWeight: '500' },
  unit: { fontSize: typography.micro },
  middle: { flex: 2, alignItems: 'flex-end' },
  value: { fontSize: typography.bodySmall, fontWeight: '600' },
  input: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    textAlign: 'right',
    minWidth: 64,
    paddingVertical: 2,
  },
  excluded: { fontSize: typography.caption, fontStyle: 'italic' },
  toggle: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
});

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderSubtle,
      gap: spacing.sm,
    },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flex: 1, gap: 1 },
    headerTitle: {
      color: colors.text,
      fontSize: typography.subtitle,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
    headerSub: { color: colors.textSubtle, fontSize: typography.micro },
    saveBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm - 2,
      borderRadius: radius.pill,
      backgroundColor: colors.accent,
    },
    saveBtnDisabled: { opacity: 0.5 },
    saveBtnText: {
      color: '#FFFFFF',
      fontSize: typography.bodySmall,
      fontWeight: '700',
    },
    savedIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: spacing.sm,
    },
    savedText: { color: colors.positive, fontSize: typography.caption, fontWeight: '600' },
    tabRow: {
      flexDirection: 'row',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabText: { fontSize: typography.bodySmall },
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    infoBannerText: { fontSize: typography.micro, flex: 1, lineHeight: lineHeights.caption },
    scroll: { alignItems: 'center', paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
    container: {
      width: '100%',
      maxWidth: layout.maxWidth,
      paddingHorizontal: layout.screenPaddingH,
      gap: spacing.lg,
    },
    card: {
      borderRadius: radius.md,
      backgroundColor: colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      overflow: 'hidden',
    },
    uploadSection: { gap: spacing.sm },
    uploadLabel: {
      fontSize: typography.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      paddingLeft: 2,
    },
    uploadRow: { flexDirection: 'row', gap: spacing.sm },
    uploadBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      borderWidth: 1,
      borderRadius: radius.md,
      paddingVertical: spacing.sm + 2,
    },
    uploadBtnText: { fontSize: typography.caption, fontWeight: '600' },
    uploadNote: {
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
      fontStyle: 'italic',
    },
    footer: {
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
      textAlign: 'center',
      paddingHorizontal: spacing.xl,
    },
  });
}
