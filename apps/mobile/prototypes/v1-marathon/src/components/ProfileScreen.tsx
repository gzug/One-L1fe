import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { layout, lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import { profileFields, connectedSources, bloodPanels } from '../data/demoData';
import type { ConnectedSource, ProfileField } from '../data/demoData';
import { prototypeCopy } from '../data/copy';
import {
  checkHealthConnect,
  requestHealthConnect,
  openHealthConnectSettings,
  statusLabel as hcStatusLabel,
} from '../data/healthConnect';
import type { HealthConnectState } from '../data/healthConnect';

// Android: header must clear status bar
const ANDROID_TOP_INSET =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

type ProfileScreenProps = {
  onClose: () => void;
  onViewBlood: () => void;
};

const personalKeys  = ['name', 'age', 'gender', 'height', 'weight'];
const trainingKeys  = ['goal_race', 'race_date', 'level', 'volume', 'long_run', 'train_days'];
const prefKeys      = ['units', 'pace_fmt'];

type SectionDef = { title: string; keys: string[] };
const sectionDefs: SectionDef[] = [
  { title: 'Personal',    keys: personalKeys },
  { title: 'Training',    keys: trainingKeys },
  { title: 'Preferences', keys: prefKeys },
];

function fieldsByKeys(keys: string[]): ProfileField[] {
  return keys
    .map((k) => profileFields.find((f) => f.key === k))
    .filter((f): f is ProfileField => f !== undefined);
}

export function ProfileScreen({ onClose, onViewBlood }: ProfileScreenProps) {
  const { colors } = useTheme();
  const [editMode, setEditMode] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    () => Object.fromEntries(profileFields.map((f) => [f.key, f.value])),
  );
  const [hcState, setHcState] = useState<HealthConnectState>({ status: 'error', granted: [] });
  const [hcBusy,  setHcBusy]  = useState(false);
  const s = createStyles(colors);

  useEffect(() => {
    let cancelled = false;
    checkHealthConnect().then((state) => { if (!cancelled) setHcState(state); });
    return () => { cancelled = true; };
  }, []);

  async function onHealthConnectPress() {
    if (hcBusy) return;
    setHcBusy(true);
    try {
      if (hcState.status === 'connected') {
        await openHealthConnectSettings();
        const fresh = await checkHealthConnect();
        setHcState(fresh);
      } else if (hcState.status === 'available_no_permissions' || hcState.status === 'error') {
        const requested = await requestHealthConnect();
        setHcState(requested);
      } else {
        // unavailable / provider_update_required / unsupported_platform — open settings best-effort
        await openHealthConnectSettings();
      }
    } finally {
      setHcBusy(false);
    }
  }

  function updateField(key: string, val: string) {
    setFieldValues((prev) => ({ ...prev, [key]: val }));
  }

  return (
    <SafeAreaView style={s.safeArea}>
      {/* Header — paddingTop covers Android status bar */}
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
          <Text style={s.headerTitle}>Profile</Text>
          <Text style={s.headerSub}>One L1fe · V1 — Marathon</Text>
        </View>
        <Pressable
          onPress={() => setEditMode((e) => !e)}
          style={[s.editBtn, editMode && s.editBtnActive]}
          hitSlop={8}
          accessibilityLabel={editMode ? 'Done editing' : 'Edit profile'}
        >
          <Text style={[s.editBtnText, editMode && s.editBtnTextActive]}>
            {editMode ? 'Done' : 'Edit'}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.container}>
          {/* Demo banner */}
          <View style={s.demoBanner}>
            <Text style={s.demoBannerText}>
              Profile values are demo data. Real data will sync from your account and connected sources in the full product.
            </Text>
          </View>

          {/* Profile sections */}
          {sectionDefs.map((section) => (
            <View key={section.title} style={s.section}>
              <Text style={s.sectionTitle}>{section.title}</Text>
              <ProfileSection
                title={section.title}
                fields={fieldsByKeys(section.keys)}
                editMode={editMode}
                fieldValues={fieldValues}
                onChangeField={updateField}
                colors={colors}
              />
            </View>
          ))}

          {/* Connected sources */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Connected sources</Text>
            <View style={[s.card]}>
              {connectedSources.map((source, i) => (
                <SourceRow
                  key={source.id}
                  source={source}
                  isLast={i === connectedSources.length - 1}
                  colors={colors}
                  hcState={hcState}
                  hcBusy={hcBusy}
                  onHealthConnectPress={onHealthConnectPress}
                />
              ))}
            </View>
          </View>

          {/* Blood panels — tappable rows → BloodResultsScreen */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Blood panels on file</Text>
            <View style={[s.card]}>
              {bloodPanels.map((panel, i) => (
                <Pressable
                  key={panel.id}
                  onPress={onViewBlood}
                  style={[
                    s.panelRow,
                    i < bloodPanels.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.profileRowBorder,
                    },
                  ]}
                  accessibilityLabel={`View ${panel.label} blood panel`}
                >
                  <View style={s.panelLeft}>
                    <Text style={[s.rowLabel, { color: colors.text }]}>{panel.label}</Text>
                    <Text style={s.panelMeta}>
                      {panel.dateLabel} · {panel.markerCount} markers
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={colors.textSubtle} />
                </Pressable>
              ))}
              <View style={s.panelActions}>
                <Pressable
                  style={[s.uploadBtn, { borderColor: colors.border }]}
                  onPress={() => {}}
                  accessibilityLabel="Upload PDF"
                >
                  <Ionicons name="document-outline" size={12} color={colors.textMuted} />
                  <Text style={[s.uploadBtnText, { color: colors.textMuted }]}>
                    {prototypeCopy.bloodPanelsUploadPdf}
                  </Text>
                </Pressable>
                <Pressable
                  style={[s.uploadBtn, { borderColor: colors.border }]}
                  onPress={() => {}}
                  accessibilityLabel="Upload photo"
                >
                  <Ionicons name="camera-outline" size={12} color={colors.textMuted} />
                  <Text style={[s.uploadBtnText, { color: colors.textMuted }]}>
                    {prototypeCopy.bloodPanelsUploadPhoto}
                  </Text>
                </Pressable>
              </View>
              <View style={s.panelProtoNote}>
                <Ionicons name="information-circle-outline" size={12} color={colors.textSubtle} />
                <Text style={s.panelProtoNoteText}>{prototypeCopy.bloodPanelsProtoNote}</Text>
              </View>
            </View>
          </View>

          <Text style={s.footer}>
            One L1fe does not store or transmit profile data in prototype mode.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ProfileSection -------------------------------------------------
function ProfileSection({
  title,
  fields,
  editMode,
  fieldValues,
  onChangeField,
  colors,
}: {
  title: string;
  fields: ProfileField[];
  editMode: boolean;
  fieldValues: Record<string, string>;
  onChangeField: (key: string, val: string) => void;
  colors: ThemeColors;
}) {
  const s = createStyles(colors);
  return (
    <View style={s.card}>
      {fields.map((field, i) => (
        <View key={field.key} style={[s.row, i < fields.length - 1 && s.rowBorder]}>
          <Text style={s.rowLabel}>{field.label}</Text>
          <View style={s.rowRight}>
            {editMode && field.editable ? (
              <TextInput
                value={fieldValues[field.key] ?? field.value}
                onChangeText={(val) => onChangeField(field.key, val)}
                style={[s.inlineInput, { color: colors.accent, borderBottomColor: colors.accentBorder }]}
                selectTextOnFocus
                returnKeyType="done"
                accessibilityLabel={`Edit ${field.label}`}
              />
            ) : (
              <Text style={s.rowValue}>{fieldValues[field.key] ?? field.value}</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// --- SourceRow -------------------------------------------------------
function SourceRow({
  source, isLast, colors, hcState, hcBusy, onHealthConnectPress,
}: {
  source: ConnectedSource;
  isLast: boolean;
  colors: ThemeColors;
  hcState: HealthConnectState;
  hcBusy: boolean;
  onHealthConnectPress: () => void;
}) {
  const s = createStyles(colors);
  const isOnFile = source.status === 'prototype_only';

  // Per-source state resolution
  let statusLine = source.statusLabel;
  let actionLabel = source.actionLabel;
  let onPress: (() => void) | undefined;
  let dotColor = colors.textSubtle;
  let actionTone: 'accent' | 'muted' = 'accent';

  if (source.id === 'health_connect') {
    statusLine = hcStatusLabel(hcState);
    if (hcState.status === 'connected') {
      actionLabel = 'Manage';
      dotColor = colors.positive;
    } else if (hcState.status === 'available_no_permissions' || hcState.status === 'error') {
      actionLabel = 'Connect';
      dotColor = colors.warning;
    } else if (hcState.status === 'provider_update_required') {
      actionLabel = 'Update';
      dotColor = colors.warning;
    } else if (hcState.status === 'unavailable') {
      actionLabel = 'Install';
      dotColor = colors.textSubtle;
    } else {
      actionLabel = 'Open';
      actionTone = 'muted';
    }
    onPress = onHealthConnectPress;
  } else if (source.id === 'garmin') {
    actionTone = 'muted';
    dotColor = colors.textSubtle;
    actionLabel = 'Health Connect';
    onPress = onHealthConnectPress;
  } else if (source.id === 'strava') {
    actionTone = 'muted';
    dotColor = colors.textSubtle;
  } else if (source.id === 'blood_panels') {
    dotColor = colors.positive;
  }

  const actionStyle = actionTone === 'accent'
    ? { borderColor: colors.accentBorder, backgroundColor: 'transparent' as const }
    : { borderColor: colors.borderSubtle, backgroundColor: 'transparent' as const };
  const actionTextColor = actionTone === 'accent' ? colors.accent : colors.textSubtle;
  const disabled = source.id === 'strava' || hcBusy;

  return (
    <View
      style={[
        s.sourceRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.profileRowBorder },
      ]}
    >
      <View style={s.sourceLeft}>
        <View style={s.sourceLabelRow}>
          <View style={[s.sourceDot, { backgroundColor: dotColor }]} />
          <Text style={s.rowLabel}>{source.label}</Text>
        </View>
        <Text style={isOnFile ? s.sourceOnFile : s.sourceMuted}>{statusLine}</Text>
        {source.note ? <Text style={s.sourceNote}>{source.note}</Text> : null}
      </View>
      <Pressable
        style={[s.sourceAction, actionStyle, disabled && { opacity: 0.5 }]}
        onPress={onPress}
        disabled={disabled || !onPress}
        accessibilityLabel={`${source.label}: ${actionLabel}`}
      >
        <Text style={[s.sourceActionText, { color: actionTextColor }]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

// --- Styles ----------------------------------------------------------
function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
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
    backLabel: {
      fontSize: typography.bodySmall,
      fontWeight: '600',
    },
    headerCenter: { flex: 1, gap: 1 },
    headerTitle:  { color: colors.text, fontSize: typography.subtitle, fontWeight: '800', letterSpacing: -0.2 },
    headerSub:    { color: colors.textSubtle, fontSize: typography.micro },
    editBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm - 2,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    editBtnActive:     { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft },
    editBtnText:       { color: colors.textMuted, fontSize: typography.bodySmall, fontWeight: '600' },
    editBtnTextActive: { color: colors.accent },
    scroll:    { alignItems: 'center', paddingVertical: spacing.xl, paddingBottom: spacing.xxxl },
    container: { width: '100%', maxWidth: layout.maxWidth, paddingHorizontal: layout.screenPaddingH, gap: spacing.xl },
    demoBanner: {
      borderRadius: radius.md,
      backgroundColor: colors.demoBanner,
      borderWidth: 1,
      borderColor: colors.demoBannerBorder,
      padding: spacing.md,
    },
    demoBannerText: { color: colors.textMuted, fontSize: typography.caption, lineHeight: lineHeights.caption },
    section:      { gap: spacing.sm },
    sectionTitle: { color: colors.textSubtle, fontSize: typography.caption, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, paddingLeft: 2 },
    card:         { borderRadius: radius.md, backgroundColor: colors.profileSectionBg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    row:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.lg },
    rowBorder:    { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.profileRowBorder },
    rowLabel:     { color: colors.textMuted, fontSize: typography.bodySmall, fontWeight: '500', flex: 1 },
    rowRight:     { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 2, justifyContent: 'flex-end' },
    rowValue:     { color: colors.text, fontSize: typography.bodySmall, fontWeight: '600', textAlign: 'right', flexShrink: 1 },
    inlineInput:  { fontSize: typography.bodySmall, fontWeight: '600', textAlign: 'right', borderBottomWidth: 1, paddingVertical: 2, minWidth: 80, flexShrink: 1 },
    sourceRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
    sourceLeft:   { flex: 1, gap: 2 },
    sourceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    sourceDot:    { width: 6, height: 6, borderRadius: 3 },
    sourceMuted:  { color: colors.textSubtle, fontSize: typography.micro },
    sourceOnFile: { color: colors.positive, fontSize: typography.micro, fontWeight: '600' },
    sourceNote:   { color: colors.textSubtle, fontSize: typography.micro, opacity: 0.7 },
    sourceAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, flexShrink: 0 },
    sourceActionText: { color: colors.accent, fontSize: typography.micro, fontWeight: '700', letterSpacing: 0.2 },
    panelRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    panelLeft:        { flex: 1, gap: 3 },
    panelMeta:        { color: colors.textSubtle, fontSize: typography.micro },
    panelActions:     { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.profileRowBorder },
    uploadBtn:        { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 1 },
    uploadBtnText:    { fontSize: typography.micro, fontWeight: '600' },
    panelProtoNote:   { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.profileRowBorder, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
    panelProtoNoteText: { color: colors.textSubtle, fontSize: typography.micro, opacity: 0.8 },
    footer:           { color: colors.textSubtle, fontSize: typography.micro, lineHeight: lineHeights.caption, textAlign: 'center', paddingHorizontal: spacing.xl },
  });
}
