import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const FIRST_RUN_GUIDE_COMPLETED_KEY = 'one_l1fe:first_run_guide_completed:v1';

export async function getFirstRunGuideCompleted(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(FIRST_RUN_GUIDE_COMPLETED_KEY) === 'true';
    }

    return (await AsyncStorage.getItem(FIRST_RUN_GUIDE_COMPLETED_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function setFirstRunGuideCompleted(completed: boolean): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(FIRST_RUN_GUIDE_COMPLETED_KEY, completed ? 'true' : 'false');
      return;
    }

    await AsyncStorage.setItem(FIRST_RUN_GUIDE_COMPLETED_KEY, completed ? 'true' : 'false');
  } catch {
    // Non-critical UX state. The guide can still run without persistence.
  }
}
