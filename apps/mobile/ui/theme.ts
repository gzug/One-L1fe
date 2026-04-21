export const theme = {
  colors: {
    bg: '#f4f7fb',
    surface: '#ffffff',
    surfaceSubtle: '#eef3fb',
    border: '#d9e2f2',
    borderStrong: '#b9c8df',
    primary: '#4263eb',
    primarySoft: '#e9efff',
    text: '#10203b',
    textMuted: '#52607a',
    textLabel: '#2c3b56',
    danger: '#b42318',
  },
  radius: {
    sm: 12,
    pill: 999,
  },
  text: {
    label: {
      fontSize: 12,
      fontWeight: '700' as const,
      letterSpacing: 0.4,
      textTransform: 'uppercase' as const,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700' as const,
    },
    title: {
      fontSize: 20,
      fontWeight: '700' as const,
    },
  },
};
