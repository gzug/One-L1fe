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
  background: '#F5EFE6',
  surface: '#FFF9F1',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#EEE6DA',
  border: 'rgba(17, 22, 21, 0.10)',
  borderSubtle: 'rgba(17, 22, 21, 0.06)',
  textPrimary: '#151B18',
  textSecondary: '#5B554E',
  textMuted: '#81786F',
  accent: '#F4A26A',
  accentText: '#1A100B',
  accentSubtle: 'rgba(244, 162, 106, 0.16)',
  accentSubtleText: '#8A5525',
  positiveBackground: 'rgba(142, 217, 168, 0.18)',
  positiveBorder: 'rgba(142, 217, 168, 0.42)',
  positiveText: '#287A45',
  scoreTileBackground: '#151B18',
  scoreTileLabel: '#D8CEC3',
  scoreTileValue: '#F5F1EA',
  syntheticBackground: 'rgba(245, 198, 106, 0.18)',
  syntheticBorder: 'rgba(245, 198, 106, 0.48)',
  syntheticText: '#8A5C00',
  warning: '#C44740',
  warningSubtle: 'rgba(240, 125, 120, 0.14)',
  noticeBackground: '#FFF4E4',
  noticeBorder: 'rgba(245, 198, 106, 0.44)',
  noticeText: '#5C4530',
  noticeTitle: '#2E2219',
  resultBackground: 'rgba(142, 217, 168, 0.16)',
  resultBorder: 'rgba(142, 217, 168, 0.42)',
  toggleTrack: '#EEE6DA',
  toggleTrackActive: '#F4A26A',
  toggleBorder: 'rgba(17, 22, 21, 0.14)',
  toggleText: '#151B18',
  toggleTextActive: '#1A100B',
  heroBackground: '#FFF9F1',
  heroBorder: 'rgba(244, 162, 106, 0.22)',
  heroGlow: 'rgba(244, 162, 106, 0.10)',
  progressTrack: 'rgba(17, 22, 21, 0.08)',
  progressFill: '#F4A26A',
  progressFillRecovery: '#8ED9A8',
  chipBackground: 'rgba(17, 22, 21, 0.05)',
  chipText: '#5B554E',
  chipBorder: 'rgba(17, 22, 21, 0.08)',
  divider: 'rgba(17, 22, 21, 0.06)',
  markerOptimal: '#287A45',
  markerGood: '#3D8C5C',
  markerElevated: '#A36C17',
  markerLow: '#C44740',
  markerMissing: '#81786F',
};

export const DARK_THEME: Theme = {
  name: 'dark',
  background: '#0E1311',
  surface: '#151B18',
  surfaceElevated: '#1B231F',
  surfaceMuted: '#111816',
  border: 'rgba(255, 255, 255, 0.08)',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',
  textPrimary: '#F5F1EA',
  textSecondary: '#A8A29A',
  textMuted: '#6F6A63',
  accent: '#F4A26A',
  accentText: '#1A100B',
  accentSubtle: 'rgba(244, 162, 106, 0.22)',
  accentSubtleText: '#F6B88A',
  positiveBackground: 'rgba(142, 217, 168, 0.13)',
  positiveBorder: 'rgba(142, 217, 168, 0.34)',
  positiveText: '#8ED9A8',
  scoreTileBackground: '#111816',
  scoreTileLabel: '#A8A29A',
  scoreTileValue: '#F5F1EA',
  syntheticBackground: 'rgba(245, 198, 106, 0.14)',
  syntheticBorder: 'rgba(245, 198, 106, 0.38)',
  syntheticText: '#F5C66A',
  warning: '#F07D78',
  warningSubtle: 'rgba(240, 125, 120, 0.16)',
  noticeBackground: '#151B18',
  noticeBorder: 'rgba(245, 198, 106, 0.30)',
  noticeText: '#D4C9BC',
  noticeTitle: '#F5F1EA',
  resultBackground: 'rgba(142, 217, 168, 0.11)',
  resultBorder: 'rgba(142, 217, 168, 0.30)',
  toggleTrack: '#111816',
  toggleTrackActive: '#F4A26A',
  toggleBorder: 'rgba(255, 255, 255, 0.10)',
  toggleText: '#A8A29A',
  toggleTextActive: '#1A100B',
  heroBackground: '#151B18',
  heroBorder: 'rgba(244, 162, 106, 0.24)',
  heroGlow: 'rgba(244, 162, 106, 0.22)',
  progressTrack: 'rgba(255, 255, 255, 0.08)',
  progressFill: '#F4A26A',
  progressFillRecovery: '#8ED9A8',
  chipBackground: 'rgba(255, 255, 255, 0.06)',
  chipText: '#A8A29A',
  chipBorder: 'rgba(255, 255, 255, 0.08)',
  divider: 'rgba(255, 255, 255, 0.06)',
  markerOptimal: '#8ED9A8',
  markerGood: '#8ED9A8',
  markerElevated: '#F5C66A',
  markerLow: '#F07D78',
  markerMissing: '#6F6A63',
};

export const THEMES: Record<ThemeName, Theme> = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
};

export function getTheme(name: ThemeName): Theme {
  return THEMES[name];
}
