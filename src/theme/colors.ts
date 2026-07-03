import type { TextStyle } from 'react-native';

/**
 * GenoMatch — metallic gray-black gloss + ribbon red & gold accents.
 * Cool gunmetal surfaces, chrome sheen, cream (#FAF8F5) type.
 */

export const LOGO_RED = '#C8102E';
export const LOGO_RED_DEEP = '#A30C24';
export const LOGO_RED_BRIGHT = '#E8163A';

export const LOGO_GOLD = '#D4AF37';
export const LOGO_GOLD_DEEP = '#B8922E';
export const LOGO_GOLD_BRIGHT = '#E8C55A';

/** Deep gunmetal — app canvas */
export const BRAND_BLACK = '#0B0C0E';
export const BRAND_CHARCOAL = '#2A2E35';
export const CREAM = '#FAF8F5';

/** Metallic gray scale */
export const METALLIC_GRAPHITE = '#1A1D22';
export const METALLIC_SLATE = '#22262D';
export const METALLIC_STEEL = '#6E737C';
export const METALLIC_SILVER = '#B8BCC4';
export const METALLIC_CHROME = '#D4D8E0';

export const BRAND_RED = LOGO_RED;
export const BRAND_RED_DEEP = LOGO_RED_DEEP;
export const BRAND_RED_SOFT = LOGO_RED_BRIGHT;
export const GOLD = LOGO_GOLD;
export const GOLD_BRIGHT = LOGO_GOLD_BRIGHT;
export const GOLD_DEEP = LOGO_GOLD_DEEP;
export const LINEN = CREAM;
export const BLUSH = '#1E2126';
export const TAUPE = '#9CA3AE';
export const WHITE = '#FFFFFF';

export const FOREST_DEEP = BRAND_BLACK;
export const FOREST = '#14161A';
export const SAGE = TAUPE;
export const MINT = METALLIC_GRAPHITE;
export const MIRROR_WHITE = WHITE;
export const MIRROR_SILVER = METALLIC_SILVER;
export const MIRROR_FOG = CREAM;
export const MIRROR_STEEL = METALLIC_STEEL;

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

export const COLORS = {
  logoRed: LOGO_RED,
  logoRedDeep: LOGO_RED_DEEP,
  logoRedBright: LOGO_RED_BRIGHT,
  logoGold: LOGO_GOLD,
  brandBlack: BRAND_BLACK,
  brandCharcoal: BRAND_CHARCOAL,
  brandRed: BRAND_RED,
  brandRedDeep: BRAND_RED_DEEP,
  brandRedSoft: BRAND_RED_SOFT,
  mirror: WHITE,
  mirrorSilver: MIRROR_SILVER,
  mirrorFog: MIRROR_FOG,
  mirrorSteel: MIRROR_STEEL,
  metallicGraphite: METALLIC_GRAPHITE,
  metallicSlate: METALLIC_SLATE,
  metallicSteel: METALLIC_STEEL,
  metallicSilver: METALLIC_SILVER,
  metallicChrome: METALLIC_CHROME,
  forestDeep: BRAND_BLACK,
  forest: FOREST,
  gold: GOLD,
  goldBright: GOLD_BRIGHT,
  goldDeep: GOLD_DEEP,
  linen: LINEN,
  cream: CREAM,
  sage: SAGE,
  mint: MINT,
  white: WHITE,
  romance: BRAND_RED,
  ivory: CREAM,

  background: BRAND_BLACK,
  surface: FOREST,
  surfaceElevated: METALLIC_SLATE,
  tabBar: 'rgba(20, 22, 26, 0.94)',
  splash: BRAND_BLACK,
  hero: FOREST,

  text: CREAM,
  textOnDark: CREAM,
  textOnForest: CREAM,
  textOnLight: CREAM,
  textMuted: creamAlpha(0.72),
  textSubtle: creamAlpha(0.58),

  border: silverAlpha(0.14),
  borderLight: silverAlpha(0.08),
  borderOnDark: silverAlpha(0.16),

  chip: silverAlpha(0.1),
  chipSolid: METALLIC_SLATE,
  chipFill: silverAlpha(0.12),
  blush: BLUSH,
  cta: BRAND_RED,
  overlay: 'rgba(0, 0, 0, 0.72)',
  overlayLight: 'rgba(0, 0, 0, 0.45)',

  verified: LOGO_GOLD,
  error: '#F87171',
  errorBg: 'rgba(248, 113, 113, 0.12)',

  actionPass: creamAlpha(0.42),
  actionPassBg: FOREST,
  actionPassBorder: silverAlpha(0.16),
  actionLike: BRAND_RED,
  actionLikeBg: BRAND_RED,
  actionSuperLike: GOLD,
  actionSuperLikeBg: FOREST,
  actionSuperLikeBorder: goldAlpha(0.4),
} as const;

