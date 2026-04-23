/**
 * appInstallId.ts
 * Provides a stable, device-sourced app install identifier.
 *
 * Priority:
 * 1. expo-application native ID (Android: androidId, iOS: identifierForVendor)
 * 2. AsyncStorage cached UUID (generated once, persisted across sessions)
 * 3. In-memory UUID (session-only, last resort — should never be reached)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = '@one_l1fe/app_install_id';

let _inMemoryFallback: string | null = null;

export async function getOrCreateAppInstallId(): Promise<string> {
  // Tier 1: native platform identifier
  try {
    if (Platform.OS === 'android') {
      const androidId = Application.getAndroidId();
      if (typeof androidId === 'string' && androidId.length > 0) {
        return `android-${androidId}`;
      }
    } else if (Platform.OS === 'ios') {
      const vendorId = await Application.getIosIdForVendorAsync();
      if (typeof vendorId === 'string' && vendorId.length > 0) {
        return `ios-${vendorId}`;
      }
    }
  } catch (_) {
    // fall through to Tier 2
  }

  // Tier 2: AsyncStorage cached UUID
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEY);
    if (typeof cached === 'string' && cached.length > 0) {
      return cached;
    }
    const generated = `gen-${uuidv4()}`;
    await AsyncStorage.setItem(STORAGE_KEY, generated);
    return generated;
  } catch (_) {
    // fall through to Tier 3
  }

  // Tier 3: in-memory fallback (session-only — should never be reached)
  if (!_inMemoryFallback) {
    _inMemoryFallback = `mem-${uuidv4()}`;
  }
  return _inMemoryFallback;
}

/**
 * Returns true if the given id looks like a legacy mock value.
 * Use to detect and re-provision old dev installs.
 */
export function isLegacyMockInstallId(id: string | null | undefined): boolean {
  if (!id) return false;
  return id.startsWith('dev-install-') || id === 'mock' || id === '';
}
