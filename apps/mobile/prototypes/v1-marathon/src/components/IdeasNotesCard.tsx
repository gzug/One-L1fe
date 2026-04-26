import React, { useRef, useState } from 'react';
import {
  Keyboard,
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

type Note = { id: string; text: string };

export function IdeasNotesCard() {
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [notes, setNotes] = useState<Note[]>([]);
  const [inputOpen, setInputOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<TextInput>(null);

  function openInput() {
    setInputOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function save() {
    const text = draft.trim();
    if (text) {
      setNotes((prev) => [{ id: Date.now().toString(), text }, ...prev]);
    }
    setDraft('');
    setInputOpen(false);
    Keyboard.dismiss();
  }

  function discard() {
    setDraft('');
    setInputOpen(false);
    Keyboard.dismiss();
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <View style={s.card}>
      {/* Header row */}
      <View style={s.headerRow}>
        <Text style={s.title}>{prototypeCopy.sectionNotes}</Text>
        {!inputOpen && (
          <Pressable onPress={openInput} style={s.addBtn} hitSlop={10} accessibilityLabel="Add note">
            <Ionicons name="add" size={18} color={colors.textSubtle} />
          </Pressable>
        )}
      </View>

      {/* Notes list */}
      {notes.length === 0 && !inputOpen && (
        <Text style={s.emptyHint}>Tap + to add an idea, observation, or question.</Text>
      )}
      {notes.map((note) => (
        <View key={note.id} style={s.noteRow}>
          <Text style={s.noteBullet}>–</Text>
          <Text style={s.noteText}>{note.text}</Text>
          <Pressable
            onPress={() => deleteNote(note.id)}
            hitSlop={8}
            accessibilityLabel="Delete note"
          >
            <Ionicons name="close" size={14} color={colors.textSubtle} />
          </Pressable>
        </View>
      ))}

      {/* Input area */}
      {inputOpen && (
        <View style={s.inputArea}>
          <TextInput
            ref={inputRef}
            value={draft}
            onChangeText={setDraft}
            placeholder={prototypeCopy.notesPlaceholder}
            placeholderTextColor={colors.textSubtle}
            style={[s.input, { color: colors.text, borderColor: colors.borderSubtle }]}
            multiline
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={save}
          />
          <View style={s.inputActions}>
            <Pressable onPress={discard} hitSlop={8}>
              <Text style={s.discardText}>{prototypeCopy.notesDiscardLabel}</Text>
            </Pressable>
            <Pressable
              onPress={save}
              style={[s.saveBtn, { backgroundColor: colors.accent }]}
              hitSlop={8}
            >
              <Text style={s.saveBtnText}>{prototypeCopy.notesSaveLabel}</Text>
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
      backgroundColor: colors.surface,        // one step below surfaceElevated — visually secondary
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    addBtn: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyHint: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
    },
    noteRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    noteBullet: {
      color: colors.textSubtle,
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
      width: 10,
    },
    noteText: {
      flex: 1,
      color: colors.textMuted,
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
    },
    inputArea: { gap: spacing.sm },
    input: {
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
      borderWidth: 1,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 64,
      textAlignVertical: 'top',
    },
    inputActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: spacing.md,
    },
    discardText: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      fontWeight: '500',
    },
    saveBtn: {
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
    },
    saveBtnText: {
      color: '#FFFFFF',
      fontSize: typography.caption,
      fontWeight: '700',
    },
  });
}
