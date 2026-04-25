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
  positiveBackground: string;
  positiveBorder: string;
  positiveText: string;
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
  // Premium additions
  heroBackground: string;
  heroBorder: string;
  heroGlow: string;
  progressTrack: string;
  progressFill: string;
  progressFillRecovery: string;
  chipBackground: string;
  chipText: string;
  chipBorder: string;
  divider: string;
  markerOptimal: string;
  markerGood: string;
  markerElevated: string;
  markerLow: string;
  markerMissing: string;
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
  accent: '#f4a36b',
  accentText: '#1a0f0d',
  accentSubtle: '#ffe7d2',
  accentSubtleText: '#8a5525',
  positiveBackground: '#ecf8ef',
  positiveBorder: '#a9d9b7',
  positiveText: '#257a43',
  scoreTileBackground: '#171d1c',
  scoreTileLabel: '#dacfc6',
  scoreTileValue: '#fffaf2',
  syntheticBackground: '#fff0c2',
  syntheticBorder: '#e4a928',
  syntheticText: '#7b4c00',
  warning: '#b3261e',
  warningSubtle: '#fde6dc',
  noticeBackground: '#fff6e8',
  noticeBorder: '#e0b565',
  noticeText: '#5c4530',
  noticeTitle: '#33251b',
  resultBackground: '#ecf8ef',
  resultBorder: '#a9d9b7',
  toggleTrack: '#eee7dc',
  toggleTrackActive: '#f4a36b',
  toggleBorder: 'rgba(17, 22, 21, 0.18)',
  toggleText: '#111615',
  toggleTextActive: '#1a0f0d',
  heroBackground: '#fffaf2',
  heroBorder: 'rgba(244, 163, 107, 0.25)',
  heroGlow: 'rgba(244, 163, 107, 0.08)',
  progressTrack: '#eee7dc',
  progressFill: '#f4a36b',
  progressFillRecovery: '#7fc9a0',
  chipBackground: '#eee7dc',
  chipText: '#4d4943',
  chipBorder: 'rgba(17, 22, 21, 0.06)',
  divider: 'rgba(17, 22, 21, 0.06)',
  markerOptimal: '#257a43',
  markerGood: '#3d8c5c',
  markerElevated: '#b3731e',
  markerLow: '#b3261e',
  markerMissing: '#7e766d',
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
  accent: '#f4a36b',
  accentText: '#1a0f0d',
  accentSubtle: 'rgba(244, 163, 107, 0.18)',
  accentSubtleText: '#f7c59c',
  positiveBackground: 'rgba(111, 207, 151, 0.14)',
  positiveBorder: 'rgba(111, 207, 151, 0.38)',
  positiveText: '#9be7b0',
  scoreTileBackground: '#111615',
  scoreTileLabel: '#b9b2a8',
  scoreTileValue: '#f3efe8',
  syntheticBackground: 'rgba(242, 184, 75, 0.16)',
  syntheticBorder: '#f2b84b',
  syntheticText: '#f2b84b',
  warning: '#ff8a80',
  warningSubtle: 'rgba(179, 38, 30, 0.18)',
  noticeBackground: '#191817',
  noticeBorder: 'rgba(242, 184, 75, 0.34)',
  noticeText: '#d6c8b8',
  noticeTitle: '#f3efe8',
  resultBackground: 'rgba(111, 207, 151, 0.12)',
  resultBorder: 'rgba(111, 207, 151, 0.35)',
  toggleTrack: '#202625',
  toggleTrackActive: '#f4a36b',
  toggleBorder: 'rgba(255, 255, 255, 0.14)',
  toggleText: '#b9b2a8',
  toggleTextActive: '#1a0f0d',
  heroBackground: '#1a1f1e',
  heroBorder: 'rgba(244, 163, 107, 0.20)',
  heroGlow: 'rgba(244, 163, 107, 0.06)',
  progressTrack: 'rgba(255, 255, 255, 0.08)',
  progressFill: '#f4a36b',
  progressFillRecovery: '#7fc9a0',
  chipBackground: 'rgba(255, 255, 255, 0.06)',
  chipText: '#b9b2a8',
  chipBorder: 'rgba(255, 255, 255, 0.08)',
  divider: 'rgba(255, 255, 255, 0.06)',
  markerOptimal: '#9be7b0',
  markerGood: '#7fc9a0',
  markerElevated: '#f2b84b',
  markerLow: '#ff8a80',
  markerMissing: '#817a72',
};

export const THEMES: Record<ThemeName, Theme> = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
};

export function getTheme(name: ThemeName): Theme {
  return THEMES[name];
}
