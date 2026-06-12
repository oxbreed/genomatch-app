import { COLORS, GLASS } from '../../theme';

/** GenoMatch-exclusive visual language — helix, bond, gold ceremony */
export const GENO_VISUAL = {
  helix: {
    goldStroke: COLORS.gold,
    forestStroke: COLORS.forest,
    nodeGold: COLORS.gold,
    nodeForest: COLORS.verified,
    opacity: { subtle: 0.14, medium: 0.22, rich: 0.32 },
  },
  chrome: {
    topRule: [COLORS.gold, 'rgba(61, 122, 82, 0.45)', 'transparent'] as [string, string, string],
    topRuleForest: [COLORS.gold, COLORS.verified, 'transparent'] as [string, string, string],
    washLinen: ['rgba(212, 168, 67, 0.12)', 'transparent', COLORS.linen] as [string, string, string],
    washMint: ['rgba(237, 243, 238, 0.92)', 'rgba(212, 168, 67, 0.06)', COLORS.linen] as [
      string,
      string,
      string,
    ],
    washDiscover: [
      'rgba(212, 168, 67, 0.14)',
      'transparent',
      'rgba(237, 243, 238, 0.35)',
    ] as [string, string, string],
    cardBorder: [
      'rgba(212, 168, 67, 0.5)',
      'rgba(61, 122, 82, 0.32)',
      'rgba(212, 168, 67, 0.38)',
    ] as [string, string, string],
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
        intensity: 64,
        blurTint: 'light' as const,
      },
      dark: {
        tint: GLASS.darkTint,
        border: GLASS.darkBorder,
        sheen: GLASS.darkSheen,
        intensity: 72,
        blurTint: 'dark' as const,
      },
      linen: {
        tint: GLASS.linenTint,
        border: GLASS.linenBorder,
        sheen: GLASS.linenSheen,
        intensity: 58,
        blurTint: 'light' as const,
      },
      sheet: {
        tint: GLASS.sheetTint,
        border: GLASS.sheetBorder,
        sheen: GLASS.linenSheen,
        intensity: 68,
        blurTint: 'light' as const,
      },
      tabBar: {
        tint: GLASS.tabBarTint,
        border: GLASS.tabBarBorder,
        sheen: GLASS.tabBarSheen,
        intensity: 78,
        blurTint: 'light' as const,
      },
    },
    backdrop: {
      dark: {
        tint: GLASS.backdropDark,
        intensity: 48,
        blurTint: 'dark' as const,
      },
      light: {
        tint: GLASS.backdropLight,
        intensity: 36,
        blurTint: 'light' as const,
      },
    },
    motion: {
      springFriction: 8,
      springTension: 200,
      pressScale: 0.96,
      tabScale: 1.06,
    },
  },
} as const;

export type GenoChromeVariant = 'linen' | 'mint' | 'forest' | 'discover';