export const GLASS = {
  lightTint: 'rgba(22, 24, 28, 0.9)',
  lightBorder: silverAlpha(0.16),
  lightSheen: [
    chromeAlpha(0.16),
    silverAlpha(0.05),
    'transparent',
  ] as [string, string, string],

  linenTint: 'rgba(24, 26, 30, 0.94)',
  linenBorder: silverAlpha(0.14),
  linenSheen: [chromeAlpha(0.12), silverAlpha(0.04), 'transparent'] as [string, string, string],

  darkTint: 'rgba(14, 15, 18, 0.92)',
  darkBorder: silverAlpha(0.18),
  darkSheen: [chromeAlpha(0.14), silverAlpha(0.05), 'transparent'] as [string, string, string],

  sheetTint: 'rgba(18, 20, 24, 0.98)',
  sheetBorder: silverAlpha(0.14),

  backdropDark: 'rgba(0, 0, 0, 0.55)',
  backdropLight: 'rgba(0, 0, 0, 0.35)',

  topRule: [silverAlpha(0.08), chromeAlpha(0.28), silverAlpha(0.08)] as [string, string, string],
  mirrorStreak: [
    'transparent',
    chromeAlpha(0.22),
    silverAlpha(0.1),
    'transparent',
  ] as [string, string, string, string],
  edgeHighlight: chromeAlpha(0.2),
  rimHighlight: [chromeAlpha(0.35), silverAlpha(0.12), 'transparent'] as [string, string, string],
  redRim: [redAlpha(0.35), 'transparent'] as [string, string],
  goldRim: [goldAlpha(0.45), goldAlpha(0.12), 'transparent'] as [string, string, string],

  tabBarTint: 'rgba(20, 22, 26, 0.94)',
  tabBarBorder: silverAlpha(0.14),
  tabBarSheen: [chromeAlpha(0.1), silverAlpha(0.03), 'transparent'] as [string, string, string],
  tabBarIndicator: redAlpha(0.18),

  insetFill: METALLIC_GRAPHITE,
  insetBorder: silverAlpha(0.16),
  insetActiveFill: redAlpha(0.14),
  insetActiveBorder: redAlpha(0.45),
} as const;

export const MIRROR_GRADIENTS = {
  cta: [LOGO_RED_BRIGHT, LOGO_RED, LOGO_RED_DEEP] as const,
  ctaSheen: [chromeAlpha(0.42), chromeAlpha(0.12), 'transparent'] as const,
  ctaStreak: ['transparent', chromeAlpha(0.35), 'transparent'] as const,
  ctaRim: [chromeAlpha(0.28), silverAlpha(0.08), 'transparent'] as const,

  goldCta: [LOGO_GOLD_BRIGHT, LOGO_GOLD, LOGO_GOLD_DEEP] as const,
  goldSheen: [chromeAlpha(0.35), chromeAlpha(0.08), 'transparent'] as const,

  ribbonBlend: [LOGO_RED, LOGO_RED_BRIGHT, LOGO_GOLD, LOGO_GOLD_BRIGHT] as const,
  ribbonBlendSoft: [redAlpha(0.85), LOGO_RED, LOGO_GOLD, goldAlpha(0.9)] as const,
  ribbonBlendSheen: [chromeAlpha(0.35), chromeAlpha(0.12), 'transparent'] as const,
  ribbonBlendGlow: [redAlpha(0.28), goldAlpha(0.22), 'transparent'] as const,

  onboardingCta: [LOGO_RED_BRIGHT, LOGO_RED, LOGO_RED_DEEP] as const,
  onboardingCtaSheen: [chromeAlpha(0.22), chromeAlpha(0.06), 'transparent'] as const,

  darkPanel: [METALLIC_SLATE, BRAND_BLACK] as const,
  metallicPanel: [METALLIC_SLATE, FOREST, BRAND_BLACK] as const,
  obsidianWash: [BRAND_BLACK, '#101216', BRAND_BLACK] as const,
  chromeGloss: [chromeAlpha(0.2), silverAlpha(0.06), 'transparent'] as const,
  metallicSweep: [
    'transparent',
    chromeAlpha(0.14),
    silverAlpha(0.06),
    'transparent',
  ] as const,
  redGlow: [redAlpha(0.28), redAlpha(0.08), 'transparent'] as const,
  goldGlow: [goldAlpha(0.22), goldAlpha(0.06), 'transparent'] as const,
} as const;

export const MIRROR_RED_TEXT = {
  color: LOGO_RED_BRIGHT,
  textShadowColor: redAlpha(0.45),
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 10,
} satisfies TextStyle;

export const ACCENT_GOLD_TEXT = {
  color: LOGO_GOLD,
  textShadowColor: goldAlpha(0.4),
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 8,
} satisfies TextStyle;
