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
  background: '#f4efe6',
  surface: '#fffaf2',
  surfaceElevated: '#ffffff',
  surfaceMuted: '#eee7dc',
  border: 'rgba(17, 22, 21, 0.12)',
  borderSubtle: 'rgba(17, 22, 21, 0.08)',
  textPrimary: '#111615',
  textSecondary: '#4d4943',
  textMuted: '#7e766d',
  accent: '#f06f5f',
  accentText: '#1a0f0d',
  accentSubtle: '#ffe2dc',
  accentSubtleText: '#9f3328',
  scoreTileBackground: '#171d1c',
  scoreTileLabel: '#dacfc6',
  scoreTileValue: '#fffaf2',
  syntheticBackground: '#fff0c2',
  syntheticBorder: '#e4a928',
  syntheticText: '#7b4c00',
  warning: '#a33d22',
  warningSubtle: '#fde6dc',
  noticeBackground: '#fff6e8',
  noticeBorder: '#e0b565',
  noticeText: '#5c4530',
  noticeTitle: '#33251b',
  resultBackground: '#fff4ea',
  resultBorder: '#efb1a5',
  toggleTrack: '#eee7dc',
  toggleTrackActive: '#f06f5f',
  toggleBorder: 'rgba(17, 22, 21, 0.18)',
  toggleText: '#111615',
  toggleTextActive: '#1a0f0d',
};

export const DARK_THEME: Theme = {
  name: 'dark',
  background: '#111615',
  surface: '#1a1f1e',
  surfaceElevated: '#202625',
  surfaceMuted: '#202625',
  border: 'rgba(255, 255, 255, 0.10)',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  textPrimary: '#f3efe8',
  textSecondary: '#b9b2a8',
  textMuted: '#817a72',
  accent: '#f06f5f',
  accentText: '#1a0f0d',
  accentSubtle: 'rgba(240, 111, 95, 0.16)',
  accentSubtleText: '#ffb4a7',
  scoreTileBackground: '#111615',
  scoreTileLabel: '#b9b2a8',
  scoreTileValue: '#f3efe8',
  syntheticBackground: 'rgba(242, 184, 75, 0.16)',
  syntheticBorder: '#f2b84b',
  syntheticText: '#f2b84b',
  warning: '#ffb4a7',
  warningSubtle: 'rgba(240, 111, 95, 0.14)',
  noticeBackground: '#191817',
  noticeBorder: 'rgba(242, 184, 75, 0.34)',
  noticeText: '#d6c8b8',
  noticeTitle: '#f3efe8',
  resultBackground: 'rgba(240, 111, 95, 0.10)',
  resultBorder: 'rgba(240, 111, 95, 0.30)',
  toggleTrack: '#202625',
  toggleTrackActive: '#f06f5f',
  toggleBorder: 'rgba(255, 255, 255, 0.14)',
  toggleText: '#b9b2a8',
  toggleTextActive: '#1a0f0d',
};

export const THEMES: Record<ThemeName, Theme> = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
};

export function getTheme(name: ThemeName): Theme {
  return THEMES[name];
}
