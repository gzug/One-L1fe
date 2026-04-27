/**
 * IdeasNotesCard — F11
 *
 * Ideas & Notes — fully persistent via AsyncStorage.
 * Notes survive app reload. Inline edit supported.
 * No network calls. Device-local only.
 *
 * F11 improvements:
 * - Empty state is a full tappable surface with + Add affordance.
 * - Tap anywhere on empty card opens TextInput immediately.
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
  const [notes, setNotes]         = useState<Note[]>([]);
  const [inputOpen, setInputOpen] = useState(false);
  const [draft, setDraft]         = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const inputRef = useRef<TextInput>(null);
  const editRef  = useRef<TextInput>(null);

  useEffect(() => {
    loadNotes().then(setNotes);
  }, []);

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

  const isEmpty = notes.length === 0 && !inputOpen;

  return (
    <View style={s.card}>
      {/* Header row */}
      <View style={s.headerRow}>
        <Text style={s.title}>{prototypeCopy.sectionNotes}</Text>
        {notes.length > 0 && !inputOpen && (
          <Pressable onPress={openInput} style={s.addBtn} hitSlop={10} accessibilityLabel="Add note">
            <View style={s.addBtnInner}>
              {/* Plus icon — RN View primitive */}
              <View style={[s.plusH, { backgroundColor: colors.textMuted }]} />
              <View style={[s.plusV, { backgroundColor: colors.textMuted }]} />
            </View>
          </Pressable>
        )}
      </View>

      {/* Empty state — entire surface is tappable */}
      {isEmpty && (
        <Pressable
          onPress={openInput}
          style={s.emptyState}
          accessibilityLabel="Add a note"
          accessibilityRole="button"
        >
          <View style={[s.emptyAddBtn, { borderColor: colors.accentBorder, backgroundColor: colors.accentSoft }]}>
            <View style={[s.plusHLg, { backgroundColor: colors.accent }]} />
            <View style={[s.plusVLg, { backgroundColor: colors.accent }]} />
          </View>
          <Text style={[s.emptyAddLabel, { color: colors.accent }]}>{prototypeCopy.notesEmptyAddLabel}</Text>
          <Text style={s.emptyHint}>{prototypeCopy.notesEmptyHint}</Text>
        </Pressable>
      )}

      {/* Notes list */}
      {notes.map((note) => (
        <View key={note.id}>
          {editingId === note.id ? (
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
              <Text style={[s.noteBullet, { color: colors.textSubtle }]}>–</Text>
              <Text style={[s.noteText, { color: colors.textMuted }]}>{note.text}</Text>
              <Pressable
                onPress={() => deleteNote(note.id)}
                hitSlop={10}
                accessibilityLabel="Delete note"
                style={s.deleteBtn}
              >
                {/* X icon — RN View primitives */}
                <View style={[s.xLine1, { backgroundColor: colors.textSubtle }]} />
                <View style={[s.xLine2, { backgroundColor: colors.textSubtle }]} />
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
        <Text style={[s.persistHint, { color: colors.textSubtle }]}>Saved on this device</Text>
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
    addBtnInner: { width: 18, height: 18, position: 'relative', alignItems: 'center', justifyContent: 'center' },
    plusH: { position: 'absolute', width: 14, height: 2, borderRadius: 1 },
    plusV: { position: 'absolute', width: 2, height: 14, borderRadius: 1 },

    // Empty state
    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
      gap: spacing.sm,
    },
    emptyAddBtn: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    plusHLg: { position: 'absolute', width: 16, height: 2, borderRadius: 1 },
    plusVLg: { position: 'absolute', width: 2, height: 16, borderRadius: 1 },
    emptyAddLabel: {
      fontSize: typography.bodySmall,
      fontWeight: '700',
      letterSpacing: -0.1,
    },
    emptyHint: {
      color: colors.textSubtle,
      fontSize: typography.caption,
      lineHeight: lineHeights.caption,
      textAlign: 'center',
    },

    persistHint: {
      fontSize: typography.micro,
      fontStyle: 'italic',
    },
    noteRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    noteBullet: {
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
      width: 10,
    },
    noteText: {
      flex: 1,
      fontSize: typography.bodySmall,
      lineHeight: lineHeights.bodySmall,
    },
    deleteBtn: {
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    xLine1: {
      position: 'absolute',
      width: 12,
      height: 1.5,
      borderRadius: 1,
      transform: [{ rotate: '45deg' }],
    },
    xLine2: {
      position: 'absolute',
      width: 12,
      height: 1.5,
      borderRadius: 1,
      transform: [{ rotate: '-45deg' }],
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
