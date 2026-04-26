import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { layout, lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import { profileFields, connectedSources } from '../data/demoData';
import type { ConnectedSource, ProfileField } from '../data/demoData';

type ProfileScreenProps = { onClose: () => void };

// Field keys grouped into sections
const personalKeys = ['name', 'age', 'gender', 'height', 'weight'];
const trainingKeys = ['goal_race', 'race_date', 'level', 'volume', 'long_run', 'train_days'];
const prefKeys = ['units', 'pace_fmt'];

type SectionDef = { title: string; keys: string[] };
const sectionDefs: SectionDef[] = [
  { title: 'Personal', keys: personalKeys },
  { title: 'Training', keys: trainingKeys },
  { title: 'Preferences', keys: prefKeys },
];

function fieldsByKeys(keys: string[]): ProfileField[] {
  return keys
    .map((k) => profileFields.find((f) => f.key === k))
    .filter((f): f is ProfileField => f !== undefined);
}

export function ProfileScreen({ onClose }: ProfileScreenProps) {
  const { colors } = useTheme();
  const [editMode, setEditMode] = useState(false);
  const s = createStyles(colors);

  return (
    <SafeAreaView style={s.safeArea}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={onClose} style={s.backBtn} hitSlop={8} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={colors.accent} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Profile</Text>
          <Text style={s.headerSub}>One L1fe \u00b7 V1 \u2014 Marathon</Text>
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
      >
        <View style={s.container}>

          {/* Demo context note */}
          <View style={s.demoBanner}>
            <Text style={s.demoBannerText}>
              Profile values are demo data. Real data will sync from your account and
              connected sources in the full product.
            </Text>
          </View>

          {/* Profile sections */}
          {sectionDefs.map((section) => (
            <ProfileSection
              key={section.title}
              title={section.title}
              fields={fieldsByKeys(section.keys)}
              editMode={editMode}
              colors={colors}
            />
          ))}

          {/* Connected sources */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Connected sources</Text>
            <View style={s.card}>
              {connectedSources.map((source, i) => (
                <SourceRow
                  key={source.id}
                  source={source}
                  isLast={i === connectedSources.length - 1}
                  colors={colors}
                />
              ))}
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

// ─── ProfileSection ─────────────────────────────────────────────────────────
function ProfileSection({
  title,
  fields,
  editMode,
  colors,
}: {
  title: string;
  fields: ProfileField[];
  editMode: boolean;
  colors: ThemeColors;
}) {
  const s = createStyles(colors);
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.card}>
        {fields.map((field, i) => (
          <View
            key={field.key}
            style={[s.row, i < fields.length - 1 && s.rowBorder]}
          >
            <Text style={s.rowLabel}>{field.label}</Text>
            <View style={s.rowRight}>
              <Text
                style={[
                  s.rowValue,
                  editMode && field.editable && s.rowValueEdit,
                ]}
              >
                {field.value}
              </Text>
              {editMode && field.editable && (
                <Ionicons name="pencil-outline" size={11} color={colors.accent} style={s.editIcon} />
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── SourceRow ─────────────────────────────────────────────────────────────────
function SourceRow({
  source,
  isLast,
  colors,
}: {
  source: ConnectedSource;
  isLast: boolean;
  colors: ThemeColors;
}) {
  const s = createStyles(colors);

  const actionIcon = source.id === 'blood_panels'
    ? 'cloud-upload-outline'
    : source.id === 'health_connect'
    ? 'settings-outline'
    : 'link-outline';

  const isOnFile = source.status === 'prototype_only';

  return (
    <View style={[s.sourceRow, !isLast && s.rowBorder]}>
      <View style={s.sourceLeft}>
        <Text style={s.rowLabel}>{source.label}</Text>
        <Text style={isOnFile ? s.sourceOnFile : s.sourceMuted}>
          {source.statusLabel}
        </Text>
        {source.note ? (
          <Text style={s.sourceNote}>{source.note}</Text>
        ) : null}
      </View>
      <Pressable
        style={[s.sourceAction, { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft }]}
        accessibilityLabel={`${source.actionLabel} ${source.label}`}
        hitSlop={6}
      >
        <Ionicons name={actionIcon} size={13} color={colors.accent} />
        <Text style={s.sourceActionText}>{source.actionLabel}</Text>
      </Pressable>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderSubtle,
      gap: spacing.sm,
    },
    backBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerCenter: {
      flex: 1,
      gap: 1,
    },
    headerTitle: {
      color: colors.text,
      fontSize: typography.subtitle,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
    headerSub: {
      color: colors.textSubtle,
      fontSize: typography.micro,
    },
    editBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm - 2,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    editBtnActive: {
      borderColor: colors.accentBorder,
      backgroundColor: colors.accentSoft,
    },
    editBtnText: {
      color: colors.textMuted,
      fontSize: typography.bodySmall,
      fontWeight: '600',
    },
    editBtnTextActive: {
      color: colors.accent,
    },
    scroll: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    container: {
      width: '100%',
      maxWidth: layout.maxWidth,
      paddingHorizontal: layout.screenPaddingH,
      gap: spacing.xl,
    },
    demoBanner: {
      borderRadius: radius.md,
      backgroundColor: colors.demoBanner,
      borderWidth: 1,
      borderColor: colors.demoBannerBorder,
      padding: spacing.md,
    },
    demoBannerText: {
      color: colors.textMuted,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
    },
    section: { gap: spacing.sm },
    sectionTitle: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      paddingLeft: 2,
    },
    card: {
      borderRadius: radius.md,
      backgroundColor: colors.profileSectionBg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.lg,
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.profileRowBorder,
    },
    rowLabel: {
      color: colors.textMuted,
      fontSize: typography.bodySmall,
      fontWeight: '500',
      flex: 1,
    },
    rowRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flex: 2,
      justifyContent: 'flex-end',
    },
    rowValue: {
      color: colors.text,
      fontSize: typography.bodySmall,
      fontWeight: '600',
      textAlign: 'right',
      flexShrink: 1,
    },
    rowValueEdit: {
      color: colors.accent,
    },
    editIcon: {
      marginLeft: 2,
    },
    sourceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    sourceLeft: {
      flex: 1,
      gap: 2,
    },
    sourceMuted: {
      color: colors.textSubtle,
      fontSize: typography.micro,
    },
    sourceOnFile: {
      color: colors.positive,
      fontSize: typography.micro,
      fontWeight: '600',
    },
    sourceNote: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      opacity: 0.7,
    },
    sourceAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      borderWidth: 1,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      flexShrink: 0,
    },
    sourceActionText: {
      color: colors.accent,
      fontSize: typography.micro,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    footer: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      lineHeight: lineHeights.caption,
      textAlign: 'center',
      paddingHorizontal: spacing.xl,
    },
  });
}
