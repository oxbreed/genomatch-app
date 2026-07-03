import { COLORS, GLASS, LOGO_GOLD, LOGO_RED, silverAlpha, chromeAlpha } from '../../theme';

export const GENO_VISUAL = {
  helix: {
    goldStroke: COLORS.metallicSilver,
    forestStroke: COLORS.metallicSteel,
    nodeGold: COLORS.metallicSilver,
    nodeForest: COLORS.metallicSteel,
    opacity: { subtle: 0.04, medium: 0.05, rich: 0.06 },
  },
  chrome: {
    topRule: GLASS.topRule,
    topRuleForest: GLASS.topRule,
    washLinen: [COLORS.background, COLORS.surface, COLORS.background] as [string, string, string],
    washMint: [COLORS.background, COLORS.surface, COLORS.background] as [string, string, string],
    washDiscover: [COLORS.background, COLORS.surface, COLORS.background] as [string, string, string],
    cardBorder: [silverAlpha(0.45), chromeAlpha(0.35), LOGO_GOLD, LOGO_RED, silverAlpha(0.4)] as [
      string,
      string,
      string,
      string,
      string,
    ],
  },
  motion: {
    driftMs: 14000,
    pulseMs: 3200,
    haloMs: 12000,
  },
  sizes: {
    bondMarkSm: 28,
    bondMarkMd: 36,
    bondMarkLg: 48,
    haloSm: 56,
    haloMd: 88,
    haloLg: 120,
  },
  glass: {
    topRule: GLASS.topRule,
    variants: {
      light: {
        tint: GLASS.lightTint,
        border: GLASS.lightBorder,
        sheen: GLASS.lightSheen,
        intensity: 24,
        blurTint: 'dark' as const,
      },
      dark: {
        tint: GLASS.darkTint,
        border: GLASS.darkBorder,
        sheen: GLASS.darkSheen,
        intensity: 32,
        blurTint: 'dark' as const,
      },
      linen: {
        tint: GLASS.linenTint,
        border: GLASS.linenBorder,
        sheen: GLASS.linenSheen,
        intensity: 20,
        blurTint: 'dark' as const,
      },
      sheet: {
        tint: GLASS.sheetTint,
        border: GLASS.sheetBorder,
        sheen: GLASS.linenSheen,
        intensity: 28,
        blurTint: 'dark' as const,
      },
      tabBar: {
        tint: GLASS.tabBarTint,
        border: GLASS.tabBarBorder,
        sheen: GLASS.tabBarSheen,
        intensity: 36,
        blurTint: 'dark' as const,
      },
    },
    backdrop: {
      dark: {
        tint: GLASS.backdropDark,
        intensity: 40,
        blurTint: 'dark' as const,
      },
      light: {
        tint: GLASS.backdropLight,
        intensity: 24,
        blurTint: 'dark' as const,
      },
    },
    motion: {
      springFriction: 8,
      springTension: 200,
      pressScale: 0.98,
      tabScale: 1.02,
    },
  },
} as const;

export type GenoChromeVariant = 'linen' | 'mint' | 'forest' | 'discover';
