// Calm, worshipful palette on purpose: this app should feel like a quiet
// place to pray, not a game. No neon, no clutter.
export const colors = {
  background: '#F7F5EF',
  surface: '#FFFFFF',
  primary: '#2B4C7E', // deep peaceful blue
  primaryDark: '#1B3358',
  accent: '#C9A24B', // muted gold — used sparingly (seeds/rewards only)
  text: '#25303B',
  textMuted: '#6B7686',
  border: '#E6E1D6',
  success: '#3E7C59',
  danger: '#B4534A',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

export const typography = {
  title: { fontSize: 24, fontWeight: '700' as const, color: colors.text },
  heading: { fontSize: 18, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  caption: { fontSize: 13, fontWeight: '400' as const, color: colors.textMuted },
};
