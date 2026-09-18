/** GenoMatch brand palette — mirror system: logo red/gold on brand black. */

// Canonical mirror brand colors (FINAL). Source of truth for the app palette.
export const LOGO_RED = '#C8102E';
export const LOGO_RED_DEEP = '#8E0B20';
export const LOGO_RED_HOT = '#E5344E';
export const LOGO_GOLD = '#D4AF37';
export const LOGO_GOLD_BRIGHT = '#E5C766';
export const LOGO_GOLD_DEEP = '#B8962E';
export const BRAND_BLACK = '#0B0C0E';
export const BRAND_BLACK_SOFT = '#15171A';
export const METALLIC_SILVER = '#B8BCC4';
export const METALLIC_CHROME = '#D4D8E0';
export const CREAM = '#FAF8F5';
export const CREAM_TINT = '#F0F1F3';
export const WHITE = '#FFFFFF';

// Backward-compatible aliases. Names are retained so existing imports keep
// compiling; every value now points at the mirror palette.
export const GOLD = LOGO_GOLD;
export const GOLD_BRIGHT = LOGO_GOLD_BRIGHT;
export const GOLD_DEEP = LOGO_GOLD_DEEP;
export const GLOSSY_RED = LOGO_RED;
export const GLOSSY_RED_DEEP = LOGO_RED_DEEP;
export const GLOSSY_RED_HOT = LOGO_RED_HOT;
export const INK = BRAND_BLACK;
export const LINEN = CREAM;
export const MINT = CREAM_TINT;

/** Backup mirror-chrome names → canonical palette (same pattern as forest/sage). */
export const LOGO_RED_BRIGHT = LOGO_RED_HOT;
export const METALLIC_GRAPHITE = BRAND_BLACK_SOFT;
export const METALLIC_SLATE = BRAND_BLACK_SOFT;
export const METALLIC_STEEL = METALLIC_SILVER;

const CREAM_RGB = '250, 248, 245';
const RED_RGB = '200, 16, 46';
const GOLD_RGB = '212, 175, 55';
const SILVER_RGB = '184, 188, 196';
const CHROME_RGB = '212, 216, 224';

export function redAlpha(opacity: number): string {
  return `rgba(${RED_RGB}, ${opacity})`;
}

export function goldAlpha(opacity: number): string {
  return `rgba(${GOLD_RGB}, ${opacity})`;
}

export function creamAlpha(opacity: number): string {
  return `rgba(${CREAM_RGB}, ${opacity})`;
}

export function silverAlpha(opacity: number): string {
  return `rgba(${SILVER_RGB}, ${opacity})`;
}

export function chromeAlpha(opacity: number): string {
  return `rgba(${CHROME_RGB}, ${opacity})`;
}

