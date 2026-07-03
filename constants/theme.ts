export const colors = {
  light: {
    background: '#F8FAFB',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    surfaceElevated: '#FFFFFF',
    primary: '#0C4A6E',
    primarySoft: '#E0F2FE',
    primaryLight: '#0369A1',
    accent: '#0891B2',
    accentSoft: '#ECFEFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    error: '#DC2626',
    warning: '#D97706',
    success: '#059669',
    info: '#0284C7',
    verified: '#059669',
    estimated: '#D97706',
    unknown: '#94A3B8',
    demo: '#7C3AED',
    web: '#2563EB',
    cardShadow: 'rgba(15, 23, 42, 0.06)',
  },
  dark: {
    background: '#0B1220',
    surface: '#111827',
    surfaceSecondary: '#1F2937',
    surfaceElevated: '#1A2332',
    primary: '#38BDF8',
    primarySoft: '#0C4A6E',
    primaryLight: '#7DD3FC',
    accent: '#22D3EE',
    accentSoft: '#164E63',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: '#334155',
    borderLight: '#1E293B',
    error: '#F87171',
    warning: '#FBBF24',
    success: '#34D399',
    info: '#60A5FA',
    verified: '#34D399',
    estimated: '#FBBF24',
    unknown: '#94A3B8',
    demo: '#A78BFA',
    web: '#60A5FA',
    cardShadow: 'rgba(0, 0, 0, 0.35)',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18, letterSpacing: 0.2 },
  overline: { fontSize: 11, fontWeight: '600' as const, lineHeight: 14, letterSpacing: 0.8 },
} as const;

export const shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  soft: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
} as const;

export type ThemeColors = (typeof colors)['light'] | (typeof colors)['dark'];
export type ColorScheme = 'light' | 'dark';
