export type ThemeName = 'light' | 'dark';

export const THEME_LABELS: Record<ThemeName, string> = {
  light: 'Light',
  dark: 'Dark',
};

export interface Theme {
  name: ThemeName;
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentText: string;
  accentSubtle: string;
  accentSubtleText: string;
  scoreTileBackground: string;
  scoreTileLabel: string;
  scoreTileValue: string;
  syntheticBackground: string;
  syntheticBorder: string;
  syntheticText: string;
  warning: string;
  warningSubtle: string;
  noticeBackground: string;
  noticeBorder: string;
  noticeText: string;
  noticeTitle: string;
  resultBackground: string;
  resultBorder: string;
  toggleTrack: string;
  toggleTrackActive: string;
  toggleBorder: string;
  toggleText: string;
  toggleTextActive: string;
}

export const LIGHT_THEME: Theme = {
  name: 'light',
  background: '#f4f5f2',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  surfaceMuted: '#eef0eb',
  border: '#dfe2dc',
  borderSubtle: '#ebede7',
  textPrimary: '#11181a',
  textSecondary: '#3f4a4d',
  textMuted: '#6a7679',
  accent: '#0f766e',
  accentText: '#ffffff',
  accentSubtle: '#e0f2ef',
  accentSubtleText: '#0f766e',
  scoreTileBackground: '#11181a',
  scoreTileLabel: '#cad6cf',
  scoreTileValue: '#ffffff',
  syntheticBackground: '#fff3d9',
  syntheticBorder: '#e7c98a',
  syntheticText: '#7a4f00',
  warning: '#9a3412',
  warningSubtle: '#fdecdf',
  noticeBackground: '#fbfaf6',
  noticeBorder: '#e0caa3',
  noticeText: '#5f4b2b',
  noticeTitle: '#3b2b13',
  resultBackground: '#eef7f5',
  resultBorder: '#b7d6d0',
  toggleTrack: '#eef0eb',
  toggleTrackActive: '#0f766e',
  toggleBorder: '#cbd5d1',
  toggleText: '#11181a',
  toggleTextActive: '#ffffff',
};

export const DARK_THEME: Theme = {
  name: 'dark',
  background: '#0c1011',
  surface: '#161b1c',
  surfaceElevated: '#1b2122',
  surfaceMuted: '#1f2627',
  border: '#252c2d',
  borderSubtle: '#1f2526',
  textPrimary: '#ecefea',
  textSecondary: '#b6c0bd',
  textMuted: '#8a9491',
  accent: '#3ad3b0',
  accentText: '#06201b',
  accentSubtle: '#0f2e29',
  accentSubtleText: '#7be3c5',
  scoreTileBackground: '#1f2627',
  scoreTileLabel: '#9bb1ab',
  scoreTileValue: '#ecefea',
  syntheticBackground: '#3a2a0f',
  syntheticBorder: '#a36e2e',
  syntheticText: '#f4c97c',
  warning: '#fca5a5',
  warningSubtle: '#3a1f1d',
  noticeBackground: '#1a1815',
  noticeBorder: '#5a4a2b',
  noticeText: '#d6c79e',
  noticeTitle: '#f1e3bd',
  resultBackground: '#13262a',
  resultBorder: '#1f4046',
  toggleTrack: '#1f2627',
  toggleTrackActive: '#3ad3b0',
  toggleBorder: '#2a3233',
  toggleText: '#b6c0bd',
  toggleTextActive: '#06201b',
};

export const THEMES: Record<ThemeName, Theme> = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
};

export function getTheme(name: ThemeName): Theme {
  return THEMES[name];
}
