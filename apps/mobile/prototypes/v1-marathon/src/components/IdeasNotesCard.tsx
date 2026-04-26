/**
 * IdeasNotesCard
 * Ideas & Notes — fully persistent via AsyncStorage.
 * Notes survive app reload. Inline edit supported.
 * No network calls. Device-local only.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { lineHeights, radius, spacing, typography } from '../theme/marathonTheme';
import type { ThemeColors } from '../theme/marathonTheme';
import { prototypeCopy } from '../data/copy';

const STORAGE_KEY = '@one_l1fe_notes_v1';

type Note = { id: string; text: string; createdAt: number };

async function loadNotes(): Promise<Note[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Note[];
  } catch {
    return [];
  }
}

async function persistNotes(notes: Note[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function IdeasNotesCard() {
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [notes, setNotes]       = useState<Note[]>([]);
  const [inputOpen, setInputOpen] = useState(false);
  const [draft, setDraft]         = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const inputRef     = useRef<TextInput>(null);
  const editRef      = useRef<TextInput>(null);

  // Load on mount
  useEffect(() => {
    loadNotes().then(setNotes);
  }, []);

  // Persist whenever notes change (after mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    persistNotes(notes);
  }, [notes]);

  function openInput() {
    setInputOpen(true);
    setEditingId(null);
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  const save = useCallback(() => {
    const text = draft.trim();
    if (text) {
      setNotes((prev) => [{ id: Date.now().toString(), text, createdAt: Date.now() }, ...prev]);
    }
    setDraft('');
    setInputOpen(false);
    Keyboard.dismiss();
  }, [draft]);

  function discard() {
    setDraft('');
    setInputOpen(false);
    Keyboard.dismiss();
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function startEdit(note: Note) {
    setInputOpen(false);
    setEditingId(note.id);
    setEditDraft(note.text);
    setTimeout(() => editRef.current?.focus(), 80);
  }

  function commitEdit(id: string) {
    const text = editDraft.trim();
    if (text) {
      setNotes((prev) => prev.map((n) => n.id === id ? { ...n, text } : n));
    } else {
      deleteNote(id);
    }
    setEditingId(null);
    setEditDraft('');
    Keyboard.dismiss();
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft('');
    Keyboard.dismiss();
  }

  return (
    <View style={s.card}>
      {/* Header row */}
      <View style={s.headerRow}>
        <Text style={s.title}>{prototypeCopy.sectionNotes}</Text>
        {!inputOpen && (
          <Pressable onPress={openInput} style={s.addBtn} hitSlop={10} accessibilityLabel="Add note">
            <Ionicons name="add" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Empty state */}
      {notes.length === 0 && !inputOpen && (
        <Text style={s.emptyHint}>Tap + to add an idea, observation, or question. Notes are saved on this device.</Text>
      )}

      {/* Notes list */}
      {notes.map((note) => (
        <View key={note.id}>
          {editingId === note.id ? (
            // Inline edit
            <View style={s.inputArea}>
              <TextInput
                ref={editRef}
                value={editDraft}
                onChangeText={setEditDraft}
                style={[s.input, { color: colors.text, borderColor: colors.accentBorder }]}
                multiline
                blurOnSubmit
                returnKeyType="done"
                onSubmitEditing={() => commitEdit(note.id)}
                accessibilityLabel="Edit note"
              />
              <View style={s.inputActions}>
                <Pressable onPress={cancelEdit} hitSlop={8}>
                  <Text style={s.discardText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => commitEdit(note.id)}
                  style={[s.saveBtn, { backgroundColor: colors.accent }]}
                  hitSlop={8}
                >
                  <Text style={s.saveBtnText}>Save</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable onPress={() => startEdit(note)} accessibilityLabel="Edit note" style={s.noteRow}>
              <Text style={s.noteBullet}>–</Text>
              <Text style={s.noteText}>{note.text}</Text>
              <Pressable
                onPress={() => deleteNote(note.id)}
                hitSlop={10}
                accessibilityLabel="Delete note"
              >
                <Ionicons name="close" size={14} color={colors.textSubtle} />
              </Pressable>
            </Pressable>
          )}
        </View>
      ))}

      {/* New note input */}
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

      {notes.length > 0 && !inputOpen && !editingId && (
        <Text style={s.persistHint}>Saved on this device</Text>
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: radius.md,
      backgroundColor: colors.surface,
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
      fontWeight: '700',
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
    persistHint: {
      color: colors.textSubtle,
      fontSize: typography.micro,
      fontStyle: 'italic',
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