/** Semantic color tokens — use these in UI code */
export const COLORS = {
  // Brand
  logoRed: LOGO_RED,
  logoGold: LOGO_GOLD,
  brandBlack: BRAND_BLACK,
  metallicSilver: METALLIC_SILVER,
  metallicChrome: METALLIC_CHROME,
  metallicGraphite: BRAND_BLACK_SOFT,
  metallicSlate: BRAND_BLACK_SOFT,
  cream: CREAM,

  // Legacy keys retained for compatibility (mapped to mirror palette)
  gold: LOGO_GOLD,
  goldBright: LOGO_GOLD_BRIGHT,
  goldDeep: LOGO_GOLD_DEEP,
  glossyRed: LOGO_RED,
  glossyRedDeep: LOGO_RED_DEEP,
  glossyRedHot: LOGO_RED_HOT,
  ink: BRAND_BLACK,
  linen: CREAM,
  mint: CREAM_TINT,
  white: WHITE,

  /** @deprecated Use cream — kept for gradual migration */
  ivory: CREAM,

  background: CREAM,
  surface: WHITE,
  tabBar: BRAND_BLACK,
  splash: BRAND_BLACK,
  hero: BRAND_BLACK_SOFT,

  text: BRAND_BLACK,
  textOnDark: CREAM,
  textOnInk: CREAM,
  textMuted: 'rgba(11, 12, 14, 0.55)',
  textSubtle: 'rgba(11, 12, 14, 0.45)',

  border: 'rgba(11, 12, 14, 0.08)',
  borderLight: 'rgba(184, 188, 196, 0.4)',
  borderOnDark: 'rgba(250, 248, 245, 0.12)',

  chip: CREAM_TINT,
  chipSolid: BRAND_BLACK_SOFT,
  chipFill: 'rgba(240, 241, 243, 0.85)',
  cta: LOGO_GOLD,
  overlay: 'rgba(11, 12, 14, 0.72)',
  overlayLight: 'rgba(11, 12, 14, 0.45)',

  verified: LOGO_GOLD,
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

  linenTint: 'rgba(250, 248, 245, 0.48)',
  linenBorder: 'rgba(212, 175, 55, 0.42)',
  linenSheen: ['rgba(255, 255, 255, 0.72)', 'rgba(212, 175, 55, 0.14)', 'transparent'] as [
    string,
    string,
    string,
  ],

  darkTint: 'rgba(11, 12, 14, 0.44)',
  darkBorder: 'rgba(250, 248, 245, 0.22)',
  darkSheen: ['rgba(212, 175, 55, 0.38)', 'rgba(255, 255, 255, 0.12)', 'transparent'] as [
    string,
    string,
    string,
  ],

  sheetTint: 'rgba(250, 248, 245, 0.58)',
  sheetBorder: 'rgba(212, 175, 55, 0.48)',

  backdropDark: 'rgba(11, 12, 14, 0.28)',
  backdropLight: 'rgba(250, 248, 245, 0.18)',

  topRule: ['transparent', 'rgba(212, 175, 55, 0.85)', 'transparent'] as [string, string, string],
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
  tabBarIndicator: 'rgba(212, 175, 55, 0.18)',

  /** Flat controls that mimic glass without blur (chips, legacy inputs) */
  insetFill: 'rgba(255, 255, 255, 0.58)',
  insetBorder: 'rgba(255, 255, 255, 0.72)',
  insetActiveFill: 'rgba(212, 175, 55, 0.2)',
  insetActiveBorder: 'rgba(212, 175, 55, 0.55)',
} as const;

export const MIRROR_GRADIENTS = {
  cta: [LOGO_RED_HOT, LOGO_RED, LOGO_RED_DEEP] as const,
  ctaSheen: [chromeAlpha(0.42), chromeAlpha(0.12), 'transparent'] as const,
  ctaStreak: ['transparent', chromeAlpha(0.35), 'transparent'] as const,
  ctaRim: [chromeAlpha(0.28), silverAlpha(0.08), 'transparent'] as const,
  goldCta: [LOGO_GOLD_BRIGHT, LOGO_GOLD, LOGO_GOLD_DEEP] as const,
  goldSheen: [chromeAlpha(0.35), chromeAlpha(0.08), 'transparent'] as const,
  ribbonBlend: [LOGO_RED, LOGO_RED_HOT, LOGO_GOLD, LOGO_GOLD_BRIGHT] as const,
  ribbonBlendSheen: [chromeAlpha(0.35), chromeAlpha(0.12), 'transparent'] as const,
  onboardingCta: [LOGO_RED_HOT, LOGO_RED, LOGO_RED_DEEP] as const,
  onboardingCtaSheen: [chromeAlpha(0.22), chromeAlpha(0.06), 'transparent'] as const,
  chromeGloss: [chromeAlpha(0.2), silverAlpha(0.06), 'transparent'] as const,
} as const;

export const MIRROR_RED_TEXT = {
  color: LOGO_RED_HOT,
  textShadowColor: redAlpha(0.45),
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 10,
} as const;

export const ACCENT_GOLD_TEXT = {
  color: LOGO_GOLD,
  textShadowColor: goldAlpha(0.4),
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 8,
} as const;
