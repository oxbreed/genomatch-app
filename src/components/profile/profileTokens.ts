import { INBOX } from '../inbox/inboxTokens';
import { FONT_FAMILY } from '../../theme';

/** Profile typography scale & layout rhythm */
export const PROFILE = {
  heroNameSize: 30,
  sectionLabelSize: 11,
  sectionTitleSize: 18,
  bodySize: 15,
  bodyLineHeight: 23,
  chipSize: 13,
  metaSize: 12,
  captionSize: 13,
  statValueSize: 22,
  headerTitleSize: INBOX.headerTitleSize,
  headerSubtitleSize: INBOX.headerSubtitleSize,
  cardPadding: 18,
  sectionGap: 22,
  cardGap: 8,
} as const;

/** Shared text styles for the profile & studio surfaces */
export const PROFILE_TYPE = {
  heroName: {
    fontFamily: FONT_FAMILY.clashSemibold,
    fontSize: PROFILE.heroNameSize,
    letterSpacing: -0.6,
  },
  heroMeta: {
    fontFamily: FONT_FAMILY.satoshiRegular,
    fontSize: 14,
    letterSpacing: 0.15,
  },
  sectionKicker: {
    fontFamily: FONT_FAMILY.satoshiBold,
    fontSize: PROFILE.sectionLabelSize,
    letterSpacing: 1.3,
    textTransform: 'uppercase' as const,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.clashMedium,
    fontSize: PROFILE.sectionTitleSize,
    letterSpacing: -0.35,
  },
  sectionHint: {
    fontFamily: FONT_FAMILY.satoshiRegular,
    fontSize: PROFILE.metaSize,
    lineHeight: 17,
  },
  blockLabel: {
    fontFamily: FONT_FAMILY.satoshiBold,
    fontSize: PROFILE.sectionLabelSize,
    letterSpacing: 1.1,
    textTransform: 'uppercase' as const,
  },
  body: {
    fontFamily: FONT_FAMILY.satoshiRegular,
    fontSize: PROFILE.bodySize,
    lineHeight: PROFILE.bodyLineHeight,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY.satoshiMedium,
    fontSize: PROFILE.bodySize,
    lineHeight: PROFILE.bodyLineHeight,
  },
  chip: {
    fontFamily: FONT_FAMILY.satoshiMedium,
    fontSize: PROFILE.chipSize,
  },
  goal: {
    fontFamily: FONT_FAMILY.clashMedium,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  statValue: {
    fontFamily: FONT_FAMILY.clashSemibold,
    fontSize: PROFILE.statValueSize,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontFamily: FONT_FAMILY.satoshiRegular,
    fontSize: PROFILE.metaSize,
    letterSpacing: 0.15,
  },
  ctaTitle: {
    fontFamily: FONT_FAMILY.clashMedium,
    fontSize: 17,
    letterSpacing: -0.3,
  },
  ctaSub: {
    fontFamily: FONT_FAMILY.satoshiRegular,
    fontSize: PROFILE.captionSize,
    lineHeight: 19,
  },
  ribbonTitle: {
    fontFamily: FONT_FAMILY.clashMedium,
    fontSize: 16,
    letterSpacing: -0.25,
  },
  ribbonSub: {
    fontFamily: FONT_FAMILY.satoshiRegular,
    fontSize: PROFILE.captionSize,
    lineHeight: 19,
  },
  footerLink: {
    fontFamily: FONT_FAMILY.satoshiMedium,
    fontSize: PROFILE.bodySize,
  },
  footerAction: {
    fontFamily: FONT_FAMILY.satoshiBold,
    fontSize: PROFILE.bodySize,
  },
} as const;
