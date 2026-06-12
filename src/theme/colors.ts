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

/** Liquid Glass surface tokens — brand colors with translucent gloss */
export const GLASS = {
  lightTint: 'rgba(255, 255, 255, 0.38)',
  lightBorder: 'rgba(255, 255, 255, 0.82)',
  lightSheen: ['rgba(255, 255, 255, 0.92)', 'rgba(255, 255, 255, 0.28)', 'transparent'] as [
    string,
    string,
    string,
  ],

  linenTint: 'rgba(245, 239, 230, 0.48)',
  linenBorder: 'rgba(212, 168, 67, 0.42)',
  linenSheen: ['rgba(255, 255, 255, 0.72)', 'rgba(212, 168, 67, 0.14)', 'transparent'] as [
    string,
    string,
    string,
  ],

  darkTint: 'rgba(22, 53, 34, 0.44)',
  darkBorder: 'rgba(245, 239, 230, 0.22)',
  darkSheen: ['rgba(212, 168, 67, 0.38)', 'rgba(255, 255, 255, 0.12)', 'transparent'] as [
    string,
    string,
    string,
  ],

  sheetTint: 'rgba(245, 239, 230, 0.58)',
  sheetBorder: 'rgba(212, 168, 67, 0.48)',

  backdropDark: 'rgba(13, 40, 24, 0.28)',
  backdropLight: 'rgba(245, 239, 230, 0.18)',

  topRule: ['transparent', 'rgba(212, 168, 67, 0.85)', 'transparent'] as [string, string, string],
  edgeHighlight: 'rgba(255, 255, 255, 0.62)',
  rimHighlight: ['rgba(255, 255, 255, 0.55)', 'rgba(255, 255, 255, 0.08)', 'transparent'] as [
    string,
    string,
    string,
  ],

  /** Floating tab bar — light liquid glass (iOS / Instagram style) */
  tabBarTint: 'rgba(255, 255, 255, 0.84)',
  tabBarBorder: 'rgba(255, 255, 255, 0.55)',
  tabBarSheen: ['rgba(255, 255, 255, 0.92)', 'rgba(255, 255, 255, 0.28)', 'transparent'] as [
    string,
    string,
    string,
  ],
  tabBarIndicator: 'rgba(212, 168, 67, 0.18)',

  /** Flat controls that mimic glass without blur (chips, legacy inputs) */
  insetFill: 'rgba(255, 255, 255, 0.58)',
  insetBorder: 'rgba(255, 255, 255, 0.72)',
  insetActiveFill: 'rgba(212, 168, 67, 0.2)',
  insetActiveBorder: 'rgba(212, 168, 67, 0.55)',
} as const;
