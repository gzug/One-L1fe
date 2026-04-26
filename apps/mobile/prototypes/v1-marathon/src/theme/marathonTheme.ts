export const marathonTheme = {
  colors: {
    background: '#11100E',
    surface: '#1A1714',
    surfaceElevated: '#24201B',
    border: '#3A3028',
    text: '#F7EFE6',
    textMuted: '#B9AFA5',
    textSubtle: '#837A70',
    accent: '#F0A66A',
    accentSoft: 'rgba(240, 166, 106, 0.16)',
    positive: '#8FD8A8',
    warning: '#F5C16C',
    danger: '#F08A7A',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 24,
    pill: 999,
  },
  typography: {
    title: 28,
    subtitle: 18,
    body: 15,
    caption: 12,
  },
} as const;

export type MarathonTheme = typeof marathonTheme;
