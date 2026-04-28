import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { darkColors, lightColors, type ThemeColors } from './marathonTheme';

type ColorScheme = 'light' | 'dark';

type ThemeContextValue = {
  colors: ThemeColors;
  scheme: ColorScheme;
  isDark: boolean;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Light is the default.
  const [scheme, setScheme] = useState<ColorScheme>('light');

  const toggle = useCallback(() => {
    setScheme((s) => (s === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: scheme === 'dark' ? darkColors : lightColors,
      scheme,
      isDark: scheme === 'dark',
      toggle,
    }),
    [scheme, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
}
