/**
 * marathonNotesStorage.ts
 *
 * Local-only persistent notes storage for the One L1fe Marathon Prototype.
 * Uses @react-native-async-storage/async-storage (already a project dependency).
 *
 * Notes are user-entered only.
 * They are NOT medical data, NOT fed into scores, NOT uploaded.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const MARATHON_NOTES_KEY = 'one_l1fe_v1_marathon_notes_ideas';

/**
 * Load the saved notes string. Returns empty string if nothing saved yet.
 */
export async function loadMarathonNotes(): Promise<string> {
  try {
    const value = await AsyncStorage.getItem(MARATHON_NOTES_KEY);
    return value ?? '';
  } catch {
    return '';
  }
}

/**
 * Save notes string. Passing an empty string is allowed (clears content but keeps key).
 */
export async function saveMarathonNotes(text: string): Promise<void> {
  await AsyncStorage.setItem(MARATHON_NOTES_KEY, text);
}

/**
 * Clear notes — removes the key entirely.
 */
export async function clearMarathonNotes(): Promise<void> {
  await AsyncStorage.removeItem(MARATHON_NOTES_KEY);
}
