/** GenoMatch brand palette */
export const FOREST_DEEP = '#163522';
export const FOREST = '#1A3D28';
export const GOLD = '#D4A843';
export const LINEN = '#F5EFE6';
export const SAGE = '#8FAF95';
export const MINT = '#EDF3EE';
export const WHITE = '#FFFFFF';

/** Semantic color tokens — use these in UI code */
export const COLORS = {
  forestDeep: FOREST_DEEP,
  forest: FOREST,
  gold: GOLD,
  linen: LINEN,
  sage: SAGE,
  mint: MINT,
  white: WHITE,

  /** @deprecated Use linen — kept for gradual migration */
  ivory: LINEN,

  background: LINEN,
  surface: WHITE,
  tabBar: FOREST_DEEP,
  splash: FOREST_DEEP,
  hero: FOREST,

  text: FOREST_DEEP,
  textOnDark: LINEN,
  textOnForest: LINEN,
  textMuted: SAGE,
  textSubtle: 'rgba(13, 40, 24, 0.45)',

  border: 'rgba(13, 40, 24, 0.08)',
  borderLight: 'rgba(143, 175, 149, 0.4)',
  borderOnDark: 'rgba(245, 239, 230, 0.12)',

  chip: MINT,
  chipFill: 'rgba(237, 243, 238, 0.85)',
  cta: GOLD,
  overlay: 'rgba(13, 40, 24, 0.72)',
  overlayLight: 'rgba(13, 40, 24, 0.45)',

  verified: '#3D7A52',
  error: '#A32D2D',
  errorBg: '#FFEBEE',
} as const;
