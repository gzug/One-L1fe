/**
 * IdeasNotesCard
 *
 * Replaces NutritionContextCard.
 * - Tap the card or the + button to expand the input field.
 * - Each saved entry becomes a bullet item (Apple Reminders / PowerPoint style).
 * - Notes persist in component state (in-memory, survive re-renders in the same session).
 * - Tap the x next to any note to delete it.
 * - No emoji glyphs; clean typographic bullets only.
 */
import React, { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import { prototypeCopy } from '../data/copy';

type Note = { id: number; text: string };

let _idSeq = 0;
function nextId() {
  _idSeq += 1;
  return _idSeq;
}

export function IdeasNotesCard() {
  const { colors } = useTheme();
  const s = createStyles(colors);

  const [notes, setNotes] = useState<Note[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<TextInput>(null);

  function openInput() {
    setExpanded(true);
    // short delay so the view finishes rendering before focusing
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  function saveNote() {
    const trimmed = draft.trim();
    if (trimmed.length === 0) {
      setExpanded(false);
      setDraft('');
      return;
    }
    setNotes((prev) => [...prev, { id: nextId(), text: trimmed }]);
    setDraft('');
    setExpanded(false);
  }

  function discardNote() {
    setDraft('');
    setExpanded(false);
  }

  function deleteNote(id: number) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  const hasNotes = notes.length > 0;

  return (
    <View style={s.card}>
      {/* Section header row */}
      <View style={s.headerRow}>
        <View style={s.headerLeft}>
          <View style={[s.accentBar, { backgroundColor: colors.accent }]} />
          <Text style={s.title}>{prototypeCopy.sectionNotes}</Text>
        </View>
        <Pressable
          onPress={openInput}
          style={[
            s.addBtn,
            { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft },
          ]}
          accessibilityLabel="Add note"
          hitSlop={8}
        >
          <Ionicons name="add" size={16} color={colors.accent} />
        </Pressable>
      </View>

      {/* Saved notes list */}
      {hasNotes && (
        <View style={s.notesList}>
          {notes.map((note, i) => (
            <View
              key={note.id}
              style={[s.noteRow, i < notes.length - 1 && s.noteRowBorder]}
            >
              {/* Bullet */}
              <Text style={[s.bullet, { color: colors.accent }]}>–</Text>
              <Text style={s.noteText}>{note.text}</Text>
              <Pressable
                onPress={() => deleteNote(note.id)}
                hitSlop={10}
                accessibilityLabel="Delete note"
                style={s.deleteBtn}
              >
                <Ionicons
                  name="close"
                  size={12}
                  color={colors.textSubtle}
                />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Empty state — only when no notes and not expanded */}
      {!hasNotes && !expanded && (
        <Pressable onPress={openInput} accessibilityLabel="Add first note">
          <Text style={s.emptyHint}>
            Tap + to add an idea, observation, or question.
          </Text>
        </Pressable>
      )}

      {/* Input area */}
      {expanded && (
        <View style={s.inputArea}>
          <TextInput
            ref={inputRef}
            value={draft}
            onChangeText={setDraft}
            placeholder={prototypeCopy.notesPlaceholder}
            placeholderTextColor={colors.textSubtle}
            style={[
              s.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
            multiline
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={saveNote}
            autoCorrect
            autoCapitalize="sentences"
          />
          <View style={s.inputActions}>
            <Pressable
              onPress={discardNote}
              style={[s.actionBtn, { borderColor: colors.border }]}
              accessibilityLabel="Discard note"
            >
              <Text style={[s.actionBtnText, { color: colors.textMuted }]}>
                {prototypeCopy.notesDiscardLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={saveNote}
              style={[
                s.actionBtn,
                s.actionBtnPrimary,
                { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft },
              ]}
              accessibilityLabel="Save note"
            >
              <Text style={[s.actionBtnText, { color: colors.accent }]}>
                {prototypeCopy.notesSaveLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: radius.md,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    accentBar: {
      width: 3,
      height: 13,
      borderRadius: 2,
    },
    title: {
      color: colors.text,
      fontSize: typography.subtitle,
      fontWeight: '800',
      letterSpacing: -0.1,
    },
    addBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notesList: {
      gap: 0,
    },
    noteRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    noteRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderSubtle,
    },
    bullet: {
      fontSize: typography.body,
      fontWeight: '700',
      lineHeight: lineHeights.body,
      width: 10,
      flexShrink: 0,
    },
    noteText: {
      flex: 1,
      color: colors.text,
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
    },
    deleteBtn: {
      paddingTop: 3,
      flexShrink: 0,
    },
    emptyHint: {
      color: colors.textSubtle,
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
    },
    inputArea: {
      gap: spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
      minHeight: 72,
      textAlignVertical: 'top',
    },
    inputActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.sm,
    },
    actionBtn: {
      borderWidth: 1,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 1,
    },
    actionBtnPrimary: {},
    actionBtnText: {
      fontSize: typography.bodySmall,
      fontWeight: '700',
      letterSpacing: 0.1,
    },
  });
}
