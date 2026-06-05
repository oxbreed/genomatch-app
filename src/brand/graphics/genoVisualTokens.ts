import { COLORS } from '../../theme';

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
} as const;

export type GenoChromeVariant = 'linen' | 'mint' | 'forest' | 'discover';
