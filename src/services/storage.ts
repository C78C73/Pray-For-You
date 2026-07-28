import AsyncStorage from '@react-native-async-storage/async-storage';

// Thin JSON wrapper over AsyncStorage. This is the entire "backend" for now
// (single-device, no sync). Swap these three functions for Firestore reads/
// writes later and every store in src/store keeps working unchanged.
const PREFIX = 'faithstreak:';

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(PREFIX + key);
}
