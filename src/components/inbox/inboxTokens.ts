import { COLORS } from '../../theme';

/** Shared typography & layout for Matches + Messages lists */
export const INBOX = {
  avatarSize: 52,
  iconBtnSize: 38,
  cardRadius: 18,
  cardPaddingV: 14,
  cardPaddingH: 12,
  cardGap: 10,
  cardMarginH: 16,
  cardMarginB: 12,
  nameSize: 16,
  metaSize: 11,
  badgeSize: 10,
  pctSize: 12,
  headerTitleSize: 26,
  headerSubtitleSize: 13,
  headerKickerSize: 10,
  markSize: 36,
  countBadgeH: 26,
  colors: {
    borderGradient: [
      'rgba(212, 168, 67, 0.45)',
      'rgba(61, 122, 82, 0.28)',
      'rgba(212, 168, 67, 0.35)',
    ] as [string, string, string],
    goldBtn: [COLORS.gold, '#C49A3A'] as [string, string],
    forestBtn: [COLORS.forestDeep, COLORS.forest] as [string, string],
  },
} as const;
