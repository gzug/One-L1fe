import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'ol.app_install_id';

// RFC 4122 v4 UUID using Math.random. Not cryptographically secure, but
// collision-safe at install-scale — install IDs are opaque identifiers, not
// secrets. Keeps this module dependency-free (no uuid or expo-crypto import).
function generateInstallId(): string {
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      out += '-';
    } else if (i === 14) {
      out += '4';
    } else if (i === 19) {
      out += hex[(Math.random() * 4) | 8];
    } else {
      out += hex[(Math.random() * 16) | 0];
    }
  }
  return out;
}

let cached: string | undefined;

export async function getOrCreateAppInstallId(): Promise<string> {
  if (cached !== undefined) return cached;

  const existing = await AsyncStorage.getItem(STORAGE_KEY);
  if (existing !== null && existing.length > 0) {
    cached = existing;
    return existing;
  }

  const generated = generateInstallId();
  await AsyncStorage.setItem(STORAGE_KEY, generated);
  cached = generated;
  return generated;
}

export function __resetAppInstallIdCacheForTests(): void {
  cached = undefined;
}
