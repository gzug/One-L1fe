/**
 * useWebBackground
 * Tiny helper — web only.
 * Sets document.body and html background-color on mount so the page
 * background matches the app theme instead of flashing white.
 * No-op on Android/iOS.
 */
import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useWebBackground(backgroundColor: string) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = backgroundColor;
    document.documentElement.style.backgroundColor = backgroundColor;
    return () => {
      document.body.style.backgroundColor = prev;
      document.documentElement.style.backgroundColor = prev;
    };
  }, [backgroundColor]);
}
